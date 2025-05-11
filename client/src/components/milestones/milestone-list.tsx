import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Milestone } from "@shared/schema";
import { MilestoneCard } from "./milestone-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, SearchIcon } from "lucide-react";

interface MilestoneListProps {
  studentId?: number;
}

export function MilestoneList({ studentId }: MilestoneListProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Get student details if studentId is provided
  const { data: student } = useQuery<Student>({
    queryKey: studentId ? [`/api/students/${studentId}`] : null,
    enabled: !!studentId,
  });
  
  // Get milestones based on user role and studentId
  const { data: milestones = [], isLoading, error } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones", studentId],
    queryFn: async ({ queryKey }) => {
      const endpoint = studentId
        ? `/api/milestones?studentId=${studentId}`
        : "/api/milestones";
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch milestones");
      }
      return response.json();
    },
  });
  
  // Filter milestones based on search term, category, and status
  const filteredMilestones = milestones.filter(milestone => {
    // Filter by search term
    const matchesSearch = searchTerm === "" ||
      milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (milestone.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category
    const matchesCategory = categoryFilter === "all" || milestone.category === categoryFilter;
    
    // Filter by status
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "completed" && milestone.completed) || 
      (statusFilter === "in-progress" && !milestone.completed);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Check if user can edit milestones
  const canEdit = user?.role === "teacher" || user?.role === "director" || user?.role === "admin";
  
  if (isLoading) {
    return <div className="text-center py-10">Loading milestones...</div>;
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load milestones. Please try again later.</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {student && (
        <h2 className="text-2xl font-semibold">
          Milestones for {student.firstName} {student.lastName}
        </h2>
      )}
      
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search milestones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="behavioral">Behavioral</SelectItem>
            <SelectItem value="physical">Physical</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Milestones</TabsTrigger>
          <TabsTrigger value="recent">Recent First</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {filteredMilestones.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No milestones found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredMilestones.map((milestone) => (
                <MilestoneCard 
                  key={milestone.id} 
                  milestone={milestone} 
                  canEdit={canEdit}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-6">
          {filteredMilestones.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No milestones found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...filteredMilestones]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((milestone) => (
                  <MilestoneCard 
                    key={milestone.id} 
                    milestone={milestone} 
                    canEdit={canEdit}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}