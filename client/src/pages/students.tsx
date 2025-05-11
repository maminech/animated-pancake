import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { StudentCard } from "@/components/students/student-card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ReportModal } from "@/components/modals/report-modal";
import { Student, Report } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

export default function Students() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch students data
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['/api/students'],
  });

  // Fetch reports data
  const { data: reports = [], isLoading: isLoadingReports } = useQuery({
    queryKey: ['/api/reports'],
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's attendance
  const { data: attendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['/api/attendance', today],
    queryFn: async () => {
      const response = await fetch(`/api/attendance?date=${today}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
  });

  // Create map of student ID to attendance status
  const attendanceStatus: Record<number, string> = {};
  attendance.forEach((a: any) => {
    attendanceStatus[a.studentId] = a.status;
  });

  // Create map of student ID to latest report
  const studentReports: Record<number, Report> = {};
  reports.forEach((report: Report) => {
    if (!studentReports[report.studentId] || 
        new Date(report.date) > new Date(studentReports[report.studentId].date)) {
      studentReports[report.studentId] = report;
    }
  });

  // Filter students based on search query
  const filteredStudents = students.filter((student: Student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Handle opening report modal
  const handleViewReport = (studentId: number) => {
    setSelectedStudent(studentId);
    setIsReportModalOpen(true);
  };

  // Handle edit student
  const handleEditStudent = (studentId: number) => {
    // This would navigate to edit student page or open edit modal
    toast({
      title: "Edit Student",
      description: "This feature is not implemented yet",
    });
  };

  // Handle view profile
  const handleViewProfile = (studentId: number) => {
    // This would navigate to student profile page
    toast({
      title: "View Profile",
      description: "This feature is not implemented yet",
    });
  };

  return (
    <>
      <Helmet>
        <title>Students - SmartKid Manager</title>
        <meta name="description" content="Manage your students, view profiles, and track progress" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="md:flex h-screen overflow-hidden">
          <Sidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <MobileNav />
            
            <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold text-foreground font-nunito mb-4 md:mb-0">
                      Students
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search students..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      {(user?.role === 'teacher' || user?.role === 'director') && (
                        <Button className="bg-primary text-white hover:bg-primary/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Student
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <div className="py-4">
                    {isLoadingStudents || isLoadingReports || isLoadingAttendance ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStudents.map((student: Student) => (
                          <StudentCard
                            key={student.id}
                            student={student}
                            latestReport={studentReports[student.id]}
                            attendanceStatus={attendanceStatus[student.id] || "unknown"}
                            onViewReport={handleViewReport}
                            onEditStudent={handleEditStudent}
                            onViewProfile={handleViewProfile}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-standard shadow p-8 text-center">
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? `No students found matching "${searchQuery}"`
                            : "No students found"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {selectedStudent !== null && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          studentId={selectedStudent}
          report={studentReports[selectedStudent]}
        />
      )}
    </>
  );
}
