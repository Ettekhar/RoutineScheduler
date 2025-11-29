import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  FileText, 
  GraduationCap, 
  Users, 
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Teacher, Batch, ScheduleEntryWithDetails, WorkingDay } from "@shared/schema";
import { WORKING_DAYS } from "@shared/schema";

const DAY_LABELS: Record<WorkingDay, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

interface ExportPanelProps {
  teachers: Teacher[];
  batches: Batch[];
  entries: ScheduleEntryWithDetails[];
  sessions?: Array<{ id: string; name: string }>;
  currentSession?: string;
  onExport: (options: ExportOptions) => Promise<void>;
}

export interface ExportOptions {
  format: "pdf";
  type: "full" | "teacher" | "semester" | "day" | "session";
  teacherId?: string;
  semester?: number;
  day?: WorkingDay;
  session?: string;
}

export function ExportPanel({ teachers, batches, entries, sessions = [], currentSession = "Fall 2025", onExport }: ExportPanelProps) {
  const [exportType, setExportType] = useState<ExportOptions["type"]>("full");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>(currentSession);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const semesters = Array.from(new Set(batches.map(b => b.semester))).sort();

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      const options: ExportOptions = {
        format: "pdf",
        type: exportType,
      };

      if (exportType === "teacher" && selectedTeacher) {
        options.teacherId = selectedTeacher;
      } else if (exportType === "semester" && selectedSemester) {
        options.semester = parseInt(selectedSemester);
      } else if (exportType === "day" && selectedDay) {
        options.day = selectedDay as WorkingDay;
      } else if (exportType === "session" && selectedSession) {
        options.session = selectedSession;
      }

      await onExport(options);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = () => {
    if (entries.length === 0) return false;
    if (exportType === "teacher" && !selectedTeacher) return false;
    if (exportType === "semester" && !selectedSemester) return false;
    if (exportType === "day" && !selectedDay) return false;
    if (exportType === "session" && !selectedSession) return false;
    return true;
  };

  // Calculate stats for the export preview
  const getExportStats = () => {
    let filteredEntries = entries;

    if (exportType === "teacher" && selectedTeacher) {
      filteredEntries = entries.filter(e => e.teacherId === selectedTeacher);
    } else if (exportType === "semester" && selectedSemester) {
      filteredEntries = entries.filter(e => e.batch.semester === parseInt(selectedSemester));
    } else if (exportType === "day" && selectedDay) {
      filteredEntries = entries.filter(e => e.day === selectedDay);
    } else if (exportType === "session" && selectedSession) {
      filteredEntries = entries.filter(e => e.session === selectedSession);
    }

    const theoryCount = filteredEntries.filter(e => e.course.courseType === "theory").length;
    const labCount = filteredEntries.filter(e => e.course.courseType === "lab").length;
    const conflictCount = filteredEntries.filter(e => e.hasConflict).length;

    return {
      total: filteredEntries.length,
      theory: theoryCount,
      lab: labCount,
      conflicts: conflictCount,
    };
  };

  const stats = getExportStats();

  return (
    <div className="h-full flex flex-col" data-testid="export-panel">
      <div className="p-4 border-b bg-card">
        <h2 className="text-xl font-semibold">Export Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Download schedules as PDF documents
        </p>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {/* Export Type Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Export Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <ExportTypeButton
                icon={<Calendar className="w-5 h-5" />}
                title="Full Schedule"
                description="Complete weekly view"
                isSelected={exportType === "full"}
                onClick={() => setExportType("full")}
                testId="button-export-full"
              />
              <ExportTypeButton
                icon={<GraduationCap className="w-5 h-5" />}
                title="By Teacher"
                description="Individual teacher schedule"
                isSelected={exportType === "teacher"}
                onClick={() => setExportType("teacher")}
                testId="button-export-teacher"
              />
              <ExportTypeButton
                icon={<Users className="w-5 h-5" />}
                title="By Semester"
                description="Semester-wise routine"
                isSelected={exportType === "semester"}
                onClick={() => setExportType("semester")}
                testId="button-export-semester"
              />
              <ExportTypeButton
                icon={<Calendar className="w-5 h-5" />}
                title="By Day"
                description="Day-wise compact view"
                isSelected={exportType === "day"}
                onClick={() => setExportType("day")}
                testId="button-export-day"
              />
              <ExportTypeButton
                icon={<Calendar className="w-5 h-5" />}
                title="By Session"
                description="Academic session routine"
                isSelected={exportType === "session"}
                onClick={() => setExportType("session")}
                testId="button-export-session"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filter Options */}
        {exportType !== "full" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filter Options</CardTitle>
            </CardHeader>
            <CardContent>
              {exportType === "teacher" && (
                <div className="space-y-2">
                  <Label>Select Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger data-testid="select-export-teacher">
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {exportType === "semester" && (
                <div className="space-y-2">
                  <Label>Select Semester</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger data-testid="select-export-semester">
                      <SelectValue placeholder="Choose a semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {exportType === "day" && (
                <div className="space-y-2">
                  <Label>Select Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger data-testid="select-export-day">
                      <SelectValue placeholder="Choose a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKING_DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                          {DAY_LABELS[day]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {exportType === "session" && (
                <div className="space-y-2">
                  <Label>Select Session</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger data-testid="select-export-session">
                      <SelectValue placeholder="Choose a session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.name}>
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Export Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-muted/50">
                <div className="text-2xl font-semibold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Classes</div>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge className="bg-schedule-theory text-white">{stats.theory}</Badge>
                  <Badge className="bg-schedule-lab text-white">{stats.lab}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Theory / Lab</div>
              </div>
            </div>
            
            {stats.conflicts > 0 && (
              <div className="mt-4 p-3 rounded-md bg-schedule-conflict/10 border border-schedule-conflict/20">
                <div className="flex items-center gap-2 text-schedule-conflict">
                  <span className="font-medium">{stats.conflicts} Conflicts</span>
                  <span className="text-sm">will be highlighted in export</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Export Button */}
        <div className="space-y-3">
          <Button
            className="w-full h-12"
            size="lg"
            disabled={!canExport() || isExporting}
            onClick={handleExport}
            data-testid="button-download-export"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Download Complete!
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </>
            )}
          </Button>

          {entries.length === 0 && (
            <p className="text-sm text-center text-muted-foreground">
              No schedule data available. Generate a schedule first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExportTypeButton({
  icon,
  title,
  description,
  isSelected,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "p-4 rounded-lg border-2 text-left transition-all hover-elevate",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30"
      )}
      onClick={onClick}
      data-testid={testId}
    >
      <div className={cn(
        "mb-2",
        isSelected ? "text-primary" : "text-muted-foreground"
      )}>
        {icon}
      </div>
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </button>
  );
}
