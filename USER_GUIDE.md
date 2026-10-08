# Calendar Event Countdown User Guide

Calendar Event Countdown is a bilingual calendar and event countdown widget for Scriptable. It supports the iPhone Lock Screen and Home Screen, plus the extra-large iPadOS widget.

[中文使用说明](./使用说明.md) · [Project README](./README.md)

## Install

1. Install [Scriptable](https://scriptable.app/) on your iPhone or iPad.
2. Create a new script in Scriptable.
3. Copy all content from [`CalendarEventCountdown.js`](./CalendarEventCountdown.js) and name the script `CalendarEventCountdown`.
4. Run it once and allow Scriptable to read your calendars.

The script only reads calendars and events. It never creates, edits, or deletes calendar data, and it makes no network requests.

## Add the Widget

### Home Screen

1. Touch and hold an empty area of the Home Screen, then add a **Scriptable** widget.
2. Choose the small, medium, or large size.
3. Touch and hold the widget, then select **Edit Widget**.
4. Select `CalendarEventCountdown` under **Script**.
5. Enter a query under **Parameter**. Leave it blank to show the nearest events from all calendars.

### Lock Screen

Edit the Lock Screen, add Scriptable's rectangular widget, and select `CalendarEventCountdown`. Only the rectangular Lock Screen widget is currently supported.

### Extra-Large iPadOS Widget

Add an extra-large Scriptable widget and select this script. Availability depends on the device and system version.

## Widget Parameters

### Common Examples

| What you want | Parameter |
| --- | --- |
| Nearest events from all calendars | Leave blank |
| Events from the `Work` calendar | `Work` |
| Merge the `Work` and `Personal` calendars | `Work/Personal` |
| Events titled or containing `Anniversary` | `Anniversary` |
| Prioritize an anniversary, then fill from two calendars | `Anniversary.Work/Personal` |
| Month-only small widget | `$month` |
| Today-only small widget | `$today` |

Replace the example names with calendar names or event titles that exist on your device.

### Separators

- `.` separates independent query groups, for example `Birthday.Anniversary.Work`.
- `/` combines complete calendar names into one group, for example `Work/Personal/Family`.

Use `/` only to combine calendars. The `.` and `/` characters cannot be escaped in parameters.

### Query Rules

- A regular parameter first looks for an exact calendar name. If that calendar does not exist, it searches event titles.
- Title search tries an exact match first, then a partial match.
- With multiple groups, the script reserves the nearest unique event from each earlier group. The last group fills the remaining space. Put the most important query first.
- The rectangular Lock Screen widget accepts up to 2 groups; other widgets accept up to 5.
- `$month` and `$today` work only as the sole parameter of a small widget.

## Widget Layouts

| Size | Content |
| --- | --- |
| Rectangular Lock Screen | Primary countdown and upcoming events |
| Small | Countdown list, month-only view, or today-only view |
| Medium | Countdowns on the left and month calendar on the right |
| Large | Countdowns on the left, today at the upper right, and month calendar below |
| Extra large on iPadOS | Countdowns on the left and a wide calendar with event titles on the right |

### English Preview

![English small and medium widgets](./previews/1.jpg)

![English large widget](./previews/2.jpg)

![English rectangular Lock Screen widget](./previews/3.jpg)

## Countdown Display

- Events are labeled as `Now`, `Today`, `Tomorrow`, `In 2 days`, `In N days`, `Yesterday`, `Two days ago`, or `N days ago`.
- Future events show their start time. Primary events that are in progress or past show their end time.
- Both languages use the 24-hour clock.
- Event bars use the corresponding Apple Calendar color.
- Home Screen titles use up to two lines with a minimum scale factor of 0.8. Later events are omitted when no vertical space remains.
- When adjacent events have the same relative date, the later date label is hidden while retaining the same width. Their titles therefore remain aligned on both Home Screen and Lock Screen lists.
- Regular queries cover now through five years ahead and retain up to 20 sorted events per group.
- If no future event is found, the script searches backward for an exact title match, one year at a time, up to 100 years.

## Birthday Privacy

The script masks names in common birthday-title formats:

```text
John's Birthday → Sb's Birthday
John’s Birthday → Sb’s Birthday
Johnʼs Birthday → Sbʼs Birthday
张三的21岁生日 → 某人的21岁生日
```

English titles must contain `birthday` and a name followed by `'s`, `’s`, or `ʼs`. Chinese titles must contain both `生日` and `的`. Titles that do not match these patterns remain unchanged.

## Month Calendar

- Weeks start on Monday by default, and dates from adjacent months remain visible.
- Weekends are dimmed; today is highlighted in white on red.
- The regular month view shows up to 4 colored event dots per day.
- The wide iPadOS calendar shows up to 4 colored event titles per day.
- A custom bilingual subtitle can appear beside the month.

### Holidays and Adjusted Workdays

The default settings recognize a calendar named `中国大陆节假日`:

- A title containing `（休）` dims the date as a day off.
- A title containing `（班）` restores normal opacity for an adjusted workday.
- These holiday events are hidden from normal event dots and titles by default.

Change the related settings near the top of the script if your holiday calendar uses different names or markers.

## Language

The default setting is:

```javascript
const languageMode = "auto";
```

- `auto`: use Chinese when the system language code begins with `zh`; otherwise use English.
- `zh`: always use Chinese.
- `en`: always use English.

Interface text, relative dates, months, weekdays, and time labels are localized. User calendar names, event titles, and widget parameters are not translated.

## Common Settings

Edit these values near the top of the script:

```javascript
const weekStartsMonday = true;      // Start weeks on Monday
const hideOtherMonth = false;       // Show dates from adjacent months
const showRestFeature = true;       // Style holidays and adjusted workdays
const hideRestEvent = true;         // Hide holiday event markers
const restCalendarTitle = "中国大陆节假日";
const restEventTitle = "（休）";
const workEventTitle = "（班）";
const languageMode = "auto";        // auto, zh, or en
const monthSubtitle = {
  zh: "美好即将发生",
  en: "Good things ahead"
};
```

To hide the subtitle beside the month:

```javascript
const monthSubtitle = { zh: "", en: "" };
```

## Troubleshooting

### “Invalid input or no events” appears

Check the query-group limit, exact calendar spelling, every calendar joined with `/`, whether the requested event is within the search range, and Scriptable's Calendar permission.

### An event is missing

Events are affected by chronological order, query priority, duplicate removal, and available widget space. Put the most important query first.

### Calendar changes do not appear immediately

iOS and iPadOS schedule widget refreshes. Run the script in Scriptable to see a current preview, or wait for the next system refresh.

### The language did not change immediately

Wait for a widget refresh or run the script in Scriptable. You can temporarily set `languageMode` to `zh` or `en` to verify the layout.

### The month view loads slowly

The month view reads events for every day in its complete calendar grid. More calendars and denser schedules take longer than a countdown-only widget.

## Limitations

- Circular and inline Lock Screen widgets are not supported.
- The widget and events do not have custom tap links.
- The `.` and `/` separators cannot be escaped.
- Widget refresh timing is controlled by the operating system.

## Copyright and License

Copyright © Shelus2021.

You may use, modify, and redistribute this project for noncommercial purposes, provided that the attribution to Shelus2021 and the license information are retained. Selling it, including it in a paid product or service, or otherwise using it commercially requires prior written permission from the author. See [`LICENSE.md`](./LICENSE.md) for the complete terms.
