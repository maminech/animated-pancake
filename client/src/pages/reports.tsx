import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { formatDate, getMoodColor, getMoodIcon } from "@/lib/utils";
import { useState } from "react";
import { ReportModal } from "@/components/modals/report-modal";
import { Student, Report } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Filter, Search, FileText, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export default function Reports() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [filterStudent, setFilterStudent] = useState("all");
  const [filterDate, setFilterDate] = useState("");
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

  // Map student IDs to student data
  const studentMap: Record<number, Student> = {};
  students.forEach((student: Student) => {
    studentMap[student.id] = student;
  });

  // Filter reports based on criteria
  const filteredReports = reports.filter((report: Report) => {
    // Filter by student
    if (filterStudent !== "all" && report.studentId !== parseInt(filterStudent)) {
      return false;
    }

    // Filter by date
    if (filterDate && report.date !== filterDate) {
      return false;
    }

    // Filter by search query (search in notes)
    if (searchQuery && !report.notes?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Function to generate a comma-separated list of activities
  const formatActivities = (activities: string[]) => {
    if (!activities || activities.length === 0) return "None";
    
    if (activities.length <= 2) {
      return activities.join(", ");
    }
    
    return `${activities.slice(0, 2).join(", ")} +${activities.length - 2} more`;
  };

  // Handle viewing a report
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Reports - SmartKid Manager</title>
        <meta name="description" content="View and manage daily reports for students" />
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
                      Daily Reports
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {(user?.role === 'teacher' || user?.role === 'director') && (
                        <Button className="bg-primary text-white hover:bg-primary/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <div className="py-4">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-standard shadow mb-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filter by student:</span>
                          </div>
                          <Select
                            value={filterStudent}
                            onValueChange={setFilterStudent}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All students</SelectItem>
                              {students.map((student: Student) => (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                  {student.firstName} {student.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filter by date:</span>
                          </div>
                          <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="mt-1"
                            max={today}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Search in reports:</span>
                          </div>
                          <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Reports List */}
                    {isLoadingStudents || isLoadingReports ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredReports.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredReports.map((report: Report) => {
                          const student = studentMap[report.studentId];
                          if (!student) return null;
                          
                          return (
                            <Card key={report.id} className="overflow-hidden">
                              <div className={`h-2 ${getMoodColor(report.mood)} bg-opacity-100`}></div>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center">
                                    <Avatar className="h-10 w-10 mr-2">
                                      <AvatarImage 
                                        src={student.profileImage} 
                                        alt={`${student.firstName} ${student.lastName}`} 
                                      />
                                      <AvatarFallback>
                                        {getInitials(student.firstName, student.lastName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <CardTitle className="text-base">
                                        {student.firstName} {student.lastName}
                                      </CardTitle>
                                      <CardDescription>
                                        {formatDate(report.date)}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`text-xl ${getMoodColor(report.mood)}`}>
                                      <i className={`fas fa-${getMoodIcon(report.mood)}`}></i>
                                    </span>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Activities:</h4>
                                    <p className="text-sm mt-1">{formatActivities(report.activities as string[])}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Notes:</h4>
                                    <p className="text-sm mt-1 line-clamp-3">
                                      {report.notes || "No notes provided"}
                                    </p>
                                  </div>
                                  
                                  {report.achievements && (report.achievements as string[]).length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground">Achievements:</h4>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {(report.achievements as string[]).map((achievement, idx) => (
                                          <Badge key={idx} variant="secondary">
                                            {achievement}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-4 w-full"
                                  onClick={() => handleViewReport(report)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Full Report
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white rounded-standard shadow p-8 text-center">
                        <p className="text-muted-foreground">
                          No reports found matching your criteria
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

      {selectedReport && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          studentId={selectedReport.studentId}
          report={selectedReport}
        />
      )}
    </>
  );
}
