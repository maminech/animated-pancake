import { 
  users, type User, type InsertUser,
  students, type Student, type InsertStudent,
  classes, type Class, type InsertClass,
  attendances, type Attendance, type InsertAttendance,
  reports, type Report, type InsertReport,
  activities, type Activity, type InsertActivity,
  milestones, type Milestone, type InsertMilestone,
  badges, type Badge, type InsertBadge,
  studentBadges, type StudentBadge, type InsertStudentBadge
} from "@shared/schema";
import bcrypt from "bcrypt";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentsByParent(parentId: number): Promise<Student[]>;
  getStudentsByClass(classId: number): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Class operations
  getClass(id: number): Promise<Class | undefined>;
  getClassesByTeacher(teacherId: number): Promise<Class[]>;
  getAllClasses(): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  
  // Attendance operations
  getAttendanceByStudent(studentId: number): Promise<Attendance[]>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;
  getAttendanceByClassAndDate(classId: number, date: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  
  // Report operations
  getReport(id: number): Promise<Report | undefined>;
  getReportsByStudent(studentId: number): Promise<Report[]>;
  getReportsByTeacher(teacherId: number): Promise<Report[]>;
  getReportsByDate(date: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, reportData: Partial<InsertReport>): Promise<Report | undefined>;
  
  // Activity operations
  getActivitiesByClass(classId: number): Promise<Activity[]>;
  getAllActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Milestone operations
  getMilestone(id: number): Promise<Milestone | undefined>;
  getMilestonesByStudent(studentId: number): Promise<Milestone[]>;
  getMilestonesByTeacher(teacherId: number): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestoneData: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  
  // Badge operations
  getBadge(id: number): Promise<Badge | undefined>;
  getAllBadges(): Promise<Badge[]>;
  getBadgesByCategory(category: string): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // Student Badge operations
  getStudentBadge(id: number): Promise<StudentBadge | undefined>;
  getStudentBadgesByStudent(studentId: number): Promise<StudentBadge[]>;
  awardBadgeToStudent(studentBadge: InsertStudentBadge): Promise<StudentBadge>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private classes: Map<number, Class>;
  private attendances: Map<number, Attendance>;
  private reports: Map<number, Report>;
  private activities: Map<number, Activity>;
  private milestones: Map<number, Milestone>;
  private badges: Map<number, Badge>;
  private studentBadges: Map<number, StudentBadge>;
  
  private currentUserId: number;
  private currentStudentId: number;
  private currentClassId: number;
  private currentAttendanceId: number;
  private currentReportId: number;
  private currentActivityId: number;
  private currentMilestoneId: number;
  private currentBadgeId: number;
  private currentStudentBadgeId: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.classes = new Map();
    this.attendances = new Map();
    this.reports = new Map();
    this.activities = new Map();
    this.milestones = new Map();
    this.badges = new Map();
    this.studentBadges = new Map();
    
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentClassId = 1;
    this.currentAttendanceId = 1;
    this.currentReportId = 1;
    this.currentActivityId = 1;
    this.currentMilestoneId = 1;
    this.currentBadgeId = 1;
    this.currentStudentBadgeId = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  private async initializeData() {
    // Create a school director
    await this.createUser({
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
      teacherId: teacher.id
    });
    
    // Create students
    const student1 = await this.createStudent({
      firstName: "Olivia",
      lastName: "Davis",
      dateOfBirth: "2017-05-15",
      profileImage: "https://ui-avatars.com/api/?name=Olivia+Davis",
      parentId: parent.id,
      classId: classData.id
    });
    
    const student2 = await this.createStudent({
      firstName: "Noah",
      lastName: "Miller",
      dateOfBirth: "2016-08-22",
      profileImage: "https://ui-avatars.com/api/?name=Noah+Miller",
      parentId: parent.id,
      classId: classData.id
    });
    
    // Create activities
    await this.createActivity({
      name: "Morning Reading",
      classId: classData.id
    });
    
    await this.createActivity({
      name: "Math Worksheet",
      classId: classData.id
    });
    
    await this.createActivity({
      name: "Art Project",
      classId: classData.id
    });
    
    await this.createActivity({
      name: "Science Experiment",
      classId: classData.id
    });
    
    // Create today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Create attendance records
    await this.createAttendance({
      studentId: student1.id,
      date: today,
      status: "present",
      notes: ""
    });
    
    await this.createAttendance({
      studentId: student2.id,
      date: today,
      status: "present",
      notes: ""
    });
    
    // Create reports
    await this.createReport({
      studentId: student1.id,
      teacherId: teacher.id,
      date: today,
      mood: "happy",
      activities: ["Morning Reading", "Math Worksheet", "Art Project"],
      notes: "Olivia had a great day today! She completed all her activities and participated actively in class discussions.",
      achievements: ["Reading Star"]
    });
    
    await this.createReport({
      studentId: student2.id,
      teacherId: teacher.id,
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
      studentId: student1.id,
      badgeId: readingBadge.id,
      dateAwarded: today,
      awardedBy: teacher.id
    });
    
    // Create milestones
    await this.createMilestone({
      studentId: student1.id,
      title: "Learn to read chapter books",
      description: "Complete reading a chapter book independently",
      date: today,
      category: "academic",
      completed: true,
      teacherId: teacher.id
    });
    
    await this.createMilestone({
      studentId: student1.id,
      title: "Master addition and subtraction",
      description: "Complete math worksheet with 90% accuracy",
      date: today,
      category: "academic",
      completed: false,
      teacherId: teacher.id
    });
    
    await this.createMilestone({
      studentId: student2.id,
      title: "Improve social skills",
      description: "Participate in group activities without prompting",
      date: today,
      category: "social",
      completed: false,
      teacherId: teacher.id
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentsByParent(parentId: number): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.parentId === parentId,
    );
  }

  async getStudentsByClass(classId: number): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.classId === classId,
    );
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = { ...studentData, id };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) return undefined;
    
    const updatedStudent = { ...existingStudent, ...studentData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  // Class operations
  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(
      (classData) => classData.teacherId === teacherId,
    );
  }

  async getAllClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = this.currentClassId++;
    const newClass: Class = { ...classData, id };
    this.classes.set(id, newClass);
    return newClass;
  }

  // Attendance operations
  async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendances.values()).filter(
      (attendance) => attendance.studentId === studentId,
    );
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return Array.from(this.attendances.values()).filter(
      (attendance) => attendance.date === date,
    );
  }

  async getAttendanceByClassAndDate(classId: number, date: string): Promise<Attendance[]> {
    const classStudents = await this.getStudentsByClass(classId);
    const studentIds = classStudents.map(student => student.id);
    
    return Array.from(this.attendances.values()).filter(
      (attendance) => 
        attendance.date === date && 
        studentIds.includes(attendance.studentId)
    );
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const id = this.currentAttendanceId++;
    const attendance: Attendance = { ...attendanceData, id };
    this.attendances.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const existingAttendance = this.attendances.get(id);
    if (!existingAttendance) return undefined;
    
    const updatedAttendance = { ...existingAttendance, ...attendanceData };
    this.attendances.set(id, updatedAttendance);
    return updatedAttendance;
  }

  // Report operations
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportsByStudent(studentId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter((report) => report.studentId === studentId)
      .sort((a, b) => {
        // Sort by date in descending order (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  async getReportsByTeacher(teacherId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter((report) => report.teacherId === teacherId)
      .sort((a, b) => {
        // Sort by date in descending order (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  async getReportsByDate(date: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.date === date,
    );
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const report: Report = { ...reportData, id };
    this.reports.set(id, report);
    return report;
  }

  async updateReport(id: number, reportData: Partial<InsertReport>): Promise<Report | undefined> {
    const existingReport = this.reports.get(id);
    if (!existingReport) return undefined;
    
    const updatedReport = { ...existingReport, ...reportData };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  // Activity operations
  async getActivitiesByClass(classId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.classId === classId,
    );
  }

  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { ...activityData, id };
    this.activities.set(id, activity);
    return activity;
  }

  // Milestone operations
  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }

  async getMilestonesByStudent(studentId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values())
      .filter((milestone) => milestone.studentId === studentId)
      .sort((a, b) => {
        // Sort by date in descending order (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  async getMilestonesByTeacher(teacherId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values())
      .filter((milestone) => milestone.teacherId === teacherId)
      .sort((a, b) => {
        // Sort by date in descending order (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  async createMilestone(milestoneData: InsertMilestone): Promise<Milestone> {
    const id = this.currentMilestoneId++;
    const milestone: Milestone = { ...milestoneData, id };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(id: number, milestoneData: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const existingMilestone = this.milestones.get(id);
    if (!existingMilestone) return undefined;
    
    const updatedMilestone = { ...existingMilestone, ...milestoneData };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  // Badge operations
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }

  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getBadgesByCategory(category: string): Promise<Badge[]> {
    return Array.from(this.badges.values())
      .filter((badge) => badge.category === category);
  }

  async createBadge(badgeData: InsertBadge): Promise<Badge> {
    const id = this.currentBadgeId++;
    const badge: Badge = { ...badgeData, id };
    this.badges.set(id, badge);
    return badge;
  }

  // Student Badge operations
  async getStudentBadge(id: number): Promise<StudentBadge | undefined> {
    return this.studentBadges.get(id);
  }

  async getStudentBadgesByStudent(studentId: number): Promise<StudentBadge[]> {
    return Array.from(this.studentBadges.values())
      .filter((studentBadge) => studentBadge.studentId === studentId)
      .sort((a, b) => {
        // Sort by date in descending order (newest first)
        return new Date(b.dateAwarded).getTime() - new Date(a.dateAwarded).getTime();
      });
  }

  async awardBadgeToStudent(studentBadgeData: InsertStudentBadge): Promise<StudentBadge> {
    const id = this.currentStudentBadgeId++;
    const studentBadge: StudentBadge = { ...studentBadgeData, id };
    this.studentBadges.set(id, studentBadge);
    return studentBadge;
  }
}

export const storage = new MemStorage();
