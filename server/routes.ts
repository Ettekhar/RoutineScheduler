import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTeacherSchema, 
  insertCourseSchema, 
  insertBatchSchema, 
  insertClassroomSchema,
  insertScheduleEntrySchema,
  WORKING_DAYS,
  type WorkingDay,
  type Course,
  type Batch,
  type Teacher,
  type Classroom,
  type TimeSlot,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Teachers CRUD
  app.get("/api/teachers", async (req, res) => {
    const teachers = await storage.getTeachers();
    res.json(teachers);
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const data = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(data);
      res.status(201).json(teacher);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/teachers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertTeacherSchema.partial().parse(req.body);
      const teacher = await storage.updateTeacher(id, data);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteTeacher(id);
    if (!deleted) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(204).send();
  });

  // Courses CRUD
  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const data = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(data);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(id, data);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteCourse(id);
    if (!deleted) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(204).send();
  });

  // Batches CRUD
  app.get("/api/batches", async (req, res) => {
    const batches = await storage.getBatches();
    res.json(batches);
  });

  app.post("/api/batches", async (req, res) => {
    try {
      const data = insertBatchSchema.parse(req.body);
      const batch = await storage.createBatch(data);
      res.status(201).json(batch);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/batches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertBatchSchema.partial().parse(req.body);
      const batch = await storage.updateBatch(id, data);
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      res.json(batch);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/batches/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteBatch(id);
    if (!deleted) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.status(204).send();
  });

  // Classrooms CRUD
  app.get("/api/classrooms", async (req, res) => {
    const classrooms = await storage.getClassrooms();
    res.json(classrooms);
  });

  app.post("/api/classrooms", async (req, res) => {
    try {
      const data = insertClassroomSchema.parse(req.body);
      const classroom = await storage.createClassroom(data);
      res.status(201).json(classroom);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/classrooms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertClassroomSchema.partial().parse(req.body);
      const classroom = await storage.updateClassroom(id, data);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
      res.json(classroom);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/classrooms/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteClassroom(id);
    if (!deleted) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    res.status(204).send();
  });

  // Time Slots
  app.get("/api/timeslots", async (req, res) => {
    const timeSlots = await storage.getTimeSlots();
    res.json(timeSlots);
  });

  // Schedule Entries
  app.get("/api/schedule", async (req, res) => {
    const entries = await storage.getScheduleEntriesWithDetails();
    res.json(entries);
  });

  app.post("/api/schedule", async (req, res) => {
    try {
      const data = insertScheduleEntrySchema.parse(req.body);
      const entry = await storage.createScheduleEntry(data);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/schedule/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertScheduleEntrySchema.partial().parse(req.body);
      
      // Check for conflicts
      const entries = await storage.getScheduleEntries();
      const otherEntries = entries.filter(e => e.id !== id);
      
      let hasConflict = false;
      let conflictType: string | null = null;

      if (data.day && data.timeSlotId) {
        // Check teacher conflict
        if (data.teacherId) {
          const teacherConflict = otherEntries.find(
            e => e.teacherId === data.teacherId && e.day === data.day && e.timeSlotId === data.timeSlotId
          );
          if (teacherConflict) {
            hasConflict = true;
            conflictType = "teacher";
          }
        }

        // Check room conflict
        if (data.classroomId) {
          const roomConflict = otherEntries.find(
            e => e.classroomId === data.classroomId && e.day === data.day && e.timeSlotId === data.timeSlotId
          );
          if (roomConflict) {
            hasConflict = true;
            conflictType = "room";
          }
        }

        // Check batch conflict
        if (data.batchId) {
          const batchConflict = otherEntries.find(
            e => e.batchId === data.batchId && e.day === data.day && e.timeSlotId === data.timeSlotId
          );
          if (batchConflict) {
            hasConflict = true;
            conflictType = "batch";
          }
        }
      }

      const entry = await storage.updateScheduleEntry(id, {
        ...data,
        hasConflict,
        conflictType,
      });
      
      if (!entry) {
        return res.status(404).json({ message: "Schedule entry not found" });
      }
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/schedule/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteScheduleEntry(id);
    if (!deleted) {
      return res.status(404).json({ message: "Schedule entry not found" });
    }
    res.status(204).send();
  });

  app.delete("/api/schedule", async (req, res) => {
    await storage.clearSchedule();
    res.status(204).send();
  });

  // Generate Schedule
  app.post("/api/schedule/generate", async (req, res) => {
    try {
      // Clear existing schedule
      await storage.clearSchedule();

      const teachers = await storage.getTeachers();
      const courses = await storage.getCourses();
      const batches = await storage.getBatches();
      const classrooms = await storage.getClassrooms();
      const timeSlots = await storage.getTimeSlots();

      if (teachers.length === 0 || courses.length === 0 || batches.length === 0 || classrooms.length === 0) {
        return res.status(400).json({ 
          message: "Not enough data to generate schedule. Please add teachers, courses, batches, and classrooms." 
        });
      }

      // Track occupied slots per group
      const teacherSlots = new Map<string, Set<string>>();
      const roomSlots = new Map<string, Set<string>>();
      const groupSlots = new Map<string, Set<string>>(); // For batch + group combinations

      teachers.forEach(t => teacherSlots.set(t.id, new Set()));
      classrooms.forEach(r => roomSlots.set(r.id, new Set()));

      // Assign teachers to courses (round-robin)
      const courseTeachers = new Map<string, Teacher>();
      let teacherIndex = 0;
      courses.forEach(course => {
        const teacher = teachers[(teacherIndex) % teachers.length];
        courseTeachers.set(course.id, teacher);
        teacherIndex = (teacherIndex + 1) % teachers.length;
      });

      // Schedule each batch's courses
      for (const batch of batches) {
        const batchCourses = courses.filter(c => c.semester === batch.semester);
        
        for (const course of batchCourses) {
          const teacher = courseTeachers.get(course.id);
          if (!teacher) continue;

          const isLab = course.courseType === "lab";
          const needsSplit = isLab && batch.studentCount > 25;
          const sessionsNeeded = course.sessionsPerWeek;

          // Find suitable rooms
          const suitableRooms = classrooms.filter(r => 
            r.roomType === course.courseType &&
            r.capacity >= (needsSplit ? Math.ceil(batch.studentCount / 2) : batch.studentCount)
          );

          if (suitableRooms.length === 0) continue;

          // If lab with >25 students, split into groups
          const groups = needsSplit ? ["A", "B"] : [null];

          for (const group of groups) {
            const groupKey = `${batch.id}-${group || "full"}`;
            if (!groupSlots.has(groupKey)) {
              groupSlots.set(groupKey, new Set());
            }

            // Schedule sessions for this group
            let sessionsScheduled = 0;
            
            for (const day of WORKING_DAYS) {
              if (sessionsScheduled >= sessionsNeeded) break;
              
              for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
                if (sessionsScheduled >= sessionsNeeded) break;
                
                const timeSlot = timeSlots[slotIdx];
                const slotKey = `${day}-${timeSlot.id}`;
                const groupSlotKey = `${groupKey}-${slotKey}`;

                // Check conflicts
                const teacherOccupied = teacherSlots.get(teacher.id)?.has(slotKey);
                const groupOccupied = groupSlots.get(groupKey)?.has(slotKey);

                if (teacherOccupied || groupOccupied) continue;

                // Find available room
                let availableRoom: Classroom | undefined;
                for (const room of suitableRooms) {
                  if (!roomSlots.get(room.id)?.has(slotKey)) {
                    availableRoom = room;
                    break;
                  }
                }

                if (!availableRoom) continue;

                // Create schedule entry
                await storage.createScheduleEntry({
                  courseId: course.id,
                  teacherId: teacher.id,
                  batchId: batch.id,
                  classroomId: availableRoom.id,
                  timeSlotId: timeSlot.id,
                  day,
                  labGroup: group,
                  hasConflict: false,
                  conflictType: null,
                });

                // Mark slots as occupied
                teacherSlots.get(teacher.id)?.add(slotKey);
                roomSlots.get(availableRoom.id)?.add(slotKey);
                groupSlots.get(groupKey)?.add(slotKey);

                sessionsScheduled++;
              }
            }
          }
        }
      }

      const entries = await storage.getScheduleEntriesWithDetails();
      res.json(entries);
    } catch (error: any) {
      console.error("Schedule generation error:", error);
      res.status(500).json({ message: error.message || "Failed to generate schedule" });
    }
  });

  // Stats
  app.get("/api/stats", async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  return httpServer;
}
