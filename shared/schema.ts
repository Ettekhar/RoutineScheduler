import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Teachers table
export const teachers = pgTable("teachers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
  maxLoad: integer("max_load").notNull().default(18),
  currentLoad: integer("current_load").notNull().default(0),
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true, currentLoad: true });
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  semester: integer("semester").notNull(),
  creditHours: integer("credit_hours").notNull(),
  courseType: text("course_type").notNull(), // 'theory' or 'lab'
  sessionsPerWeek: integer("sessions_per_week").notNull().default(1),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Student Batches table
export const batches = pgTable("batches", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  semester: integer("semester").notNull(),
  studentCount: integer("student_count").notNull(),
  section: text("section").notNull().default("A"),
});

export const insertBatchSchema = createInsertSchema(batches).omit({ id: true });
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

// Classrooms table
export const classrooms = pgTable("classrooms", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  roomNumber: text("room_number").notNull(),
  capacity: integer("capacity").notNull(),
  roomType: text("room_type").notNull(), // 'theory' or 'lab'
  building: text("building").notNull().default("Main"),
});

export const insertClassroomSchema = createInsertSchema(classrooms).omit({ id: true });
export type InsertClassroom = z.infer<typeof insertClassroomSchema>;
export type Classroom = typeof classrooms.$inferSelect;

// Time Slots table
export const timeSlots = pgTable("time_slots", {
  id: varchar("id", { length: 36 }).primaryKey(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  slotNumber: integer("slot_number").notNull(),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({ id: true });
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;

// Schedule Entries table
export const scheduleEntries = pgTable("schedule_entries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  teacherId: varchar("teacher_id", { length: 36 }).notNull(),
  batchId: varchar("batch_id", { length: 36 }).notNull(),
  classroomId: varchar("classroom_id", { length: 36 }).notNull(),
  timeSlotId: varchar("time_slot_id", { length: 36 }).notNull(),
  day: text("day").notNull(), // 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'
  labGroup: text("lab_group"), // null for theory, 'A' or 'B' for labs with split batches
  hasConflict: boolean("has_conflict").notNull().default(false),
  conflictType: text("conflict_type"), // 'teacher', 'room', 'batch'
  session: text("session").notNull().default("Fall 2025"), // e.g., 'Fall 2025', 'Spring 2025'
});

export const insertScheduleEntrySchema = createInsertSchema(scheduleEntries).omit({ id: true });
export type InsertScheduleEntry = z.infer<typeof insertScheduleEntrySchema>;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;

// Extended types for frontend display
export interface ScheduleEntryWithDetails extends ScheduleEntry {
  course: Course;
  teacher: Teacher;
  batch: Batch;
  classroom: Classroom;
  timeSlot: TimeSlot;
}

// Filter state type
export interface ScheduleFilters {
  teacherId?: string;
  semester?: number;
  courseId?: string;
  day?: string;
  classroomId?: string;
  courseType?: 'theory' | 'lab';
}

// Days of the week (Sun-Thu for university)
export const WORKING_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;
export type WorkingDay = typeof WORKING_DAYS[number];

// Default time slots (8:45 AM - 3:30 PM, 45 minutes each)
export const DEFAULT_TIME_SLOTS = [
  { startTime: '08:45', endTime: '09:30', slotNumber: 1 },
  { startTime: '09:30', endTime: '10:15', slotNumber: 2 },
  { startTime: '10:15', endTime: '11:00', slotNumber: 3 },
  { startTime: '11:00', endTime: '11:45', slotNumber: 4 },
  { startTime: '11:45', endTime: '12:30', slotNumber: 5 },
  { startTime: '12:30', endTime: '13:15', slotNumber: 6 },
  { startTime: '13:15', endTime: '14:00', slotNumber: 7 },
  { startTime: '14:00', endTime: '14:45', slotNumber: 8 },
  { startTime: '14:45', endTime: '15:30', slotNumber: 9 },
];

// Lunch Break configuration
export interface LunchBreakConfig {
  startTime: string; // HH:MM format (e.g., "12:00")
  endTime: string;   // HH:MM format (e.g., "13:00")
  enabled: boolean;
}

// Statistics type for dashboard
export interface ScheduleStats {
  totalTeachers: number;
  totalCourses: number;
  totalBatches: number;
  totalClassrooms: number;
  totalScheduledClasses: number;
  conflictCount: number;
  theorySessions: number;
  labSessions: number;
}

// Users table (kept for compatibility)
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Session type
export interface Session {
  id: string;
  name: string; // e.g., 'Fall 2025', 'Spring 2025'
}
