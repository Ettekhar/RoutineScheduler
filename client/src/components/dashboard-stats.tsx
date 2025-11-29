import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  MapPin, 
  Calendar,
  AlertTriangle,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleStats, Teacher, Classroom } from "@shared/schema";

interface DashboardStatsProps {
  stats: ScheduleStats;
  teachers: Teacher[];
  classrooms: Classroom[];
  isLoading?: boolean;
}

export function DashboardStats({ stats, teachers, classrooms, isLoading }: DashboardStatsProps) {
  // Calculate teacher utilization
  const teacherUtilization = teachers.length > 0
    ? Math.round((teachers.reduce((acc, t) => acc + t.currentLoad, 0) / 
        teachers.reduce((acc, t) => acc + t.maxLoad, 0)) * 100)
    : 0;

  // Calculate room utilization (assuming 45 possible slots per week: 9 slots * 5 days)
  const maxPossibleSlots = classrooms.length * 45;
  const roomUtilization = maxPossibleSlots > 0
    ? Math.round((stats.totalScheduledClasses / maxPossibleSlots) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-stats">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Teachers"
          value={stats.totalTeachers}
          icon={<GraduationCap className="h-5 w-5" />}
          description={`${teachers.filter(t => t.currentLoad > 0).length} with assigned classes`}
          iconColor="text-schedule-theory"
          testId="stat-teachers"
        />
        <StatCard
          title="Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="h-5 w-5" />}
          description={`${stats.theorySessions + stats.labSessions} total sessions`}
          iconColor="text-schedule-lab"
          testId="stat-courses"
        />
        <StatCard
          title="Student Batches"
          value={stats.totalBatches}
          icon={<Users className="h-5 w-5" />}
          description="Across all semesters"
          iconColor="text-schedule-special"
          testId="stat-batches"
        />
        <StatCard
          title="Classrooms"
          value={stats.totalClassrooms}
          icon={<MapPin className="h-5 w-5" />}
          description={`${classrooms.filter(c => c.roomType === 'lab').length} labs, ${classrooms.filter(c => c.roomType === 'theory').length} theory`}
          iconColor="text-amber-500"
          testId="stat-classrooms"
        />
      </div>

      {/* Schedule Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1" data-testid="stat-scheduled-classes">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalScheduledClasses}</div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-schedule-theory" />
                <span className="text-sm text-muted-foreground">{stats.theorySessions} Theory</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-schedule-lab" />
                <span className="text-sm text-muted-foreground">{stats.labSessions} Lab</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1" data-testid="stat-conflicts">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule Status</CardTitle>
            {stats.conflictCount > 0 ? (
              <AlertTriangle className="h-4 w-4 text-schedule-conflict" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-schedule-lab" />
            )}
          </CardHeader>
          <CardContent>
            {stats.conflictCount > 0 ? (
              <>
                <div className="text-3xl font-bold text-schedule-conflict">{stats.conflictCount}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Conflicts detected - review required
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-schedule-lab">Clean</div>
                <p className="text-sm text-muted-foreground mt-1">
                  No scheduling conflicts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1" data-testid="stat-session-types">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Types</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Theory</span>
                  <span className="font-medium">{stats.theorySessions}</span>
                </div>
                <Progress 
                  value={stats.totalScheduledClasses > 0 ? (stats.theorySessions / stats.totalScheduledClasses) * 100 : 0} 
                  className="h-2 bg-muted"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Lab</span>
                  <span className="font-medium">{stats.labSessions}</span>
                </div>
                <Progress 
                  value={stats.totalScheduledClasses > 0 ? (stats.labSessions / stats.totalScheduledClasses) * 100 : 0} 
                  className="h-2 bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="stat-teacher-utilization">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teacher Utilization</CardTitle>
            <Badge variant={teacherUtilization > 80 ? "destructive" : "secondary"}>
              {teacherUtilization}%
            </Badge>
          </CardHeader>
          <CardContent>
            <Progress value={teacherUtilization} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {teachers.reduce((acc, t) => acc + t.currentLoad, 0)} / {teachers.reduce((acc, t) => acc + t.maxLoad, 0)} teaching hours assigned
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-room-utilization">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Utilization</CardTitle>
            <Badge variant={roomUtilization > 80 ? "destructive" : "secondary"}>
              {roomUtilization}%
            </Badge>
          </CardHeader>
          <CardContent>
            <Progress value={roomUtilization} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {stats.totalScheduledClasses} / {maxPossibleSlots} possible time slots used
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
  iconColor,
  testId,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  iconColor: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-md bg-muted", iconColor)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
