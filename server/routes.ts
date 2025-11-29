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
      const batchSemesterLabTimeSlots = new Map<string, Set<string>>(); // Track time slot IDs used by labs for each batch-semester
      const semesterDaySlotCounts = new Map<string, number>(); // Track classes per day per semester
      const batchSemesterTimeSlots = new Map<string, Set<string>>(); // STRICT: Track day-time slots used by batch-semester (theory OR lab, not both)
      const semesterTimeSlots = new Map<number, Set<string>>(); // STRICT SEMESTER LEVEL: No time slot can be used twice in same semester

      teachers.forEach(t => teacherSlots.set(t.id, new Set()));
      classrooms.forEach(r => roomSlots.set(r.id, new Set()));
      batches.forEach(b => {
        batchSlots.set(b.id, new Set());
        batchTheoryDays.set(b.id, new Set());
        batchLabDays.set(b.id, new Set());
      });
      WORKING_DAYS.forEach(d => daySlotCounts.set(d, 0));
      
      // Initialize semester time slots
      const uniqueSemesters = new Set<number>();
      courses.forEach(c => uniqueSemesters.add(c.semester));
      uniqueSemesters.forEach(sem => semesterTimeSlots.set(sem, new Set()));
      
      // Pre-calculate total weekly classes per semester
      const semesterWeeklyCounts = new Map<number, number>();
      courses.forEach(course => {
        const current = semesterWeeklyCounts.get(course.semester) || 0;
        semesterWeeklyCounts.set(course.semester, current + course.sessionsPerWeek);
      });
      
      // Calculate target distribution per day per semester
      const semesterDayTargets = new Map<number, number>();
      semesterWeeklyCounts.forEach((count, sem) => {
        const target = Math.ceil(count / 5); // Spread across 5 days
        semesterDayTargets.set(sem, target);
      });

      // Assign teachers to courses (round-robin)
      const courseTeachers = new Map<string, Teacher>();
      let teacherIndex = 0;
      courses.forEach(course => {
        const teacher = teachers[(teacherIndex) % teachers.length];
        courseTeachers.set(course.id, teacher);
        teacherIndex = (teacherIndex + 1) % teachers.length;
      });

      // Create day-time slot combinations for intelligent distribution
      interface DayTimeSlot {
        day: WorkingDay;
        timeSlot: TimeSlot;
        isAM: boolean; // true if 8:45-12:00, false if 12:00-15:30
      }
      
      const dayTimeSlots: DayTimeSlot[] = [];
      const dayTimeSlotCounts = new Map<string, number>(); // Track usage per day-time combo
      
      WORKING_DAYS.forEach(day => {
        timeSlots.forEach(timeSlot => {
          if (!isLunchTime(timeSlot.startTime, timeSlot.endTime, lunchBreak)) {
            const isAM = parseInt(timeSlot.startTime) < 12;
            dayTimeSlots.push({ day, timeSlot, isAM });
            dayTimeSlotCounts.set(`${day}-${isAM ? 'AM' : 'PM'}`, 0);
          }
        });
      });

      // Find least-loaded day with semester-aware distribution
      const findLeastLoadedDayForSemester = (semester: number, excludeDays?: Set<string>): WorkingDay | null => {
        let bestDay: WorkingDay | null = null;
        let bestScore = Infinity;
        const target = semesterDayTargets.get(semester) || 10;
        
        for (const day of WORKING_DAYS) {
          if (excludeDays?.has(day)) continue;
          const key = `${semester}-${day}`;
          const count = semesterDaySlotCounts.get(key) || 0;
          
          // Prefer days below target, penalize days above target
          const score = Math.abs(count - target);
          if (score < bestScore) {
            bestDay = day;
            bestScore = score;
          }
        }
        return bestDay;
      };
      
      // Find least-loaded day (compact distribution - no AM/PM separation)
      const findLeastLoadedDay = (excludeDays?: Set<string>): WorkingDay | null => {
        let minDay: WorkingDay | null = null;
        let minCount = Infinity;
        for (const day of WORKING_DAYS) {
          if (excludeDays?.has(day)) continue;
          const count = daySlotCounts.get(day) || 0;
          if (count < minCount) {
            minDay = day;
            minCount = count;
          }
        }
        return minDay;
      };

      // PHASE 1: Schedule ALL theory classes first - smart distribution
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

          const groupKey = `${batch.id}-full`;
          if (!groupSlots.has(groupKey)) {
            groupSlots.set(groupKey, new Set());
            groupDays.set(groupKey, new Set());
          }

          for (let sess = 0; sess < sessionsNeeded; sess++) {
            // Find least-loaded day for this semester
            const bestDay = findLeastLoadedDayForSemester(batch.semester);
            if (!bestDay) break;

            // Try to find an available slot on this day
            let scheduled = false;
            for (const timeSlot of timeSlots) {
              if (isLunchTime(timeSlot.startTime, timeSlot.endTime, lunchBreak)) continue;
              
              const slotKey = `${bestDay}-${timeSlot.id}`;
              const batchSemKey = `${batch.id}-${batch.semester}`;
              
              // STRICT CHECK: No class in this SEMESTER can use this time slot (prevents any batch from using it)
              if (semesterTimeSlots.get(batch.semester)?.has(slotKey)) continue;
              
              // STRICT CHECK: This batch+semester cannot have ANY class (theory or lab) at this time
              if (batchSemesterTimeSlots.get(batchSemKey)?.has(slotKey)) continue;
              if (teacherSlots.get(teacher.id)?.has(slotKey) || batchSlots.get(batch.id)?.has(slotKey)) continue;

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
                timeSlotId: timeSlot.id,
                day: bestDay,
                labGroup: null,
                hasConflict: false,
                conflictType: null,
              });

              teacherSlots.get(teacher.id)?.add(slotKey);
              roomSlots.get(availableRoom.id)?.add(slotKey);
              batchSlots.get(batch.id)?.add(slotKey);
              groupDays.get(groupKey)?.add(bestDay);
              batchTheoryDays.get(batch.id)?.add(bestDay);
              
              // STRICT: Mark this batch-semester-time combo as occupied
              if (!batchSemesterTimeSlots.has(batchSemKey)) batchSemesterTimeSlots.set(batchSemKey, new Set());
              batchSemesterTimeSlots.get(batchSemKey)?.add(slotKey);
              
              // STRICT: Mark this time slot as occupied for entire semester
              semesterTimeSlots.get(batch.semester)?.add(slotKey);
              
              daySlotCounts.set(bestDay, (daySlotCounts.get(bestDay) || 0) + 1);
              const semKey = `${batch.semester}-${bestDay}`;
              semesterDaySlotCounts.set(semKey, (semesterDaySlotCounts.get(semKey) || 0) + 1);

              scheduled = true;
              break;
            }
            if (!scheduled) break;
          }
        }
      }

      // PHASE 2: Schedule lab classes - on different days from theory when possible
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
            // Lab: >25 students - split into groups A and B on different days
            const groups = ["A", "B"];
            const usedGroupDays = { A: new Set<string>(), B: new Set<string>() };

            for (const group of groups) {
              const groupKey = `${batch.id}-${group}`;
              if (!groupSlots.has(groupKey)) {
                groupSlots.set(groupKey, new Set());
                groupDays.set(groupKey, new Set());
              }

              for (let sess = 0; sess < sessionsNeeded; sess++) {
                // Find least-loaded day for this semester
                const excludeDaysSet = new Set<string>();
                if (group === "B") {
                  for (const d of usedGroupDays.A) excludeDaysSet.add(d);
                }
                for (const d of usedGroupDays[group]) excludeDaysSet.add(d);

                const bestDay = findLeastLoadedDayForSemester(batch.semester, excludeDaysSet);
                if (!bestDay) break;

                // Find 2 consecutive time slots NOT already used by other labs for this batch-semester
                const usedLabTimeSlots = batchSemesterLabTimeSlots.get(`${batch.id}-${batch.semester}`) || new Set();
                const batchSemKey = `${batch.id}-${batch.semester}`;
                let scheduled = false;
                for (let i = 0; i < timeSlots.length - 1; i++) {
                  const slot1 = timeSlots[i];
                  const slot2 = timeSlots[i + 1];
                  if (isLunchTime(slot1.startTime, slot1.endTime, lunchBreak) ||
                      isLunchTime(slot2.startTime, slot2.endTime, lunchBreak)) continue;

                  // Skip if these time slots already have labs for this batch-semester
                  if (usedLabTimeSlots.has(slot1.id) || usedLabTimeSlots.has(slot2.id)) continue;

                  const slotKey1 = `${bestDay}-${slot1.id}`;
                  const slotKey2 = `${bestDay}-${slot2.id}`;

                  // STRICT CHECK: No class in this SEMESTER can use these time slots
                  if (semesterTimeSlots.get(batch.semester)?.has(slotKey1) || semesterTimeSlots.get(batch.semester)?.has(slotKey2)) continue;
                  
                  // STRICT CHECK: Cannot use if batch-semester already has class at this time (theory or lab)
                  if (batchSemesterTimeSlots.get(batchSemKey)?.has(slotKey1) || batchSemesterTimeSlots.get(batchSemKey)?.has(slotKey2)) continue;
                  if (teacherSlots.get(teacher.id)?.has(slotKey1) || teacherSlots.get(teacher.id)?.has(slotKey2)) continue;
                  if (batchSlots.get(batch.id)?.has(slotKey1) || batchSlots.get(batch.id)?.has(slotKey2)) continue;

                  let availableRoom: Classroom | undefined;
                  for (const room of suitableRooms) {
                    if (!roomSlots.get(room.id)?.has(slotKey1) && !roomSlots.get(room.id)?.has(slotKey2)) {
                      availableRoom = room;
                      break;
                    }
                  }
                  if (!availableRoom) continue;

                  for (const s of [slot1, slot2]) {
                    const sk = `${bestDay}-${s.id}`;
                    await storage.createScheduleEntry({
                      courseId: course.id,
                      teacherId: teacher.id,
                      batchId: batch.id,
                      classroomId: availableRoom.id,
                      timeSlotId: s.id,
                      day: bestDay,
                      labGroup: group,
                      hasConflict: false,
                      conflictType: null,
                    });
                    teacherSlots.get(teacher.id)?.add(sk);
                    roomSlots.get(availableRoom.id)?.add(sk);
                    batchSlots.get(batch.id)?.add(sk);
                  }

                  groupDays.get(groupKey)?.add(bestDay);
                  usedGroupDays[group].add(bestDay);
                  batchLabDays.get(batch.id)?.add(bestDay);
                  
                  // Track time slots used by labs for this batch-semester
                  if (!batchSemesterLabTimeSlots.has(batchSemKey)) {
                    batchSemesterLabTimeSlots.set(batchSemKey, new Set());
                  }
                  batchSemesterLabTimeSlots.get(batchSemKey)?.add(slot1.id);
                  batchSemesterLabTimeSlots.get(batchSemKey)?.add(slot2.id);
                  
                  // STRICT: Mark these times as occupied for this batch-semester
                  if (!batchSemesterTimeSlots.has(batchSemKey)) {
                    batchSemesterTimeSlots.set(batchSemKey, new Set());
                  }
                  batchSemesterTimeSlots.get(batchSemKey)?.add(slotKey1);
                  batchSemesterTimeSlots.get(batchSemKey)?.add(slotKey2);
                  
                  // STRICT: Mark these times as occupied for entire semester
                  semesterTimeSlots.get(batch.semester)?.add(slotKey1);
                  semesterTimeSlots.get(batch.semester)?.add(slotKey2);
                  
                  daySlotCounts.set(bestDay, (daySlotCounts.get(bestDay) || 0) + 2);
                  const semKey = `${batch.semester}-${bestDay}`;
                  semesterDaySlotCounts.set(semKey, (semesterDaySlotCounts.get(semKey) || 0) + 2);
                  
                  scheduled = true;
                  break;
                }
                if (!scheduled) break;
              }
            }
          } else {
            // Lab: <=25 students - no grouping
            const groupKey = `${batch.id}-full`;
            if (!groupSlots.has(groupKey)) {
              groupSlots.set(groupKey, new Set());
              groupDays.set(groupKey, new Set());
            }

            const usedDays = new Set<string>();
            const usedLabTimeSlots = batchSemesterLabTimeSlots.get(`${batch.id}-${batch.semester}`) || new Set();
            const batchSemKey = `${batch.id}-${batch.semester}`;
            
            for (let sess = 0; sess < sessionsNeeded; sess++) {
              const excludeDaysSet = new Set<string>();
              for (const d of usedDays) excludeDaysSet.add(d);

              const bestDay = findLeastLoadedDayForSemester(batch.semester, excludeDaysSet);
              if (!bestDay) break;

              let scheduled = false;
              for (let i = 0; i < timeSlots.length - 1; i++) {
                const slot1 = timeSlots[i];
                const slot2 = timeSlots[i + 1];
                if (isLunchTime(slot1.startTime, slot1.endTime, lunchBreak) ||
                    isLunchTime(slot2.startTime, slot2.endTime, lunchBreak)) continue;

                // Skip if these time slots already have labs for this batch-semester
                if (usedLabTimeSlots.has(slot1.id) || usedLabTimeSlots.has(slot2.id)) continue;

                const slotKey1 = `${bestDay}-${slot1.id}`;
                const slotKey2 = `${bestDay}-${slot2.id}`;

                // STRICT CHECK: No class in this SEMESTER can use these time slots
                if (semesterTimeSlots.get(batch.semester)?.has(slotKey1) || semesterTimeSlots.get(batch.semester)?.has(slotKey2)) continue;
                
                // STRICT CHECK: Cannot use if batch-semester already has class at this time (theory or lab)
                if (batchSemesterTimeSlots.get(batchSemKey)?.has(slotKey1) || batchSemesterTimeSlots.get(batchSemKey)?.has(slotKey2)) continue;
                if (teacherSlots.get(teacher.id)?.has(slotKey1) || teacherSlots.get(teacher.id)?.has(slotKey2)) continue;
                if (batchSlots.get(batch.id)?.has(slotKey1) || batchSlots.get(batch.id)?.has(slotKey2)) continue;

                let availableRoom: Classroom | undefined;
                for (const room of suitableRooms) {
                  if (!roomSlots.get(room.id)?.has(slotKey1) && !roomSlots.get(room.id)?.has(slotKey2)) {
                    availableRoom = room;
                    break;
                  }
                }
                if (!availableRoom) continue;

                for (const s of [slot1, slot2]) {
                  const sk = `${bestDay}-${s.id}`;
                  await storage.createScheduleEntry({
                    courseId: course.id,
                    teacherId: teacher.id,
                    batchId: batch.id,
                    classroomId: availableRoom.id,
                    timeSlotId: s.id,
                    day: bestDay,
                    labGroup: null,
                    hasConflict: false,
                    conflictType: null,
                  });
                  teacherSlots.get(teacher.id)?.add(sk);
                  roomSlots.get(availableRoom.id)?.add(sk);
                  batchSlots.get(batch.id)?.add(sk);
                }

                groupDays.get(groupKey)?.add(bestDay);
                usedDays.add(bestDay);
                batchLabDays.get(batch.id)?.add(bestDay);
                
                // Track time slots used by labs for this batch-semester
                if (!batchSemesterLabTimeSlots.has(batchSemKey)) {
                  batchSemesterLabTimeSlots.set(batchSemKey, new Set());
                }
                batchSemesterLabTimeSlots.get(batchSemKey)?.add(slot1.id);
                batchSemesterLabTimeSlots.get(batchSemKey)?.add(slot2.id);
                
                // STRICT: Mark these times as occupied for this batch-semester
                if (!batchSemesterTimeSlots.has(batchSemKey)) {
                  batchSemesterTimeSlots.set(batchSemKey, new Set());
                }
                batchSemesterTimeSlots.get(batchSemKey)?.add(slotKey1);
                batchSemesterTimeSlots.get(batchSemKey)?.add(slotKey2);
                
                // STRICT: Mark these times as occupied for entire semester
                semesterTimeSlots.get(batch.semester)?.add(slotKey1);
                semesterTimeSlots.get(batch.semester)?.add(slotKey2);
                
                daySlotCounts.set(bestDay, (daySlotCounts.get(bestDay) || 0) + 2);
                const semKey = `${batch.semester}-${bestDay}`;
                semesterDaySlotCounts.set(semKey, (semesterDaySlotCounts.get(semKey) || 0) + 2);
                
                scheduled = true;
                break;
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
