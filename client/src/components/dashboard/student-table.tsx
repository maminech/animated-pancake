import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { calculateAge, formatDate, getInitials, getMoodColor } from "@/lib/utils";
import {
  Pencil,
  FileText,
  MessageCircle,
} from "lucide-react";
import { Student, Report } from "@shared/schema";
import { useState } from "react";
import { ReportModal } from "@/components/modals/report-modal";

interface StudentTableProps {
  students: Student[];
  reports: Record<number, Report>;
  attendanceStatus: Record<number, string>;
  moods: Record<number, string>;
  onViewReport: (studentId: number) => void;
  onEditStudent: (studentId: number) => void;
  onSendMessage: (studentId: number) => void;
}

export function StudentTable({
  students,
  reports,
  attendanceStatus,
  moods,
  onViewReport,
  onEditStudent,
  onSendMessage,
}: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportClick = (studentId: number) => {
    setSelectedStudent(studentId);
    setIsReportModalOpen(true);
  };

  return (
    <>
      <div className="rounded-standard shadow bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background">
              <TableRow>
                <TableHead className="w-[240px]">Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Today's Mood</TableHead>
                <TableHead>Last Report</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage 
                          src={student.profileImage} 
                          alt={`${student.firstName} ${student.lastName}`} 
                        />
                        <AvatarFallback>
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {calculateAge(student.dateOfBirth)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attendanceStatus[student.id] === "present" 
                        ? "bg-green-100 text-green-800" 
                        : attendanceStatus[student.id] === "absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {attendanceStatus[student.id] ? (
                        attendanceStatus[student.id].charAt(0).toUpperCase() + 
                        attendanceStatus[student.id].slice(1)
                      ) : (
                        "Unknown"
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`text-xl mr-2 ${getMoodColor(moods[student.id] || "okay")}`}>
                        <i className={`fas fa-${moods[student.id] ? getMoodIcon(moods[student.id]) : "meh"}`}></i>
                      </span>
                      <span className="capitalize">
                        {moods[student.id] || "Not recorded"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {reports[student.id] ? (
                      formatDate(reports[student.id].date)
                    ) : (
                      <span className="text-muted-foreground">No reports yet</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEditStudent(student.id)}
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleReportClick(student.id)}
                      >
                        <FileText className="h-4 w-4 text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onSendMessage(student.id)}
                      >
                        <MessageCircle className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedStudent !== null && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          studentId={selectedStudent}
        />
      )}
    </>
  );
}

import { getMoodIcon } from "@/lib/utils";
