import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(d)) {
    return `Today, ${formatTime(d)}`;
  } else if (isYesterday(d)) {
    return `Yesterday, ${formatTime(d)}`;
  } else {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export function getActivityIcon(activity: string): string {
  const lowerActivity = activity.toLowerCase();
  
  if (lowerActivity.includes('read')) return 'book-open';
  if (lowerActivity.includes('math')) return 'calculator';
  if (lowerActivity.includes('art')) return 'palette';
  if (lowerActivity.includes('science')) return 'flask-conical';
  if (lowerActivity.includes('music')) return 'music';
  if (lowerActivity.includes('gym') || lowerActivity.includes('physical')) return 'dumbbell';
  if (lowerActivity.includes('lunch') || lowerActivity.includes('snack')) return 'utensils';
  if (lowerActivity.includes('nap') || lowerActivity.includes('rest')) return 'moon';
  
  return 'activity';
}

export function getMoodIcon(mood: string): string {
  switch (mood.toLowerCase()) {
    case 'amazing':
      return 'grin-stars';
    case 'happy':
      return 'smile';
    case 'okay':
      return 'meh';
    case 'sad':
      return 'frown';
    case 'upset':
      return 'angry';
    default:
      return 'meh';
  }
}

export function getMoodColor(mood: string): string {
  switch (mood.toLowerCase()) {
    case 'amazing':
      return 'text-primary';
    case 'happy':
      return 'text-secondary';
    case 'okay':
      return 'text-accent';
    case 'sad':
      return 'text-warning';
    case 'upset':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

export function getBgMoodColor(mood: string): string {
  switch (mood.toLowerCase()) {
    case 'amazing':
      return 'bg-primary';
    case 'happy':
      return 'bg-secondary';
    case 'okay':
      return 'bg-accent';
    case 'sad':
      return 'bg-warning';
    case 'upset':
      return 'bg-destructive';
    default:
      return 'bg-muted';
  }
}

export function calculateAge(dateOfBirth: string): string {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return `${age} years old`;
}
