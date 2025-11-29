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
      const daySlotCounts = new Map<string, number>(); // Track how many classes per day to balance load
      const batchTheoryDays = new Map<string, Set<string>>(); // Track which days batch uses for theory
      const batchLabDays = new Map<string, Set<string>>(); // Track which days batch uses for labs

      teachers.forEach(t => teacherSlots.set(t.id, new Set()));
      classrooms.forEach(r => roomSlots.set(r.id, new Set()));
      batches.forEach(b => {
        batchSlots.set(b.id, new Set());
        batchTheoryDays.set(b.id, new Set());
        batchLabDays.set(b.id, new Set());
      });
      WORKING_DAYS.forEach(d => daySlotCounts.set(d, 0));

      // Assign teachers to courses (round-robin)
      const courseTeachers = new Map<string, Teacher>();
      let teacherIndex = 0;
      courses.forEach(course => {
        const teacher = teachers[(teacherIndex) % teachers.length];
        courseTeachers.set(course.id, teacher);
        teacherIndex = (teacherIndex + 1) % teachers.length;
      });

      // Create all available slots for distribution (day + time combinations)
      interface AvailableSlot {
        day: WorkingDay;
        timeSlotId: string;
        isPM: boolean; // afternoon flag for distribution
      }
      
      const availableSlots: AvailableSlot[] = [];
      WORKING_DAYS.forEach(day => {
        timeSlots.forEach(slot => {
          if (!isLunchTime(slot.startTime, slot.endTime, lunchBreak)) {
            const isPM = parseInt(slot.startTime) >= 13; // 1:00 PM onwards
            availableSlots.push({ day, timeSlotId: slot.id, isPM });
          }
        });
      });

      // Round-robin slot assignment index
      let slotAssignmentIndex = 0;

      // PHASE 1: Schedule ALL theory classes first
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchCourses = courses.filter(c => c.semester === batch.semester && c.courseType === "theory");
        
        for (let courseIdx = 0; courseIdx < batchCourses.length; courseIdx++) {
          const course = batchCourses[courseIdx];
          const teacher = courseTeachers.get(course.id);
          if (!teacher) continue;

          const sessionsNeeded = course.sessionsPerWeek;
          const suitableRooms = classrooms.filter(r => 
            r.roomType === "theory" &&
            r.capacity >= batch.studentCount
          );

          if (suitableRooms.length === 0) continue;

          // Schedule theory classes on separate days
          {
            const groupKey = `${batch.id}-full`;
            if (!groupSlots.has(groupKey)) {
              groupSlots.set(groupKey, new Set());
              groupDays.set(groupKey, new Set());
            }

            let sessionsScheduled = 0;
            
            for (let sess = 0; sess < sessionsNeeded; sess++) {
              let scheduled = false;
              
              // Find next available slot in round-robin, but on a different day for each session
              for (let attempts = 0; attempts < availableSlots.length && !scheduled; attempts++) {
                const slotIdx = (slotAssignmentIndex + attempts) % availableSlots.length;
                const slot = availableSlots[slotIdx];
                
                // Theory must use different day than any theory already scheduled for this batch
                if (batchTheoryDays.get(batch.id)?.has(slot.day)) continue;
                
                const slotKey = `${slot.day}-${slot.timeSlotId}`;

                const teacherOccupied = teacherSlots.get(teacher.id)?.has(slotKey);
                const batchOccupied = batchSlots.get(batch.id)?.has(slotKey);

                if (teacherOccupied || batchOccupied) continue;

                let availableRoom: Classroom | undefined;
                for (const room of suitableRooms) {
                  if (!roomSlots.get(room.id)?.has(slotKey)) {
                    availableRoom = room;
                    break;
                  }
                }

                if (!availableRoom) continue;

                await storage.createScheduleEntry({
                  courseId: course.id,
                  teacherId: teacher.id,
                  batchId: batch.id,
                  classroomId: availableRoom.id,
                  timeSlotId: slot.timeSlotId,
                  day: slot.day,
                  labGroup: null,
                  hasConflict: false,
                  conflictType: null,
                });

                teacherSlots.get(teacher.id)?.add(slotKey);
                roomSlots.get(availableRoom.id)?.add(slotKey);
                groupSlots.get(groupKey)?.add(slotKey);
                batchSlots.get(batch.id)?.add(slotKey);
                groupDays.get(groupKey)?.add(slot.day);
                batchTheoryDays.get(batch.id)?.add(slot.day);
                daySlotCounts.set(slot.day, (daySlotCounts.get(slot.day) || 0) + 1);

                slotAssignmentIndex = (slotIdx + 1) % availableSlots.length;
                sessionsScheduled++;
                scheduled = true;
              }
              
              if (!scheduled) break;
            }
          }
        }
      }

      // PHASE 2: Schedule ALL lab classes on DIFFERENT days than theory
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchCourses = courses.filter(c => c.semester === batch.semester && c.courseType === "lab");
        
        for (let courseIdx = 0; courseIdx < batchCourses.length; courseIdx++) {
          const course = batchCourses[courseIdx];
          const teacher = courseTeachers.get(course.id);
          if (!teacher) continue;

          const needsSplit = batch.studentCount > 25;
          const sessionsNeeded = course.sessionsPerWeek;

          // Find suitable rooms
          const suitableRooms = classrooms.filter(r => 
            r.roomType === "lab" &&
            r.capacity >= (needsSplit ? Math.ceil(batch.studentCount / 2) : batch.studentCount)
          );

          if (suitableRooms.length === 0) continue;

          if (needsSplit) {
            // Lab classes with >25 students: split into groups A and B
            const groups = ["A", "B"];
            const usedGroupDays = { A: new Set<string>(), B: new Set<string>() };

            for (const group of groups) {
              const groupKey = `${batch.id}-${group}`;
              if (!groupSlots.has(groupKey)) {
                groupSlots.set(groupKey, new Set());
                groupDays.set(groupKey, new Set());
              }

              let sessionsScheduled = 0;
              
              for (let sess = 0; sess < sessionsNeeded; sess++) {
                let scheduled = false;
                
                for (let attempts = 0; attempts < availableSlots.length * 2 && !scheduled; attempts++) {
                  const slotIdx = (slotAssignmentIndex + attempts) % availableSlots.length;
                  const slot = availableSlots[slotIdx];
                  
                  // CRITICAL: Labs cannot use days where theory is scheduled for this batch
                  if (batchTheoryDays.get(batch.id)?.has(slot.day)) continue;
                  
                  // Group B must use different day than Group A
                  if (group === "B" && usedGroupDays.A.has(slot.day)) continue;
                  if (usedGroupDays[group].has(slot.day)) continue;

                  // Try to find 2 consecutive slots starting from this one
                  const slotIndex = timeSlots.findIndex(s => s.id === slot.timeSlotId);
                  if (slotIndex === -1 || slotIndex >= timeSlots.length - 1) continue;

                  const slot1 = timeSlots[slotIndex];
                  const slot2 = timeSlots[slotIndex + 1];

                  if (isLunchTime(slot1.startTime, slot1.endTime, lunchBreak) ||
                      isLunchTime(slot2.startTime, slot2.endTime, lunchBreak)) continue;

                  const slotKey1 = `${slot.day}-${slot1.id}`;
                  const slotKey2 = `${slot.day}-${slot2.id}`;

                  const teacherFree = !teacherSlots.get(teacher.id)?.has(slotKey1) &&
                                     !teacherSlots.get(teacher.id)?.has(slotKey2);
                  const groupFree = !groupSlots.get(groupKey)?.has(slotKey1) &&
                                   !groupSlots.get(groupKey)?.has(slotKey2);
                  const batchFree = !batchSlots.get(batch.id)?.has(slotKey1) &&
                                   !batchSlots.get(batch.id)?.has(slotKey2);

                  if (!teacherFree || !groupFree || !batchFree) continue;

                  let availableRoom: Classroom | undefined;
                  for (const room of suitableRooms) {
                    if (!roomSlots.get(room.id)?.has(slotKey1) &&
                        !roomSlots.get(room.id)?.has(slotKey2)) {
                      availableRoom = room;
                      break;
                    }
                  }

                  if (!availableRoom) continue;

                  for (const s of [slot1, slot2]) {
                    const sk = `${slot.day}-${s.id}`;
                    await storage.createScheduleEntry({
                      courseId: course.id,
                      teacherId: teacher.id,
                      batchId: batch.id,
                      classroomId: availableRoom.id,
                      timeSlotId: s.id,
                      day: slot.day,
                      labGroup: group,
                      hasConflict: false,
                      conflictType: null,
                    });

                    teacherSlots.get(teacher.id)?.add(sk);
                    roomSlots.get(availableRoom.id)?.add(sk);
                    groupSlots.get(groupKey)?.add(sk);
                    batchSlots.get(batch.id)?.add(sk);
                  }

                  groupDays.get(groupKey)?.add(slot.day);
                  usedGroupDays[group].add(slot.day);
                  batchLabDays.get(batch.id)?.add(slot.day);
                  daySlotCounts.set(slot.day, (daySlotCounts.get(slot.day) || 0) + 2);
                  slotAssignmentIndex = (slotIdx + 1) % availableSlots.length;
                  sessionsScheduled++;
                  scheduled = true;
                }
                
                if (!scheduled) break;
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
            const usedDays = new Set<string>();
            
            for (let sess = 0; sess < sessionsNeeded; sess++) {
              let scheduled = false;
              
              for (let attempts = 0; attempts < availableSlots.length * 2 && !scheduled; attempts++) {
                const slotIdx = (slotAssignmentIndex + attempts) % availableSlots.length;
                const slot = availableSlots[slotIdx];
                
                // CRITICAL: Labs cannot use days where theory is scheduled for this batch
                if (batchTheoryDays.get(batch.id)?.has(slot.day)) continue;
                if (usedDays.has(slot.day)) continue;

                const slotIndex = timeSlots.findIndex(s => s.id === slot.timeSlotId);
                if (slotIndex === -1 || slotIndex >= timeSlots.length - 1) continue;

                const slot1 = timeSlots[slotIndex];
                const slot2 = timeSlots[slotIndex + 1];

                const slotKey1 = `${slot.day}-${slot1.id}`;
                const slotKey2 = `${slot.day}-${slot2.id}`;

                const teacherFree = !teacherSlots.get(teacher.id)?.has(slotKey1) &&
                                   !teacherSlots.get(teacher.id)?.has(slotKey2);
                const groupFree = !groupSlots.get(groupKey)?.has(slotKey1) &&
                                 !groupSlots.get(groupKey)?.has(slotKey2);
                const batchFree = !batchSlots.get(batch.id)?.has(slotKey1) &&
                                 !batchSlots.get(batch.id)?.has(slotKey2);

                if (!teacherFree || !groupFree || !batchFree) continue;

                let availableRoom: Classroom | undefined;
                for (const room of suitableRooms) {
                  if (!roomSlots.get(room.id)?.has(slotKey1) &&
                      !roomSlots.get(room.id)?.has(slotKey2)) {
                    availableRoom = room;
                    break;
                  }
                }

                if (!availableRoom) continue;

                for (const s of [slot1, slot2]) {
                  const sk = `${slot.day}-${s.id}`;
                  await storage.createScheduleEntry({
                    courseId: course.id,
                    teacherId: teacher.id,
                    batchId: batch.id,
                    classroomId: availableRoom.id,
                    timeSlotId: s.id,
                    day: slot.day,
                    labGroup: null,
                    hasConflict: false,
                    conflictType: null,
                  });

                  teacherSlots.get(teacher.id)?.add(sk);
                  roomSlots.get(availableRoom.id)?.add(sk);
                  groupSlots.get(groupKey)?.add(sk);
                  batchSlots.get(batch.id)?.add(sk);
                }

                groupDays.get(groupKey)?.add(slot.day);
                usedDays.add(slot.day);
                batchLabDays.get(batch.id)?.add(slot.day);
                daySlotCounts.set(slot.day, (daySlotCounts.get(slot.day) || 0) + 2);
                slotAssignmentIndex = (slotIdx + 1) % availableSlots.length;
                sessionsScheduled++;
                scheduled = true;
              }
              
              if (!scheduled) break;
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
