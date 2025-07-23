import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getSentimentGradientColor } from '@/lib/sentiment-utils';
import { JournalEntry } from '@/lib/database';

interface JournalGridProps {
  entries: JournalEntry[];
  onEntryClick?: (entry: JournalEntry) => void;
}

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  // Monday=0, Sunday=6
  const diff = (day === 0 ? 6 : day - 1);
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getSunday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  // Monday=0, Sunday=6
  const diff = (day === 0 ? 0 : 7 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function JournalGrid({ entries, onEntryClick }: JournalGridProps) {
  if (!entries || entries.length === 0) return null;

  // Map entries by date (YYYY-MM-DD)
  const entryMap = new Map<string, JournalEntry>();
  entries.forEach(entry => {
    entryMap.set(entry.date, entry);
  });

  // Find oldest entry date and today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oldestEntryDate = new Date(entries.reduce((min, e) => e.date < min ? e.date : min, entries[0].date));

  // Start from Monday of the oldest entry's week
  const startDate = getMonday(oldestEntryDate);
  // End at Sunday of the current week
  const endDate = getSunday(today);

  // Build day data for all days in range
  type DayData = {
    date: string;
    sentiment: number | null;
    hasEntry: boolean;
    entry?: JournalEntry;
    isFuture: boolean;
  };
  const dayData: DayData[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const entry = entryMap.get(dateStr);
    const isFuture = d > today;
    dayData.push({
      date: dateStr,
      sentiment: entry ? entry.sentiment_score : null,
      hasEntry: !!entry,
      entry,
      isFuture,
    });
  }

  // Split into weeks (arrays of 7 days, Monday-Sunday)
  const weeks: DayData[][] = [];
  let i = 0;
  // Handle first (oldest) week, which may be partial
  const firstWeekLen = 7 - (new Date(startDate).getDay() === 0 ? 6 : new Date(startDate).getDay() - 1);
  const firstWeek = dayData.slice(0, firstWeekLen);
  while (firstWeek.length < 7) firstWeek.unshift({ date: '', sentiment: null, hasEntry: false, isFuture: false });
  weeks.push(firstWeek);
  i = firstWeekLen;
  // Handle all full weeks in between
  for (; i + 7 <= dayData.length; i += 7) {
    weeks.push(dayData.slice(i, i + 7));
  }
  // Handle last (most recent) week, which may be partial
  if (i < dayData.length) {
    const lastWeek = dayData.slice(i);
    while (lastWeek.length < 7) lastWeek.push({ date: '', sentiment: null, hasEntry: false, isFuture: false });
    weeks.push(lastWeek);
  }
  // Most recent week at the top
  weeks.reverse();
  // Shift each week left by 1 (so Monday aligns with first column)
  const shiftedWeeks = weeks.map(week => week.slice(1).concat(week[0]));

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-xs text-center text-muted-foreground pb-1">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
      {shiftedWeeks.map((week, wIdx) => (
        <div key={wIdx} className="grid grid-cols-7 gap-1 w-full">
          {week.map((day, idx) => (
            <div key={day.date + idx}>
              {day.hasEntry ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`aspect-square w-full rounded-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer`}
                      style={{ background: getSentimentGradientColor(day.sentiment!) }}
                      onClick={() => day.entry && onEntryClick?.(day.entry)}
                    >
                      <span className="text-xs font-medium text-foreground">
                        {day.sentiment}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>
                      {day.date && new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </TooltipContent>
                </Tooltip>
              ) : day.isFuture ? (
                <div className="aspect-square w-full rounded-sm border border-gray-200 bg-white" />
              ) : (
                <div className="aspect-square w-full rounded-sm border border-gray-200 bg-gray-200 dark:bg-gray-800" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 