import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard-stats";
import { LunchBreakSettings } from "@/components/lunch-break-settings";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [newSessionName, setNewSessionName] = useState("");

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

  const { data: sessionsData } = useQuery({
    queryKey: ["/api/sessions"],
  });

  const generateMutation = useMutation({
    mutationFn: async (sessionName: string) => {
      const res = await apiRequest("POST", "/api/schedule/generate", { sessionName });
      return res.json() as Promise<{ entries: any[]; stats: any }>;
    },
    onSuccess: ({ entries, stats }) => {
      // Populate caches directly from the generate response so the UI
      // updates immediately without a refetch hitting a different Vercel
      // serverless instance that has no memory of the generated data.
      queryClient.setQueryData(["/api/schedule"], entries);
      queryClient.setQueryData(["/api/stats"], stats);

      // These reads are cheap and don't depend on the generated state
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Schedule Generated",
        description: `A new conflict-free schedule has been created (${entries.length} classes).`,
      });
      setShowGenerateDialog(false);
      setSelectedSession("");
      setNewSessionName("");
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
    mutationFn: async (sessionName: string) => {
      return apiRequest("DELETE", "/api/schedule", { sessionName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Schedule Cleared",
        description: "All scheduled classes have been removed.",
      });
      setShowClearDialog(false);
      setSelectedSession("");
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
    <>
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
                onClick={() => setShowClearDialog(true)}
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
              onClick={() => setShowGenerateDialog(true)}
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

      {/* Generate Schedule Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent data-testid="dialog-generate-schedule">
          <DialogHeader>
            <DialogTitle>Generate Schedule</DialogTitle>
            <DialogDescription>Select a session to generate the schedule for</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger data-testid="select-session-generate">
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessionsData?.sessions?.map((session: any) => (
                    <SelectItem key={session.id} value={session.name}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Or Create New Session</label>
              <Input
                placeholder="New session name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                data-testid="input-new-session-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGenerateDialog(false);
                setSelectedSession("");
                setNewSessionName("");
              }}
              data-testid="button-cancel-generate"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const trimmedNew = newSessionName.trim();
                const sessionToUse = trimmedNew || selectedSession;
                if (sessionToUse && sessionToUse.trim()) {
                  generateMutation.mutate(sessionToUse);
                } else {
                  toast({
                    title: "Error",
                    description: "Please select or create a session",
                    variant: "destructive",
                  });
                }
              }}
              disabled={generateMutation.isPending}
              data-testid="button-confirm-generate"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Schedule Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent data-testid="dialog-clear-schedule">
          <DialogHeader>
            <DialogTitle>Clear Schedule</DialogTitle>
            <DialogDescription>Select a session to clear the schedule for</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Session</label>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger data-testid="select-session-clear">
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                {sessionsData?.sessions?.map((session: any) => (
                  <SelectItem key={session.id} value={session.name}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowClearDialog(false);
                setSelectedSession("");
              }}
              data-testid="button-cancel-clear"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedSession && selectedSession.trim()) {
                  clearMutation.mutate(selectedSession);
                } else {
                  toast({
                    title: "Error",
                    description: "Please select a session",
                    variant: "destructive",
                  });
                }
              }}
              disabled={clearMutation.isPending}
              data-testid="button-confirm-clear"
            >
              {clearMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
