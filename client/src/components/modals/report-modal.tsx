import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReportForm } from "@/components/forms/report-form";
import { useQuery } from "@tanstack/react-query";
import { Student, Report } from "@shared/schema";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  report?: Report;
}

export function ReportModal({ 
  isOpen, 
  onClose, 
  studentId,
  report 
}: ReportModalProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student data
  const { data: studentData, isLoading: isStudentLoading } = useQuery({
    queryKey: [`/api/students/${studentId}`],
    enabled: isOpen && !!studentId
  });

  useEffect(() => {
    if (studentData) {
      setStudent(studentData);
      setLoading(false);
    } else if (isStudentLoading) {
      setLoading(true);
    }
  }, [studentData, isStudentLoading]);

  const handleSaveReport = async (reportData: Partial<Report>) => {
    try {
      setLoading(true);
      setError(null);

      if (report?.id) {
        // Update existing report
        await apiRequest("PUT", `/api/reports/${report.id}`, reportData);
      } else {
        // Create new report
        await apiRequest("POST", "/api/reports", {
          ...reportData,
          studentId,
          date: reportData.date || new Date().toISOString().split('T')[0]
        });
      }

      onClose();
    } catch (err) {
      console.error("Error saving report:", err);
      setError("Failed to save report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {report ? "Edit Report" : "Daily Report"}: {student ? `${student.firstName} ${student.lastName}` : "Loading..."}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => setError(null)} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <ReportForm
            student={student!}
            initialData={report}
            onSave={handleSaveReport}
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="report-form"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
