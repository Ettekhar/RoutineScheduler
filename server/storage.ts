import { 
  type User, 
  type InsertUser,
  type Teacher,
  type InsertTeacher,
  type Course,
  type InsertCourse,
  type Batch,
  type InsertBatch,
  type Classroom,
  type InsertClassroom,
  type TimeSlot,
  type InsertTimeSlot,
  type ScheduleEntry,
  type InsertScheduleEntry,
  type ScheduleEntryWithDetails,
  type ScheduleStats,
  DEFAULT_TIME_SLOTS,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Teachers
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: string): Promise<boolean>;

  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Batches
  getBatches(): Promise<Batch[]>;
  getBatch(id: string): Promise<Batch | undefined>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: string, batch: Partial<InsertBatch>): Promise<Batch | undefined>;
  deleteBatch(id: string): Promise<boolean>;

  // Classrooms
  getClassrooms(): Promise<Classroom[]>;
  getClassroom(id: string): Promise<Classroom | undefined>;
  createClassroom(classroom: InsertClassroom): Promise<Classroom>;
  updateClassroom(id: string, classroom: Partial<InsertClassroom>): Promise<Classroom | undefined>;
  deleteClassroom(id: string): Promise<boolean>;

  // Time Slots
  getTimeSlots(): Promise<TimeSlot[]>;
  getTimeSlot(id: string): Promise<TimeSlot | undefined>;

  // Schedule Entries
  getScheduleEntries(): Promise<ScheduleEntry[]>;
  getScheduleEntriesWithDetails(): Promise<ScheduleEntryWithDetails[]>;
  getScheduleEntry(id: string): Promise<ScheduleEntry | undefined>;
  createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry>;
  updateScheduleEntry(id: string, entry: Partial<InsertScheduleEntry>): Promise<ScheduleEntry | undefined>;
  deleteScheduleEntry(id: string): Promise<boolean>;
  clearSchedule(): Promise<void>;

  // Stats
  getStats(): Promise<ScheduleStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private teachers: Map<string, Teacher>;
  private courses: Map<string, Course>;
  private batches: Map<string, Batch>;
  private classrooms: Map<string, Classroom>;
  private timeSlots: Map<string, TimeSlot>;
  private scheduleEntries: Map<string, ScheduleEntry>;

  constructor() {
    this.users = new Map();
    this.teachers = new Map();
    this.courses = new Map();
    this.batches = new Map();
    this.classrooms = new Map();
    this.timeSlots = new Map();
    this.scheduleEntries = new Map();

    // Initialize default time slots
    DEFAULT_TIME_SLOTS.forEach(slot => {
      const id = `slot-${slot.slotNumber}`;
      this.timeSlots.set(id, {
        id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotNumber: slot.slotNumber,
      });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const teacher: Teacher = { 
      ...insertTeacher, 
      id,
      currentLoad: 0,
      maxLoad: insertTeacher.maxLoad || 18,
    };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async updateTeacher(id: string, updates: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const teacher = this.teachers.get(id);
    if (!teacher) return undefined;
    
    const updated: Teacher = { ...teacher, ...updates };
    this.teachers.set(id, updated);
    return updated;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    return this.teachers.delete(id);
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = { 
      ...insertCourse, 
      id,
      sessionsPerWeek: insertCourse.sessionsPerWeek || 1,
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updated: Course = { ...course, ...updates };
    this.courses.set(id, updated);
    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Batches
  async getBatches(): Promise<Batch[]> {
    return Array.from(this.batches.values());
  }

  async getBatch(id: string): Promise<Batch | undefined> {
    return this.batches.get(id);
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const id = randomUUID();
    const batch: Batch = { 
      ...insertBatch, 
      id,
      section: insertBatch.section || "A",
    };
    this.batches.set(id, batch);
    return batch;
  }

  async updateBatch(id: string, updates: Partial<InsertBatch>): Promise<Batch | undefined> {
    const batch = this.batches.get(id);
    if (!batch) return undefined;
    
    const updated: Batch = { ...batch, ...updates };
    this.batches.set(id, updated);
    return updated;
  }

  async deleteBatch(id: string): Promise<boolean> {
    return this.batches.delete(id);
  }

  // Classrooms
  async getClassrooms(): Promise<Classroom[]> {
    return Array.from(this.classrooms.values());
  }

  async getClassroom(id: string): Promise<Classroom | undefined> {
    return this.classrooms.get(id);
  }

  async createClassroom(insertClassroom: InsertClassroom): Promise<Classroom> {
    const id = randomUUID();
    const classroom: Classroom = { 
      ...insertClassroom, 
      id,
      building: insertClassroom.building || "Main",
    };
    this.classrooms.set(id, classroom);
    return classroom;
  }

  async updateClassroom(id: string, updates: Partial<InsertClassroom>): Promise<Classroom | undefined> {
    const classroom = this.classrooms.get(id);
    if (!classroom) return undefined;
    
    const updated: Classroom = { ...classroom, ...updates };
    this.classrooms.set(id, updated);
    return updated;
  }

  async deleteClassroom(id: string): Promise<boolean> {
    return this.classrooms.delete(id);
  }

  // Time Slots
  async getTimeSlots(): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values()).sort((a, b) => a.slotNumber - b.slotNumber);
  }

  async getTimeSlot(id: string): Promise<TimeSlot | undefined> {
    return this.timeSlots.get(id);
  }

  // Schedule Entries
  async getScheduleEntries(): Promise<ScheduleEntry[]> {
    return Array.from(this.scheduleEntries.values());
  }

  async getScheduleEntriesWithDetails(): Promise<ScheduleEntryWithDetails[]> {
    const entries = Array.from(this.scheduleEntries.values());
    const result: ScheduleEntryWithDetails[] = [];

    for (const entry of entries) {
      const course = await this.getCourse(entry.courseId);
      const teacher = await this.getTeacher(entry.teacherId);
      const batch = await this.getBatch(entry.batchId);
      const classroom = await this.getClassroom(entry.classroomId);
      const timeSlot = await this.getTimeSlot(entry.timeSlotId);

      if (course && teacher && batch && classroom && timeSlot) {
        result.push({
          ...entry,
          course,
          teacher,
          batch,
          classroom,
          timeSlot,
        });
      }
    }

    return result;
  }

  async getScheduleEntry(id: string): Promise<ScheduleEntry | undefined> {
    return this.scheduleEntries.get(id);
  }

  async createScheduleEntry(insertEntry: InsertScheduleEntry): Promise<ScheduleEntry> {
    const id = randomUUID();
    const entry: ScheduleEntry = { 
      ...insertEntry, 
      id,
      hasConflict: insertEntry.hasConflict || false,
      conflictType: insertEntry.conflictType || null,
      labGroup: insertEntry.labGroup || null,
    };
    this.scheduleEntries.set(id, entry);
    
    // Update teacher load
    const teacher = await this.getTeacher(entry.teacherId);
    if (teacher) {
      await this.updateTeacher(teacher.id, { 
        ...teacher,
        currentLoad: teacher.currentLoad + 1 
      } as any);
    }
    
    return entry;
  }

  async updateScheduleEntry(id: string, updates: Partial<InsertScheduleEntry>): Promise<ScheduleEntry | undefined> {
    const entry = this.scheduleEntries.get(id);
    if (!entry) return undefined;

    // If teacher changed, update loads
    if (updates.teacherId && updates.teacherId !== entry.teacherId) {
      const oldTeacher = await this.getTeacher(entry.teacherId);
      const newTeacher = await this.getTeacher(updates.teacherId);
      
      if (oldTeacher) {
        await this.updateTeacher(oldTeacher.id, { 
          currentLoad: Math.max(0, oldTeacher.currentLoad - 1) 
        } as any);
      }
      if (newTeacher) {
        await this.updateTeacher(newTeacher.id, { 
          currentLoad: newTeacher.currentLoad + 1 
        } as any);
      }
    }
    
    const updated: ScheduleEntry = { ...entry, ...updates };
    this.scheduleEntries.set(id, updated);
    return updated;
  }

  async deleteScheduleEntry(id: string): Promise<boolean> {
    const entry = this.scheduleEntries.get(id);
    if (entry) {
      // Update teacher load
      const teacher = await this.getTeacher(entry.teacherId);
      if (teacher) {
        await this.updateTeacher(teacher.id, { 
          currentLoad: Math.max(0, teacher.currentLoad - 1) 
        } as any);
      }
    }
    return this.scheduleEntries.delete(id);
  }

  async clearSchedule(): Promise<void> {
    // Reset all teacher loads
    for (const teacher of this.teachers.values()) {
      teacher.currentLoad = 0;
    }
    this.scheduleEntries.clear();
  }

  // Stats
  async getStats(): Promise<ScheduleStats> {
    const entries = await this.getScheduleEntriesWithDetails();
    
    return {
      totalTeachers: this.teachers.size,
      totalCourses: this.courses.size,
      totalBatches: this.batches.size,
      totalClassrooms: this.classrooms.size,
      totalScheduledClasses: entries.length,
      conflictCount: entries.filter(e => e.hasConflict).length,
      theorySessions: entries.filter(e => e.course.courseType === "theory").length,
      labSessions: entries.filter(e => e.course.courseType === "lab").length,
    };
  }
}

export const storage = new MemStorage();
