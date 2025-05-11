// Import model default exports
import User from './User';
import Class from './Class';
import Student from './Student';
import Attendance from './Attendance';
import Report from './Report';
import Activity from './Activity';
import Milestone from './Milestone';
import Badge from './Badge';
import StudentBadge from './StudentBadge';
import Homework from './Homework';
import HomeworkSubmission from './HomeworkSubmission';
import Conversation from './Conversation';
import ConversationParticipant from './ConversationParticipant';
import Message from './Message';
import Notification from './Notification';
import RoadmapTemplate from './RoadmapTemplate';
import RoadmapStage from './RoadmapStage';
import StudentRoadmap from './StudentRoadmap';
import StageProgress from './StageProgress';

// Re-export model interfaces
import type { IUser } from './User';
import type { IClass } from './Class';
import type { IStudent } from './Student';
import type { IAttendance } from './Attendance';
import type { IReport } from './Report';
import type { IActivity } from './Activity';
import type { IMilestone } from './Milestone';
import type { IBadge } from './Badge';
import type { IStudentBadge } from './StudentBadge';
import type { IHomework } from './Homework';
import type { IHomeworkSubmission } from './HomeworkSubmission';
import type { IConversation } from './Conversation';
import type { IConversationParticipant } from './ConversationParticipant';
import type { IMessage } from './Message';
import type { INotification } from './Notification';
import type { IRoadmapTemplate } from './RoadmapTemplate';
import type { IRoadmapStage } from './RoadmapStage';
import type { IStudentRoadmap } from './StudentRoadmap';
import type { IStageProgress } from './StageProgress';

export {
  // Models
  User,
  Class,
  Student,
  Attendance,
  Report,
  Activity,
  Milestone,
  Badge,
  StudentBadge,
  Homework,
  HomeworkSubmission,
  Conversation,
  ConversationParticipant,
  Message,
  Notification,
  RoadmapTemplate,
  RoadmapStage,
  StudentRoadmap,
  StageProgress,
  
  // Interfaces
  IUser,
  IClass,
  IStudent,
  IAttendance,
  IReport,
  IActivity,
  IMilestone,
  IBadge,
  IStudentBadge,
  IHomework,
  IHomeworkSubmission,
  IConversation,
  IConversationParticipant,
  IMessage,
  INotification,
  IRoadmapTemplate,
  IRoadmapStage,
  IStudentRoadmap,
  IStageProgress
};