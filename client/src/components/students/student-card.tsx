import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Student, Report } from "@shared/schema";
import { calculateAge, formatDate, getInitials, getMoodColor, getMoodIcon } from "@/lib/utils";
import { FileText, MessageCircle, Edit } from "lucide-react";

interface StudentCardProps {
  student: Student;
  latestReport?: Report;
  attendanceStatus: string;
  onViewReport: (studentId: number) => void;
  onEditStudent: (studentId: number) => void;
  onViewProfile: (studentId: number) => void;
}

export function StudentCard({
  student,
  latestReport,
  attendanceStatus,
  onViewReport,
  onEditStudent,
  onViewProfile,
}: StudentCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative pb-48">
        <div 
          className="absolute h-full w-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
        >
          <Avatar className="h-28 w-28 border-4 border-white">
            <AvatarImage
              src={student.profileImage}
              alt={`${student.firstName} ${student.lastName}`}
            />
            <AvatarFallback className="text-3xl">
              {getInitials(student.firstName, student.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {calculateAge(student.dateOfBirth)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${
              attendanceStatus === "present" 
                ? "text-green-600" 
                : attendanceStatus === "absent"
                ? "text-red-600"
                : "text-yellow-600"
            }`}>
              {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mood:</span>
            {latestReport ? (
              <span className={`font-medium flex items-center ${getMoodColor(latestReport.mood)}`}>
                <i className={`fas fa-${getMoodIcon(latestReport.mood)} mr-1`}></i> 
                <span className="capitalize">
                  {latestReport.mood}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Not recorded</span>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Report:</span>
            <span className="font-medium">
              {latestReport ? formatDate(latestReport.date) : "No reports yet"}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 pb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onViewReport(student.id)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Report
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewProfile(student.id)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
