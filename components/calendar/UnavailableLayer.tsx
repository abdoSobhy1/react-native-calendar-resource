import { useMemo } from "react";
import { View } from "react-native";
import {
  CalendarDimensions,
  CalendarTimeConfig,
  RenderUnavailableSlotFunction,
  Resource,
  UnavailableSlot,
  UnavailableSlotStyles,
} from "../../types/calendar";

type UnavailableLayerProps<TResource = any, TUnavailable = any> = {
  unavailableSlots: UnavailableSlot<TUnavailable>[];
  resources: Resource<TResource>[];
  timeConfig: CalendarTimeConfig;
  dimensions: CalendarDimensions;
  unavailableStyles?: UnavailableSlotStyles;
  renderUnavailableSlot?: RenderUnavailableSlotFunction<TUnavailable>;
};

function DiagonalStripes({
  color,
  width,
  height,
}: {
  color: string;
  width: number;
  height: number;
}) {
  const stripeWidth = 1;
  const gapBetweenStripes = 5;
  const stripeSpacing = stripeWidth + gapBetweenStripes;

  const diagonalLength = Math.sqrt(width * width + height * height);
  const numberOfStripes = Math.ceil(diagonalLength / stripeSpacing);

  const stripes = [];
  for (
    let stripeIndex = -numberOfStripes;
    stripeIndex < numberOfStripes;
    stripeIndex++
  ) {
    stripes.push(
      <View
        key={stripeIndex}
        style={{
          position: "absolute",
          backgroundColor: color,
          left: stripeIndex * stripeSpacing,
          top: -width,
          width: stripeWidth,
          height: diagonalLength * 2.1,
          transform: [{ rotate: "45deg" }],
        }}
      />,
    );
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}>
      {stripes}
    </View>
  );
}

export function UnavailableLayer<TResource = any, TUnavailable = any>({
  unavailableSlots,
  resources,
  timeConfig,
  dimensions,
  unavailableStyles,
  renderUnavailableSlot,
}: UnavailableLayerProps<TResource, TUnavailable>) {
  const positionedSlots = useMemo(() => {
    return unavailableSlots
      .map((slot) => {
        const resourceIndex = resources.findIndex(
          (resource) => resource.id === slot.resourceId,
        );

        if (resourceIndex === -1) {
          return null;
        }

        const topPosition =
          (slot.startHour - timeConfig.startHour - 1) * dimensions.hourHeight;
        const blockHeight =
          (slot.endHour - slot.startHour) * dimensions.hourHeight;
        const leftPosition = resourceIndex * dimensions.resourceWidth;
        const blockWidth = dimensions.resourceWidth;

        return { slot, topPosition, leftPosition, blockWidth, blockHeight };
      })
      .filter(Boolean) as {
      slot: UnavailableSlot<TUnavailable>;
      topPosition: number;
      leftPosition: number;
      blockWidth: number;
      blockHeight: number;
    }[];
  }, [unavailableSlots, resources, timeConfig.startHour, dimensions]);

  const gridTotalWidth = resources.length * dimensions.resourceWidth;
  const gridBodyHeight =
    (timeConfig.endHour - timeConfig.startHour - 1) * dimensions.hourHeight;

  // Default styles
  const getSlotStyle = (type: string) => {
    switch (type) {
      case "reserved":
        return {
          backgroundColor:
            unavailableStyles?.reserved?.backgroundColor || "#7f1d1d",
          opacity: unavailableStyles?.reserved?.opacity || 0.3,
        };
      case "offHours":
        return {
          backgroundColor:
            unavailableStyles?.offHours?.backgroundColor || "#404040",
          opacity: unavailableStyles?.offHours?.opacity || 0.5,
        };
      case "disabled":
        return {
          backgroundColor:
            unavailableStyles?.disabled?.backgroundColor || "#525252",
          opacity: unavailableStyles?.disabled?.opacity || 0.6,
        };
      default:
        return {
          backgroundColor: "#404040",
          opacity: 0.5,
        };
    }
  };

  const getStripeColor = (type: string) => {
    if (type === "reserved") return "#dc2626";
    return "#737373";
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: gridTotalWidth,
        height: gridBodyHeight,
        zIndex: 1,
      }}
      pointerEvents="none">
      {positionedSlots.map((item) => {
        const showStripes = item.slot.type !== "disabled";
        const slotStyle = getSlotStyle(item.slot.type);
        const stripeColor = getStripeColor(item.slot.type);

        if (renderUnavailableSlot) {
          return (
            <View
              key={item.slot.id}
              style={{
                position: "absolute",
                top: item.topPosition,
                left: item.leftPosition,
                width: item.blockWidth,
                height: item.blockHeight,
              }}>
              {renderUnavailableSlot(item.slot, {
                width: item.blockWidth,
                height: item.blockHeight,
              })}
            </View>
          );
        }

        return (
          <View
            key={item.slot.id}
            style={{
              position: "absolute",
              overflow: "hidden",
              top: item.topPosition,
              left: item.leftPosition,
              width: item.blockWidth,
              height: item.blockHeight,
              backgroundColor: slotStyle.backgroundColor,
              opacity: slotStyle.opacity,
              borderWidth: 1,
              borderColor: "#333",
            }}>
            {showStripes && (
              <DiagonalStripes
                color={stripeColor}
                width={item.blockWidth}
                height={item.blockHeight}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
