import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import { FilterSidebar } from "@/components/filter-sidebar";
import { EditScheduleModal } from "@/components/edit-schedule-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { 
  Teacher, 
  Course, 
  Batch, 
  Classroom, 
  TimeSlot,
  ScheduleEntryWithDetails,
  ScheduleFilters,
  WorkingDay,
} from "@shared/schema";

export default function Schedule() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ScheduleFilters>({});
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntryWithDetails | null>(null);

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
  });

  const { data: classrooms = [] } = useQuery<Classroom[]>({
    queryKey: ["/api/classrooms"],
  });

  const { data: timeSlots = [] } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots"],
  });

  const { data: entries = [], isLoading } = useQuery<ScheduleEntryWithDetails[]>({
    queryKey: ["/api/schedule"],
  });

  const { data: lunchBreak } = useQuery({
    queryKey: ["/api/lunch-break"],
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/schedule/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Schedule Updated",
        description: "The class has been rescheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update the schedule entry.",
        variant: "destructive",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/schedule/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Class Removed",
        description: "The scheduled class has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Could not remove the schedule entry.",
        variant: "destructive",
      });
    },
  });

  const handleEditEntry = (entry: ScheduleEntryWithDetails) => {
    setEditingEntry(entry);
  };

  const handleSaveEntry = async (id: string, data: any) => {
    await updateEntryMutation.mutateAsync({ id, data });
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteEntryMutation.mutateAsync(id);
    setEditingEntry(null);
  };

  const handleDragEntry = async (entryId: string, newDay: WorkingDay, newSlotId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    // Find the actual time slot
    const slot = timeSlots.find(s => s.id === newSlotId);
    if (!slot) return;

    await updateEntryMutation.mutateAsync({
      id: entryId,
      data: {
        courseId: entry.courseId,
        teacherId: entry.teacherId,
        batchId: entry.batchId,
        classroomId: entry.classroomId,
        timeSlotId: slot.id,
        day: newDay,
        labGroup: entry.labGroup,
      },
    });
  };

  // Conflict checking function for the edit modal
  const checkConflict = (data: any, excludeId?: string) => {
    const otherEntries = entries.filter(e => e.id !== excludeId);
    
    // Check for teacher conflict
    const teacherConflict = otherEntries.find(
      e => e.teacherId === data.teacherId && e.day === data.day && e.timeSlotId === data.timeSlotId
    );
    if (teacherConflict) {
      return { hasConflict: true, message: "Teacher is already assigned to another class at this time" };
    }

    // Check for room conflict
    const roomConflict = otherEntries.find(
      e => e.classroomId === data.classroomId && e.day === data.day && e.timeSlotId === data.timeSlotId
    );
    if (roomConflict) {
      return { hasConflict: true, message: "Room is already occupied at this time" };
    }

    // Check for batch conflict
    const batchConflict = otherEntries.find(
      e => e.batchId === data.batchId && e.day === data.day && e.timeSlotId === data.timeSlotId
    );
    if (batchConflict) {
      return { hasConflict: true, message: "Batch has another class scheduled at this time" };
    }

    return null;
  };

  return (
    <div className="flex-1 flex overflow-hidden" data-testid="schedule-page">
      <FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        teachers={teachers}
        courses={courses}
        batches={batches}
        classrooms={classrooms}
        isCollapsed={filterCollapsed}
        onToggleCollapse={() => setFilterCollapsed(!filterCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <ScheduleCalendar
          entries={entries}
          filters={filters}
          onEditEntry={handleEditEntry}
          onDragEntry={handleDragEntry}
          isLoading={isLoading}
          lunchBreak={lunchBreak}
        />
      </div>

      <EditScheduleModal
        entry={editingEntry}
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        teachers={teachers}
        courses={courses}
        batches={batches}
        classrooms={classrooms}
        timeSlots={timeSlots}
        conflictCheck={checkConflict}
      />
    </div>
  );
}
