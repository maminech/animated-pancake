import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Student } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const formattedDate = date ? date.toISOString().split('T')[0] : "";
  const [loading, setLoading] = useState(false);

  // Fetch students data
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['/api/students'],
  });

  // Fetch attendance for selected date
  const { data: attendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['/api/attendance', formattedDate],
    queryFn: async () => {
      if (!formattedDate) return [];
      const response = await fetch(`/api/attendance?date=${formattedDate}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
  });

  // Map student IDs to their attendance status
  const attendanceMap: Record<number, string> = {};
  attendance.forEach((a: any) => {
    attendanceMap[a.studentId] = a.status;
  });

  // Handle marking attendance
  const markAttendance = async (studentId: number, status: string) => {
    if (user?.role !== 'teacher' && user?.role !== 'director') {
      toast({
        title: "Permission denied",
        description: "Only teachers and directors can mark attendance",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      await apiRequest("POST", "/api/attendance", {
        studentId,
        date: formattedDate,
        status,
        notes: "",
      });
      
      // Invalidate attendance query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/attendance', formattedDate] });
      
      toast({
        title: "Attendance updated",
        description: `Student marked as ${status}`,
      });
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        title: "Failed to update attendance",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Attendance - SmartKid Manager</title>
        <meta name="description" content="Track and record student attendance" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="md:flex h-screen overflow-hidden">
          <Sidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <MobileNav />
            
            <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <h1 className="text-2xl font-semibold text-foreground font-nunito mb-4">
                    Attendance Tracker
                  </h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => {
                            // Disable future dates
                            return date > new Date();
                          }}
                          className="rounded-md border"
                        />
                      </CardContent>
                    </Card>
                    
                    {/* Attendance Summary */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>
                          {date ? date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) : "Select a date"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingStudents || isLoadingAttendance ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          </div>
                        ) : students.length > 0 ? (
                          <div className="space-y-4">
                            {/* Summary stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="bg-green-50 p-4 rounded-md">
                                <p className="text-green-600 text-2xl font-bold">
                                  {Object.values(attendanceMap).filter(status => status === 'present').length}
                                </p>
                                <p className="text-sm text-green-800">Present</p>
                              </div>
                              <div className="bg-red-50 p-4 rounded-md">
                                <p className="text-red-600 text-2xl font-bold">
                                  {Object.values(attendanceMap).filter(status => status === 'absent').length}
                                </p>
                                <p className="text-sm text-red-800">Absent</p>
                              </div>
                              <div className="bg-yellow-50 p-4 rounded-md">
                                <p className="text-yellow-600 text-2xl font-bold">
                                  {Object.values(attendanceMap).filter(status => status === 'late').length}
                                </p>
                                <p className="text-sm text-yellow-800">Late</p>
                              </div>
                            </div>
                            
                            {/* Student list */}
                            <div className="divide-y">
                              {students.map((student: Student) => (
                                <div key={student.id} className="py-3 flex items-center justify-between">
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
                                      <p className="font-medium">{student.firstName} {student.lastName}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    {attendanceMap[student.id] ? (
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(attendanceMap[student.id])}`}>
                                        {attendanceMap[student.id].charAt(0).toUpperCase() + attendanceMap[student.id].slice(1)}
                                      </span>
                                    ) : (
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                          onClick={() => markAttendance(student.id, 'present')}
                                          disabled={loading}
                                        >
                                          Present
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                          onClick={() => markAttendance(student.id, 'absent')}
                                          disabled={loading}
                                        >
                                          Absent
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                          onClick={() => markAttendance(student.id, 'late')}
                                          disabled={loading}
                                        >
                                          Late
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">No students found</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
