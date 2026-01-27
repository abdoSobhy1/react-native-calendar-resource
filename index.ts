// Main package entry point
export { Calendar } from "./components/calendar/Calendar";

// Sub-components
export { CalendarHeader } from "./components/calendar/CalendarHeader";
export { EventsLayer } from "./components/calendar/EventsLayer";
export { GridBody } from "./components/calendar/GridBody";
export { ResourceHeaders } from "./components/calendar/ResourceHeaders";
export { TimeColumn } from "./components/calendar/TimeColumn";
export { UnavailableLayer } from "./components/calendar/UnavailableLayer";

// Types
export type {
  CalendarDimensions,
  CalendarEvent,
  CalendarEventStyles,
  CalendarProps,
  CalendarStyles,
  CalendarTimeConfig,
  RenderEventFunction,
  RenderResourceHeaderFunction,
  RenderTimeSlotFunction,
  RenderUnavailableSlotFunction,
  Resource,
  UnavailableSlot,
  UnavailableSlotStyles,
  UnavailableType,
} from "./types/calendar";
