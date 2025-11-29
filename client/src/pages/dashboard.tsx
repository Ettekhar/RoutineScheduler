import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard-stats";
import { LunchBreakSettings } from "@/components/lunch-break-settings";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Play, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import type { 
  Teacher, 
  Course, 
  Batch, 
  Classroom, 
  ScheduleStats,
  ScheduleEntryWithDetails 
} from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
  });

  const { data: classrooms = [] } = useQuery<Classroom[]>({
    queryKey: ["/api/classrooms"],
  });

  const { data: entries = [] } = useQuery<ScheduleEntryWithDetails[]>({
    queryKey: ["/api/schedule"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ScheduleStats>({
    queryKey: ["/api/stats"],
  });

  const { data: lunchBreak } = useQuery({
    queryKey: ["/api/lunch-break"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/schedule/generate");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Schedule Generated",
        description: "A new conflict-free schedule has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate schedule. Please check your data.",
        variant: "destructive",
      });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/schedule");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Schedule Cleared",
        description: "All scheduled classes have been removed.",
      });
    },
  });

  const canGenerate = teachers.length > 0 && courses.length > 0 && batches.length > 0 && classrooms.length > 0;

  const defaultStats: ScheduleStats = {
    totalTeachers: teachers.length,
    totalCourses: courses.length,
    totalBatches: batches.length,
    totalClassrooms: classrooms.length,
    totalScheduledClasses: entries.length,
    conflictCount: entries.filter(e => e.hasConflict).length,
    theorySessions: entries.filter(e => e.course?.courseType === "theory").length,
    labSessions: entries.filter(e => e.course?.courseType === "lab").length,
  };

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="dashboard-page">
      <div className="max-w-screen-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              University Class Routine Scheduling System
            </p>
          </div>
          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <Button
                variant="outline"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                data-testid="button-clear-schedule"
              >
                {clearMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Clear Schedule
              </Button>
            )}
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!canGenerate || generateMutation.isPending}
              data-testid="button-generate-schedule"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Schedule
            </Button>
          </div>
        </div>

        {/* Warning if missing data */}
        {!canGenerate && (
          <Card className="border-schedule-conflict/30 bg-schedule-conflict/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-schedule-conflict">
                <AlertTriangle className="w-5 h-5" />
                Setup Required
              </CardTitle>
              <CardDescription>
                Add the following data to generate a schedule:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {teachers.length === 0 && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      Add Teachers
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {courses.length === 0 && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      Add Courses
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {batches.length === 0 && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      Add Batches
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {classrooms.length === 0 && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      Add Classrooms
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lunch Break Settings */}
        <LunchBreakSettings />

        {/* Stats */}
        <DashboardStats 
          stats={stats || defaultStats} 
          teachers={teachers}
          classrooms={classrooms}
          isLoading={statsLoading}
        />

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/schedule">
            <Card className="hover-elevate cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Play className="w-5 h-5 text-schedule-theory" />
                  View Schedule
                </CardTitle>
                <CardDescription>
                  View and edit the weekly class routine with filters
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin">
            <Card className="hover-elevate cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-schedule-lab" />
                  Admin Panel
                </CardTitle>
                <CardDescription>
                  Manage teachers, courses, batches, and classrooms
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/export">
            <Card className="hover-elevate cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-schedule-special" />
                  Export Schedule
                </CardTitle>
                <CardDescription>
                  Download schedules as PDF documents
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
