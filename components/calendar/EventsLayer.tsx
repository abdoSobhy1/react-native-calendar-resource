import { useMemo, useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  CalendarDimensions,
  CalendarEvent,
  CalendarEventStyles,
  CalendarTimeConfig,
  DroppedEventData,
  RenderEventFunction,
  Resource,
} from "../../types/calendar";

type EventsLayerProps = {
  events: CalendarEvent[];
  resources: Resource[];
  onEventPress?: (event: CalendarEvent) => void;
  onEventDrop?: (
    droppedData: DroppedEventData,
    originalEvent: CalendarEvent,
  ) => void;
  timeConfig: CalendarTimeConfig;
  dimensions: CalendarDimensions;
  eventStyles?: CalendarEventStyles;
  renderEvent?: RenderEventFunction;
  enableDragAndDrop?: boolean;
};

export function EventsLayer({
  events,
  resources,
  onEventPress,
  onEventDrop,
  timeConfig,
  dimensions,
  eventStyles,
  renderEvent,
  enableDragAndDrop = false,
}: EventsLayerProps) {
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dropPreview, setDropPreview] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
  } | null>(null);
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
      event: CalendarEvent;
      topPosition: number;
      leftPosition: number;
      blockWidth: number;
      blockHeight: number;
    }[];
  }, [events, resources, timeConfig.startHour, dimensions]);

  const gridTotalWidth = resources.length * dimensions.resourceWidth;
  const gridBodyHeight =
    (timeConfig.endHour - timeConfig.startHour - 1) * dimensions.hourHeight;

  const handleEventPress = (event: CalendarEvent) => {
    if (!draggedEventId) {
      onEventPress?.(event);
    }
  };

  const updateDropPreview = (
    event: CalendarEvent,
    currentX: number,
    currentY: number,
    blockWidth: number,
    blockHeight: number,
    eventColor: string,
  ) => {
    "worklet";
    // Calculate snapped position
    const newResourceIndex = Math.max(
      0,
      Math.min(
        Math.floor(currentX / dimensions.resourceWidth),
        resources.length - 1,
      ),
    );

    const hourOffset = currentY / dimensions.hourHeight;
    const eventDuration = event.endHour - event.startHour;
    let newStartHour = timeConfig.startHour + hourOffset;

    // Snap to whole hour cells
    newStartHour = Math.round(newStartHour);

    // Clamp to valid range
    newStartHour = Math.max(
      timeConfig.startHour,
      Math.min(timeConfig.endHour - eventDuration, newStartHour),
    );

    const snappedTop =
      (newStartHour - timeConfig.startHour - 1) * dimensions.hourHeight;
    const snappedLeft = newResourceIndex * dimensions.resourceWidth;

    runOnJS(setDropPreview)({
      top: snappedTop,
      left: snappedLeft,
      width: blockWidth,
      height: blockHeight,
      color: eventColor,
    });
  };

  const handleEventDrop = (
    event: CalendarEvent,
    finalX: number,
    finalY: number,
  ) => {
    "worklet";
    // Calculate new resource and time
    const newResourceIndex = Math.max(
      0,
      Math.min(
        Math.floor(finalX / dimensions.resourceWidth),
        resources.length - 1,
      ),
    );
    const newResource = resources[newResourceIndex];

    const hourOffset = finalY / dimensions.hourHeight;
    const eventDuration = event.endHour - event.startHour;
    let newStartHour = timeConfig.startHour + hourOffset;

    // Snap to whole hour cells
    newStartHour = Math.round(newStartHour);

    // Clamp to valid range
    newStartHour = Math.max(
      timeConfig.startHour,
      Math.min(timeConfig.endHour - eventDuration, newStartHour),
    );
    const newEndHour = newStartHour + eventDuration;

    // Only trigger callback if position changed significantly
    if (
      newResource.id !== event.resourceId ||
      Math.abs(newStartHour - event.startHour) > 0.1
    ) {
      runOnJS(onEventDrop!)(
        {
          eventId: event.id,
          newResourceId: newResource.id,
          newStartHour,
          newEndHour,
        },
        event,
      );
    }

    runOnJS(setDraggedEventId)(null);
    runOnJS(setDropPreview)(null);
  };

  const createGesture = (
    event: CalendarEvent,
    layoutX: number,
    layoutY: number,
    translateX: Animated.SharedValue<number>,
    translateY: Animated.SharedValue<number>,
    blockWidth: number,
    blockHeight: number,
    eventColor: string,
  ) => {
    const longPress = Gesture.LongPress()
      .minDuration(500)
      .onStart(() => {
        if (enableDragAndDrop) {
          runOnJS(setDraggedEventId)(event.id);
        }
      });

    const pan = Gesture.Pan()
      .enabled(enableDragAndDrop)
      .activeOffsetX([-5, 5])
      .activeOffsetY([-5, 5])
      .onUpdate((e) => {
        translateX.value = e.translationX;
        translateY.value = e.translationY;

        // Update preview position
        const currentX = layoutX + e.translationX;
        const currentY = layoutY + e.translationY;
        updateDropPreview(
          event,
          currentX,
          currentY,
          blockWidth,
          blockHeight,
          eventColor,
        );
      })
      .onEnd(() => {
        const finalX = layoutX + translateX.value;
        const finalY = layoutY + translateY.value;

        // Calculate snapped position
        const newResourceIndex = Math.max(
          0,
          Math.min(
            Math.floor(finalX / dimensions.resourceWidth),
            resources.length - 1,
          ),
        );
        const hourOffset = finalY / dimensions.hourHeight;
        const eventDuration = event.endHour - event.startHour;
        let newStartHour = timeConfig.startHour + hourOffset;
        newStartHour = Math.round(newStartHour);
        newStartHour = Math.max(
          timeConfig.startHour,
          Math.min(timeConfig.endHour - eventDuration, newStartHour),
        );

        const snappedTop =
          (newStartHour - timeConfig.startHour - 1) * dimensions.hourHeight;
        const snappedLeft = newResourceIndex * dimensions.resourceWidth;

        // Snap instantly to final position and KEEP it there
        translateX.value = snappedLeft - layoutX;
        translateY.value = snappedTop - layoutY;

        // Trigger the drop callback - React will re-render with new position
        handleEventDrop(event, finalX, finalY);

        // Don't reset - let React take over when it re-renders with updated event data
      });

    return Gesture.Simultaneous(longPress, pan);
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
      {/* Drop preview ghost */}
      {dropPreview && (
        <View
          style={{
            position: "absolute",
            top: dropPreview.top,
            left: dropPreview.left,
            width: dropPreview.width,
            height: dropPreview.height,
            backgroundColor: dropPreview.color,
            opacity: 0.3,
            borderRadius,
            borderWidth: 2,
            borderColor: "#ffffff",
            borderStyle: "dashed",
            zIndex: 5,
          }}
        />
      )}

      {positionedEvents.map((item) => {
        const eventColor = item.event.color || defaultColor;
        const isDragging = draggedEventId === item.event.id;

        return (
          <EventBlock
            key={item.event.id}
            event={item.event}
            topPosition={item.topPosition}
            leftPosition={item.leftPosition}
            blockHeight={item.blockHeight}
            blockWidth={item.blockWidth}
            eventColor={eventColor}
            isDragging={isDragging}
            borderRadius={borderRadius}
            opacity={opacity}
            enableDragAndDrop={enableDragAndDrop}
            onPress={handleEventPress}
            createGesture={createGesture}
            renderEvent={renderEvent}
            updateDropPreview={updateDropPreview}
          />
        );
      })}
    </View>
  );
}

// Separate component for each event block to manage its own gesture state
type EventBlockProps = {
  event: CalendarEvent;
  topPosition: number;
  leftPosition: number;
  blockHeight: number;
  blockWidth: number;
  eventColor: string;
  isDragging: boolean;
  borderRadius: number;
  opacity: number;
  enableDragAndDrop: boolean;
  onPress: (event: CalendarEvent) => void;
  createGesture: (
    event: CalendarEvent,
    layoutX: number,
    layoutY: number,
    translateX: Animated.SharedValue<number>,
    translateY: Animated.SharedValue<number>,
    blockWidth: number,
    blockHeight: number,
    eventColor: string,
  ) => any;
  renderEvent?: RenderEventFunction;
  updateDropPreview: (
    event: CalendarEvent,
    currentX: number,
    currentY: number,
    blockWidth: number,
    blockHeight: number,
    eventColor: string,
  ) => void;
};

function EventBlock({
  event,
  topPosition,
  leftPosition,
  blockHeight,
  blockWidth,
  eventColor,
  isDragging,
  borderRadius,
  opacity,
  enableDragAndDrop,
  onPress,
  createGesture,
  renderEvent,
  updateDropPreview,
}: EventBlockProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Reset translation when position changes (event data updated)
  // Use the event's position as a key to detect changes
  const positionKey = `${topPosition}-${leftPosition}`;
  const prevPositionKey = useSharedValue(positionKey);

  useEffect(() => {
    if (prevPositionKey.value !== positionKey && !isDragging) {
      translateX.value = 0;
      translateY.value = 0;
      prevPositionKey.value = positionKey;
    }
  }, [positionKey, isDragging, prevPositionKey, translateX, translateY]);

  const gesture = enableDragAndDrop
    ? createGesture(
        event,
        leftPosition,
        topPosition,
        translateX,
        translateY,
        blockWidth,
        blockHeight,
        eventColor,
      )
    : undefined;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: isDragging ? withSpring(1.05) : withSpring(1) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1a1a",
          top: topPosition,
          left: leftPosition,
          height: blockHeight,
          width: blockWidth,
          zIndex: isDragging ? 1000 : 10,
        },
        animatedStyle,
      ]}>
      <GestureDetector gesture={gesture || Gesture.Tap()}>
        <Animated.View style={{ width: "100%", height: "100%" }}>
          <Pressable
            onPress={() => onPress(event)}
            style={{
              height: blockHeight - 2,
              width: blockWidth - 2,
              backgroundColor: eventColor,
              borderRadius,
              opacity: isDragging ? 0.7 : opacity,
              justifyContent: "center",
              alignItems: "center",
              padding: 8,
              overflow: "hidden",
              borderWidth: isDragging ? 2 : 0,
              borderColor: "#ffffff",
            }}>
            {renderEvent ? (
              renderEvent(event, {
                width: blockWidth - 2,
                height: blockHeight - 2,
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
                {event.title}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
