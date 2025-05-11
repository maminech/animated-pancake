import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import { Student } from "@shared/schema";

interface ActivityItemProps {
  student: Student;
  title: string;
  description: string;
  timestamp: string;
}

export function ActivityItem({ 
  student, 
  title, 
  description, 
  timestamp 
}: ActivityItemProps) {
  return (
    <li className="p-4 hover:bg-background transition duration-150">
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={student.profileImage} 
            alt={`${student.firstName} ${student.lastName}`} 
          />
          <AvatarFallback>
            {getInitials(student.firstName, student.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{formatDate(timestamp)}</p>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </li>
  );
}
