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
  type LunchBreakConfig,
} from "@shared/schema";

// Helper function to check if a time slot is during lunch break
function isLunchTime(slotStart: string, slotEnd: string, lunchBreak: LunchBreakConfig): boolean {
  if (!lunchBreak.enabled) return false;
  
  const slotStartMin = parseInt(slotStart.split(':')[0]) * 60 + parseInt(slotStart.split(':')[1]);
  const slotEndMin = parseInt(slotEnd.split(':')[0]) * 60 + parseInt(slotEnd.split(':')[1]);
  const lunchStartMin = parseInt(lunchBreak.startTime.split(':')[0]) * 60 + parseInt(lunchBreak.startTime.split(':')[1]);
  const lunchEndMin = parseInt(lunchBreak.endTime.split(':')[0]) * 60 + parseInt(lunchBreak.endTime.split(':')[1]);
  
  // Check if slot overlaps with lunch break
  return slotStartMin < lunchEndMin && slotEndMin > lunchStartMin;
}

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

  // Helper function to find consecutive available slots for labs
  function findConsecutiveSlots(
    day: string,
    groupKey: string,
    batchId: string,
    teacher: Teacher,
    room: Classroom,
    timeSlots: TimeSlot[],
    lunchBreak: LunchBreakConfig,
    teacherSlots: Map<string, Set<string>>,
    roomSlots: Map<string, Set<string>>,
    groupSlots: Map<string, Set<string>>,
    batchSlots: Map<string, Set<string>>
  ): { slot1: TimeSlot; slot2: TimeSlot } | null {
    // Try to find 2 consecutive slots
    for (let i = 0; i < timeSlots.length - 1; i++) {
      const slot1 = timeSlots[i];
      const slot2 = timeSlots[i + 1];
      
      // Skip if either slot is lunch time
      if (isLunchTime(slot1.startTime, slot1.endTime, lunchBreak) ||
          isLunchTime(slot2.startTime, slot2.endTime, lunchBreak)) {
        continue;
      }

      const slotKey1 = `${day}-${slot1.id}`;
      const slotKey2 = `${day}-${slot2.id}`;

      // Check if both slots are available
      const teacherFree = !teacherSlots.get(teacher.id)?.has(slotKey1) && 
                         !teacherSlots.get(teacher.id)?.has(slotKey2);
      const groupFree = !groupSlots.get(groupKey)?.has(slotKey1) && 
                       !groupSlots.get(groupKey)?.has(slotKey2);
      const batchFree = !batchSlots.get(batchId)?.has(slotKey1) && 
                       !batchSlots.get(batchId)?.has(slotKey2);
      const roomFree = !roomSlots.get(room.id)?.has(slotKey1) && 
                      !roomSlots.get(room.id)?.has(slotKey2);

      if (teacherFree && groupFree && batchFree && roomFree) {
        return { slot1, slot2 };
      }
    }
    
    return null;
  }

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
      const lunchBreak = await storage.getLunchBreak();

      if (teachers.length === 0 || courses.length === 0 || batches.length === 0 || classrooms.length === 0) {
        return res.status(400).json({ 
          message: "Not enough data to generate schedule. Please add teachers, courses, batches, and classrooms." 
        });
      }

      // Track occupied slots per group
      const teacherSlots = new Map<string, Set<string>>();
      const roomSlots = new Map<string, Set<string>>();
      const groupSlots = new Map<string, Set<string>>(); // For batch + group combinations
      const batchSlots = new Map<string, Set<string>>(); // Track entire batch occupancy (blocks all students)
      const groupDays = new Map<string, Set<string>>(); // Track which days each group is used

      teachers.forEach(t => teacherSlots.set(t.id, new Set()));
      classrooms.forEach(r => roomSlots.set(r.id, new Set()));
      batches.forEach(b => batchSlots.set(b.id, new Set()));

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

          // Handle theory classes: no grouping, schedule once per day for full batch
          if (!isLab) {
            const groupKey = `${batch.id}-full`;
            if (!groupSlots.has(groupKey)) {
              groupSlots.set(groupKey, new Set());
              groupDays.set(groupKey, new Set());
            }

            let sessionsScheduled = 0;
            for (const day of WORKING_DAYS) {
              if (sessionsScheduled >= sessionsNeeded) break;
              
              let dayScheduled = false;
              for (const timeSlot of timeSlots) {
                if (dayScheduled) break; // Only 1 session per day for theory classes
                
                const slotKey = `${day}-${timeSlot.id}`;

                // Skip lunch time slots
                if (isLunchTime(timeSlot.startTime, timeSlot.endTime, lunchBreak)) continue;

                // Check conflicts - for theory, entire batch is occupied
                const teacherOccupied = teacherSlots.get(teacher.id)?.has(slotKey);
                const groupOccupied = groupSlots.get(groupKey)?.has(slotKey);
                const batchOccupied = batchSlots.get(batch.id)?.has(slotKey);

                if (teacherOccupied || groupOccupied || batchOccupied) continue;

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
                  labGroup: null,
                  hasConflict: false,
                  conflictType: null,
                });

                // Mark slots as occupied - for theory, mark entire batch as occupied
                teacherSlots.get(teacher.id)?.add(slotKey);
                roomSlots.get(availableRoom.id)?.add(slotKey);
                groupSlots.get(groupKey)?.add(slotKey);
                batchSlots.get(batch.id)?.add(slotKey);
                groupDays.get(groupKey)?.add(day);

                dayScheduled = true;
                sessionsScheduled++;
              }
            }
          } else if (needsSplit) {
            // Lab classes with >25 students: split into groups
            const groups = ["A", "B"];
            let groupAScheduled = 0;
            let groupBScheduled = 0;

            for (const group of groups) {
              const groupKey = `${batch.id}-${group}`;
              if (!groupSlots.has(groupKey)) {
                groupSlots.set(groupKey, new Set());
                groupDays.set(groupKey, new Set());
              }

              let sessionsScheduled = 0;
              
              // Try to schedule on different days for each group
              for (const day of WORKING_DAYS) {
                if (sessionsScheduled >= sessionsNeeded) break;

                // For group B, try to use different days than group A
                if (group === "B" && groupDays.get(`${batch.id}-A`)?.has(day)) {
                  continue;
                }

                // Find 2 consecutive slots for lab
                let availableRoom: Classroom | undefined;
                for (const room of suitableRooms) {
                  const consecutive = findConsecutiveSlots(
                    day,
                    groupKey,
                    batch.id,
                    teacher,
                    room,
                    timeSlots,
                    lunchBreak,
                    teacherSlots,
                    roomSlots,
                    groupSlots,
                    batchSlots
                  );

                  if (consecutive) {
                    availableRoom = room;
                    const { slot1, slot2 } = consecutive;

                    // Create entries for both consecutive slots
                    for (const slot of [slot1, slot2]) {
                      const slotKey = `${day}-${slot.id}`;
                      
                      await storage.createScheduleEntry({
                        courseId: course.id,
                        teacherId: teacher.id,
                        batchId: batch.id,
                        classroomId: availableRoom.id,
                        timeSlotId: slot.id,
                        day,
                        labGroup: group,
                        hasConflict: false,
                        conflictType: null,
                      });

                      // Mark slots as occupied - for lab groups, mark specific group AND batch
                      teacherSlots.get(teacher.id)?.add(slotKey);
                      roomSlots.get(availableRoom.id)?.add(slotKey);
                      groupSlots.get(groupKey)?.add(slotKey);
                      batchSlots.get(batch.id)?.add(slotKey);
                    }

                    groupDays.get(groupKey)?.add(day);
                    sessionsScheduled++;
                    break;
                  }
                }
              }
            }
          } else {
            // Lab classes with <=25 students: no grouping
            const groupKey = `${batch.id}-full`;
            if (!groupSlots.has(groupKey)) {
              groupSlots.set(groupKey, new Set());
              groupDays.set(groupKey, new Set());
            }

            let sessionsScheduled = 0;
            for (const day of WORKING_DAYS) {
              if (sessionsScheduled >= sessionsNeeded) break;

              // Find 2 consecutive slots for lab
              let availableRoom: Classroom | undefined;
              for (const room of suitableRooms) {
                const consecutive = findConsecutiveSlots(
                  day,
                  groupKey,
                  batch.id,
                  teacher,
                  room,
                  timeSlots,
                  lunchBreak,
                  teacherSlots,
                  roomSlots,
                  groupSlots,
                  batchSlots
                );

                if (consecutive) {
                  availableRoom = room;
                  const { slot1, slot2 } = consecutive;

                  // Create entries for both consecutive slots
                  for (const slot of [slot1, slot2]) {
                    const slotKey = `${day}-${slot.id}`;
                    
                    await storage.createScheduleEntry({
                      courseId: course.id,
                      teacherId: teacher.id,
                      batchId: batch.id,
                      classroomId: availableRoom.id,
                      timeSlotId: slot.id,
                      day,
                      labGroup: null,
                      hasConflict: false,
                      conflictType: null,
                    });

                    // Mark slots as occupied - for lab without grouping, mark batch
                    teacherSlots.get(teacher.id)?.add(slotKey);
                    roomSlots.get(availableRoom.id)?.add(slotKey);
                    groupSlots.get(groupKey)?.add(slotKey);
                    batchSlots.get(batch.id)?.add(slotKey);
                  }

                  groupDays.get(groupKey)?.add(day);
                  sessionsScheduled++;
                  break;
                }
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

  // Lunch Break
  app.get("/api/lunch-break", async (req, res) => {
    const lunchBreak = await storage.getLunchBreak();
    res.json(lunchBreak);
  });

  app.post("/api/lunch-break", async (req, res) => {
    try {
      const { startTime, endTime, enabled } = req.body;
      
      if (!startTime || !endTime || enabled === undefined) {
        return res.status(400).json({ message: "startTime, endTime, and enabled are required" });
      }
      
      const lunchBreak = await storage.setLunchBreak({
        startTime,
        endTime,
        enabled,
      });
      res.json(lunchBreak);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
