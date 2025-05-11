import bcrypt from "bcrypt";
import { ObjectId } from "mongoose";
import { 
  User, Student, Class, Attendance, Report, Activity, 
  Milestone, Badge, StudentBadge, Homework, HomeworkSubmission,
  Conversation, ConversationParticipant, Message, Notification,
  RoadmapTemplate, RoadmapStage, StudentRoadmap, StageProgress,
  IUser, IStudent, IClass, IAttendance, IReport, IActivity,
  IMilestone, IBadge, IStudentBadge, IHomework, IHomeworkSubmission,
  IConversation, IConversationParticipant, IMessage, INotification,
  IRoadmapTemplate, IRoadmapStage, IStudentRoadmap, IStageProgress
} from "./models";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUserByEmail(email: string): Promise<IUser | undefined>;
  createUser(user: Partial<IUser>): Promise<IUser>;
  updateUser(id: string, userData: Partial<IUser>): Promise<IUser | undefined>;
  
  // Student operations
  getStudent(id: string): Promise<IStudent | undefined>;
  getStudentsByParent(parentId: string): Promise<IStudent[]>;
  getStudentsByClass(classId: string): Promise<IStudent[]>;
  createStudent(student: Partial<IStudent>): Promise<IStudent>;
  updateStudent(id: string, studentData: Partial<IStudent>): Promise<IStudent | undefined>;
  deleteStudent(id: string): Promise<boolean>;
  
  // Class operations
  getClass(id: string): Promise<IClass | undefined>;
  getClassesByTeacher(teacherId: string): Promise<IClass[]>;
  getAllClasses(): Promise<IClass[]>;
  createClass(classData: Partial<IClass>): Promise<IClass>;
  
  // Attendance operations
  getAttendanceByStudent(studentId: string): Promise<IAttendance[]>;
  getAttendanceByDate(date: string): Promise<IAttendance[]>;
  getAttendanceByClassAndDate(classId: string, date: string): Promise<IAttendance[]>;
  createAttendance(attendance: Partial<IAttendance>): Promise<IAttendance>;
  updateAttendance(id: string, attendanceData: Partial<IAttendance>): Promise<IAttendance | undefined>;
  
  // Report operations
  getReport(id: string): Promise<IReport | undefined>;
  getReportsByStudent(studentId: string): Promise<IReport[]>;
  getReportsByTeacher(teacherId: string): Promise<IReport[]>;
  getReportsByDate(date: string): Promise<IReport[]>;
  createReport(report: Partial<IReport>): Promise<IReport>;
  updateReport(id: string, reportData: Partial<IReport>): Promise<IReport | undefined>;
  
  // Activity operations
  getActivitiesByClass(classId: string): Promise<IActivity[]>;
  getAllActivities(): Promise<IActivity[]>;
  createActivity(activity: Partial<IActivity>): Promise<IActivity>;
  
  // Milestone operations
  getMilestone(id: string): Promise<IMilestone | undefined>;
  getMilestonesByStudent(studentId: string): Promise<IMilestone[]>;
  getMilestonesByTeacher(teacherId: string): Promise<IMilestone[]>;
  createMilestone(milestone: Partial<IMilestone>): Promise<IMilestone>;
  updateMilestone(id: string, milestoneData: Partial<IMilestone>): Promise<IMilestone | undefined>;
  
  // Badge operations
  getBadge(id: string): Promise<IBadge | undefined>;
  getAllBadges(): Promise<IBadge[]>;
  getBadgesByCategory(category: string): Promise<IBadge[]>;
  createBadge(badge: Partial<IBadge>): Promise<IBadge>;
  
  // Student Badge operations
  getStudentBadge(id: string): Promise<IStudentBadge | undefined>;
  getStudentBadgesByStudent(studentId: string): Promise<IStudentBadge[]>;
  awardBadgeToStudent(studentBadge: Partial<IStudentBadge>): Promise<IStudentBadge>;
  
  // Homework operations
  getHomework(id: string): Promise<IHomework | undefined>;
  getHomeworksByClass(classId: string): Promise<IHomework[]>;
  getHomeworksByTeacher(teacherId: string): Promise<IHomework[]>;
  createHomework(homework: Partial<IHomework>): Promise<IHomework>;
  updateHomework(id: string, homeworkData: Partial<IHomework>): Promise<IHomework | undefined>;
  
  // Homework Submission operations
  getHomeworkSubmission(id: string): Promise<IHomeworkSubmission | undefined>;
  getHomeworkSubmissionsByStudent(studentId: string): Promise<IHomeworkSubmission[]>;
  getHomeworkSubmissionsByHomework(homeworkId: string): Promise<IHomeworkSubmission[]>;
  createHomeworkSubmission(submission: Partial<IHomeworkSubmission>): Promise<IHomeworkSubmission>;
  updateHomeworkSubmission(id: string, submissionData: Partial<IHomeworkSubmission>): Promise<IHomeworkSubmission | undefined>;
  
  // Messaging operations
  createConversation(conversation: Partial<IConversation>): Promise<IConversation>;
  addParticipantToConversation(participant: Partial<IConversationParticipant>): Promise<IConversationParticipant>;
  sendMessage(message: Partial<IMessage>): Promise<IMessage>;
  getConversationsByUser(userId: string): Promise<IConversation[]>;
  getMessagesByConversation(conversationId: string): Promise<IMessage[]>;
  
  // Notification operations
  createNotification(notification: Partial<INotification>): Promise<INotification>;
  getNotificationsByUser(userId: string): Promise<INotification[]>;
  markNotificationAsRead(notificationId: string): Promise<INotification | undefined>;
  
  // Roadmap operations
  createRoadmapTemplate(template: Partial<IRoadmapTemplate>): Promise<IRoadmapTemplate>;
  createRoadmapStage(stage: Partial<IRoadmapStage>): Promise<IRoadmapStage>;
  assignRoadmapToStudent(studentRoadmap: Partial<IStudentRoadmap>): Promise<IStudentRoadmap>;
  updateStudentStageProgress(progress: Partial<IStageProgress>): Promise<IStageProgress>;
  getRoadmapTemplates(): Promise<IRoadmapTemplate[]>;
  getRoadmapStagesByTemplate(templateId: string): Promise<IRoadmapStage[]>;
  getStudentRoadmap(studentId: string): Promise<IStudentRoadmap | undefined>;
  getStageProgressByStudentRoadmap(studentRoadmapId: string): Promise<IStageProgress[]>;
}

export class MongoStorage implements IStorage {
  constructor() {
    // Initialize with some sample data if needed
    this.initializeData();
  }

  private async initializeData() {
    // Check if we have any users, if not create sample data
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      try {
        // Create a school director
        const director = await this.createUser({
          firstName: "Admin",
          lastName: "User",
          email: "director@smartkid.com",
          password: await bcrypt.hash("password123", 10),
          role: "director",
          profileImage: "https://ui-avatars.com/api/?name=Admin+User"
        });
        
        // Create a teacher
        const teacher = await this.createUser({
          firstName: "Sarah",
          lastName: "Johnson",
          email: "teacher@smartkid.com",
          password: await bcrypt.hash("password123", 10),
          role: "teacher",
          profileImage: "https://ui-avatars.com/api/?name=Sarah+Johnson"
        });
        
        // Create a parent
        const parent = await this.createUser({
          firstName: "John",
          lastName: "Doe",
          email: "parent@smartkid.com",
          password: await bcrypt.hash("password123", 10),
          role: "parent",
          profileImage: "https://ui-avatars.com/api/?name=John+Doe"
        });
        
        // Create a class
        const classData = await this.createClass({
          name: "Class 2B",
          teacherId: teacher._id
        });
        
        // Create students
        const student1 = await this.createStudent({
          firstName: "Olivia",
          lastName: "Davis",
          dateOfBirth: "2017-05-15",
          profileImage: "https://ui-avatars.com/api/?name=Olivia+Davis",
          parentId: parent._id,
          classId: classData._id
        });
        
        const student2 = await this.createStudent({
          firstName: "Noah",
          lastName: "Miller",
          dateOfBirth: "2016-08-22",
          profileImage: "https://ui-avatars.com/api/?name=Noah+Miller",
          parentId: parent._id,
          classId: classData._id
        });
        
        // Create activities
        await this.createActivity({
          name: "Morning Reading",
          classId: classData._id
        });
        
        await this.createActivity({
          name: "Math Worksheet",
          classId: classData._id
        });
        
        await this.createActivity({
          name: "Art Project",
          classId: classData._id
        });
        
        await this.createActivity({
          name: "Science Experiment",
          classId: classData._id
        });
        
        // Create today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Create attendance records
        await this.createAttendance({
          studentId: student1._id,
          date: today,
          status: "present",
          notes: ""
        });
        
        await this.createAttendance({
          studentId: student2._id,
          date: today,
          status: "present",
          notes: ""
        });
        
        // Create reports
        await this.createReport({
          studentId: student1._id,
          teacherId: teacher._id,
          date: today,
          mood: "happy",
          activities: ["Morning Reading", "Math Worksheet", "Art Project"],
          notes: "Olivia had a great day today! She completed all her activities and participated actively in class discussions.",
          achievements: ["Reading Star"]
        });
        
        await this.createReport({
          studentId: student2._id,
          teacherId: teacher._id,
          date: today,
          mood: "okay",
          activities: ["Morning Reading", "Math Worksheet"],
          notes: "Noah is struggling with multiplication problems in today's math worksheet. He might need additional practice.",
          achievements: []
        });
        
        // Create badges
        const readingBadge = await this.createBadge({
          name: "Reading Star",
          description: "Awarded for exceptional reading progress",
          icon: "📚",
          category: "academic"
        });
        
        const mathBadge = await this.createBadge({
          name: "Math Wizard",
          description: "Awarded for excellence in mathematics",
          icon: "🧮",
          category: "academic"
        });
        
        const kindnessBadge = await this.createBadge({
          name: "Kindness Award",
          description: "Awarded for showing exceptional kindness to others",
          icon: "❤️",
          category: "behavioral"
        });
        
        const perfectAttendanceBadge = await this.createBadge({
          name: "Perfect Attendance",
          description: "Awarded for perfect attendance over a month",
          icon: "🌟",
          category: "attendance"
        });
        
        // Award badges to students
        await this.awardBadgeToStudent({
          studentId: student1._id,
          badgeId: readingBadge._id,
          dateAwarded: today,
          awardedBy: teacher._id
        });
        
        // Create milestones
        await this.createMilestone({
          studentId: student1._id,
          title: "Learn to read chapter books",
          description: "Complete reading a chapter book independently",
          date: today,
          category: "academic",
          completed: true,
          teacherId: teacher._id
        });
        
        await this.createMilestone({
          studentId: student1._id,
          title: "Master addition and subtraction",
          description: "Complete math worksheet with 90% accuracy",
          date: today,
          category: "academic",
          completed: false,
          teacherId: teacher._id
        });
        
        await this.createMilestone({
          studentId: student2._id,
          title: "Improve social skills",
          description: "Participate in group activities without prompting",
          date: today,
          category: "social",
          completed: false,
          teacherId: teacher._id
        });
        
        console.log("Sample data initialized successfully");
      } catch (error) {
        console.error("Error initializing sample data", error);
      }
    }
  }

  // User operations
  async getUser(id: string): Promise<IUser | undefined> {
    try {
      const user = await User.findById(id);
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | undefined> {
    try {
      const user = await User.findByIdAndUpdate(id, userData, { new: true });
      return user || undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  // Student operations
  async getStudent(id: string): Promise<IStudent | undefined> {
    try {
      const student = await Student.findById(id);
      return student || undefined;
    } catch (error) {
      console.error("Error getting student:", error);
      return undefined;
    }
  }

  async getStudentsByParent(parentId: string): Promise<IStudent[]> {
    try {
      const students = await Student.find({ parentId });
      return students;
    } catch (error) {
      console.error("Error getting students by parent:", error);
      return [];
    }
  }

  async getStudentsByClass(classId: string): Promise<IStudent[]> {
    try {
      const students = await Student.find({ classId });
      return students;
    } catch (error) {
      console.error("Error getting students by class:", error);
      return [];
    }
  }

  async createStudent(studentData: Partial<IStudent>): Promise<IStudent> {
    try {
      const student = new Student(studentData);
      await student.save();
      return student;
    } catch (error) {
      console.error("Error creating student:", error);
      throw error;
    }
  }

  async updateStudent(id: string, studentData: Partial<IStudent>): Promise<IStudent | undefined> {
    try {
      const student = await Student.findByIdAndUpdate(id, studentData, { new: true });
      return student || undefined;
    } catch (error) {
      console.error("Error updating student:", error);
      return undefined;
    }
  }

  async deleteStudent(id: string): Promise<boolean> {
    try {
      const result = await Student.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("Error deleting student:", error);
      return false;
    }
  }

  // Class operations
  async getClass(id: string): Promise<IClass | undefined> {
    try {
      const classData = await Class.findById(id);
      return classData || undefined;
    } catch (error) {
      console.error("Error getting class:", error);
      return undefined;
    }
  }

  async getClassesByTeacher(teacherId: string): Promise<IClass[]> {
    try {
      const classes = await Class.find({ teacherId });
      return classes;
    } catch (error) {
      console.error("Error getting classes by teacher:", error);
      return [];
    }
  }

  async getAllClasses(): Promise<IClass[]> {
    try {
      const classes = await Class.find();
      return classes;
    } catch (error) {
      console.error("Error getting all classes:", error);
      return [];
    }
  }

  async createClass(classData: Partial<IClass>): Promise<IClass> {
    try {
      const newClass = new Class(classData);
      await newClass.save();
      return newClass;
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
  }

  // Attendance operations
  async getAttendanceByStudent(studentId: string): Promise<IAttendance[]> {
    try {
      const attendances = await Attendance.find({ studentId });
      return attendances;
    } catch (error) {
      console.error("Error getting attendance by student:", error);
      return [];
    }
  }

  async getAttendanceByDate(date: string): Promise<IAttendance[]> {
    try {
      const attendances = await Attendance.find({ date });
      return attendances;
    } catch (error) {
      console.error("Error getting attendance by date:", error);
      return [];
    }
  }

  async getAttendanceByClassAndDate(classId: string, date: string): Promise<IAttendance[]> {
    try {
      // First get all students in the class
      const students = await Student.find({ classId });
      const studentIds = students.map(student => student._id);
      
      // Then get attendance records for those students on the given date
      const attendances = await Attendance.find({
        studentId: { $in: studentIds },
        date
      });
      
      return attendances;
    } catch (error) {
      console.error("Error getting attendance by class and date:", error);
      return [];
    }
  }

  async createAttendance(attendanceData: Partial<IAttendance>): Promise<IAttendance> {
    try {
      const attendance = new Attendance(attendanceData);
      await attendance.save();
      return attendance;
    } catch (error) {
      console.error("Error creating attendance:", error);
      throw error;
    }
  }

  async updateAttendance(id: string, attendanceData: Partial<IAttendance>): Promise<IAttendance | undefined> {
    try {
      const attendance = await Attendance.findByIdAndUpdate(id, attendanceData, { new: true });
      return attendance || undefined;
    } catch (error) {
      console.error("Error updating attendance:", error);
      return undefined;
    }
  }

  // Report operations
  async getReport(id: string): Promise<IReport | undefined> {
    try {
      const report = await Report.findById(id);
      return report || undefined;
    } catch (error) {
      console.error("Error getting report:", error);
      return undefined;
    }
  }

  async getReportsByStudent(studentId: string): Promise<IReport[]> {
    try {
      const reports = await Report.find({ studentId }).sort({ date: -1 });
      return reports;
    } catch (error) {
      console.error("Error getting reports by student:", error);
      return [];
    }
  }

  async getReportsByTeacher(teacherId: string): Promise<IReport[]> {
    try {
      const reports = await Report.find({ teacherId }).sort({ date: -1 });
      return reports;
    } catch (error) {
      console.error("Error getting reports by teacher:", error);
      return [];
    }
  }

  async getReportsByDate(date: string): Promise<IReport[]> {
    try {
      const reports = await Report.find({ date });
      return reports;
    } catch (error) {
      console.error("Error getting reports by date:", error);
      return [];
    }
  }

  async createReport(reportData: Partial<IReport>): Promise<IReport> {
    try {
      const report = new Report(reportData);
      await report.save();
      return report;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  }

  async updateReport(id: string, reportData: Partial<IReport>): Promise<IReport | undefined> {
    try {
      const report = await Report.findByIdAndUpdate(id, reportData, { new: true });
      return report || undefined;
    } catch (error) {
      console.error("Error updating report:", error);
      return undefined;
    }
  }

  // Activity operations
  async getActivitiesByClass(classId: string): Promise<IActivity[]> {
    try {
      const activities = await Activity.find({ classId });
      return activities;
    } catch (error) {
      console.error("Error getting activities by class:", error);
      return [];
    }
  }

  async getAllActivities(): Promise<IActivity[]> {
    try {
      const activities = await Activity.find();
      return activities;
    } catch (error) {
      console.error("Error getting all activities:", error);
      return [];
    }
  }

  async createActivity(activityData: Partial<IActivity>): Promise<IActivity> {
    try {
      const activity = new Activity(activityData);
      await activity.save();
      return activity;
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  }

  // Milestone operations
  async getMilestone(id: string): Promise<IMilestone | undefined> {
    try {
      const milestone = await Milestone.findById(id);
      return milestone || undefined;
    } catch (error) {
      console.error("Error getting milestone:", error);
      return undefined;
    }
  }

  async getMilestonesByStudent(studentId: string): Promise<IMilestone[]> {
    try {
      const milestones = await Milestone.find({ studentId });
      return milestones;
    } catch (error) {
      console.error("Error getting milestones by student:", error);
      return [];
    }
  }

  async getMilestonesByTeacher(teacherId: string): Promise<IMilestone[]> {
    try {
      const milestones = await Milestone.find({ teacherId });
      return milestones;
    } catch (error) {
      console.error("Error getting milestones by teacher:", error);
      return [];
    }
  }

  async createMilestone(milestoneData: Partial<IMilestone>): Promise<IMilestone> {
    try {
      const milestone = new Milestone(milestoneData);
      await milestone.save();
      return milestone;
    } catch (error) {
      console.error("Error creating milestone:", error);
      throw error;
    }
  }

  async updateMilestone(id: string, milestoneData: Partial<IMilestone>): Promise<IMilestone | undefined> {
    try {
      const milestone = await Milestone.findByIdAndUpdate(id, milestoneData, { new: true });
      return milestone || undefined;
    } catch (error) {
      console.error("Error updating milestone:", error);
      return undefined;
    }
  }

  // Badge operations
  async getBadge(id: string): Promise<IBadge | undefined> {
    try {
      const badge = await Badge.findById(id);
      return badge || undefined;
    } catch (error) {
      console.error("Error getting badge:", error);
      return undefined;
    }
  }

  async getAllBadges(): Promise<IBadge[]> {
    try {
      const badges = await Badge.find();
      return badges;
    } catch (error) {
      console.error("Error getting all badges:", error);
      return [];
    }
  }

  async getBadgesByCategory(category: string): Promise<IBadge[]> {
    try {
      const badges = await Badge.find({ category });
      return badges;
    } catch (error) {
      console.error("Error getting badges by category:", error);
      return [];
    }
  }

  async createBadge(badgeData: Partial<IBadge>): Promise<IBadge> {
    try {
      const badge = new Badge(badgeData);
      await badge.save();
      return badge;
    } catch (error) {
      console.error("Error creating badge:", error);
      throw error;
    }
  }

  // Student Badge operations
  async getStudentBadge(id: string): Promise<IStudentBadge | undefined> {
    try {
      const studentBadge = await StudentBadge.findById(id);
      return studentBadge || undefined;
    } catch (error) {
      console.error("Error getting student badge:", error);
      return undefined;
    }
  }

  async getStudentBadgesByStudent(studentId: string): Promise<IStudentBadge[]> {
    try {
      const studentBadges = await StudentBadge.find({ studentId })
        .populate('badgeId')  // Populate the badge details
        .exec();
      return studentBadges;
    } catch (error) {
      console.error("Error getting student badges by student:", error);
      return [];
    }
  }

  async awardBadgeToStudent(studentBadgeData: Partial<IStudentBadge>): Promise<IStudentBadge> {
    try {
      const studentBadge = new StudentBadge(studentBadgeData);
      await studentBadge.save();
      return studentBadge;
    } catch (error) {
      console.error("Error awarding badge to student:", error);
      throw error;
    }
  }

  // Homework operations
  async getHomework(id: string): Promise<IHomework | undefined> {
    try {
      const homework = await Homework.findById(id);
      return homework || undefined;
    } catch (error) {
      console.error("Error getting homework:", error);
      return undefined;
    }
  }

  async getHomeworksByClass(classId: string): Promise<IHomework[]> {
    try {
      const homeworks = await Homework.find({ classId }).sort({ dueDate: 1 });
      return homeworks;
    } catch (error) {
      console.error("Error getting homeworks by class:", error);
      return [];
    }
  }

  async getHomeworksByTeacher(teacherId: string): Promise<IHomework[]> {
    try {
      const homeworks = await Homework.find({ teacherId }).sort({ dueDate: 1 });
      return homeworks;
    } catch (error) {
      console.error("Error getting homeworks by teacher:", error);
      return [];
    }
  }

  async createHomework(homeworkData: Partial<IHomework>): Promise<IHomework> {
    try {
      const homework = new Homework(homeworkData);
      await homework.save();
      return homework;
    } catch (error) {
      console.error("Error creating homework:", error);
      throw error;
    }
  }

  async updateHomework(id: string, homeworkData: Partial<IHomework>): Promise<IHomework | undefined> {
    try {
      const homework = await Homework.findByIdAndUpdate(id, homeworkData, { new: true });
      return homework || undefined;
    } catch (error) {
      console.error("Error updating homework:", error);
      return undefined;
    }
  }

  // Homework Submission operations
  async getHomeworkSubmission(id: string): Promise<IHomeworkSubmission | undefined> {
    try {
      const submission = await HomeworkSubmission.findById(id);
      return submission || undefined;
    } catch (error) {
      console.error("Error getting homework submission:", error);
      return undefined;
    }
  }

  async getHomeworkSubmissionsByStudent(studentId: string): Promise<IHomeworkSubmission[]> {
    try {
      const submissions = await HomeworkSubmission.find({ studentId })
        .populate('homeworkId')
        .sort({ submissionDate: -1 });
      return submissions;
    } catch (error) {
      console.error("Error getting homework submissions by student:", error);
      return [];
    }
  }

  async getHomeworkSubmissionsByHomework(homeworkId: string): Promise<IHomeworkSubmission[]> {
    try {
      const submissions = await HomeworkSubmission.find({ homeworkId })
        .populate('studentId')
        .sort({ submissionDate: -1 });
      return submissions;
    } catch (error) {
      console.error("Error getting homework submissions by homework:", error);
      return [];
    }
  }

  async createHomeworkSubmission(submissionData: Partial<IHomeworkSubmission>): Promise<IHomeworkSubmission> {
    try {
      const submission = new HomeworkSubmission(submissionData);
      await submission.save();
      return submission;
    } catch (error) {
      console.error("Error creating homework submission:", error);
      throw error;
    }
  }

  async updateHomeworkSubmission(id: string, submissionData: Partial<IHomeworkSubmission>): Promise<IHomeworkSubmission | undefined> {
    try {
      const submission = await HomeworkSubmission.findByIdAndUpdate(id, submissionData, { new: true });
      return submission || undefined;
    } catch (error) {
      console.error("Error updating homework submission:", error);
      return undefined;
    }
  }

  // Messaging operations
  async createConversation(conversationData: Partial<IConversation>): Promise<IConversation> {
    try {
      const conversation = new Conversation(conversationData);
      await conversation.save();
      return conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async addParticipantToConversation(participantData: Partial<IConversationParticipant>): Promise<IConversationParticipant> {
    try {
      const participant = new ConversationParticipant(participantData);
      await participant.save();
      return participant;
    } catch (error) {
      console.error("Error adding participant to conversation:", error);
      throw error;
    }
  }

  async sendMessage(messageData: Partial<IMessage>): Promise<IMessage> {
    try {
      const message = new Message(messageData);
      await message.save();
      
      // Update the conversation's lastMessageAt field
      await Conversation.findByIdAndUpdate(
        messageData.conversationId,
        { lastMessageAt: new Date() }
      );
      
      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async getConversationsByUser(userId: string): Promise<IConversation[]> {
    try {
      // Find all conversations where the user is a participant
      const participants = await ConversationParticipant.find({ userId });
      const conversationIds = participants.map(p => p.conversationId);
      
      const conversations = await Conversation.find({
        _id: { $in: conversationIds }
      }).sort({ lastMessageAt: -1 });
      
      return conversations;
    } catch (error) {
      console.error("Error getting conversations by user:", error);
      return [];
    }
  }

  async getMessagesByConversation(conversationId: string): Promise<IMessage[]> {
    try {
      const messages = await Message.find({ conversationId })
        .sort({ sentAt: 1 });
      return messages;
    } catch (error) {
      console.error("Error getting messages by conversation:", error);
      return [];
    }
  }

  // Notification operations
  async createNotification(notificationData: Partial<INotification>): Promise<INotification> {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getNotificationsByUser(userId: string): Promise<INotification[]> {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 });
      return notifications;
    } catch (error) {
      console.error("Error getting notifications by user:", error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<INotification | undefined> {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      return notification || undefined;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return undefined;
    }
  }

  // Roadmap operations
  async createRoadmapTemplate(templateData: Partial<IRoadmapTemplate>): Promise<IRoadmapTemplate> {
    try {
      const template = new RoadmapTemplate(templateData);
      await template.save();
      return template;
    } catch (error) {
      console.error("Error creating roadmap template:", error);
      throw error;
    }
  }

  async createRoadmapStage(stageData: Partial<IRoadmapStage>): Promise<IRoadmapStage> {
    try {
      const stage = new RoadmapStage(stageData);
      await stage.save();
      return stage;
    } catch (error) {
      console.error("Error creating roadmap stage:", error);
      throw error;
    }
  }

  async assignRoadmapToStudent(roadmapData: Partial<IStudentRoadmap>): Promise<IStudentRoadmap> {
    try {
      const roadmap = new StudentRoadmap(roadmapData);
      await roadmap.save();
      return roadmap;
    } catch (error) {
      console.error("Error assigning roadmap to student:", error);
      throw error;
    }
  }

  async updateStudentStageProgress(progressData: Partial<IStageProgress>): Promise<IStageProgress> {
    try {
      // Check if progress entry already exists
      let progress;
      if (progressData._id) {
        progress = await StageProgress.findByIdAndUpdate(
          progressData._id,
          progressData,
          { new: true }
        );
      } else if (progressData.studentRoadmapId && progressData.stageId) {
        // Try to find by roadmap and stage IDs
        progress = await StageProgress.findOne({
          studentRoadmapId: progressData.studentRoadmapId,
          stageId: progressData.stageId
        });
        
        if (progress) {
          // Update existing progress
          Object.assign(progress, progressData);
          await progress.save();
        } else {
          // Create new progress
          progress = new StageProgress(progressData);
          await progress.save();
        }
      } else {
        // Create new progress
        progress = new StageProgress(progressData);
        await progress.save();
      }
      
      // If the status is 'completed', update student roadmap's currentStageId to the next stage
      if (progressData.status === 'completed' && progressData.studentRoadmapId) {
        const studentRoadmap = await StudentRoadmap.findById(progressData.studentRoadmapId);
        if (studentRoadmap) {
          // Find the current stage to get its order
          const currentStage = await RoadmapStage.findById(progressData.stageId);
          if (currentStage) {
            // Find the next stage in sequence
            const nextStage = await RoadmapStage.findOne({
              templateId: currentStage.templateId,
              order: currentStage.order + 1
            });
            
            if (nextStage) {
              // Update the student roadmap to point to the next stage
              studentRoadmap.currentStageId = nextStage._id;
              await studentRoadmap.save();
            }
          }
        }
      }
      
      return progress;
    } catch (error) {
      console.error("Error updating student stage progress:", error);
      throw error;
    }
  }

  async getRoadmapTemplates(): Promise<IRoadmapTemplate[]> {
    try {
      const templates = await RoadmapTemplate.find({ isActive: true });
      return templates;
    } catch (error) {
      console.error("Error getting roadmap templates:", error);
      return [];
    }
  }

  async getRoadmapStagesByTemplate(templateId: string): Promise<IRoadmapStage[]> {
    try {
      const stages = await RoadmapStage.find({ templateId })
        .sort({ order: 1 });
      return stages;
    } catch (error) {
      console.error("Error getting roadmap stages by template:", error);
      return [];
    }
  }

  async getStudentRoadmap(studentId: string): Promise<IStudentRoadmap | undefined> {
    try {
      const roadmap = await StudentRoadmap.findOne({ studentId })
        .populate('templateId')
        .populate('currentStageId');
      return roadmap || undefined;
    } catch (error) {
      console.error("Error getting student roadmap:", error);
      return undefined;
    }
  }

  async getStageProgressByStudentRoadmap(studentRoadmapId: string): Promise<IStageProgress[]> {
    try {
      const progressEntries = await StageProgress.find({ studentRoadmapId })
        .populate('stageId');
      return progressEntries;
    } catch (error) {
      console.error("Error getting stage progress by student roadmap:", error);
      return [];
    }
  }
}

export const storage = new MongoStorage();