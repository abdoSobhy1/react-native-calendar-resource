import { addDays, format, subDays } from "date-fns";
import { Pressable, Text, View } from "react-native";
import { CalendarTimeConfig } from "../../types/calendar";

type CalendarHeaderProps = {
  date: Date;
  timeConfig: CalendarTimeConfig;
  onDateChange?: (date: Date) => void;
  showDateNavigation?: boolean;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  allowPastDates?: boolean;
};

export function CalendarHeader({
  date,
  timeConfig,
  onDateChange,
  showDateNavigation = true,
  dateFormat = "EEE, MMM d, yyyy",
  minDate,
  maxDate,
  allowPastDates = true,
}: CalendarHeaderProps) {
  const handlePreviousDay = () => {
    const newDate = subDays(date, 1);

    // Check if going back is allowed
    if (!allowPastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(newDate);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate < today) return;
    }

    // Check minDate constraint
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      const checkDate = new Date(newDate);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate < min) return;
    }

    onDateChange?.(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDays(date, 1);

    // Check maxDate constraint
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      const checkDate = new Date(newDate);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate > max) return;
    }

    onDateChange?.(newDate);
  };

  // Check if previous button should be disabled
  const isPreviousDisabled = () => {
    const prevDate = subDays(date, 1);

    if (!allowPastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(prevDate);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate < today) return true;
    }

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      const checkDate = new Date(prevDate);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate < min) return true;
    }

    return false;
  };

  // Check if next button should be disabled
  const isNextDisabled = () => {
    if (!maxDate) return false;

    const nextDate = addDays(date, 1);
    const max = new Date(maxDate);
    max.setHours(0, 0, 0, 0);
    const checkDate = new Date(nextDate);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate > max;
  };

  const prevDisabled = isPreviousDisabled();
  const nextDisabled = isNextDisabled();

  return (
    <View
      style={{
        backgroundColor: "#1a1a1a",
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        {showDateNavigation ? (
          <>
            <Pressable
              onPress={handlePreviousDay}
              disabled={prevDisabled}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(38, 38, 38, 0.75)",
              }}>
              <Text style={{ color: prevDisabled ? "#626262" : "#fefefe", fontSize: 24, fontWeight: "bold" }}>‹</Text>
            </Pressable>
            <Text style={{ color: "#fefefe", fontSize: 16, fontWeight: "600" }}>
              {format(date, dateFormat)}
            </Text>
            <Pressable
              onPress={handleNextDay}
              disabled={nextDisabled}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(38, 38, 38, 0.75)",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Text style={{ color: nextDisabled ? "#626262" : "#fefefe", fontSize: 24, fontWeight: "bold" }}>›</Text>
            </Pressable>
          </>
        ) : (
          <Text style={{ color: '#fefefe', fontSize: 16, fontWeight: '600' }}>
            {format(date, dateFormat)}
          </Text>
        )}
      </View>
    </View>
  );
}
