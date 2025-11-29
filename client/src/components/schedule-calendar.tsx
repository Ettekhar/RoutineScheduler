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

const format24to12 = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

const isLunchTime = (startTime: string, endTime: string, lunch?: { startTime: string; endTime: string; enabled: boolean }) => {
  if (!lunch || !lunch.enabled) return false;
  
  const slotStart = timeToMinutes(startTime);
  const slotEnd = timeToMinutes(endTime);
  const lunchStart = timeToMinutes(lunch.startTime);
  const lunchEnd = timeToMinutes(lunch.endTime);
  
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

  // Check if "all semester" filter is active
  const isAllSemesterView = !filters.semester;

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

  // Group entries by day, semester, and time slot (for all semester view)
  const entriesByDaySemanticSlot = useMemo(() => {
    const grouped: Record<string, ScheduleEntryWithDetails[]> = {};
    
    filteredEntries.forEach((entry) => {
      const key = `${entry.day}-sem-${entry.batch.semester}-${entry.timeSlotId}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });
    
    return grouped;
  }, [filteredEntries]);

  // Group entries by day and time slot (for regular view)
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

  // Render semester-wise view (all semester filter)
  if (isAllSemesterView) {
    return (
      <div className="flex flex-col h-full" data-testid="schedule-calendar">
        {/* Header with stats */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Weekly Schedule (By Semester)</h2>
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

        {/* Semester Grid with Days in front */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="border rounded-lg overflow-hidden">
              {/* Time Slot Header Row */}
              <div className="flex border-b">
                <div className="w-16 shrink-0 p-2 border-r font-medium text-sm text-muted-foreground">
                  Day
                </div>
                <div className="w-16 shrink-0 p-2 border-r font-medium text-sm text-muted-foreground">
                  Sem
                </div>
                {DEFAULT_TIME_SLOTS.map((slot) => {
                  const isLunch = isLunchTime(slot.startTime, slot.endTime, lunchBreak);
                  return (
                    <div
                      key={slot.slotNumber}
                      className={cn(
                        "shrink-0 p-2 border-r text-center font-medium text-xs text-muted-foreground",
                        isLunch ? "w-24" : "w-40"
                      )}
                    >
                      {isLunch ? "Lunch" : `${slot.startTime}-${slot.endTime}`}
                    </div>
                  );
                })}
              </div>

              {/* Day and Semester Rows */}
              {WORKING_DAYS.map((day, dayIndex) => (
                <div key={day}>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((sem, semIndex) => (
                    <div key={`${day}-${sem}`} className="flex border-b last:border-b-0">
                      {/* Day Label (only for middle semester - S4) */}
                      {semIndex === 3 ? (
                        <div className={cn(
                          "w-16 shrink-0 p-2 border-r font-medium text-sm text-center bg-muted/30",
                          "row-span-8"
                        )} style={{ gridRow: `span 8` }}>
                          {DAY_LABELS[day]}
                        </div>
                      ) : (
                        <div className="w-16 shrink-0 p-2 border-r font-medium text-sm text-center" />
                      )}

                      {/* Semester Label */}
                      <div className="w-16 shrink-0 p-2 border-r font-medium text-sm text-center bg-muted/20">
                        S{sem}
                      </div>

                      {/* Time Slot Cells */}
                      {DEFAULT_TIME_SLOTS.map((slot) => {
                        const cellKey = `${day}-sem-${sem}-slot-${slot.slotNumber}`;
                        const cellEntries = entriesByDaySemanticSlot[`${day}-sem-${sem}-slot-${slot.slotNumber}`] || [];
                        const isDragOver = dragOverCell === cellKey;
                        const isLunch = isLunchTime(slot.startTime, slot.endTime, lunchBreak);

                        return (
                          <div
                            key={cellKey}
                            className={cn(
                              "shrink-0 min-h-[70px] p-1.5 border-r transition-colors",
                              isLunch ? "w-24" : "w-40",
                              isDragOver && !isLunch && "bg-accent/50",
                              isLunch && "bg-orange-100/50 dark:bg-orange-950/40 flex items-center justify-center"
                            )}
                            onDragOver={(e) => handleDragOver(e, cellKey)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day, `slot-${slot.slotNumber}`)}
                            data-testid={`cell-${day}-sem-${sem}-${slot.slotNumber}`}
                          >
                            <div className="flex flex-col gap-0.5 w-full h-full justify-start">
                              {!isLunch && cellEntries.length > 0 && (
                                cellEntries.map((entry) => (
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
              ))}
            </div>
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
                Generate a schedule or add classes manually to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render time-slot view (when semester filter is applied)
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
            {DEFAULT_TIME_SLOTS.map((slot) => {
              const isLunch = isLunchTime(slot.startTime, slot.endTime, lunchBreak);
              return (
                <div
                  key={slot.slotNumber}
                  className={cn(
                    "p-2 border-r text-center font-medium text-sm text-muted-foreground",
                    isLunch ? "min-w-[70px] flex-shrink" : "flex-1 min-w-[120px]"
                  )}
                >
                  <span className="block">{format24to12(slot.startTime)}</span>
                  <span className="block text-xs opacity-60">{format24to12(slot.endTime)}</span>
                </div>
              );
            })}
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
                      "min-h-[110px] p-2 border-r transition-colors",
                      isLunch ? "min-w-[70px] flex-shrink" : "flex-1 min-w-[120px]",
                      isDragOver && !isLunch && "bg-accent/50",
                      isLunch && "bg-orange-100/50 dark:bg-orange-950/40 flex items-center justify-center"
                    )}
                    onDragOver={(e) => handleDragOver(e, cellKey)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, `slot-${slot.slotNumber}`)}
                    data-testid={`cell-${day}-${slot.slotNumber}`}
                  >
                    <div className="flex flex-col gap-2 w-full h-full justify-start">
                      {isLunch ? (
                        <div className="flex items-center justify-center h-full text-center">
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Lunch</span>
                        </div>
                      ) : slotEntries.length > 0 ? (
                        slotEntries.map((entry) => (
                          <ClassBlock
                            key={entry.id}
                            entry={entry}
                            onClick={() => onEditEntry(entry)}
                            onDragStart={(e) => handleDragStart(e, entry.id)}
                            draggable
                          />
                        ))
                      ) : null}
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
