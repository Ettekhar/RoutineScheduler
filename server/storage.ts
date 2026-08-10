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
  type LunchBreakConfig,
  DEFAULT_TIME_SLOTS,
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";
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
  updateTeacher(
    id: string,
    teacher: Partial<InsertTeacher>,
  ): Promise<Teacher | undefined>;
  deleteTeacher(id: string): Promise<boolean>;

  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(
    id: string,
    course: Partial<InsertCourse>,
  ): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Batches
  getBatches(): Promise<Batch[]>;
  getBatch(id: string): Promise<Batch | undefined>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(
    id: string,
    batch: Partial<InsertBatch>,
  ): Promise<Batch | undefined>;
  deleteBatch(id: string): Promise<boolean>;

  // Classrooms
  getClassrooms(): Promise<Classroom[]>;
  getClassroom(id: string): Promise<Classroom | undefined>;
  createClassroom(classroom: InsertClassroom): Promise<Classroom>;
  updateClassroom(
    id: string,
    classroom: Partial<InsertClassroom>,
  ): Promise<Classroom | undefined>;
  deleteClassroom(id: string): Promise<boolean>;

  // Time Slots
  getTimeSlots(): Promise<TimeSlot[]>;
  getTimeSlot(id: string): Promise<TimeSlot | undefined>;

  // Schedule Entries
  getScheduleEntries(): Promise<ScheduleEntry[]>;
  getScheduleEntriesWithDetails(): Promise<ScheduleEntryWithDetails[]>;
  getScheduleEntry(id: string): Promise<ScheduleEntry | undefined>;
  createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry>;
  updateScheduleEntry(
    id: string,
    entry: Partial<InsertScheduleEntry>,
  ): Promise<ScheduleEntry | undefined>;
  deleteScheduleEntry(id: string): Promise<boolean>;
  clearSchedule(): Promise<void>;

  // Stats
  getStats(): Promise<ScheduleStats>;

  // Lunch Break
  getLunchBreak(): Promise<LunchBreakConfig>;
  setLunchBreak(config: LunchBreakConfig): Promise<LunchBreakConfig>;

  // Sessions
  getSessions(): Promise<Array<{ id: string; name: string }>>;
  getCurrentSession(): Promise<string>;
  setCurrentSession(sessionName: string): Promise<string>;
  addSession(sessionName: string): Promise<{ id: string; name: string }>;
  updateSession(
    id: string,
    newName: string,
  ): Promise<{ id: string; name: string }>;
  deleteSession(id: string): Promise<boolean>;
  clearScheduleForSession(sessionName: string): Promise<void>;
}

interface StorageState {
  users: User[];
  teachers: Teacher[];
  courses: Course[];
  batches: Batch[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
  scheduleEntries: ScheduleEntry[];
  lunchBreak: LunchBreakConfig;
  sessions: Array<{ id: string; name: string }>;
  currentSession: string;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private teachers: Map<string, Teacher>;
  private courses: Map<string, Course>;
  private batches: Map<string, Batch>;
  private classrooms: Map<string, Classroom>;
  private timeSlots: Map<string, TimeSlot>;
  private scheduleEntries: Map<string, ScheduleEntry>;
  private lunchBreak: LunchBreakConfig;
  private sessions: Map<string, { id: string; name: string }>;
  private currentSession: string;
  private storageFilePath: string;
  private persistEnabled: boolean;

  constructor() {
    this.storageFilePath = path.resolve(process.cwd(), "storage.json");
    this.persistEnabled = true;
    this.users = new Map();
    this.teachers = new Map();
    this.courses = new Map();
    this.batches = new Map();
    this.classrooms = new Map();
    this.timeSlots = new Map();
    this.scheduleEntries = new Map();
    this.sessions = new Map();
    this.currentSession = "Fall 2025";

    // Default lunch break: 1:15 PM - 2:00 PM
    this.lunchBreak = {
      startTime: "13:15",
      endTime: "14:00",
      enabled: true,
    };

    // Initialize default sessions
    const defaultSessions = ["Fall 2025", "Spring 2025", "Summer 2025"];
    defaultSessions.forEach((name) => {
      const id = `session-${name.toLowerCase().replace(/\s/g, "-")}`;
      this.sessions.set(id, { id, name });
    });

    // Initialize default time slots
    DEFAULT_TIME_SLOTS.forEach((slot) => {
      const id = `slot-${slot.slotNumber}`;
      this.timeSlots.set(id, {
        id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotNumber: slot.slotNumber,
      });
    });
  }

  private serialize(): StorageState {
    return {
      users: Array.from(this.users.values()),
      teachers: Array.from(this.teachers.values()),
      courses: Array.from(this.courses.values()),
      batches: Array.from(this.batches.values()),
      classrooms: Array.from(this.classrooms.values()),
      timeSlots: Array.from(this.timeSlots.values()),
      scheduleEntries: Array.from(this.scheduleEntries.values()),
      lunchBreak: this.lunchBreak,
      sessions: Array.from(this.sessions.values()),
      currentSession: this.currentSession,
    };
  }

  private async detectStorageFilePath(): Promise<void> {
    const candidates = [
      process.env.STORAGE_FILE_PATH,
      path.resolve(process.cwd(), "storage.json"),
      path.resolve(process.cwd(), "..", "storage.json"),
      path.resolve(process.cwd(), "server", "..", "storage.json"),
      // Vercel serverless: __dirname is dist/, storage.json is at project root
      typeof __dirname !== "undefined"
        ? path.resolve(__dirname, "..", "storage.json")
        : null,
      // Explicit Vercel path
      "/var/task/storage.json",
    ].filter((value): value is string => Boolean(value));

    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        this.storageFilePath = candidate;
        return;
      } catch {
        // try the next candidate
      }
    }

    this.storageFilePath = path.resolve(process.cwd(), "storage.json");
  }

  private restore(state: StorageState) {
    this.users = new Map(state.users.map((item) => [item.id, item]));
    this.teachers = new Map(state.teachers.map((item) => [item.id, item]));
    this.courses = new Map(state.courses.map((item) => [item.id, item]));
    this.batches = new Map(state.batches.map((item) => [item.id, item]));
    this.classrooms = new Map(state.classrooms.map((item) => [item.id, item]));
    this.timeSlots = new Map(state.timeSlots.map((item) => [item.id, item]));
    this.scheduleEntries = new Map(
      state.scheduleEntries.map((item) => [item.id, item]),
    );
    this.lunchBreak = state.lunchBreak;
    this.sessions = new Map(state.sessions.map((item) => [item.id, item]));
    this.currentSession = state.currentSession;
  }

  private async persist(): Promise<void> {
    if (!this.persistEnabled) return;
    try {
      await fs.mkdir(path.dirname(this.storageFilePath), { recursive: true });
      await fs.writeFile(
        this.storageFilePath,
        JSON.stringify(this.serialize(), null, 2),
        "utf-8",
      );
    } catch (err: any) {
      // On serverless platforms the filesystem may be read-only; log and continue
      console.warn(
        "storage.persist: failed to write storage.json — continuing without persistence:",
        err && err.message ? err.message : err,
      );
    }
  }

  private async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.storageFilePath, "utf-8");
      const data = JSON.parse(raw) as StorageState;
      this.restore(data);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return;
      }
      throw error;
    }
  }

  async initialize(): Promise<void> {
    await this.detectStorageFilePath();

    try {
      await fs.access(this.storageFilePath);
      await this.load();
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // storage file missing: initialize sample data in-memory.
        // Attempting to persist on serverless platforms can fail; persist() is tolerant.
        this.persistEnabled = false;
        await initializeSampleData();
        this.persistEnabled = true;
        await this.persist().catch(() => {
          /* already handled in persist() */
        });
        return;
      }
      throw error;
    }
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
    await this.persist();
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
    await this.persist();
    return teacher;
  }

  async updateTeacher(
    id: string,
    updates: Partial<InsertTeacher>,
  ): Promise<Teacher | undefined> {
    const teacher = this.teachers.get(id);
    if (!teacher) return undefined;

    const updated: Teacher = { ...teacher, ...updates };
    this.teachers.set(id, updated);
    await this.persist();
    return updated;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const deleted = this.teachers.delete(id);
    if (deleted) await this.persist();
    return deleted;
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
    await this.persist();
    return course;
  }

  async updateCourse(
    id: string,
    updates: Partial<InsertCourse>,
  ): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;

    const updated: Course = { ...course, ...updates };
    this.courses.set(id, updated);
    await this.persist();
    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const deleted = this.courses.delete(id);
    if (deleted) await this.persist();
    return deleted;
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
    await this.persist();
    return batch;
  }

  async updateBatch(
    id: string,
    updates: Partial<InsertBatch>,
  ): Promise<Batch | undefined> {
    const batch = this.batches.get(id);
    if (!batch) return undefined;

    const updated: Batch = { ...batch, ...updates };
    this.batches.set(id, updated);
    await this.persist();
    return updated;
  }

  async deleteBatch(id: string): Promise<boolean> {
    const deleted = this.batches.delete(id);
    if (deleted) await this.persist();
    return deleted;
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
    await this.persist();
    return classroom;
  }

  async updateClassroom(
    id: string,
    updates: Partial<InsertClassroom>,
  ): Promise<Classroom | undefined> {
    const classroom = this.classrooms.get(id);
    if (!classroom) return undefined;

    const updated: Classroom = { ...classroom, ...updates };
    this.classrooms.set(id, updated);
    await this.persist();
    return updated;
  }

  async deleteClassroom(id: string): Promise<boolean> {
    const deleted = this.classrooms.delete(id);
    if (deleted) await this.persist();
    return deleted;
  }

  // Time Slots
  async getTimeSlots(): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values()).sort(
      (a, b) => a.slotNumber - b.slotNumber,
    );
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

  async createScheduleEntry(
    insertEntry: InsertScheduleEntry,
  ): Promise<ScheduleEntry> {
    const id = randomUUID();
    const entry: ScheduleEntry = {
      ...insertEntry,
      id,
      hasConflict: insertEntry.hasConflict || false,
      conflictType: insertEntry.conflictType || null,
      labGroup: insertEntry.labGroup || null,
      session: insertEntry.session ?? this.currentSession,
    };
    this.scheduleEntries.set(id, entry);

    // Update teacher load
    const teacher = await this.getTeacher(entry.teacherId);
    if (teacher) {
      await this.updateTeacher(teacher.id, {
        ...teacher,
        currentLoad: teacher.currentLoad + 1,
      } as any);
    }
    await this.persist();
    return entry;
  }

  async updateScheduleEntry(
    id: string,
    updates: Partial<InsertScheduleEntry>,
  ): Promise<ScheduleEntry | undefined> {
    const entry = this.scheduleEntries.get(id);
    if (!entry) return undefined;

    // If teacher changed, update loads
    if (updates.teacherId && updates.teacherId !== entry.teacherId) {
      const oldTeacher = await this.getTeacher(entry.teacherId);
      const newTeacher = await this.getTeacher(updates.teacherId);

      if (oldTeacher) {
        await this.updateTeacher(oldTeacher.id, {
          currentLoad: Math.max(0, oldTeacher.currentLoad - 1),
        } as any);
      }
      if (newTeacher) {
        await this.updateTeacher(newTeacher.id, {
          currentLoad: newTeacher.currentLoad + 1,
        } as any);
      }
    }

    const updated: ScheduleEntry = { ...entry, ...updates };
    this.scheduleEntries.set(id, updated);
    await this.persist();
    return updated;
  }

  async deleteScheduleEntry(id: string): Promise<boolean> {
    const entry = this.scheduleEntries.get(id);
    if (entry) {
      // Update teacher load
      const teacher = await this.getTeacher(entry.teacherId);
      if (teacher) {
        await this.updateTeacher(teacher.id, {
          currentLoad: Math.max(0, teacher.currentLoad - 1),
        } as any);
      }
    }
    const deleted = this.scheduleEntries.delete(id);
    if (deleted) await this.persist();
    return deleted;
  }

  async clearSchedule(): Promise<void> {
    // Reset all teacher loads
    for (const teacher of this.teachers.values()) {
      teacher.currentLoad = 0;
    }
    this.scheduleEntries.clear();
    await this.persist();
  }

  async clearScheduleForSession(sessionName: string): Promise<void> {
    const entries = Array.from(this.scheduleEntries.values()).filter(
      (e) => e.session === sessionName,
    );

    // Reduce teacher loads for entries being deleted
    for (const entry of entries) {
      const teacher = await this.getTeacher(entry.teacherId);
      if (teacher) {
        await this.updateTeacher(teacher.id, {
          currentLoad: Math.max(0, teacher.currentLoad - 1),
        } as any);
      }
    }

    // Delete entries for this session
    for (const entry of entries) {
      this.scheduleEntries.delete(entry.id);
    }
    await this.persist();
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
      conflictCount: entries.filter((e) => e.hasConflict).length,
      theorySessions: entries.filter((e) => e.course.courseType === "theory")
        .length,
      labSessions: entries.filter((e) => e.course.courseType === "lab").length,
    };
  }

  // Lunch Break
  async getLunchBreak(): Promise<LunchBreakConfig> {
    return this.lunchBreak;
  }

  async setLunchBreak(config: LunchBreakConfig): Promise<LunchBreakConfig> {
    this.lunchBreak = config;
    await this.persist();
    return this.lunchBreak;
  }

  // Sessions
  async getSessions(): Promise<Array<{ id: string; name: string }>> {
    return Array.from(this.sessions.values());
  }

  async getCurrentSession(): Promise<string> {
    return this.currentSession;
  }

  async setCurrentSession(sessionName: string): Promise<string> {
    this.currentSession = sessionName;
    await this.persist();
    return this.currentSession;
  }

  async addSession(sessionName: string): Promise<{ id: string; name: string }> {
    // Check if session already exists
    const exists = Array.from(this.sessions.values()).some(
      (s) => s.name === sessionName,
    );
    if (exists) {
      throw new Error(`Session "${sessionName}" already exists`);
    }

    const id = `session-${sessionName.toLowerCase().replace(/\s+/g, "-")}`;
    const session = { id, name: sessionName };
    this.sessions.set(id, session);
    await this.persist();
    return session;
  }

  async updateSession(
    id: string,
    newName: string,
  ): Promise<{ id: string; name: string }> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session with ID "${id}" not found`);
    }

    // Check if new name already exists
    const exists = Array.from(this.sessions.values()).some(
      (s) => s.name === newName && s.id !== id,
    );
    if (exists) {
      throw new Error(`Session "${newName}" already exists`);
    }

    // Update all schedule entries with old session name to new session name
    for (const entry of this.scheduleEntries.values()) {
      if (entry.session === session.name) {
        entry.session = newName;
      }
    }

    session.name = newName;
    this.sessions.set(id, session);
    await this.persist();
    return session;
  }

  async deleteSession(id: string): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;

    // Don't allow deleting if it's the current session
    if (this.currentSession === session.name) {
      throw new Error(
        `Cannot delete the current session "${session.name}". Switch to another session first.`,
      );
    }

    // Delete all schedule entries for this session
    const entriesToDelete = Array.from(this.scheduleEntries.entries()).filter(
      ([_, entry]) => entry.session === session.name,
    );

    for (const [entryId, entry] of entriesToDelete) {
      // Update teacher loads
      const teacher = await this.getTeacher(entry.teacherId);
      if (teacher) {
        await this.updateTeacher(teacher.id, {
          currentLoad: Math.max(0, teacher.currentLoad - 1),
        } as any);
      }
      this.scheduleEntries.delete(entryId);
    }

    const deleted = this.sessions.delete(id);
    if (deleted) await this.persist();
    return deleted;
  }
}

export const storage = new MemStorage();

// Initialize with YOUR exact data
export async function initializeSampleData() {
  // YOUR 31 TEACHERS
  const teachers = [
    await storage.createTeacher({
      name: "Prof. Usman Farooq",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Fatima Tariq",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Mr. Salim Baig",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Prof. Rashid Malik",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Rohan K. Patel",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Mr. Tariq Samad",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Anil Das",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Prof. Ravi Anand",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Sarah Ali",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Ms. Tanya Ahmed",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Prof. David S. Roy",
      designation: "Associate Professor",
      department: "Science",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Mr. Mahmood Ahmad",
      designation: "Associate Professor",
      department: "Humanities",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Ms. Nadia Malik",
      designation: "Associate Professor",
      department: "Humanities",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Dinesh K. Ghai",
      designation: "Associate Professor",
      department: "EEE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Mr. Karan Bhat",
      designation: "Associate Professor",
      department: "EEE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Shweta Iyer",
      designation: "Associate Professor",
      department: "SE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Ms. Swati Singh",
      designation: "Associate Professor",
      department: "Math",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Mr. Nikhil Kant",
      designation: "Associate Professor",
      department: "Humanities",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Prof. Anu Nair",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Arjun Roy",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Ms. Usha Hariom",
      designation: "Associate Professor",
      department: "Math",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Prof. Keshav E. Rao",
      designation: "Associate Professor",
      department: "Math",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Mr. Sharad Hari",
      designation: "Associate Professor",
      department: "Economics",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Suresh Hari",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Ms. Meera Shah",
      designation: "Associate Professor",
      department: "Math",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Mr. Mohan S. Upadhyay",
      designation: "Associate Professor",
      department: "Math",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Prof. Amit Mishra",
      designation: "Associate Professor",
      department: "Business",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Dr. Manish K. Negi",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Ms. Farida Ibrahim",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Mr. Jaswant Firdaus",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
    await storage.createTeacher({
      name: "Prof. Brijesh S. Singh",
      designation: "Associate Professor",
      department: "CSE",
      maxLoad: 20,
    }),
  ];

  // YOUR 20 CLASSROOMS
  const classrooms = [
    await storage.createClassroom({
      name: "Main Lecture A1",
      roomNumber: "A-101",
      capacity: 80,
      roomType: "theory",
      building: "Building A",
    }),
    await storage.createClassroom({
      name: "Main Lecture A2",
      roomNumber: "A-102",
      capacity: 75,
      roomType: "theory",
      building: "Building A",
    }),
    await storage.createClassroom({
      name: "Theory Room A3",
      roomNumber: "A-201",
      capacity: 60,
      roomType: "theory",
      building: "Building A",
    }),
    await storage.createClassroom({
      name: "Theory Room A4",
      roomNumber: "A-202",
      capacity: 55,
      roomType: "theory",
      building: "Building A",
    }),
    await storage.createClassroom({
      name: "Seminar Room A5",
      roomNumber: "A-301",
      capacity: 40,
      roomType: "theory",
      building: "Building A",
    }),
    await storage.createClassroom({
      name: "Main Lecture B1",
      roomNumber: "B-101",
      capacity: 85,
      roomType: "theory",
      building: "Building B",
    }),
    await storage.createClassroom({
      name: "Theory Room B2",
      roomNumber: "B-102",
      capacity: 65,
      roomType: "theory",
      building: "Building B",
    }),
    await storage.createClassroom({
      name: "Theory Room B3",
      roomNumber: "B-201",
      capacity: 50,
      roomType: "theory",
      building: "Building B",
    }),
    await storage.createClassroom({
      name: "Seminar Room B4",
      roomNumber: "B-301",
      capacity: 35,
      roomType: "theory",
      building: "Building B",
    }),
    await storage.createClassroom({
      name: "Theory Room C1",
      roomNumber: "C-101",
      capacity: 45,
      roomType: "theory",
      building: "Building C",
    }),
    await storage.createClassroom({
      name: "CSE Lab 1",
      roomNumber: "C-L01",
      capacity: 30,
      roomType: "lab",
      building: "Building C",
    }),
    await storage.createClassroom({
      name: "CSE Lab 2",
      roomNumber: "C-L02",
      capacity: 30,
      roomType: "lab",
      building: "Building C",
    }),
    await storage.createClassroom({
      name: "CSE Lab 3",
      roomNumber: "C-L03",
      capacity: 25,
      roomType: "lab",
      building: "Building C",
    }),
    await storage.createClassroom({
      name: "CSE Lab 4",
      roomNumber: "C-L04",
      capacity: 25,
      roomType: "lab",
      building: "Building C",
    }),
    await storage.createClassroom({
      name: "ENG Lab 1",
      roomNumber: "D-L01",
      capacity: 28,
      roomType: "lab",
      building: "Building D",
    }),
    await storage.createClassroom({
      name: "ENG Lab 2",
      roomNumber: "D-L02",
      capacity: 28,
      roomType: "lab",
      building: "Building D",
    }),
    await storage.createClassroom({
      name: "Electronics Lab",
      roomNumber: "D-L03",
      capacity: 20,
      roomType: "lab",
      building: "Building D",
    }),
    await storage.createClassroom({
      name: "EEE Lab",
      roomNumber: "D-L04",
      capacity: 22,
      roomType: "lab",
      building: "Building D",
    }),
    await storage.createClassroom({
      name: "CAD Lab",
      roomNumber: "E-L01",
      capacity: 15,
      roomType: "lab",
      building: "Building E",
    }),
    await storage.createClassroom({
      name: "Graphics Lab",
      roomNumber: "E-L02",
      capacity: 18,
      roomType: "lab",
      building: "Building E",
    }),
  ];

  // YOUR 56 EXACT COURSES (sessionsPerWeek = creditHours initially)
  const courses = [
    // SEM 1 - BATCH-41
    await storage.createCourse({
      code: "CSE1101",
      name: "Introduction to Computer Systems",
      semester: 1,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE1102",
      name: "Structured Programming Language",
      semester: 1,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE1103L",
      name: "Structured Programming Language Lab",
      semester: 1,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "MAT1104",
      name: "Math-I (Calculus)",
      semester: 1,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "PHY1105",
      name: "Physics (Electricity, Magnetism & Optics)",
      semester: 1,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "ENV1106",
      name: "Environmental Science",
      semester: 1,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "ENG1107",
      name: "English Reading & Public Speaking",
      semester: 1,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "BAN1108",
      name: "Bengali",
      semester: 1,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    // SEM 2 - BATCH-40
    await storage.createCourse({
      code: "CSE1201",
      name: "Object Oriented Programming (C++)",
      semester: 2,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE1202L",
      name: "OOP (C++) Lab",
      semester: 2,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "EEE1203",
      name: "Electrical & Electronics Circuits",
      semester: 2,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "EEE1204L",
      name: "Electrical & Electronics Circuits Lab",
      semester: 2,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "SE1205L",
      name: "Engineering Drawing & CAD Lab",
      semester: 2,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "MAT1206",
      name: "Discrete Mathematics",
      semester: 2,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "MAT1207",
      name: "Math-II (Co-ordinate Geometry & Vector Analysis)",
      semester: 2,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "ENG1208",
      name: "English Writing & Communication",
      semester: 2,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    // SEM 3 - BATCH-39
    await storage.createCourse({
      code: "CSE2301",
      name: "Data Structures",
      semester: 3,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE2302L",
      name: "Data Structures Lab",
      semester: 3,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE2303",
      name: "Digital Logic & System Design",
      semester: 3,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE2304L",
      name: "Digital Logic & System Design Lab",
      semester: 3,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "STA2305",
      name: "Statistics & Probability",
      semester: 3,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "MAT2306",
      name: "Math-III (Differential Equation & Special Function)",
      semester: 3,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "ECO2307",
      name: "Industrial Economics",
      semester: 3,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "PG2308",
      name: "Liberation War of Bangladesh",
      semester: 3,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    // SEM 4 - BATCH-38
    await storage.createCourse({
      code: "CSE2401",
      name: "Algorithm",
      semester: 4,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE2402L",
      name: "Algorithm Lab",
      semester: 4,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE2403",
      name: "Microprocessors & Microcontrollers",
      semester: 4,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE2404L",
      name: "Microcontrollers & Assembly Lab",
      semester: 4,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE2405L",
      name: "Java Programming Lab",
      semester: 4,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "MAT2406",
      name: "Numerical Methods",
      semester: 4,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "MAT2407",
      name: "Math-IV (Matrix & Complex Analysis)",
      semester: 4,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "BBA2408",
      name: "Introduction to Management & Marketing",
      semester: 4,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    // SEM 5 - BATCH-37
    await storage.createCourse({
      code: "CSE3501",
      name: "Database Management Systems",
      semester: 5,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE3502L",
      name: "DBMS Lab",
      semester: 5,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE3503",
      name: "Computer Graphics & Animation",
      semester: 5,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE3504L",
      name: "CG & Animation Lab",
      semester: 5,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE3505",
      name: "Communication Engineering",
      semester: 5,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE3506",
      name: "Technical Writing & Presentation",
      semester: 5,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE3507",
      name: "Computer Peripherals & Interfacing",
      semester: 5,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "BBA3508",
      name: "Financial & Managerial Accounting",
      semester: 5,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    // SEM 6 - BATCH-35 & BATCH-36
    await storage.createCourse({
      code: "CSE3601",
      name: "Operating System",
      semester: 6,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE3602L",
      name: "Operating System Lab",
      semester: 6,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE3603",
      name: "Web Engineering",
      semester: 6,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE3604L",
      name: "Web Engineering Lab",
      semester: 6,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE3605",
      name: "Computer Architecture",
      semester: 6,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE3606",
      name: "Computer Peripherals",
      semester: 6,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE3607",
      name: "Cloud Computing",
      semester: 6,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE3608L",
      name: "Mobile Application Lab",
      semester: 6,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    // SEM 7 - BATCH-34
    await storage.createCourse({
      code: "CSE4701",
      name: "Computer Networks & Cyber Security",
      semester: 7,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4702L",
      name: "CN & Cyber Security Lab",
      semester: 7,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE4703",
      name: "Software Engineering",
      semester: 7,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4704L",
      name: "Software Engineering Lab",
      semester: 7,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE4705",
      name: "Digital Signal & System",
      semester: 7,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4706",
      name: "Simulation and Modeling",
      semester: 7,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4707",
      name: "Computer Graphics & Animation",
      semester: 7,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4708L",
      name: "CG & Animation Lab",
      semester: 7,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    // SEM 8 - BATCH-33
    await storage.createCourse({
      code: "CSE4801",
      name: "Artificial Intelligence & Expert Systems",
      semester: 8,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4802L",
      name: "AI & Expert System Lab",
      semester: 8,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE4803",
      name: "Technical Writing & Presentation",
      semester: 8,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4804",
      name: "Data Warehousing & Data Mining",
      semester: 8,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4805",
      name: "IT Entrepreneurship",
      semester: 8,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE4806",
      name: "Advanced Topics in Computer Science",
      semester: 8,
      creditHours: 3,
      courseType: "theory",
      sessionsPerWeek: 3,
    }),
    await storage.createCourse({
      code: "CSE4807L",
      name: "Capstone Project Lab",
      semester: 8,
      creditHours: 2,
      courseType: "lab",
      sessionsPerWeek: 2,
    }),
    await storage.createCourse({
      code: "CSE4808",
      name: "Research Methodology & Ethics",
      semester: 8,
      creditHours: 2,
      courseType: "theory",
      sessionsPerWeek: 2,
    }),
  ];

  // YOUR 9 EXACT BATCHES
  const batches = [
    await storage.createBatch({
      name: "BATCH-41",
      semester: 1,
      studentCount: 50,
      section: "A",
    }),
    await storage.createBatch({
      name: "BATCH-40",
      semester: 2,
      studentCount: 48,
      section: "A",
    }),
    await storage.createBatch({
      name: "BATCH-39",
      semester: 3,
      studentCount: 49,
      section: "A",
    }),
    await storage.createBatch({
      name: "BATCH-38",
      semester: 4,
      studentCount: 51,
      section: "A",
    }),
    await storage.createBatch({
      name: "BATCH-37",
      semester: 5,
      studentCount: 43,
      section: "A",
    }),
    await storage.createBatch({
      name: "BATCH-35",
      semester: 6,
      studentCount: 41,
      section: "A",
    }),
    await storage.createBatch({
      name: "BATCH-36",
      semester: 6,
      studentCount: 11,
      section: "A",
    }),
    await storage.createBatch({
      name: "BATCH-34",
      semester: 7,
      studentCount: 41,
      section: "A",
    }),
    await storage.createBatch({
      name: "BATCH-33",
      semester: 8,
      studentCount: 48,
      section: "A",
    }),
  ];

  console.log("✓ YOUR data initialized:");
  console.log(`  - ${teachers.length} teachers`);
  console.log(`  - ${courses.length} courses`);
  console.log(`  - ${batches.length} batches`);
  console.log(`  - ${classrooms.length} classrooms`);
}
