const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];
const MONTHS_JA = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS_JA[d.getDay()]}）`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDay(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDate();
}

export function getMonthLabel(year: number, month: number): string {
  return `${year}年 ${MONTHS_JA[month]}`;
}

export function getWeekdayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return WEEKDAYS_JA[d.getDay()];
}

export function getWeekdayIndex(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay();
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

export function isSameMonth(dateStr: string, year: number, month: number): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getFullYear() === year && d.getMonth() === month;
}

export function getCalendarDays(year: number, month: number): {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  weekdayIndex: number;
}[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: { date: string; day: number; isCurrentMonth: boolean; weekdayIndex: number }[] = [];

  // Previous month padding
  const prevLastDay = new Date(year, month, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevLastDay - i);
    days.push({
      date: dateToString(d),
      day: d.getDate(),
      isCurrentMonth: false,
      weekdayIndex: d.getDay(),
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: dateToString(d),
      day: i,
      isCurrentMonth: true,
      weekdayIndex: d.getDay(),
    });
  }

  // Next month padding to fill 6 rows (42 cells)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: dateToString(d),
      day: d.getDate(),
      isCurrentMonth: false,
      weekdayIndex: d.getDay(),
    });
  }

  return days;
}

export function dateToString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayString(): string {
  return dateToString(new Date());
}

export function groupEntriesByDate<T extends { entry_date: string }>(entries: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const entry of entries) {
    const date = entry.entry_date;
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(entry);
  }
  return map;
}

export { WEEKDAYS_JA, MONTHS_JA };
