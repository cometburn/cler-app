# Date Formatter Utility

A flexible date formatting utility that supports custom format strings.

## Installation

Just copy the `date-formatter.ts` file to your utils folder.

## Usage

```typescript
import { formatDate } from '@/utils/date-formatter';

const date = new Date('2026-02-14T15:30:45');

// Common formats
formatDate(date, 'MM/DD/YYYY')              // "02/14/2026"
formatDate(date, 'DD/MM/YYYY')              // "14/02/2026"
formatDate(date, 'YYYY-MM-DD')              // "2026-02-14"

// With time
formatDate(date, 'MM/DD/YYYY HH:mm:ss')     // "02/14/2026 15:30:45"
formatDate(date, 'DD/MM/YYYY hh:mm A')      // "14/02/2026 03:30 PM"
formatDate(date, 'YYYY-MM-DD HH:mm')        // "2026-02-14 15:30"

// 12-hour format
formatDate(date, 'hh:mm A')                 // "03:30 PM"
formatDate(date, 'h:m a')                   // "3:30 pm"

// Without leading zeros
formatDate(date, 'M/D/YY')                  // "2/14/26"
formatDate(date, 'D/M/YYYY H:m')            // "14/2/2026 15:30"

// Custom separators
formatDate(date, 'YYYY.MM.DD')              // "2026.02.14"
formatDate(date, 'DD-MM-YYYY')              // "14-02-2026"
formatDate(date, 'MM/DD/YY @ hh:mm A')      // "02/14/26 @ 03:30 PM"
```

## Supported Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `YYYY` | 4-digit year | 2026 |
| `YY` | 2-digit year | 26 |
| `MM` | 2-digit month | 01-12 |
| `M` | Month without leading zero | 1-12 |
| `DD` | 2-digit day | 01-31 |
| `D` | Day without leading zero | 1-31 |
| `HH` | 24-hour format with leading zero | 00-23 |
| `H` | 24-hour format without leading zero | 0-23 |
| `hh` | 12-hour format with leading zero | 01-12 |
| `h` | 12-hour format without leading zero | 1-12 |
| `mm` | Minutes with leading zero | 00-59 |
| `m` | Minutes without leading zero | 0-59 |
| `ss` | Seconds with leading zero | 00-59 |
| `s` | Seconds without leading zero | 0-59 |
| `A` | AM/PM uppercase | AM, PM |
| `a` | am/pm lowercase | am, pm |

## Common Format Patterns

```typescript
// US Format
formatDate(date, 'MM/DD/YYYY')              // 02/14/2026

// European Format
formatDate(date, 'DD/MM/YYYY')              // 14/02/2026

// ISO Format
formatDate(date, 'YYYY-MM-DD')              // 2026-02-14

// Database Timestamp
formatDate(date, 'YYYY-MM-DD HH:mm:ss')     // 2026-02-14 15:30:45

// Human Readable
formatDate(date, 'MM/DD/YYYY hh:mm A')      // 02/14/2026 03:30 PM

// Compact
formatDate(date, 'M/D/YY')                  // 2/14/26

// Time Only
formatDate(date, 'HH:mm:ss')                // 15:30:45
formatDate(date, 'hh:mm A')                 // 03:30 PM
```

## With DateTimePicker Component

```tsx
import { formatDate } from '@/utils/date-formatter';
import { DateTimePickerField } from '@/components/ui/datetime-picker-field';

<DateTimePickerField
  control={form.control}
  name="start_datetime"
  label="Start Date & Time"
  formatDate={(date) => formatDate(date, 'MM/DD/YYYY hh:mm A')}
/>
```

## Edge Cases

```typescript
// Invalid date
formatDate(null, 'MM/DD/YYYY')              // ""
formatDate(undefined, 'MM/DD/YYYY')         // ""
formatDate('invalid', 'MM/DD/YYYY')         // ""

// Default format (if not specified)
formatDate(date)                            // "02/14/2026" (MM/DD/YYYY)
```

## Backward Compatibility

The old functions still work:

```typescript
import { formatDateMMDDYYYY, formatDateTimeMMDDYYYY } from '@/utils/date-formatter';

formatDateMMDDYYYY(date)          // "02/14/2026"
formatDateTimeMMDDYYYY(date)      // "02/14/2026 15:30"
```

## Migration Guide

### Before
```typescript
const formatted = formatDateMMDDYYYY(date);
```

### After
```typescript
const formatted = formatDate(date, 'MM/DD/YYYY');
```

Or create your own custom formats:
```typescript
const usFormat = formatDate(date, 'MM/DD/YYYY');
const euroFormat = formatDate(date, 'DD/MM/YYYY');
const isoFormat = formatDate(date, 'YYYY-MM-DD HH:mm:ss');
```

## TypeScript Support

Fully typed with TypeScript:

```typescript
formatDate(date: string | Date | undefined | null, format?: string): string
```

But our custom `formatDate` is lighter (no dependencies) and covers most common use cases! 🎯