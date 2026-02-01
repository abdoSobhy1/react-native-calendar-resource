import { ReactNode } from "react";

// Core data types
export type Resource = {
  id: string;
  label: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  color?: string;
};

export type DroppedEventData = {
  eventId: string;
  newResourceId: string;
  newStartHour: number;
  newEndHour: number;
};

export type UnavailableType = "reserved" | "offHours" | "disabled";

export type UnavailableSlot = {
  id: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  type: UnavailableType;
};

// Configuration types
export type CalendarDimensions = {
  /** Width of each resource column in pixels */
  resourceWidth: number;
  /** Height of each hour row in pixels */
  hourHeight: number;
};

export type CalendarTimeConfig = {
  /** Start hour (0-23) */
  startHour: number;
  /** End hour (1-24) */
  endHour: number;
  /** Time format for display (e.g., "HH:mm", "h a") */
  timeFormat?: string;
};

export type CalendarStyles = {
  /** Background color for the calendar */
  backgroundColor?: string;
  /** Grid line color */
  gridColor?: string;
  /** Header background color */
  headerBackgroundColor?: string;
  /** Time column background color */
  timeColumnBackgroundColor?: string;
  /** Slot background color */
  slotBackgroundColor?: string;
  /** Slot border color */
  slotBorderColor?: string;
};

export type CalendarEventStyles = {
  /** Default event background color */
  defaultColor?: string;
  /** Event border radius */
  borderRadius?: number;
  /** Event opacity */
  opacity?: number;
};

export type UnavailableSlotStyles = {
  /** Style for reserved slots */
  reserved?: {
    backgroundColor?: string;
    opacity?: number;
  };
  /** Style for off-hours slots */
  offHours?: {
    backgroundColor?: string;
    opacity?: number;
  };
  /** Style for disabled slots */
  disabled?: {
    backgroundColor?: string;
    opacity?: number;
  };
};

// Render function types
export type RenderEventFunction = (
  event: CalendarEvent,
  dimensions: { width: number; height: number },
) => ReactNode;

export type RenderResourceHeaderFunction = (resource: Resource) => ReactNode;

export type RenderTimeSlotFunction = (hour: number) => ReactNode;

export type RenderUnavailableSlotFunction = (
  slot: UnavailableSlot,
  dimensions: { width: number; height: number },
) => ReactNode;

// Main props type
export type CalendarProps = {
  // Required props
  date: Date;
  resources: Resource[];
  events: CalendarEvent[];

  // Optional data
  unavailableSlots?: UnavailableSlot[];

  // Configuration
  timeConfig?: CalendarTimeConfig;
  dimensions?: Partial<CalendarDimensions>;
  styles?: CalendarStyles;
  eventStyles?: CalendarEventStyles;
  unavailableStyles?: UnavailableSlotStyles;

  // Zoom configuration
  zoomEnabled?: boolean;
  maxZoom?: number;
  initialZoom?: number;
  snapBack?: boolean;
  snapBackDelay?: number;

  // Interaction handlers
  onSlotPress?: (hour: number, resourceId: string, date: Date) => void;
  onEventPress?: (event: CalendarEvent) => void;
  onResourcePress?: (resource: Resource) => void;
  onDateChange?: (date: Date) => void;
  onEventDrop?: (
    droppedData: DroppedEventData,
    originalEvent: CalendarEvent,
  ) => void;

  // Date range constraints
  minDate?: Date;
  maxDate?: Date;
  allowPastDates?: boolean;

  // Custom render functions
  renderEvent?: RenderEventFunction;
  renderResourceHeader?: RenderResourceHeaderFunction;
  renderTimeSlot?: RenderTimeSlotFunction;
  renderUnavailableSlot?: RenderUnavailableSlotFunction;

  // Feature flags
  showHeader?: boolean;
  showTimeColumn?: boolean;
  showResourceHeaders?: boolean;
  enableHorizontalScroll?: boolean;
  enableVerticalScroll?: boolean;
  showDateNavigation?: boolean;
  enableDragAndDrop?: boolean;
  dateFormat?: string;

  // Accessibility
  accessibilityLabel?: string;
};
