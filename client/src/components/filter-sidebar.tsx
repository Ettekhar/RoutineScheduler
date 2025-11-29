import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  X, 
  Filter,
  GraduationCap,
  BookOpen,
  Users,
  MapPin,
  Calendar,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { 
  ScheduleFilters, 
  Teacher, 
  Course, 
  Batch, 
  Classroom,
  WorkingDay 
} from "@shared/schema";
import { WORKING_DAYS } from "@shared/schema";

interface FilterSidebarProps {
  filters: ScheduleFilters;
  onFiltersChange: (filters: ScheduleFilters) => void;
  teachers: Teacher[];
  courses: Course[];
  batches: Batch[];
  classrooms: Classroom[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DAY_LABELS: Record<WorkingDay, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

export function FilterSidebar({
  filters,
  onFiltersChange,
  teachers,
  courses,
  batches,
  classrooms,
  isCollapsed = false,
  onToggleCollapse,
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    teacher: true,
    semester: true,
    course: true,
    day: true,
    room: true,
    type: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = <K extends keyof ScheduleFilters>(
    key: K, 
    value: ScheduleFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof ScheduleFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    key => filters[key as keyof ScheduleFilters] !== undefined
  ).length;

  const semesters = Array.from(new Set(batches.map(b => b.semester))).sort();
  
  // Filter courses based on selected semester
  const filteredCourses = filters.semester 
    ? courses.filter(c => c.semester === filters.semester)
    : courses;

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-card flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="relative"
          data-testid="button-expand-filters"
        >
          <Filter className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="w-72 border-r bg-card flex flex-col h-full" 
      data-testid="filter-sidebar"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs h-7 px-2"
              data-testid="button-clear-filters"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
            data-testid="button-collapse-filters"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="p-3 border-b">
          <div className="flex flex-wrap gap-1.5">
            {filters.teacherId && (
              <Badge 
                variant="secondary" 
                className="gap-1 pr-1"
                data-testid="badge-filter-teacher"
              >
                {teachers.find(t => t.id === filters.teacherId)?.name || "Teacher"}
                <button
                  onClick={() => clearFilter("teacherId")}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.semester && (
              <Badge 
                variant="secondary" 
                className="gap-1 pr-1"
                data-testid="badge-filter-semester"
              >
                Semester {filters.semester}
                <button
                  onClick={() => clearFilter("semester")}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.courseId && (
              <Badge 
                variant="secondary" 
                className="gap-1 pr-1"
                data-testid="badge-filter-course"
              >
                {courses.find(c => c.id === filters.courseId)?.code || "Course"}
                <button
                  onClick={() => clearFilter("courseId")}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.day && (
              <Badge 
                variant="secondary" 
                className="gap-1 pr-1"
                data-testid="badge-filter-day"
              >
                {DAY_LABELS[filters.day as WorkingDay]}
                <button
                  onClick={() => clearFilter("day")}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.classroomId && (
              <Badge 
                variant="secondary" 
                className="gap-1 pr-1"
                data-testid="badge-filter-room"
              >
                {classrooms.find(r => r.id === filters.classroomId)?.roomNumber || "Room"}
                <button
                  onClick={() => clearFilter("classroomId")}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.courseType && (
              <Badge 
                variant="secondary" 
                className="gap-1 pr-1"
                data-testid="badge-filter-type"
              >
                {filters.courseType === "theory" ? "Theory" : "Lab"}
                <button
                  onClick={() => clearFilter("courseType")}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Teacher Filter */}
          <FilterSection
            title="Teacher"
            icon={<GraduationCap className="w-4 h-4" />}
            isOpen={openSections.teacher}
            onToggle={() => toggleSection("teacher")}
          >
            <Select
              value={filters.teacherId || "all"}
              onValueChange={(val) => updateFilter("teacherId", val === "all" ? undefined : val)}
            >
              <SelectTrigger data-testid="select-filter-teacher">
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Semester Filter */}
          <FilterSection
            title="Semester"
            icon={<Users className="w-4 h-4" />}
            isOpen={openSections.semester}
            onToggle={() => toggleSection("semester")}
          >
            <Select
              value={filters.semester?.toString() || "all"}
              onValueChange={(val) => {
                // When semester changes, clear course filter since courses are semester-specific
                const newFilters = { ...filters, courseId: undefined };
                newFilters.semester = val === "all" ? undefined : parseInt(val);
                onFiltersChange(newFilters);
              }}
            >
              <SelectTrigger data-testid="select-filter-semester">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Course Filter */}
          <FilterSection
            title="Course"
            icon={<BookOpen className="w-4 h-4" />}
            isOpen={openSections.course}
            onToggle={() => toggleSection("course")}
          >
            <Select
              value={filters.courseId || "all"}
              onValueChange={(val) => updateFilter("courseId", val === "all" ? undefined : val)}
            >
              <SelectTrigger data-testid="select-filter-course">
                <SelectValue placeholder={filters.semester ? `Courses in Semester ${filters.semester}` : "All Courses"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filters.semester ? "All Courses" : "All Courses"}</SelectItem>
                {filteredCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Day Filter */}
          <FilterSection
            title="Day"
            icon={<Calendar className="w-4 h-4" />}
            isOpen={openSections.day}
            onToggle={() => toggleSection("day")}
          >
            <Select
              value={filters.day || "all"}
              onValueChange={(val) => updateFilter("day", val === "all" ? undefined : val)}
            >
              <SelectTrigger data-testid="select-filter-day">
                <SelectValue placeholder="All Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {WORKING_DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {DAY_LABELS[day]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Room Filter */}
          <FilterSection
            title="Room"
            icon={<MapPin className="w-4 h-4" />}
            isOpen={openSections.room}
            onToggle={() => toggleSection("room")}
          >
            <Select
              value={filters.classroomId || "all"}
              onValueChange={(val) => updateFilter("classroomId", val === "all" ? undefined : val)}
            >
              <SelectTrigger data-testid="select-filter-room">
                <SelectValue placeholder="All Rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {classrooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.roomNumber} - {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Class Type Filter */}
          <FilterSection
            title="Class Type"
            icon={<FlaskConical className="w-4 h-4" />}
            isOpen={openSections.type}
            onToggle={() => toggleSection("type")}
          >
            <Select
              value={filters.courseType || "all"}
              onValueChange={(val) => updateFilter("courseType", val === "all" ? undefined : val as 'theory' | 'lab')}
            >
              <SelectTrigger data-testid="select-filter-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="theory">Theory Classes</SelectItem>
                <SelectItem value="lab">Lab Sessions</SelectItem>
              </SelectContent>
            </Select>
          </FilterSection>
        </div>
      </ScrollArea>
    </div>
  );
}

// Collapsible Filter Section Component
function FilterSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover-elevate text-sm font-medium">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 px-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
