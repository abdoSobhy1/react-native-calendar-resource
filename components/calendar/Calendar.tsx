import { useMemo, useRef, useState, useEffect } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import {
  CalendarDimensions,
  CalendarProps,
  CalendarTimeConfig,
} from "../../types/calendar";
import { CalendarHeader } from "./CalendarHeader";
import { EventsLayer } from "./EventsLayer";
import { GridBody } from "./GridBody";
import { ResourceHeaders } from "./ResourceHeaders";
import { TimeColumn } from "./TimeColumn";
import { UnavailableLayer } from "./UnavailableLayer";

// Default configuration
const DEFAULT_DIMENSIONS: CalendarDimensions = {
  resourceWidth: 64,
  hourHeight: 64,
};

const DEFAULT_TIME_CONFIG: CalendarTimeConfig = {
  startHour: 9,
  endHour: 24,
  timeFormat: "HH:mm",
};

export function Calendar({
  date,
  resources,
  events,
  unavailableSlots = [],
  timeConfig,
  dimensions,
  zoomEnabled = false,
  maxZoom = 3,
  initialZoom = 1,
  snapBack = false,
  snapBackDelay = 1000,
  styles,
  eventStyles,
  unavailableStyles,
  onSlotPress,
  onEventPress,
  onEventDrop,
  onResourcePress,
  onDateChange,
  minDate,
  maxDate,
  allowPastDates = false,
  renderEvent,
  renderResourceHeader,
  renderTimeSlot,
  renderUnavailableSlot,
  showHeader = true,
  showTimeColumn = true,
  showResourceHeaders = true,
  enableHorizontalScroll = true,
  enableVerticalScroll = true,
  showDateNavigation = true,
  enableDragAndDrop = false,
  dateFormat = "EEE, MMM d, yyyy",
  accessibilityLabel = "Calendar",
}: CalendarProps) {
  const headerScrollRef = useRef<ScrollView>(null);
  const timeColumnScrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<ScrollView>(null);

  // Zoom state
  const minZoom = 1;
  const zoomScale = useSharedValue(initialZoom);
  const savedZoomScale = useSharedValue(initialZoom);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [isPinching, setIsPinching] = useState(false);
  const snapBackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const focalX = useRef(0);
  const focalY = useRef(0);
  const lastScrollX = useRef(0);
  const lastScrollY = useRef(0);

  // Update state when zoom changes
  useAnimatedReaction(
    () => zoomScale.value,
    (zoom) => {
      runOnJS(setCurrentZoom)(zoom);
    },
  );

  // Adjust scroll position for focal point zooming
  const prevZoom = useRef(initialZoom);
  useEffect(() => {
    if (currentZoom !== prevZoom.current && horizontalScrollRef.current && verticalScrollRef.current) {
      const zoomRatio = currentZoom / prevZoom.current;
      
      // Calculate new scroll position to keep focal point in place
      horizontalScrollRef.current.scrollTo({
        x: (lastScrollX.current + focalX.current) * zoomRatio - focalX.current,
        animated: false,
      });
      
      verticalScrollRef.current.scrollTo({
        y: (lastScrollY.current + focalY.current) * zoomRatio - focalY.current,
        animated: false,
      });
      
      lastScrollX.current = (lastScrollX.current + focalX.current) * zoomRatio - focalX.current;
      lastScrollY.current = (lastScrollY.current + focalY.current) * zoomRatio - focalY.current;
      
      prevZoom.current = currentZoom;
    }
  }, [currentZoom]);

  // Merge configurations with defaults
  const baseDimensions = useMemo(
    () => ({ ...DEFAULT_DIMENSIONS, ...dimensions }),
    [dimensions],
  );

  const finalTimeConfig = useMemo(
    () => ({ ...DEFAULT_TIME_CONFIG, ...timeConfig }),
    [timeConfig],
  );

  // Apply zoom to dimensions - recalculate on zoom change
  const finalDimensions = useMemo(
    () => ({
      resourceWidth: baseDimensions.resourceWidth * currentZoom,
      hourHeight: baseDimensions.hourHeight * currentZoom,
    }),
    [baseDimensions, currentZoom],
  );

  // Calculate grid dimensions
  const gridTotalWidth = resources.length * finalDimensions.resourceWidth;
  const totalHours = finalTimeConfig.endHour - finalTimeConfig.startHour;
  const gridTotalHeight = totalHours * finalDimensions.hourHeight;

  // Callbacks to update focal point (avoid accessing refs in worklets)
  const updateFocalPoint = (x: number, y: number) => {
    focalX.current = x;
    focalY.current = y;
  };

  // Pinch gesture for zoom with focal point
  const pinchGesture = Gesture.Pinch()
    .enabled(zoomEnabled)
    .onBegin((e: { focalX: number; focalY: number }) => {
      'worklet';
      // Clear any pending snap-back timer
      if (snapBackTimerRef.current) {
        clearTimeout(snapBackTimerRef.current);
        snapBackTimerRef.current = null;
      }
      runOnJS(setIsPinching)(true);
      runOnJS(updateFocalPoint)(e.focalX, e.focalY);
    })
    .onUpdate((e: { scale: number; focalX: number; focalY: number }) => {
      'worklet';
      const newScale = savedZoomScale.value * e.scale;
      const clampedScale = Math.max(minZoom, Math.min(maxZoom, newScale));
      
      // Update zoom
      zoomScale.value = clampedScale;
      
      // Store focal point
      runOnJS(updateFocalPoint)(e.focalX, e.focalY);
    })
    .onEnd(() => {
      'worklet';
      savedZoomScale.value = zoomScale.value;
      runOnJS(setIsPinching)(false);
      
      // Snap back with smooth animation
      if (snapBack && zoomScale.value !== initialZoom) {
        snapBackTimerRef.current = setTimeout(() => {
          zoomScale.value = withTiming(initialZoom, { 
            duration: 400,
            // Use easeOut for smoother deceleration
          });
          savedZoomScale.value = initialZoom;
        }, snapBackDelay);
      }
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(setIsPinching)(false);
    });

  const handleHorizontalScroll = (
    scrollEvent: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const horizontalOffset = scrollEvent.nativeEvent.contentOffset.x;
    lastScrollX.current = horizontalOffset;
    headerScrollRef.current?.scrollTo({ x: horizontalOffset, animated: false });
  };

  const handleVerticalScroll = (
    scrollEvent: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const verticalOffset = scrollEvent.nativeEvent.contentOffset.y;
    lastScrollY.current = verticalOffset;
    timeColumnScrollRef.current?.scrollTo({
      y: verticalOffset,
      animated: false,
    });
  };

  const backgroundColor = styles?.backgroundColor || "#1a1a1a";

  return (
    <View
      style={{ flex: 1, backgroundColor }}
      accessibilityLabel={accessibilityLabel}>
      {showHeader && (
        <CalendarHeader
          date={date}
          timeConfig={finalTimeConfig}
          onDateChange={onDateChange}
          showDateNavigation={showDateNavigation}
          dateFormat={dateFormat}
          minDate={minDate}
          maxDate={maxDate}
          allowPastDates={allowPastDates}
        />
      )}

      {showResourceHeaders && (
        <ResourceHeaders
          resources={resources}
          scrollRef={headerScrollRef}
          dimensions={finalDimensions}
          renderResourceHeader={renderResourceHeader}
          onResourcePress={onResourcePress}
        />
      )}

      <View style={{ flex: 1, flexDirection: "row" }}>
        {showTimeColumn && (
          <TimeColumn
            scrollRef={timeColumnScrollRef}
            gridTotalHeight={gridTotalHeight}
            timeConfig={finalTimeConfig}
            dimensions={finalDimensions}
            renderTimeSlot={renderTimeSlot}
            styles={styles}
          />
        )}

        <View style={{ flex: 1 }}>
          <GestureDetector gesture={pinchGesture}>
            <Animated.View style={{ flex: 1 }}>
              <ScrollView
                ref={horizontalScrollRef}
                horizontal={enableHorizontalScroll}
                showsHorizontalScrollIndicator={enableHorizontalScroll}
                bounces={false}
                onScroll={handleHorizontalScroll}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
                scrollEnabled={enableHorizontalScroll && !isPinching}>
                <ScrollView
                  ref={verticalScrollRef}
                  showsVerticalScrollIndicator={enableVerticalScroll}
                  bounces={false}
                  onScroll={handleVerticalScroll}
                  scrollEventThrottle={16}
                  nestedScrollEnabled={true}
                  scrollEnabled={enableVerticalScroll && !isPinching}
                  contentContainerStyle={{
                    width: gridTotalWidth,
                    height: gridTotalHeight,
                  }}>
                  <View
                    style={{
                      position: "relative",
                      width: gridTotalWidth,
                      height: gridTotalHeight,
                    }}>
                    <GridBody
                      resources={resources}
                      events={events}
                      unavailableSlots={unavailableSlots}
                      onSlotPress={onSlotPress}
                      date={date}
                      timeConfig={finalTimeConfig}
                      dimensions={finalDimensions}
                      styles={styles}
                    />
                    <UnavailableLayer
                      unavailableSlots={unavailableSlots}
                      resources={resources}
                      timeConfig={finalTimeConfig}
                      dimensions={finalDimensions}
                      unavailableStyles={unavailableStyles}
                      renderUnavailableSlot={renderUnavailableSlot}
                    />
                    <EventsLayer
                      events={events}
                      resources={resources}
                      onEventPress={onEventPress}
                      onEventDrop={onEventDrop}
                      timeConfig={finalTimeConfig}
                      dimensions={finalDimensions}
                      eventStyles={eventStyles}
                      renderEvent={renderEvent}
                      enableDragAndDrop={enableDragAndDrop}
                    />
                  </View>
                </ScrollView>
              </ScrollView>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}
