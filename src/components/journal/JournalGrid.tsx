import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getSentimentGradientColor } from '@/lib/sentiment-utils';
import { JournalEntry } from '@/lib/database';

interface JournalGridProps {
  entries: JournalEntry[];
  onEntryClick?: (entry: JournalEntry) => void;
}

export function JournalGrid({ entries, onEntryClick }: JournalGridProps) {
  // Build dayData from entries
  type DayData = {
    date: string;
    sentiment: number | null;
    hasEntry: boolean;
    entry?: JournalEntry;
  };
  const dayData: DayData[] = entries.map(entry => ({
    date: entry.date,
    sentiment: entry.sentiment_score,
    hasEntry: true,
    entry,
  }));
  // Always 7 columns for days of the week, fill card width
  const cols = 7;
  const total = dayData.length;
  if (total === 0) return null;
  // Reverse the data so the most recent day is first
  const reversedDayData = dayData.slice().reverse();
  // Find the weekday of the most recent day (0=Sunday, 1=Monday, ... 6=Saturday)
  const mostRecentDate = new Date(reversedDayData[0].date);
  const mostRecentWeekday = mostRecentDate.getDay();
  // Convert to Monday=0, Sunday=6
  const mostRecentCol = (mostRecentWeekday + 6) % 7;
  // Pad the start (top row, left side) so the most recent day lands in its correct column
  const padStart = mostRecentCol;
  let paddedDayData: (DayData | null)[] = [...Array(padStart).fill(null), ...reversedDayData];
  // Find the weekday of the oldest day
  const oldestDate = new Date(reversedDayData[reversedDayData.length - 1].date);
  const oldestWeekday = oldestDate.getDay();
  const oldestCol = (oldestWeekday + 6) % 7;
  // Pad the end (bottom row, right side) so the oldest day lands in its correct column
  const padEnd = cols - 1 - oldestCol;
  paddedDayData = [...paddedDayData, ...Array(padEnd).fill(null)];
  // Calculate number of rows
  const rows = Math.ceil(paddedDayData.length / cols);
  // Fill the grid top-down, left to right
  const grid: (DayData | null)[][] = [];
  for (let r = 0; r < rows; r++) {
    grid.push(paddedDayData.slice(r * cols, (r + 1) * cols));
  }
  return (
    <div className="grid grid-cols-7 gap-5 w-full">
      {grid.flat().map((day, idx) => (
        day ? (
          <Tooltip key={day.date}>
            <TooltipTrigger asChild>
              <div
                className={`aspect-square w-full rounded-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer`}
                style={{ background: day.hasEntry ? getSentimentGradientColor(day.sentiment!) : '#ededed' }}
                onClick={() => day.entry && onEntryClick?.(day.entry)}
              >
                {day.hasEntry && (
                  <span className="text-xs font-medium text-foreground">
                    {day.sentiment}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span>
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div key={idx} className="aspect-square w-full rounded-sm border border-gray-200 bg-white" />
        )
      ))}
    </div>
  );
} 