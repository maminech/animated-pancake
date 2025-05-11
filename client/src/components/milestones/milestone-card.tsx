import { CalendarIcon, CheckCircle2Icon, CircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Milestone } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MilestoneCardProps {
  milestone: Milestone;
  canEdit?: boolean;
}

export function MilestoneCard({ milestone, canEdit = false }: MilestoneCardProps) {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  
  // Format the date
  const formattedDate = new Date(milestone.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  // Map category to color
  const categoryColors = {
    academic: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    behavioral: "bg-green-100 text-green-800 hover:bg-green-200",
    physical: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    social: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    creative: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  };
  
  // Map category to friendly name
  const categoryNames = {
    academic: "Academic",
    behavioral: "Behavioral",
    physical: "Physical",
    social: "Social",
    creative: "Creative",
  };
  
  const toggleCompletion = async () => {
    if (!canEdit) return;
    
    try {
      setUpdating(true);
      
      await apiRequest("PUT", `/api/milestones/${milestone.id}`, {
        completed: !milestone.completed,
      });
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      
      toast({
        title: milestone.completed ? "Milestone marked as incomplete" : "Milestone completed",
        description: milestone.title,
      });
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast({
        title: "Failed to update milestone",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      milestone.completed ? "border-l-4 border-l-green-500" : "border-l-4 border-l-orange-300"
    )}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-semibold line-clamp-2">{milestone.title}</h3>
          <Badge variant="outline" className={cn("font-normal", categoryColors[milestone.category])}>
            {categoryNames[milestone.category]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1 pb-2">
        {milestone.description && (
          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
        )}
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>{formattedDate}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center">
        <div className="flex items-center text-sm">
          {milestone.completed ? (
            <CheckCircle2Icon className="h-5 w-5 text-green-500 mr-1" />
          ) : (
            <CircleIcon className="h-5 w-5 text-orange-400 mr-1" />
          )}
          <span className={cn(
            milestone.completed ? "text-green-600" : "text-orange-600"
          )}>
            {milestone.completed ? "Completed" : "In Progress"}
          </span>
        </div>
        
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCompletion}
            disabled={updating}
            className="font-normal"
          >
            {milestone.completed ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}