import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminPanel } from "@/components/admin-panel";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Teacher, Course, Batch, Classroom } from "@shared/schema";
import { 
  insertTeacherSchema, 
  insertCourseSchema, 
  insertBatchSchema, 
  insertClassroomSchema 
} from "@shared/schema";
import { z } from "zod";

export default function Admin() {
  const { toast } = useToast();

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: batches = [], isLoading: batchesLoading } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
  });

  const { data: classrooms = [], isLoading: classroomsLoading } = useQuery<Classroom[]>({
    queryKey: ["/api/classrooms"],
  });

  const isLoading = teachersLoading || coursesLoading || batchesLoading || classroomsLoading;

  // Teacher mutations
  const addTeacherMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertTeacherSchema>) => 
      apiRequest("POST", "/api/teachers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Teacher Added", description: "New teacher has been added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTeacherMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof insertTeacherSchema> }) => 
      apiRequest("PATCH", `/api/teachers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({ title: "Teacher Updated", description: "Teacher details have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/teachers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Teacher Deleted", description: "Teacher has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Course mutations
  const addCourseMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertCourseSchema>) => 
      apiRequest("POST", "/api/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Course Added", description: "New course has been added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof insertCourseSchema> }) => 
      apiRequest("PATCH", `/api/courses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course Updated", description: "Course details have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Course Deleted", description: "Course has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Batch mutations
  const addBatchMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertBatchSchema>) => 
      apiRequest("POST", "/api/batches", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Batch Added", description: "New batch has been added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof insertBatchSchema> }) => 
      apiRequest("PATCH", `/api/batches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      toast({ title: "Batch Updated", description: "Batch details have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/batches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Batch Deleted", description: "Batch has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Classroom mutations
  const addClassroomMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertClassroomSchema>) => 
      apiRequest("POST", "/api/classrooms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Classroom Added", description: "New classroom has been added successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateClassroomMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof insertClassroomSchema> }) => 
      apiRequest("PATCH", `/api/classrooms/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classrooms"] });
      toast({ title: "Classroom Updated", description: "Classroom details have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteClassroomMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/classrooms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Classroom Deleted", description: "Classroom has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <AdminPanel
      teachers={teachers}
      courses={courses}
      batches={batches}
      classrooms={classrooms}
      onAddTeacher={(data) => addTeacherMutation.mutateAsync(data)}
      onUpdateTeacher={(id, data) => updateTeacherMutation.mutateAsync({ id, data })}
      onDeleteTeacher={(id) => deleteTeacherMutation.mutateAsync(id)}
      onAddCourse={(data) => addCourseMutation.mutateAsync(data)}
      onUpdateCourse={(id, data) => updateCourseMutation.mutateAsync({ id, data })}
      onDeleteCourse={(id) => deleteCourseMutation.mutateAsync(id)}
      onAddBatch={(data) => addBatchMutation.mutateAsync(data)}
      onUpdateBatch={(id, data) => updateBatchMutation.mutateAsync({ id, data })}
      onDeleteBatch={(id) => deleteBatchMutation.mutateAsync(id)}
      onAddClassroom={(data) => addClassroomMutation.mutateAsync(data)}
      onUpdateClassroom={(id, data) => updateClassroomMutation.mutateAsync({ id, data })}
      onDeleteClassroom={(id) => deleteClassroomMutation.mutateAsync(id)}
      isLoading={isLoading}
    />
  );
}
