# React Native Calendar Component

A fully customizable, type-safe resource-based calendar component for React Native. Built with TypeScript and pure React Native styling, this calendar displays events across multiple resources (courts, rooms, equipment, etc.) with flexible time slots and unavailable periods.

## Features

- ✨ **Fully Customizable** - Configure everything from dimensions to colors to rendering
- 🎯 **Type-Safe** - Full TypeScript support with generics
- 📱 **Resource-Based** - Display multiple resources side-by-side
- ⏰ **Flexible Time Slots** - Configure any start/end hour range
- 🎨 **Custom Rendering** - Override default renderers for events, resources, and slots
- 🚫 **Unavailable Slots** - Support for reserved, off-hours, and disabled periods
- 📐 **Configurable Dimensions** - Adjust resource width and hour height
- 🎭 **Style Customization** - Full control over colors and appearance
- 👆 **Interactive** - Handle slot, event, and resource press events
- 🔄 **Synchronized Scrolling** - Header and time column scroll with the grid
- 🎯 **Drag and Drop** - Long-press and drag events to reschedule (optional)
- 🔍 **Pinch to Zoom** - Zoom in/out with focal point support (optional)

---

## Installation

```bash
npm install react-native-calendar-resource
# or
yarn add react-native-calendar-resource
```

### Dependencies

Ensure you have the required peer dependencies:

```bash
npm install date-fns
# or
yarn add date-fns
```

**Note:** For Expo projects, these are typically already installed. For bare React Native projects, follow the [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation) and [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) installation guides.

---

## Quick Start

```tsx
import { Calendar } from "react-native-calendar-resource";

function MyCalendar() {
  return (
    <Calendar
      date={new Date()}
      resources={[
        { id: "1", label: "event 1" },
        { id: "2", label: "event 2" },
      ]}
      events={[
        {
          id: "evt1",
          title: "Booked",
          resourceId: "1",
          startHour: 10,
          endHour: 12,
          color: "#3b82f6",
        },
      ]}
      onSlotPress={(hour, resourceId, date) => {
        console.log("Slot pressed:", { hour, resourceId, date });
      }}
    />
  );
}
```

---

## API Reference

### Required Props

| Prop        | Type                 | Description                              |
| ----------- | -------------------- | ---------------------------------------- |
| `date`      | `Date`               | The date to display in the calendar      |
| `resources` | `Resource<T>[]`      | Array of resources to display as columns |
| `events`    | `CalendarEvent<T>[]` | Array of events to render                |

### Optional Props

| Prop                     | Type                                   | Default                                              | Description                                 |
| ------------------------ | -------------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| `unavailableSlots`       | `UnavailableSlot<T>[]`                 | `[]`                                                 | Slots that are unavailable                  |
| `timeConfig`             | `CalendarTimeConfig`                   | `{ startHour: 9, endHour: 24, timeFormat: "HH:mm" }` | Time configuration                          |
| `dimensions`             | `Partial<CalendarDimensions>`          | `{ resourceWidth: 64, hourHeight: 64 }`              | Grid dimensions                             |
| `styles`                 | `CalendarStyles`                       | -                                                    | Overall calendar styling                    |
| `eventStyles`            | `CalendarEventStyles`                  | -                                                    | Event-specific styling                      |
| `unavailableStyles`      | `UnavailableSlotStyles`                | -                                                    | Unavailable slot styling                    |
| `onSlotPress`            | `(hour, resourceId, date) => void`     | -                                                    | Called when empty slot is pressed           |
| `onEventPress`           | `(event) => void`                      | -                                                    | Called when event is pressed                |
| `onEventDrop`            | `(droppedData, originalEvent) => void` | -                                                    | Called when event is dropped after dragging |
| `onResourcePress`        | `(resource) => void`                   | -                                                    | Called when resource header is pressed      |
| `renderEvent`            | `(event, dimensions) => ReactNode`     | -                                                    | Custom event renderer                       |
| `renderResourceHeader`   | `(resource) => ReactNode`              | -                                                    | Custom resource header renderer             |
| `renderTimeSlot`         | `(hour) => ReactNode`                  | -                                                    | Custom time slot renderer                   |
| `renderUnavailableSlot`  | `(slot, dimensions) => ReactNode`      | -                                                    | Custom unavailable slot renderer            |
| `showHeader`             | `boolean`                              | `true`                                               | Show date header                            |
| `showTimeColumn`         | `boolean`                              | `true`                                               | Show time column                            |
| `showResourceHeaders`    | `boolean`                              | `true`                                               | Show resource headers                       |
| `enableHorizontalScroll` | `boolean`                              | `true`                                               | Enable horizontal scrolling                 |
| `enableVerticalScroll`   | `boolean`                              | `true`                                               | Enable vertical scrolling                   |
| `enableDragAndDrop`      | `boolean`                              | `false`                                              | Enable drag and drop for events             |
| `zoomEnabled`            | `boolean`                              | `false`                                              | Enable pinch-to-zoom gesture ⚠️ Experimental |
| `maxZoom`                | `number`                               | `3`                                                  | Maximum zoom level (3 = 300%)               |
| `initialZoom`            | `number`                               | `1`                                                  | Initial zoom level (1 = 100%)               |
| `snapBack`               | `boolean`                              | `false`                                              | Auto-return to initial zoom after gesture   |
| `snapBackDelay`          | `number`                               | `1000`                                               | Delay before snap-back in milliseconds      |

---

## Type Definitions

```typescript
type Resource<T = any> = {
  id: string;
  label: string;
  data?: T; // Additional custom data
};

type CalendarEvent<T = any> = {
  id: string;
  title: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  color?: string;
  data?: T; // Additional custom data
};

type UnavailableSlot<T = any> = {
  id: string;
  resourceId: string;
  startHour: number;
  endHour: number;
  type: "reserved" | "offHours" | "disabled";
  data?: T; // Additional custom data
};

type CalendarTimeConfig = {
  startHour: number; // 0-23
  endHour: number; // 1-24
  timeFormat?: string; // date-fns format string
};

type CalendarDimensions = {
  resourceWidth: number; // px
  hourHeight: number; // px
};
```

---

## Examples

### Drag and Drop Events

Enable event rescheduling by long-pressing and dragging:

```tsx
import { useState } from "react";
import { Calendar, CalendarEvent } from "react-native-calendar-resource";

function MyCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "evt1",
      title: "Team Meeting",
      resourceId: "1",
      startHour: 10,
      endHour: 11.5,
      color: "#3b82f6",
    },
  ]);

  return (
    <Calendar
      date={new Date()}
      resources={resources}
      events={events}
      enableDragAndDrop={true}
      onEventDrop={(droppedData, originalEvent) => {
        // Update event with new time/resource
        setEvents((prev) =>
          prev.map((event) =>
            event.id === droppedData.eventId
              ? {
                  ...event,
                  resourceId: droppedData.newResourceId,
                  startHour: droppedData.newStartHour,
                  endHour: droppedData.newEndHour,
                }
              : event,
          ),
        );

        console.log("Event moved:", {
          from: {
            resource: originalEvent.resourceId,
            time: `${originalEvent.startHour}-${originalEvent.endHour}`,
          },
          to: {
            resource: droppedData.newResourceId,
            time: `${droppedData.newStartHour}-${droppedData.newEndHour}`,
          },
        });
      }}
    />
  );
}
```

**How it works:**

- Long-press an event for 500ms to start dragging
- Drag the event to a new resource or time slot
- Events snap to 30-minute intervals
- Visual feedback shows the event being dragged (opacity, scale, border)
- The `onEventDrop` callback receives both the new position and original event data

### Pinch to Zoom

> **⚠️ EXPERIMENTAL FEATURE**: Pinch-to-zoom is currently experimental and may have performance or gesture detection issues. We recommend waiting for a stable release before using in production.

Enable pinch-to-zoom for better visibility of events:

```tsx
<Calendar
  date={new Date()}
  resources={resources}
  events={events}
  zoomEnabled={true}
  maxZoom={3}
  initialZoom={1}
  snapBack={true}
  snapBackDelay={1000}
/>
```

**How it works:**

- Pinch with two fingers to zoom in/out (min: 1x, max: configurable)
- Zoom centers on the focal point between your fingers
- Scroll position adjusts automatically to keep content in view
- Optional snap-back returns to initial zoom after a delay
- Smooth animations for zoom transitions

### Custom Time Range

```tsx
<Calendar
  date={new Date()}
  resources={resources}
  events={events}
  timeConfig={{
    startHour: 6, // Start at 6 AM
    endHour: 22, // End at 10 PM
    timeFormat: "h:mm a", // 12-hour format
  }}
/>
```

### Custom Dimensions

```tsx
<Calendar
  date={new Date()}
  resources={resources}
  events={events}
  dimensions={{
    resourceWidth: 100,
    hourHeight: 80,
  }}
/>
```

### Custom Event Rendering

```tsx
<Calendar
  date={new Date()}
  resources={resources}
  events={events}
  renderEvent={(event, { width, height }) => (
    <View style={{ width, height, backgroundColor: event.color, padding: 8 }}>
      <Text style={{ color: "white", fontWeight: "bold" }}>{event.title}</Text>
      <Text style={{ color: "white", fontSize: 12 }}>
        {event.startHour}:00 - {event.endHour}:00
      </Text>
    </View>
  )}
/>
```

### Custom Resource Headers

```tsx
<Calendar
  date={new Date()}
  resources={resources}
  events={events}
  renderResourceHeader={(resource) => (
    <View style={{ padding: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
        {resource.label}
      </Text>
      <Text style={{ fontSize: 12, color: "#999" }}>Available</Text>
    </View>
  )}
/>
```

### Custom Styling

```tsx
<Calendar
  date={new Date()}
  resources={resources}
  events={events}
  styles={{
    backgroundColor: "#000",
    gridColor: "#333",
    slotBackgroundColor: "#1a1a1a",
  }}
  eventStyles={{
    defaultColor: "#3b82f6",
    borderRadius: 12,
    opacity: 0.9,
  }}
  unavailableStyles={{
    reserved: {
      backgroundColor: "#dc2626",
      opacity: 0.4,
    },
    offHours: {
      backgroundColor: "#404040",
      opacity: 0.6,
    },
  }}
/>
```

### With TypeScript Generics

```tsx
interface eventData {
  capacity: number;
  amenities: string[];
}

interface BookingData {
  userId: string;
  notes: string;
}

<Calendar<BookingData, eventData>
  date={new Date()}
  resources={[
    {
      id: "1",
      label: "event 1",
      data: { capacity: 4, amenities: ["lights", "net"] },
    },
  ]}
  events={[
    {
      id: "1",
      title: "Booked",
      resourceId: "1",
      startHour: 10,
      endHour: 12,
      data: { userId: "user123", notes: "Bring equipment" },
    },
  ]}
  onEventPress={(event) => {
    console.log(event.data.userId); // Type-safe!
  }}
/>;
```

---

## Technologies

- React Native
- Expo
- TypeScript
- date-fns

---

## License

MIT

---

**Author:** Abdelrahman Sobhy
