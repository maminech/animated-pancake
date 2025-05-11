import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { StatsCard } from "@/components/dashboard/stats-card";
import { MoodChart } from "@/components/dashboard/mood-chart";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { StudentTable } from "@/components/dashboard/student-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDate, getGreeting } from "@/lib/utils";
import { useState } from "react";
import { ReportModal } from "@/components/modals/report-modal";
import { Student, Report } from "@shared/schema";
import {
  UserRound,
  ClipboardCheck,
  FileText,
  Plus
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  // Calculate statistics
  const totalStudents = students.length;
  const presentStudents = attendance.filter((a: any) => a.status === 'present').length;
  const attendancePercentage = totalStudents > 0 
    ? Math.round((presentStudents / totalStudents) * 100) 
    : 0;
  const reportsToComplete = user?.role === 'teacher' 
    ? totalStudents - reports.filter((r: Report) => r.date === today).length 
    : 0;

  // Create mood data for chart
  const moods = ['amazing', 'happy', 'okay', 'sad', 'upset'];
  const moodCounts = moods.map(mood => {
    const count = reports
      .filter((r: Report) => r.date === today && r.mood === mood)
      .length;
    return { mood, count };
  });

  // Create map of student ID to attendance status
  const attendanceStatus: Record<number, string> = {};
  attendance.forEach((a: any) => {
    attendanceStatus[a.studentId] = a.status;
  });

  // Create map of student ID to mood
  const studentMoods: Record<number, string> = {};
  reports
    .filter((r: Report) => r.date === today)
    .forEach((r: Report) => {
      studentMoods[r.studentId] = r.mood;
    });

  // Create map of student ID to latest report
  const studentReports: Record<number, Report> = {};
  reports.forEach((report: Report) => {
    if (!studentReports[report.studentId] || 
        new Date(report.date) > new Date(studentReports[report.studentId].date)) {
      studentReports[report.studentId] = report;
    }
  });

  // Recent activity data from reports and attendance
  const recentActivities = [
    ...reports.map((report: Report) => {
      const student = students.find((s: Student) => s.id === report.studentId);
      if (!student) return null;
      
      return {
        type: 'report',
        student,
        title: `${student.firstName} ${student.lastName} received a new report`,
        description: report.notes || 'No notes provided',
        timestamp: report.date,
      };
    }),
    ...attendance
      .filter((a: any) => a.date === today)
      .map((a: any) => {
        const student = students.find((s: Student) => s.id === a.studentId);
        if (!student) return null;
        
        return {
          type: 'attendance',
          student,
          title: `${student.firstName} ${student.lastName} marked as ${a.status}`,
          description: a.notes || '',
          timestamp: new Date().toISOString(),
        };
      }),
  ]
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Handle opening report modal
  const handleOpenReportModal = (studentId: number) => {
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

  // Handle send message
  const handleSendMessage = (studentId: number) => {
    // This would navigate to messaging page or open message modal
    toast({
      title: "Send Message",
      description: "This feature is not implemented yet",
    });
  };

  const roleTitle = user?.role === 'teacher' 
    ? 'Teacher Dashboard' 
    : user?.role === 'parent'
    ? 'Parent Dashboard'
    : 'Director Dashboard';

  return (
    <>
      <Helmet>
        <title>Dashboard - SmartKid Manager</title>
        <meta name="description" content="Your personalized dashboard for managing students, reports, and activities" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="md:flex h-screen overflow-hidden">
          <Sidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <MobileNav />
            
            <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <h1 className="text-2xl font-semibold text-foreground font-nunito">
                    {roleTitle}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {getGreeting()}, {user?.firstName}!
                  </p>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <div className="py-4">
                    {/* Stats overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <StatsCard
                        title="Total Students"
                        value={totalStudents.toString()}
                        icon={<UserRound className="h-5 w-5 text-primary" />}
                        iconBgColor="bg-primary bg-opacity-10"
                      />
                      <StatsCard
                        title="Attendance Today"
                        value={presentStudents.toString()}
                        subtitle={`(${attendancePercentage}%)`}
                        icon={<ClipboardCheck className="h-5 w-5 text-secondary" />}
                        iconBgColor="bg-secondary bg-opacity-10"
                      />
                      <StatsCard
                        title="Reports to Complete"
                        value={reportsToComplete.toString()}
                        icon={<FileText className="h-5 w-5 text-accent" />}
                        iconBgColor="bg-accent bg-opacity-10"
                      />
                    </div>

                    {/* Class mood section - only for teachers/directors */}
                    {(user?.role === 'teacher' || user?.role === 'director') && (
                      <div className="mb-6">
                        <h2 className="text-lg font-medium text-foreground mb-4 font-nunito">
                          Today's Class Mood
                        </h2>
                        <MoodChart
                          moodData={moodCounts}
                          title="Class 2B - Morning Check-in"
                          subtitle={`Today, ${formatDate(new Date())}`}
                        />
                      </div>
                    )}

                    {/* Recent activity */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-foreground font-nunito">
                          Recent Activity
                        </h2>
                        <a href="#" className="text-primary font-medium text-sm hover:underline">
                          View all
                        </a>
                      </div>
                      
                      <div className="bg-white rounded-standard shadow overflow-hidden">
                        {isLoadingStudents || isLoadingReports ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          </div>
                        ) : recentActivities.length > 0 ? (
                          <ul className="divide-y divide-border">
                            {recentActivities.map((activity: any, idx) => (
                              <ActivityItem
                                key={idx}
                                student={activity.student}
                                title={activity.title}
                                description={activity.description}
                                timestamp={activity.timestamp}
                              />
                            ))}
                          </ul>
                        ) : (
                          <div className="py-8 text-center text-muted-foreground">
                            No recent activities found
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Students list */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-foreground font-nunito">
                          My Students
                        </h2>
                        {(user?.role === 'teacher' || user?.role === 'director') && (
                          <Button className="bg-primary text-white hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Student
                          </Button>
                        )}
                      </div>

                      {isLoadingStudents || isLoadingReports || isLoadingAttendance ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      ) : students.length > 0 ? (
                        <StudentTable
                          students={students}
                          reports={studentReports}
                          attendanceStatus={attendanceStatus}
                          moods={studentMoods}
                          onViewReport={handleOpenReportModal}
                          onEditStudent={handleEditStudent}
                          onSendMessage={handleSendMessage}
                        />
                      ) : (
                        <div className="bg-white rounded-standard shadow p-8 text-center">
                          <p className="text-muted-foreground">No students found</p>
                        </div>
                      )}
                    </div>
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
