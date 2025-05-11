import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Student, StudentBadge } from "@shared/schema";
import { BadgeCard } from "./badge-card";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BadgeGridProps {
  studentId?: number;
  showAwardButtons?: boolean;
}

type BadgeWithAwardDetails = Badge & { 
  awarded: boolean;
  awardDate?: string;
  studentBadgeId?: number;
};

export function BadgeGrid({ studentId, showAwardButtons = false }: BadgeGridProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const canAward = (user?.role === "teacher" || user?.role === "director") && showAwardButtons;
  
  // Get student details if studentId is provided
  const { data: student } = useQuery<Student>({
    queryKey: studentId ? [`/api/students/${studentId}`] : null,
    enabled: !!studentId,
  });
  
  // Get all badges
  const { data: badges = [], isLoading: badgesLoading, error: badgesError } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });
  
  // Get student badges if studentId is provided
  const { data: studentBadges = [], isLoading: studentBadgesLoading } = useQuery<StudentBadge[]>({
    queryKey: studentId ? [`/api/student-badges?studentId=${studentId}`] : null,
    enabled: !!studentId,
  });
  
  // Combine the data - keep information about which badges have been awarded
  const combinedBadges: BadgeWithAwardDetails[] = badges.map(badge => {
    const studentBadge = studentBadges.find(sb => sb.badgeId === badge.id);
    return {
      ...badge,
      awarded: !!studentBadge,
      awardDate: studentBadge?.dateAwarded,
      studentBadgeId: studentBadge?.id,
    };
  });
  
  // Filter badges based on search term and category
  const filteredBadges = combinedBadges.filter(badge => {
    // Filter by search term
    const matchesSearch = searchTerm === "" ||
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === "all" || badge.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  if (badgesLoading || studentBadgesLoading) {
    return <div className="text-center py-10">Loading badges...</div>;
  }
  
  if (badgesError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load badges. Please try again later.</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {student && (
        <h2 className="text-2xl font-semibold">
          Badges for {student.firstName} {student.lastName}
        </h2>
      )}
      
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search badges..."
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
            <SelectItem value="attendance">Attendance</SelectItem>
            <SelectItem value="special">Special</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {studentId ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Badges</TabsTrigger>
            <TabsTrigger value="awarded">Awarded Badges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {filteredBadges.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No badges found. Try adjusting your filters.
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredBadges.map((badge) => (
                  <BadgeCard 
                    key={badge.id} 
                    badge={badge}
                    studentId={studentId}
                    awarded={badge.awarded}
                    awardDate={badge.awardDate}
                    showAwardButton={canAward && !badge.awarded}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="awarded" className="mt-6">
            {filteredBadges.filter(b => b.awarded).length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No awarded badges found.
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredBadges
                  .filter(badge => badge.awarded)
                  .map((badge) => (
                    <BadgeCard 
                      key={badge.id} 
                      badge={badge}
                      studentId={studentId}
                      awarded={true}
                      awardDate={badge.awardDate}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBadges.length === 0 ? (
            <div className="text-center py-10 text-gray-500 col-span-full">
              No badges found. Try adjusting your filters.
            </div>
          ) : (
            filteredBadges.map((badge) => (
              <BadgeCard 
                key={badge.id} 
                badge={badge}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}