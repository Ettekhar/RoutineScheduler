import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Calendar, Clock, MapPin, GraduationCap, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { 
  ScheduleEntryWithDetails, 
  Teacher, 
  Course, 
  Batch, 
  Classroom,
  TimeSlot,
  WorkingDay 
} from "@shared/schema";
import { WORKING_DAYS, DEFAULT_TIME_SLOTS } from "@shared/schema";

const DAY_LABELS: Record<WorkingDay, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

const editScheduleSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  batchId: z.string().min(1, "Batch is required"),
  classroomId: z.string().min(1, "Classroom is required"),
  timeSlotId: z.string().min(1, "Time slot is required"),
  day: z.string().min(1, "Day is required"),
  labGroup: z.string().optional(),
});

type EditScheduleFormData = z.infer<typeof editScheduleSchema>;

interface EditScheduleModalProps {
  entry: ScheduleEntryWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: EditScheduleFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  teachers: Teacher[];
  courses: Course[];
  batches: Batch[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
  conflictCheck?: (data: EditScheduleFormData, excludeId?: string) => { hasConflict: boolean; message: string } | null;
}

export function EditScheduleModal({
  entry,
  isOpen,
  onClose,
  onSave,
  onDelete,
  teachers,
  courses,
  batches,
  classrooms,
  timeSlots,
  conflictCheck,
}: EditScheduleModalProps) {
  const form = useForm<EditScheduleFormData>({
    resolver: zodResolver(editScheduleSchema),
    defaultValues: {
      courseId: entry?.courseId || "",
      teacherId: entry?.teacherId || "",
      batchId: entry?.batchId || "",
      classroomId: entry?.classroomId || "",
      timeSlotId: entry?.timeSlotId || "",
      day: entry?.day || "",
      labGroup: entry?.labGroup || undefined,
    },
  });

  // Reset form when entry changes
  if (entry) {
    const currentValues = form.getValues();
    if (currentValues.courseId !== entry.courseId) {
      form.reset({
        courseId: entry.courseId,
        teacherId: entry.teacherId,
        batchId: entry.batchId,
        classroomId: entry.classroomId,
        timeSlotId: entry.timeSlotId,
        day: entry.day,
        labGroup: entry.labGroup || undefined,
      });
    }
  }

  const watchedValues = form.watch();
  const selectedCourse = courses.find(c => c.id === watchedValues.courseId);
  const selectedBatch = batches.find(b => b.id === watchedValues.batchId);
  const selectedClassroom = classrooms.find(r => r.id === watchedValues.classroomId);
  const isLabCourse = selectedCourse?.courseType === "lab";
  const needsLabGroups = isLabCourse && selectedBatch && selectedBatch.studentCount > 25;

  // Check for conflicts in real-time
  const conflictResult = conflictCheck?.(watchedValues, entry?.id);

  // Check room capacity warning
  const hasCapacityWarning = selectedClassroom && selectedBatch && 
    selectedClassroom.capacity < (needsLabGroups ? Math.ceil(selectedBatch.studentCount / 2) : selectedBatch.studentCount);

  // Check room type mismatch
  const hasTypeMismatch = selectedClassroom && selectedCourse && 
    selectedClassroom.roomType !== selectedCourse.courseType;

  const handleSubmit = async (data: EditScheduleFormData) => {
    if (entry) {
      await onSave(entry.id, data);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (entry && onDelete) {
      await onDelete(entry.id);
      onClose();
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Class Schedule
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Course Selection */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <span>Course</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-course">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          <div className="flex items-center gap-2">
                            <span>{course.code}</span>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs",
                                course.courseType === "theory" 
                                  ? "bg-schedule-theory/20 text-schedule-theory" 
                                  : "bg-schedule-lab/20 text-schedule-lab"
                              )}
                            >
                              {course.courseType}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Day and Time Slot Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Day
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-day">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WORKING_DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {DAY_LABELS[day]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Time Slot
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-timeslot">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.startTime} - {slot.endTime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Teacher Selection */}
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    Teacher
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-teacher">
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{teacher.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {teacher.currentLoad}/{teacher.maxLoad}h
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Batch Selection */}
            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Batch
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-batch">
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          <div className="flex items-center gap-2">
                            <span>{batch.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({batch.studentCount} students)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lab Group (if applicable) */}
            {needsLabGroups && (
              <FormField
                control={form.control}
                name="labGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Group</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-labgroup">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Group A</SelectItem>
                        <SelectItem value="B">Group B</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Classroom Selection */}
            <FormField
              control={form.control}
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Classroom
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-classroom">
                        <SelectValue placeholder="Select classroom" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classrooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          <div className="flex items-center gap-2">
                            <span>{room.roomNumber} - {room.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs",
                                room.roomType === "theory" 
                                  ? "bg-schedule-theory/20 text-schedule-theory" 
                                  : "bg-schedule-lab/20 text-schedule-lab"
                              )}
                            >
                              {room.capacity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warnings and Conflicts */}
            <div className="space-y-2">
              {conflictResult && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-schedule-conflict/10 text-schedule-conflict border border-schedule-conflict/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{conflictResult.message}</span>
                </div>
              )}
              
              {hasCapacityWarning && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">
                    Room capacity ({selectedClassroom.capacity}) may be insufficient for this batch
                  </span>
                </div>
              )}

              {hasTypeMismatch && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">
                    Room type ({selectedClassroom.roomType}) doesn't match course type ({selectedCourse.courseType})
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-2 pt-4 border-t">
              {onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  data-testid="button-delete-schedule"
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  data-testid="button-save-schedule"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
