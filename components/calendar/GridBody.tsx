import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import {
  CalendarDimensions,
  CalendarEvent,
  CalendarStyles,
  CalendarTimeConfig,
  Resource,
  UnavailableSlot,
} from "../../types/calendar";

type GridBodyProps<TEvent = any, TResource = any, TUnavailable = any> = {
  resources: Resource<TResource>[];
  events: CalendarEvent<TEvent>[];
  unavailableSlots: UnavailableSlot<TUnavailable>[];
  onSlotPress?: (hour: number, resourceId: string, date: Date) => void;
  date: Date;
  timeConfig: CalendarTimeConfig;
  dimensions: CalendarDimensions;
  styles?: CalendarStyles;
};

export function GridBody<TEvent = any, TResource = any, TUnavailable = any>({
  resources,
  events,
  unavailableSlots,
  onSlotPress,
  date,
  timeConfig,
  dimensions,
  styles,
}: GridBodyProps<TEvent, TResource, TUnavailable>) {
  const hoursArray = useMemo(() => {
    const result: number[] = [];
    for (
      let hour = timeConfig.startHour + 1;
      hour <= timeConfig.endHour;
      hour++
    ) {
      result.push(hour);
    }
    return result;
  }, [timeConfig.startHour, timeConfig.endHour]);

  const occupiedSlots = useMemo(() => {
    const occupied = new Set<string>();

    events.forEach((event) => {
      for (let hour = event.startHour; hour < event.endHour; hour++) {
        occupied.add(`${event.resourceId}-${hour}`);
      }
    });

    unavailableSlots.forEach((slot) => {
      for (let hour = slot.startHour; hour < slot.endHour; hour++) {
        occupied.add(`${slot.resourceId}-${hour}`);
      }
    });

    return occupied;
  }, [events, unavailableSlots]);

  const gridTotalWidth = resources.length * dimensions.resourceWidth;
  const gridBodyHeight =
    (timeConfig.endHour - timeConfig.startHour - 1) * dimensions.hourHeight;

  const handleSlotPress = (hour: number, resourceId: string) => {
    onSlotPress?.(hour, resourceId, date);
  };

  const slotBgColor = styles?.slotBackgroundColor || "#1f1f1f";
  const gridLineColor = styles?.gridColor || "#333";

  return (
    <View
      style={{
        flexDirection: "row",
        width: gridTotalWidth,
        height: gridBodyHeight,
      }}>
      {resources.map((resource, resourceIndex) => (
        <View key={resource.id}>
          {hoursArray.map((hour) => {
            const slotKey = `${resource.id}-${hour}`;
            const isSlotOccupied = occupiedSlots.has(slotKey);
            const isLastColumn = resourceIndex === resources.length - 1;
            const isFirstColumn = resourceIndex === 0;

            if (isSlotOccupied) {
              return (
                <View
                  key={slotKey}
                  style={{
                    width: dimensions.resourceWidth,
                    height: dimensions.hourHeight,
                    borderLeftWidth: 1,
                    borderBottomWidth: 1,
                    borderRightWidth: isLastColumn ? 1 : 0,
                    borderColor: gridLineColor,
                  }}
                />
              );
            }

            return (
              <Pressable
                key={slotKey}
                onPress={() => handleSlotPress(hour, resource.id)}
                style={{
                  width: dimensions.resourceWidth,
                  height: dimensions.hourHeight,
                  backgroundColor: slotBgColor,
                  borderLeftWidth: isFirstColumn ? 0 : 1,
                  borderBottomWidth: 1,
                  borderRightWidth: isLastColumn ? 1 : 0,
                  borderColor: gridLineColor,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Text style={{ color: "#474747", fontSize: 20, fontWeight: "300" }}>+</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
