import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  WORKING_DAYS, 
  DEFAULT_TIME_SLOTS,
  type ScheduleEntryWithDetails,
  type ScheduleFilters,
  type WorkingDay
} from "@shared/schema";
import { ClassBlock } from "./class-block";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

interface ScheduleCalendarProps {
  entries: ScheduleEntryWithDetails[];
  filters: ScheduleFilters;
  onEditEntry: (entry: ScheduleEntryWithDetails) => void;
  onDragEntry?: (entryId: string, newDay: WorkingDay, newSlotId: string) => void;
  isLoading?: boolean;
  lunchBreak?: { startTime: string; endTime: string; enabled: boolean };
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isLunchTime = (startTime: string, endTime: string, lunch?: { startTime: string; endTime: string; enabled: boolean }) => {
  if (!lunch || !lunch.enabled) return false;
  
  const slotStart = timeToMinutes(startTime);
  const slotEnd = timeToMinutes(endTime);
  const lunchStart = timeToMinutes(lunch.startTime);
  const lunchEnd = timeToMinutes(lunch.endTime);
  
  // Check if slot overlaps with lunch period
  return slotStart < lunchEnd && slotEnd > lunchStart;
};

const DAY_LABELS: Record<WorkingDay, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
};

const DAY_FULL_LABELS: Record<WorkingDay, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

export function ScheduleCalendar({
  entries,
  filters,
  onEditEntry,
  onDragEntry,
  isLoading,
  lunchBreak,
}: ScheduleCalendarProps) {
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  // Filter entries based on active filters
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filters.teacherId && entry.teacherId !== filters.teacherId) return false;
      if (filters.semester && entry.batch.semester !== filters.semester) return false;
      if (filters.courseId && entry.courseId !== filters.courseId) return false;
      if (filters.day && entry.day !== filters.day) return false;
      if (filters.classroomId && entry.classroomId !== filters.classroomId) return false;
      if (filters.courseType && entry.course.courseType !== filters.courseType) return false;
      return true;
    });
  }, [entries, filters]);

  // Group entries by day and time slot
  const entriesByDayAndSlot = useMemo(() => {
    const grouped: Record<string, ScheduleEntryWithDetails[]> = {};
    
    filteredEntries.forEach((entry) => {
      const key = `${entry.day}-${entry.timeSlotId}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });
    
    return grouped;
  }, [filteredEntries]);

  const handleDragStart = (e: React.DragEvent, entryId: string) => {
    e.dataTransfer.setData("entryId", entryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCell(cellKey);
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, day: WorkingDay, slotId: string) => {
    e.preventDefault();
    const entryId = e.dataTransfer.getData("entryId");
    if (entryId && onDragEntry) {
      onDragEntry(entryId, day, slotId);
    }
    setDragOverCell(null);
  };

  const conflictCount = filteredEntries.filter(e => e.hasConflict).length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="schedule-calendar">
      {/* Header with stats */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Weekly Schedule</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-schedule-theory" />
              Theory
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-schedule-lab" />
              Lab
            </span>
            {conflictCount > 0 && (
              <span className="flex items-center gap-1.5 text-schedule-conflict">
                <AlertTriangle className="w-4 h-4" />
                {conflictCount} Conflict{conflictCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredEntries.length} Classes Scheduled
        </div>
      </div>

      {/* Calendar Grid */}
      <ScrollArea className="flex-1">
        <div className="min-w-[900px]">
          {/* Time Slot Header */}
          <div className="flex sticky top-0 z-20 bg-card border-b">
            <div className="w-20 shrink-0 p-3 border-r font-medium text-sm text-muted-foreground">
              Day
            </div>
            {DEFAULT_TIME_SLOTS.map((slot) => (
              <div
                key={slot.slotNumber}
                className="flex-1 min-w-[100px] p-3 border-r text-center font-medium text-sm text-muted-foreground"
              >
                <span className="block">{slot.startTime}</span>
                <span className="block text-xs opacity-60">{slot.endTime}</span>
              </div>
            ))}
          </div>

          {/* Day Rows */}
          {WORKING_DAYS.map((day) => (
            <div key={day} className="flex border-b">
              {/* Day Label */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-20 shrink-0 p-3 border-r bg-muted/30 flex items-center justify-center font-medium text-sm sticky left-0 z-10">
                    {DAY_LABELS[day]}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {DAY_FULL_LABELS[day]}
                </TooltipContent>
              </Tooltip>

              {/* Time Slot Cells */}
              {DEFAULT_TIME_SLOTS.map((slot) => {
                const cellKey = `${day}-slot-${slot.slotNumber}`;
                const slotEntries = entriesByDayAndSlot[`${day}-slot-${slot.slotNumber}`] || [];
                const isDragOver = dragOverCell === cellKey;
                const isLunch = isLunchTime(slot.startTime, slot.endTime, lunchBreak);

                return (
                  <div
                    key={cellKey}
                    className={cn(
                      "flex-1 min-w-[100px] min-h-[90px] p-1 border-r transition-colors",
                      isDragOver && "bg-accent/50",
                      isLunch && "bg-orange-100/50 dark:bg-orange-950/30",
                      slotEntries.length === 0 && !isLunch && "bg-background"
                    )}
                    onDragOver={(e) => handleDragOver(e, cellKey)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, `slot-${slot.slotNumber}`)}
                    data-testid={`cell-${day}-${slot.slotNumber}`}
                  >
                    <div className="flex flex-col gap-1 h-full items-center justify-center">
                      {isLunch ? (
                        <span className="text-xs font-medium text-muted-foreground">Lunch Break</span>
                      ) : (
                        slotEntries.map((entry) => (
                          <ClassBlock
                            key={entry.id}
                            entry={entry}
                            onClick={() => onEditEntry(entry)}
                            onDragStart={(e) => handleDragStart(e, entry.id)}
                            draggable
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Empty State */}
      {filteredEntries.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-card rounded-lg border shadow-sm pointer-events-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-1">No Classes Scheduled</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {Object.keys(filters).length > 0 
                ? "No classes match your current filters. Try adjusting them."
                : "Generate a schedule or add classes manually to get started."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
