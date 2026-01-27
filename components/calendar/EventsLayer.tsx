import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import {
  CalendarDimensions,
  CalendarEvent,
  CalendarEventStyles,
  CalendarTimeConfig,
  RenderEventFunction,
  Resource,
} from "../../types/calendar";

type EventsLayerProps<TEvent = any, TResource = any> = {
  events: CalendarEvent<TEvent>[];
  resources: Resource<TResource>[];
  onEventPress?: (event: CalendarEvent<TEvent>) => void;
  timeConfig: CalendarTimeConfig;
  dimensions: CalendarDimensions;
  eventStyles?: CalendarEventStyles;
  renderEvent?: RenderEventFunction<TEvent>;
};

export function EventsLayer<TEvent = any, TResource = any>({
  events,
  resources,
  onEventPress,
  timeConfig,
  dimensions,
  eventStyles,
  renderEvent,
}: EventsLayerProps<TEvent, TResource>) {
  const positionedEvents = useMemo(() => {
    return events
      .map((event) => {
        const resourceIndex = resources.findIndex(
          (resource) => resource.id === event.resourceId,
        );

        if (resourceIndex === -1) {
          return null;
        }

        const topPosition =
          (event.startHour - timeConfig.startHour - 1) * dimensions.hourHeight;
        const blockHeight =
          (event.endHour - event.startHour) * dimensions.hourHeight;
        const leftPosition = resourceIndex * dimensions.resourceWidth;
        const blockWidth = dimensions.resourceWidth;

        return {
          event,
          topPosition,
          leftPosition,
          blockWidth,
          blockHeight,
        };
      })
      .filter(Boolean) as {
      event: CalendarEvent<TEvent>;
      topPosition: number;
      leftPosition: number;
      blockWidth: number;
      blockHeight: number;
    }[];
  }, [events, resources, timeConfig.startHour, dimensions]);

  const gridTotalWidth = resources.length * dimensions.resourceWidth;
  const gridBodyHeight =
    (timeConfig.endHour - timeConfig.startHour - 1) * dimensions.hourHeight;

  const handleEventPress = (event: CalendarEvent<TEvent>) => {
    onEventPress?.(event);
  };

  const defaultColor = eventStyles?.defaultColor || "#3b82f6";
  const borderRadius = eventStyles?.borderRadius || 8;
  const opacity = eventStyles?.opacity || 1;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10,
        width: gridTotalWidth,
        height: gridBodyHeight,
      }}
      pointerEvents="box-none">
      {positionedEvents.map((item) => {
        const eventColor = item.event.color || defaultColor;

        return (
          <View
            key={item.event.id}
            style={{
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#1a1a1a",
              top: item.topPosition,
              left: item.leftPosition,
              height: item.blockHeight,
              width: item.blockWidth,
            }}>
            <Pressable
              onPress={() => handleEventPress(item.event)}
              style={{
                height: item.blockHeight - 2,
                width: item.blockWidth - 2,
                backgroundColor: eventColor,
                borderRadius,
                opacity,
                justifyContent: "center",
                alignItems: "center",
                padding: 8,
                overflow: "hidden",
              }}>
              {renderEvent ? (
                renderEvent(item.event, {
                  width: item.blockWidth - 2,
                  height: item.blockHeight - 2,
                })
              ) : (
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                  numberOfLines={2}>
                  {item.event.title}
                </Text>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
