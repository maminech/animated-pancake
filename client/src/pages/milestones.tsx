import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { MilestoneList } from "@/components/milestones/milestone-list";
import { MilestoneForm } from "@/components/milestones/milestone-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Milestones() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  // Fetch students based on user role
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });
  
  // Determine if user can add milestones
  const canAddMilestones = user?.role === "teacher" || user?.role === "director" || user?.role === "admin";
  
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Student Milestones</h1>
            <p className="text-muted-foreground">
              Track and celebrate student progress across different development areas
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
                    Set a new goal or learning objective for a student.
                  </DialogDescription>
                </DialogHeader>
                <MilestoneForm 
                  students={students} 
                  onSuccess={() => setShowForm(false)} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <MilestoneList />
      </div>
    </motion.div>
  );
}