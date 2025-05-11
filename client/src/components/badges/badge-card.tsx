import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  badge: Badge;
  studentId?: number;
  awarded?: boolean;
  awardDate?: string;
  showAwardButton?: boolean;
}

export function BadgeCard({ 
  badge, 
  studentId,
  awarded = false,
  awardDate,
  showAwardButton = false 
}: BadgeCardProps) {
  const [isAwarding, setIsAwarding] = useState(false);
  const { toast } = useToast();
  
  // Map category to color
  const categoryColors = {
    academic: "from-blue-50 to-blue-100 border-blue-200",
    behavioral: "from-green-50 to-green-100 border-green-200",
    attendance: "from-amber-50 to-amber-100 border-amber-200",
    special: "from-purple-50 to-purple-100 border-purple-200",
  };
  
  // Map category to friendly name
  const categoryNames = {
    academic: "Academic",
    behavioral: "Behavioral",
    attendance: "Attendance",
    special: "Special",
  };
  
  const handleAwardBadge = async () => {
    if (!studentId) return;
    
    try {
      setIsAwarding(true);
      
      await apiRequest("POST", "/api/student-badges", {
        studentId,
        badgeId: badge.id,
        dateAwarded: new Date().toISOString().split('T')[0],
      });
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: [`/api/student-badges`] });
      
      toast({
        title: "Badge awarded",
        description: `${badge.name} badge has been awarded successfully.`,
      });
    } catch (error) {
      console.error("Error awarding badge:", error);
      toast({
        title: "Failed to award badge",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAwarding(false);
    }
  };
  
  // Format award date if available
  const formattedAwardDate = awardDate
    ? new Date(awardDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn(
        "overflow-hidden border-2",
        "bg-gradient-to-b",
        categoryColors[badge.category]
      )}>
        <CardHeader className="pb-2 pt-4 px-4 text-center">
          <div className="text-4xl mb-2">{badge.icon}</div>
          <h3 className="font-semibold">{badge.name}</h3>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {categoryNames[badge.category]}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 pb-2 text-center">
          <p className="text-sm text-gray-600">{badge.description}</p>
        </CardContent>
        
        <CardFooter className="p-4 pt-2 flex justify-center">
          {awarded ? (
            <div className="flex flex-col items-center">
              <div className="text-sm font-semibold text-green-600 mb-1">
                ✓ Awarded
              </div>
              {formattedAwardDate && (
                <div className="text-xs text-gray-500">
                  {formattedAwardDate}
                </div>
              )}
            </div>
          ) : showAwardButton ? (
            <Button 
              size="sm" 
              onClick={handleAwardBadge} 
              disabled={isAwarding}
              className="w-full"
            >
              {isAwarding ? "Awarding..." : "Award Badge"}
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </motion.div>
  );
}