import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { MilestoneList } from "@/components/milestones/milestone-list";
import { MilestoneForm } from "@/components/milestones/milestone-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusIcon, Award } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { BadgeGrid } from "@/components/badges/badge-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentMilestones() {
  const { user } = useAuth();
  const { id } = useParams();
  const studentId = id ? parseInt(id) : undefined;
  const [showForm, setShowForm] = useState(false);
  
  // Get student details
  const { data: student, isLoading } = useQuery<Student>({
    queryKey: studentId ? [`/api/students/${studentId}`] : null,
    enabled: !!studentId,
  });
  
  // Determine if user can add milestones
  const canAddMilestones = user?.role === "teacher" || user?.role === "director" || user?.role === "admin";
  
  if (isLoading || !studentId) {
    return <div className="text-center py-10">Loading student details...</div>;
  }
  
  if (!student) {
    return (
      <div className="container py-8">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Student Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested student could not be found.</p>
          <Link href="/students">
            <Button>Back to Students</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container py-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center mb-2">
              <Link href="/students">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Students
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {student.firstName} {student.lastName}'s Progress
            </h1>
            <p className="text-muted-foreground">
              Track milestones, badges, and achievements
            </p>
          </div>
          
          {canAddMilestones && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PlusIcon className="h-4 w-4" />
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Milestone</DialogTitle>
                  <DialogDescription>
                    Set a new goal or learning objective for {student.firstName}.
                  </DialogDescription>
                </DialogHeader>
                <MilestoneForm 
                  students={[student]} 
                  studentId={student.id}
                  onSuccess={() => setShowForm(false)} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Tabs defaultValue="milestones" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>Badges</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="milestones" className="mt-6">
            <MilestoneList studentId={student.id} />
          </TabsContent>
          
          <TabsContent value="badges" className="mt-6">
            <BadgeGrid 
              studentId={student.id} 
              showAwardButtons={canAddMilestones}
            />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}