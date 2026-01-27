import { format } from "date-fns";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  CalendarDimensions,
  CalendarStyles,
  CalendarTimeConfig,
  RenderTimeSlotFunction,
} from "../../types/calendar";

type TimeColumnProps = {
  scrollRef: React.RefObject<ScrollView | null>;
  gridTotalHeight: number;
  timeConfig: CalendarTimeConfig;
  dimensions: CalendarDimensions;
  renderTimeSlot?: RenderTimeSlotFunction;
  styles?: CalendarStyles;
};

function formatHour(hour: number, timeFormat: string): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return format(date, timeFormat);
}

export function TimeColumn({
  scrollRef,
  gridTotalHeight,
  timeConfig,
  dimensions,
  renderTimeSlot,
  styles,
}: TimeColumnProps) {
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

  const bgColor = styles?.timeColumnBackgroundColor || "#262626";

  return (
    <View
      style={{
        zIndex: 10,
        position: "relative",
        borderRightWidth: 1,
        borderRightColor: "#333",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: dimensions.resourceWidth,
        backgroundColor: bgColor,
      }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        bounces={false}
        contentContainerStyle={{ minHeight: gridTotalHeight }}>
        <View
          style={{
            position: "relative",
            width: dimensions.resourceWidth,
            height: gridTotalHeight,
          }}>
          {hoursArray.map((hour, hourIndex) => {
            const topPosition = hourIndex * dimensions.hourHeight;
            return (
              <View
                key={hour}
                style={{
                  position: "absolute",
                  left: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  top: topPosition,
                  width: dimensions.resourceWidth,
                  height: dimensions.hourHeight,
                }}>
                {renderTimeSlot ? (
                  renderTimeSlot(hour)
                ) : (
                  <Text style={{ color: "#fefefe", fontSize: 14 }}>
                    {formatHour(hour, timeConfig.timeFormat || "HH:mm")}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
