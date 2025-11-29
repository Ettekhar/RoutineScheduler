import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Teacher, Course, Batch, Classroom } from "@shared/schema";
import { 
  insertTeacherSchema, 
  insertCourseSchema, 
  insertBatchSchema, 
  insertClassroomSchema 
} from "@shared/schema";

interface AdminPanelProps {
  teachers: Teacher[];
  courses: Course[];
  batches: Batch[];
  classrooms: Classroom[];
  onAddTeacher: (data: z.infer<typeof insertTeacherSchema>) => Promise<void>;
  onUpdateTeacher: (id: string, data: z.infer<typeof insertTeacherSchema>) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
  onAddCourse: (data: z.infer<typeof insertCourseSchema>) => Promise<void>;
  onUpdateCourse: (id: string, data: z.infer<typeof insertCourseSchema>) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onAddBatch: (data: z.infer<typeof insertBatchSchema>) => Promise<void>;
  onUpdateBatch: (id: string, data: z.infer<typeof insertBatchSchema>) => Promise<void>;
  onDeleteBatch: (id: string) => Promise<void>;
  onAddClassroom: (data: z.infer<typeof insertClassroomSchema>) => Promise<void>;
  onUpdateClassroom: (id: string, data: z.infer<typeof insertClassroomSchema>) => Promise<void>;
  onDeleteClassroom: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function AdminPanel({
  teachers,
  courses,
  batches,
  classrooms,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddBatch,
  onUpdateBatch,
  onDeleteBatch,
  onAddClassroom,
  onUpdateClassroom,
  onDeleteClassroom,
  isLoading,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("teachers");

  return (
    <div className="h-full flex flex-col" data-testid="admin-panel">
      <div className="p-4 border-b bg-card">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage teachers, courses, student batches, and classrooms
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-12 bg-transparent p-0 gap-6">
            <TabsTrigger 
              value="teachers" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
              data-testid="tab-teachers"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Teachers ({teachers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="courses"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
              data-testid="tab-courses"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger 
              value="batches"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
              data-testid="tab-batches"
            >
              <Users className="w-4 h-4 mr-2" />
              Batches ({batches.length})
            </TabsTrigger>
            <TabsTrigger 
              value="classrooms"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0"
              data-testid="tab-classrooms"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Classrooms ({classrooms.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="teachers" className="mt-0">
            <TeachersTab
              teachers={teachers}
              onAdd={onAddTeacher}
              onUpdate={onUpdateTeacher}
              onDelete={onDeleteTeacher}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="courses" className="mt-0">
            <CoursesTab
              courses={courses}
              onAdd={onAddCourse}
              onUpdate={onUpdateCourse}
              onDelete={onDeleteCourse}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="batches" className="mt-0">
            <BatchesTab
              batches={batches}
              onAdd={onAddBatch}
              onUpdate={onUpdateBatch}
              onDelete={onDeleteBatch}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="classrooms" className="mt-0">
            <ClassroomsTab
              classrooms={classrooms}
              onAdd={onAddClassroom}
              onUpdate={onUpdateClassroom}
              onDelete={onDeleteClassroom}
              isLoading={isLoading}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// Teachers Tab
function TeachersTab({
  teachers,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
}: {
  teachers: Teacher[];
  onAdd: (data: z.infer<typeof insertTeacherSchema>) => Promise<void>;
  onUpdate: (id: string, data: z.infer<typeof insertTeacherSchema>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof insertTeacherSchema>>({
    resolver: zodResolver(insertTeacherSchema),
    defaultValues: {
      name: "",
      designation: "",
      department: "",
      maxLoad: 18,
    },
  });

  const handleSubmit = async (data: z.infer<typeof insertTeacherSchema>) => {
    setSubmitting(true);
    try {
      if (editingTeacher) {
        await onUpdate(editingTeacher.id, data);
      } else {
        await onAdd(data);
      }
      setDialogOpen(false);
      setEditingTeacher(null);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.reset({
      name: teacher.name,
      designation: teacher.designation,
      department: teacher.department,
      maxLoad: teacher.maxLoad,
    });
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingTeacher(null);
      form.reset();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="text-lg">Teachers</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-teacher">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Smith" {...field} data-testid="input-teacher-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation *</FormLabel>
                      <FormControl>
                        <Input placeholder="Associate Professor" {...field} data-testid="input-teacher-designation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science" {...field} data-testid="input-teacher-department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Weekly Load (hours) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={40}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 18)}
                          data-testid="input-teacher-maxload"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} data-testid="button-save-teacher">
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingTeacher ? "Update" : "Add"} Teacher
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {teachers.length === 0 ? (
          <EmptyState 
            icon={<GraduationCap className="w-8 h-8" />}
            title="No Teachers Added"
            description="Add teachers to start building your schedule"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Load</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id} data-testid={`row-teacher-${teacher.id}`}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.designation}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.currentLoad >= teacher.maxLoad ? "destructive" : "secondary"}>
                      {teacher.currentLoad}/{teacher.maxLoad} hrs
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(teacher)}
                        data-testid={`button-edit-teacher-${teacher.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DeleteConfirmDialog
                        title="Delete Teacher"
                        description={`Are you sure you want to delete ${teacher.name}? This action cannot be undone.`}
                        onConfirm={() => onDelete(teacher.id)}
                        testId={`button-delete-teacher-${teacher.id}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Courses Tab
function CoursesTab({
  courses,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
}: {
  courses: Course[];
  onAdd: (data: z.infer<typeof insertCourseSchema>) => Promise<void>;
  onUpdate: (id: string, data: z.infer<typeof insertCourseSchema>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof insertCourseSchema>>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      code: "",
      name: "",
      semester: 1,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 1,
    },
  });

  const handleSubmit = async (data: z.infer<typeof insertCourseSchema>) => {
    setSubmitting(true);
    try {
      if (editingCourse) {
        await onUpdate(editingCourse.id, data);
      } else {
        await onAdd(data);
      }
      setDialogOpen(false);
      setEditingCourse(null);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    form.reset({
      code: course.code,
      name: course.name,
      semester: course.semester,
      creditHours: course.creditHours,
      courseType: course.courseType,
      sessionsPerWeek: course.sessionsPerWeek,
    });
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCourse(null);
      form.reset();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="text-lg">Courses</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-course">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="CSE101" {...field} data-testid="input-course-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester *</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(val) => field.onChange(parseInt(val))}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-course-semester">
                              <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                Semester {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduction to Programming" {...field} data-testid="input-course-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="creditHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credits *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                            data-testid="input-course-credits"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-course-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="theory">Theory</SelectItem>
                            <SelectItem value="lab">Lab</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sessionsPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sessions/Week *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-course-sessions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} data-testid="button-save-course">
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingCourse ? "Update" : "Add"} Course
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <EmptyState 
            icon={<BookOpen className="w-8 h-8" />}
            title="No Courses Added"
            description="Add courses for your semesters"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>Semester {course.semester}</TableCell>
                  <TableCell>{course.creditHours}</TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        course.courseType === "theory" 
                          ? "bg-schedule-theory text-white" 
                          : "bg-schedule-lab text-white"
                      )}
                    >
                      {course.courseType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(course)}
                        data-testid={`button-edit-course-${course.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DeleteConfirmDialog
                        title="Delete Course"
                        description={`Are you sure you want to delete ${course.code}? This action cannot be undone.`}
                        onConfirm={() => onDelete(course.id)}
                        testId={`button-delete-course-${course.id}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Batches Tab
function BatchesTab({
  batches,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
}: {
  batches: Batch[];
  onAdd: (data: z.infer<typeof insertBatchSchema>) => Promise<void>;
  onUpdate: (id: string, data: z.infer<typeof insertBatchSchema>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof insertBatchSchema>>({
    resolver: zodResolver(insertBatchSchema),
    defaultValues: {
      name: "",
      semester: 1,
      studentCount: 30,
      section: "A",
    },
  });

  const handleSubmit = async (data: z.infer<typeof insertBatchSchema>) => {
    setSubmitting(true);
    try {
      if (editingBatch) {
        await onUpdate(editingBatch.id, data);
      } else {
        await onAdd(data);
      }
      setDialogOpen(false);
      setEditingBatch(null);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    form.reset({
      name: batch.name,
      semester: batch.semester,
      studentCount: batch.studentCount,
      section: batch.section,
    });
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingBatch(null);
      form.reset();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="text-lg">Student Batches</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-batch">
              <Plus className="w-4 h-4 mr-2" />
              Add Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBatch ? "Edit Batch" : "Add New Batch"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="CSE-2024" {...field} data-testid="input-batch-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester *</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(val) => field.onChange(parseInt(val))}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-batch-semester">
                              <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <SelectItem key={sem} value={sem.toString()}>
                                Semester {sem}
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
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-batch-section">
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["A", "B", "C", "D"].map((sec) => (
                              <SelectItem key={sec} value={sec}>
                                Section {sec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="studentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Students *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={200}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          data-testid="input-batch-students"
                        />
                      </FormControl>
                      <FormMessage />
                      {field.value > 25 && (
                        <p className="text-xs text-schedule-conflict flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          Labs will be split into groups for batches &gt; 25 students
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} data-testid="button-save-batch">
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingBatch ? "Update" : "Add"} Batch
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <EmptyState 
            icon={<Users className="w-8 h-8" />}
            title="No Batches Added"
            description="Add student batches to schedule classes"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Lab Groups</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id} data-testid={`row-batch-${batch.id}`}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>Semester {batch.semester}</TableCell>
                  <TableCell>{batch.section}</TableCell>
                  <TableCell>{batch.studentCount}</TableCell>
                  <TableCell>
                    {batch.studentCount > 25 ? (
                      <Badge variant="secondary">2 Groups</Badge>
                    ) : (
                      <span className="text-muted-foreground">Single</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(batch)}
                        data-testid={`button-edit-batch-${batch.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DeleteConfirmDialog
                        title="Delete Batch"
                        description={`Are you sure you want to delete ${batch.name}? This action cannot be undone.`}
                        onConfirm={() => onDelete(batch.id)}
                        testId={`button-delete-batch-${batch.id}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Classrooms Tab
function ClassroomsTab({
  classrooms,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
}: {
  classrooms: Classroom[];
  onAdd: (data: z.infer<typeof insertClassroomSchema>) => Promise<void>;
  onUpdate: (id: string, data: z.infer<typeof insertClassroomSchema>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof insertClassroomSchema>>({
    resolver: zodResolver(insertClassroomSchema),
    defaultValues: {
      name: "",
      roomNumber: "",
      capacity: 40,
      roomType: "theory",
      building: "Main",
    },
  });

  const handleSubmit = async (data: z.infer<typeof insertClassroomSchema>) => {
    setSubmitting(true);
    try {
      if (editingClassroom) {
        await onUpdate(editingClassroom.id, data);
      } else {
        await onAdd(data);
      }
      setDialogOpen(false);
      setEditingClassroom(null);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    form.reset({
      name: classroom.name,
      roomNumber: classroom.roomNumber,
      capacity: classroom.capacity,
      roomType: classroom.roomType,
      building: classroom.building,
    });
    setDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingClassroom(null);
      form.reset();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="text-lg">Classrooms</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-classroom">
              <Plus className="w-4 h-4 mr-2" />
              Add Classroom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClassroom ? "Edit Classroom" : "Add New Classroom"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Lecture Hall A" {...field} data-testid="input-classroom-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roomNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="101" {...field} data-testid="input-classroom-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={500}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 40)}
                            data-testid="input-classroom-capacity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-classroom-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="theory">Theory Classroom</SelectItem>
                            <SelectItem value="lab">Lab Room</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="building"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building *</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Building" {...field} data-testid="input-classroom-building" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} data-testid="button-save-classroom">
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingClassroom ? "Update" : "Add"} Classroom
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {classrooms.length === 0 ? (
          <EmptyState 
            icon={<MapPin className="w-8 h-8" />}
            title="No Classrooms Added"
            description="Add classrooms and labs for scheduling"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.map((classroom) => (
                <TableRow key={classroom.id} data-testid={`row-classroom-${classroom.id}`}>
                  <TableCell className="font-medium">{classroom.roomNumber}</TableCell>
                  <TableCell>{classroom.name}</TableCell>
                  <TableCell>{classroom.building}</TableCell>
                  <TableCell>{classroom.capacity} seats</TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        classroom.roomType === "theory" 
                          ? "bg-schedule-theory text-white" 
                          : "bg-schedule-lab text-white"
                      )}
                    >
                      {classroom.roomType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(classroom)}
                        data-testid={`button-edit-classroom-${classroom.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <DeleteConfirmDialog
                        title="Delete Classroom"
                        description={`Are you sure you want to delete ${classroom.roomNumber}? This action cannot be undone.`}
                        onConfirm={() => onDelete(classroom.id)}
                        testId={`button-delete-classroom-${classroom.id}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}

// Delete Confirm Dialog
function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  testId,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  testId: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid={testId}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
