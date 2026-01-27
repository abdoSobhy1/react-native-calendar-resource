import { ReactNode } from "react";

// Core data types
export type Resource<T = any> = {
  id: string;
  label: string;
  data?: T; // Additional custom data
};

export type CalendarEvent<T = any> = {
  id: string;
  title: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  color?: string;
  data?: T; // Additional custom data
};

export type UnavailableType = "reserved" | "offHours" | "disabled";

export type UnavailableSlot<T = any> = {
  id: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  type: UnavailableType;
  data?: T; // Additional custom data
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
export type RenderEventFunction<T = any> = (
  event: CalendarEvent<T>,
  dimensions: { width: number; height: number },
) => ReactNode;

export type RenderResourceHeaderFunction<T = any> = (
  resource: Resource<T>,
) => ReactNode;

export type RenderTimeSlotFunction = (hour: number) => ReactNode;

export type RenderUnavailableSlotFunction<T = any> = (
  slot: UnavailableSlot<T>,
  dimensions: { width: number; height: number },
) => ReactNode;

// Main props type
export type CalendarProps<TEvent = any, TResource = any, TUnavailable = any> = {
  // Required props
  date: Date;
  resources: Resource<TResource>[];
  events: CalendarEvent<TEvent>[];

  // Optional data
  unavailableSlots?: UnavailableSlot<TUnavailable>[];

  // Configuration
  timeConfig?: CalendarTimeConfig;
  dimensions?: Partial<CalendarDimensions>;
  styles?: CalendarStyles;
  eventStyles?: CalendarEventStyles;
  unavailableStyles?: UnavailableSlotStyles;

  // Interaction handlers
  onSlotPress?: (hour: number, resourceId: string, date: Date) => void;
  onEventPress?: (event: CalendarEvent<TEvent>) => void;
  onResourcePress?: (resource: Resource<TResource>) => void;
  onDateChange?: (date: Date) => void;

  // Date range constraints
  minDate?: Date;
  maxDate?: Date;
  allowPastDates?: boolean;

  // Custom render functions
  renderEvent?: RenderEventFunction<TEvent>;
  renderResourceHeader?: RenderResourceHeaderFunction<TResource>;
  renderTimeSlot?: RenderTimeSlotFunction;
  renderUnavailableSlot?: RenderUnavailableSlotFunction<TUnavailable>;

  // Feature flags
  showHeader?: boolean;
  showTimeColumn?: boolean;
  showResourceHeaders?: boolean;
  enableHorizontalScroll?: boolean;
  enableVerticalScroll?: boolean;
  showDateNavigation?: boolean;
  dateFormat?: string;

  // Accessibility
  accessibilityLabel?: string;
};
