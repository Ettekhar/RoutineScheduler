import { useQuery } from "@tanstack/react-query";
import { ExportPanel, type ExportOptions } from "@/components/export-panel";
import { useToast } from "@/hooks/use-toast";
import type { Teacher, Batch, ScheduleEntryWithDetails, WorkingDay } from "@shared/schema";
import { WORKING_DAYS, DEFAULT_TIME_SLOTS } from "@shared/schema";

const format24to12 = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

const DAY_LABELS: Record<WorkingDay, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

export default function Export() {
  const { toast } = useToast();

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
  });

  const { data: entries = [] } = useQuery<ScheduleEntryWithDetails[]>({
    queryKey: ["/api/schedule"],
  });

  const { data: sessions = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["/api/sessions"],
  });

  const handleExport = async (options: ExportOptions) => {
    try {
      // Filter entries based on export options
      let filteredEntries = [...entries];
      let title = "University Class Schedule";

      if (options.type === "teacher" && options.teacherId) {
        const teacher = teachers.find(t => t.id === options.teacherId);
        filteredEntries = entries.filter(e => e.teacherId === options.teacherId);
        title = `Schedule - ${teacher?.name || "Teacher"}`;
      } else if (options.type === "semester" && options.semester) {
        filteredEntries = entries.filter(e => e.batch.semester === options.semester);
        title = `Schedule - Semester ${options.semester}`;
      } else if (options.type === "day" && options.day) {
        filteredEntries = entries.filter(e => e.day === options.day);
        title = `Schedule - ${DAY_LABELS[options.day]}`;
      } else if (options.type === "session" && options.session) {
        filteredEntries = entries.filter(e => e.session === options.session);
        title = `Schedule - ${options.session}`;
      }

      // Generate PDF content
      const pdfContent = generatePDFContent(filteredEntries, title, options);
      
      // Create and download the PDF
      downloadPDF(pdfContent, title);

      toast({
        title: "Export Successful",
        description: `Schedule has been exported as PDF.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not generate the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return <ExportPanel teachers={teachers} batches={batches} entries={entries} sessions={sessions} currentSession={sessions[0]?.name} onExport={handleExport} />;
}

function generatePDFContent(
  entries: ScheduleEntryWithDetails[], 
  title: string,
  options: ExportOptions
): string {
  const days = options.type === "day" && options.day 
    ? [options.day as WorkingDay] 
    : WORKING_DAYS;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', 'Roboto', system-ui, sans-serif;
          padding: 20px;
          background: #fff;
          color: #212121;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1565C0;
        }
        .header h1 {
          font-size: 24px;
          color: #1565C0;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 12px;
        }
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .schedule-table th {
          background: #1565C0;
          color: white;
          padding: 10px 5px;
          text-align: center;
          font-weight: 600;
        }
        .schedule-table td {
          border: 1px solid #e0e0e0;
          padding: 8px 5px;
          vertical-align: top;
          min-height: 60px;
        }
        .day-cell {
          background: #f5f5f5;
          font-weight: 600;
          text-align: center;
          width: 60px;
        }
        .class-block {
          padding: 6px;
          border-radius: 4px;
          margin-bottom: 4px;
          font-size: 10px;
        }
        .theory-block {
          background: #1565C0;
          color: white;
        }
        .lab-block {
          background: #2E7D32;
          color: white;
        }
        .conflict-block {
          background: #F57C00;
          color: white;
        }
        .class-code {
          font-weight: 600;
          font-size: 11px;
        }
        .class-details {
          opacity: 0.9;
          font-size: 9px;
        }
        .stats {
          margin-top: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
          font-size: 12px;
        }
        .stats-row {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .stat-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
        @media print {
          body { padding: 10px; }
          .schedule-table { font-size: 9px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <table class="schedule-table">
        <thead>
          <tr>
            <th>Day</th>
            ${DEFAULT_TIME_SLOTS.map(slot => 
              `<th>${format24to12(slot.startTime)}<br><span style="font-size:9px;opacity:0.8">${format24to12(slot.endTime)}</span></th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  days.forEach(day => {
    html += `<tr>`;
    html += `<td class="day-cell">${DAY_LABELS[day].slice(0, 3)}</td>`;
    
    DEFAULT_TIME_SLOTS.forEach(slot => {
      const slotEntries = entries.filter(
        e => e.day === day && e.timeSlot.slotNumber === slot.slotNumber
      );
      
      html += `<td>`;
      slotEntries.forEach(entry => {
        const blockClass = entry.hasConflict 
          ? 'conflict-block' 
          : entry.course.courseType === 'lab' 
            ? 'lab-block' 
            : 'theory-block';
        
        html += `
          <div class="class-block ${blockClass}">
            <div class="class-code">${entry.course.code}</div>
            <div class="class-details">${entry.teacher.name}</div>
            <div class="class-details">${entry.classroom.roomNumber} | ${entry.batch.name}</div>
          </div>
        `;
      });
      html += `</td>`;
    });
    
    html += `</tr>`;
  });

  const theoryCount = entries.filter(e => e.course.courseType === 'theory').length;
  const labCount = entries.filter(e => e.course.courseType === 'lab').length;
  const conflictCount = entries.filter(e => e.hasConflict).length;

  html += `
        </tbody>
      </table>

      <div class="stats">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-color" style="background:#1565C0"></div>
            <span>Theory Classes: ${theoryCount}</span>
          </div>
          <div class="stat-item">
            <div class="stat-color" style="background:#2E7D32"></div>
            <span>Lab Sessions: ${labCount}</span>
          </div>
          ${conflictCount > 0 ? `
          <div class="stat-item">
            <div class="stat-color" style="background:#F57C00"></div>
            <span>Conflicts: ${conflictCount}</span>
          </div>
          ` : ''}
          <div class="stat-item">
            <strong>Total: ${entries.length} Classes</strong>
          </div>
        </div>
      </div>

      <div class="footer">
        University Class Routine Scheduling System
      </div>
    </body>
    </html>
  `;

  return html;
}

function downloadPDF(content: string, title: string) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window');
  }

  printWindow.document.write(content);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.print();
  };
}
