import { cn } from "@/lib/utils";
import type { ScheduleEntryWithDetails } from "@shared/schema";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { AlertTriangle, Users, MapPin, GraduationCap } from "lucide-react";

const format24to12 = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

interface ClassBlockProps {
  entry: ScheduleEntryWithDetails;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  draggable?: boolean;
  compact?: boolean;
}

const SEMESTER_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

export function ClassBlock({ 
  entry, 
  onClick, 
  onDragStart,
  draggable = false,
  compact = false 
}: ClassBlockProps) {
  const isTheory = entry.course.courseType === "theory";
  const hasConflict = entry.hasConflict;
  const semesterColor = SEMESTER_COLORS[(entry.batch.semester - 1) % SEMESTER_COLORS.length];

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
        "p-2.5 rounded-lg cursor-pointer transition-all relative",
        "border text-white shadow-sm hover:shadow-md",
        "hover-elevate active-elevate-2",
        "flex flex-col justify-between",
        isTheory 
          ? "bg-schedule-theory border-schedule-theory/80" 
          : "bg-schedule-lab border-schedule-lab/80",
        hasConflict && "ring-2 ring-schedule-conflict ring-offset-1 bg-stripes",
        compact && "p-1.5"
      )}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      data-testid={`class-block-${entry.id}`}
    >
      {/* Semester indicator dot */}
      <div className={cn("absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full shadow-md", semesterColor)} 
        title={`Semester ${entry.batch.semester}`}
      />

      {/* Conflict indicator */}
      {hasConflict && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-schedule-conflict flex items-center justify-center shadow-md border border-white">
          <AlertTriangle className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Course code */}
      <div className={cn(
        "font-bold truncate leading-tight",
        compact ? "text-xs" : "text-sm"
      )}>
        {entry.course.code}
      </div>

      {/* Course name (truncated) */}
      {!compact && (
        <div className="text-xs opacity-90 truncate leading-tight">
          {entry.course.name}
        </div>
      )}

      {/* Teacher name */}
      <div className={cn(
        "flex items-center gap-1 opacity-90 mt-1",
        compact ? "text-[10px]" : "text-xs"
      )}>
        <GraduationCap className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
        <span className="truncate">{entry.teacher.name.split(" ")[0]}</span>
      </div>

      {/* Room and batch info */}
      {!compact && (
        <div className="flex flex-col gap-1 mt-1.5 text-xs opacity-85">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{entry.classroom.roomNumber}</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <Users className="w-3 h-3 shrink-0" />
            <span className="truncate text-[11px]">{entry.batch.name}</span>
            {entry.labGroup && (
              <span className="px-1.5 py-0.5 rounded-sm bg-white/25 text-[10px] font-medium shrink-0">
                G{entry.labGroup}
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
            {format24to12(entry.timeSlot.startTime)} - {format24to12(entry.timeSlot.endTime)}
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
