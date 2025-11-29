import { cn } from "@/lib/utils";
import type { ScheduleEntryWithDetails } from "@shared/schema";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { AlertTriangle, Users, MapPin, GraduationCap } from "lucide-react";

interface ClassBlockProps {
  entry: ScheduleEntryWithDetails;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  draggable?: boolean;
  compact?: boolean;
}

export function ClassBlock({ 
  entry, 
  onClick, 
  onDragStart,
  draggable = false,
  compact = false 
}: ClassBlockProps) {
  const isTheory = entry.course.courseType === "theory";
  const hasConflict = entry.hasConflict;

  const getConflictMessage = () => {
    switch (entry.conflictType) {
      case "teacher":
        return "Teacher is assigned to another class at this time";
      case "room":
        return "Room is already occupied at this time";
      case "batch":
        return "Batch has another class scheduled at this time";
      default:
        return "Schedule conflict detected";
    }
  };

  const blockContent = (
    <div
      className={cn(
        "p-2 rounded-md cursor-pointer transition-all h-full min-h-[70px]",
        "border text-white shadow-sm",
        "hover-elevate active-elevate-2",
        isTheory 
          ? "bg-schedule-theory border-schedule-theory/70" 
          : "bg-schedule-lab border-schedule-lab/70",
        hasConflict && "ring-2 ring-schedule-conflict ring-offset-1 bg-stripes",
        compact && "min-h-0 p-1.5"
      )}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      data-testid={`class-block-${entry.id}`}
    >
      {/* Conflict indicator */}
      {hasConflict && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-schedule-conflict flex items-center justify-center shadow-md">
          <AlertTriangle className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Course code */}
      <div className={cn(
        "font-semibold truncate",
        compact ? "text-xs" : "text-sm"
      )}>
        {entry.course.code}
      </div>

      {/* Course name (truncated) */}
      {!compact && (
        <div className="text-xs opacity-90 truncate mb-1">
          {entry.course.name}
        </div>
      )}

      {/* Teacher name */}
      <div className={cn(
        "flex items-center gap-1 opacity-90",
        compact ? "text-[10px]" : "text-xs"
      )}>
        <GraduationCap className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
        <span className="truncate">{entry.teacher.name}</span>
      </div>

      {/* Room and batch info */}
      {!compact && (
        <div className="flex items-center justify-between gap-2 mt-1 text-xs opacity-80">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{entry.classroom.roomNumber}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 shrink-0" />
            <span className="truncate">{entry.batch.name}</span>
            {entry.labGroup && (
              <span className="px-1 py-0.5 rounded bg-white/20 text-[10px] font-medium">
                {entry.labGroup}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          {blockContent}
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        className="max-w-xs p-3"
        data-testid={`tooltip-class-${entry.id}`}
      >
        <div className="space-y-2">
          <div>
            <div className="font-semibold">{entry.course.code}: {entry.course.name}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {entry.course.courseType} • {entry.course.creditHours} Credits
            </div>
          </div>
          
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span>{entry.teacher.name} ({entry.teacher.designation})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{entry.classroom.name} ({entry.classroom.roomNumber})</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                {entry.batch.name} - Semester {entry.batch.semester}
                {entry.labGroup && ` (Group ${entry.labGroup})`}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {entry.timeSlot.startTime} - {entry.timeSlot.endTime}
          </div>

          {hasConflict && (
            <div className="flex items-center gap-2 text-schedule-conflict text-sm font-medium pt-1 border-t">
              <AlertTriangle className="w-4 h-4" />
              {getConflictMessage()}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
