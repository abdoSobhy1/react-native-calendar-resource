import { useMemo, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
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

export function Calendar<TEvent = any, TResource = any, TUnavailable = any>({
  date,
  resources,
  events,
  unavailableSlots = [],
  timeConfig,
  dimensions,
  styles,
  eventStyles,
  unavailableStyles,
  onSlotPress,
  onEventPress,
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
  dateFormat = "EEE, MMM d, yyyy",
  accessibilityLabel = "Calendar",
}: CalendarProps<TEvent, TResource, TUnavailable>) {
  const headerScrollRef = useRef<ScrollView>(null);
  const timeColumnScrollRef = useRef<ScrollView>(null);

  // Merge configurations with defaults
  const finalDimensions = useMemo(
    () => ({ ...DEFAULT_DIMENSIONS, ...dimensions }),
    [dimensions],
  );

  const finalTimeConfig = useMemo(
    () => ({ ...DEFAULT_TIME_CONFIG, ...timeConfig }),
    [timeConfig],
  );

  // Calculate grid dimensions
  const gridTotalWidth = resources.length * finalDimensions.resourceWidth;
  const totalHours = finalTimeConfig.endHour - finalTimeConfig.startHour;
  const gridTotalHeight = totalHours * finalDimensions.hourHeight;

  const handleHorizontalScroll = (
    scrollEvent: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const horizontalOffset = scrollEvent.nativeEvent.contentOffset.x;
    headerScrollRef.current?.scrollTo({ x: horizontalOffset, animated: false });
  };

  const handleVerticalScroll = (
    scrollEvent: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const verticalOffset = scrollEvent.nativeEvent.contentOffset.y;
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
          <ScrollView
            horizontal={enableHorizontalScroll}
            showsHorizontalScrollIndicator={enableHorizontalScroll}
            bounces={false}
            onScroll={handleHorizontalScroll}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            scrollEnabled={enableHorizontalScroll}>
            <ScrollView
              showsVerticalScrollIndicator={enableVerticalScroll}
              bounces={false}
              onScroll={handleVerticalScroll}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
              scrollEnabled={enableVerticalScroll}
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
                  timeConfig={finalTimeConfig}
                  dimensions={finalDimensions}
                  eventStyles={eventStyles}
                  renderEvent={renderEvent}
                />
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
