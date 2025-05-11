import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./mongoStorage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { 
  IUser, IStudent 
} from "./models";

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "smartkid-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check user role
const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User Authentication Routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Create JWT token (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ user: userWithoutPassword, token });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  });
  
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      // Validate user data
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        profileImage: `https://ui-avatars.com/api/?name=${validatedData.firstName}+${validatedData.lastName}`
      });
      
      // Create JWT token (excluding password)
      const { password: _, ...userWithoutPassword } = newUser;
      const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: err.errors });
      }
      
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  // Current user verification route
  app.get('/api/auth/me', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error('Auth verification error:', err);
      res.status(500).json({ message: 'Server error during verification' });
    }
  });
  
  // Student Routes
  app.get('/api/students', authenticateToken, async (req: Request, res: Response) => {
    try {
      let students = [];
      
      if (req.user.role === 'parent') {
        students = await storage.getStudentsByParent(req.user.id);
      } else if (req.user.role === 'teacher') {
        // Get teacher's classes
        const classes = await storage.getClassesByTeacher(req.user.id);
        if (classes.length === 0) {
          return res.json([]);
        }
        
        // Get students from all classes taught by this teacher
        students = await Promise.all(
          classes.map(async (classData) => {
            return await storage.getStudentsByClass(classData.id);
          })
        ).then(results => results.flat());
      } else if (req.user.role === 'director') {
        // Directors can see all students
        const allClasses = await storage.getAllClasses();
        students = await Promise.all(
          allClasses.map(async (classData) => {
            return await storage.getStudentsByClass(classData.id);
          })
        ).then(results => results.flat());
      }
      
      res.json(students);
    } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ message: 'Server error while fetching students' });
    }
  });
  
  app.get('/api/students/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.id);
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Check if user has permission to access this student
      if (req.user.role === 'parent' && student.parentId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      if (req.user.role === 'teacher') {
        const classes = await storage.getClassesByTeacher(req.user.id);
        const classIds = classes.map(c => c.id);
        
        if (!classIds.includes(student.classId!)) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      
      res.json(student);
    } catch (err) {
      console.error('Error fetching student:', err);
      res.status(500).json({ message: 'Server error while fetching student details' });
    }
  });
  
  app.post('/api/students', authenticateToken, authorizeRole(['teacher', 'director']), async (req: Request, res: Response) => {
    try {
      // Validate student data
      const validatedData = insertStudentSchema.parse(req.body);
      
      // Create student
      const newStudent = await storage.createStudent(validatedData);
      
      res.status(201).json(newStudent);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: err.errors });
      }
      
      console.error('Error creating student:', err);
      res.status(500).json({ message: 'Server error while creating student' });
    }
  });
  
  // Attendance Routes
  app.get('/api/attendance', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { date, classId } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: 'Date parameter is required' });
      }
      
      let attendanceRecords = [];
      
      if (classId) {
        // Get attendance for specific class on a specific date
        attendanceRecords = await storage.getAttendanceByClassAndDate(
          parseInt(classId as string), 
          date as string
        );
      } else {
        // Get all attendance for a specific date
        attendanceRecords = await storage.getAttendanceByDate(date as string);
      }
      
      res.json(attendanceRecords);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      res.status(500).json({ message: 'Server error while fetching attendance records' });
    }
  });
  
  app.post('/api/attendance', authenticateToken, authorizeRole(['teacher']), async (req: Request, res: Response) => {
    try {
      // Validate attendance data
      const validatedData = insertAttendanceSchema.parse(req.body);
      
      // Create attendance record
      const newAttendance = await storage.createAttendance(validatedData);
      
      res.status(201).json(newAttendance);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: err.errors });
      }
      
      console.error('Error creating attendance record:', err);
      res.status(500).json({ message: 'Server error while creating attendance record' });
    }
  });
  
  // Report Routes
  app.get('/api/reports', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { studentId } = req.query;
      
      let reports = [];
      
      if (studentId) {
        // Get reports for a specific student
        reports = await storage.getReportsByStudent(parseInt(studentId as string));
      } else if (req.user.role === 'teacher') {
        // Teachers get their own reports
        reports = await storage.getReportsByTeacher(req.user.id);
      } else if (req.user.role === 'parent') {
        // Parents get reports for their children
        const children = await storage.getStudentsByParent(req.user.id);
        reports = await Promise.all(
          children.map(async (child) => {
            return await storage.getReportsByStudent(child.id);
          })
        ).then(results => results.flat());
      }
      
      res.json(reports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      res.status(500).json({ message: 'Server error while fetching reports' });
    }
  });
  
  app.get('/api/reports/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Check permissions
      if (req.user.role === 'teacher' && report.teacherId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      if (req.user.role === 'parent') {
        const children = await storage.getStudentsByParent(req.user.id);
        const childIds = children.map(c => c.id);
        
        if (!childIds.includes(report.studentId)) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      
      res.json(report);
    } catch (err) {
      console.error('Error fetching report:', err);
      res.status(500).json({ message: 'Server error while fetching report details' });
    }
  });
  
  app.post('/api/reports', authenticateToken, authorizeRole(['teacher']), async (req: Request, res: Response) => {
    try {
      // Validate report data
      const validatedData = insertReportSchema.parse(req.body);
      
      // Create report
      const newReport = await storage.createReport({
        ...validatedData,
        teacherId: req.user.id
      });
      
      res.status(201).json(newReport);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: err.errors });
      }
      
      console.error('Error creating report:', err);
      res.status(500).json({ message: 'Server error while creating report' });
    }
  });
  
  app.put('/api/reports/:id', authenticateToken, authorizeRole(['teacher']), async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Check if this teacher created the report
      if (report.teacherId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update report
      const updatedReport = await storage.updateReport(reportId, req.body);
      
      res.json(updatedReport);
    } catch (err) {
      console.error('Error updating report:', err);
      res.status(500).json({ message: 'Server error while updating report' });
    }
  });
  
  // Activities Routes
  app.get('/api/activities', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { classId } = req.query;
      
      let activities = [];
      
      if (classId) {
        activities = await storage.getActivitiesByClass(parseInt(classId as string));
      } else {
        activities = await storage.getAllActivities();
      }
      
      res.json(activities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      res.status(500).json({ message: 'Server error while fetching activities' });
    }
  });
  
  // Milestone routes
  app.get('/api/milestones', authenticateToken, async (req: Request, res: Response) => {
    try {
      const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
      const teacherId = req.query.teacherId ? Number(req.query.teacherId) : undefined;
      
      let milestones = [];
      if (studentId) {
        milestones = await storage.getMilestonesByStudent(studentId);
      } else if (teacherId) {
        milestones = await storage.getMilestonesByTeacher(teacherId);
      } else if (req.user.role === 'teacher') {
        milestones = await storage.getMilestonesByTeacher(req.user.id);
      } else if (req.user.role === 'parent') {
        // Parents get milestones for their children
        const children = await storage.getStudentsByParent(req.user.id);
        milestones = await Promise.all(
          children.map(async (child) => {
            return await storage.getMilestonesByStudent(child.id);
          })
        ).then(results => results.flat());
      }
      
      res.json(milestones);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      res.status(500).json({ message: 'Server error while fetching milestones' });
    }
  });
  
  app.get('/api/milestones/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const milestoneId = Number(req.params.id);
      const milestone = await storage.getMilestone(milestoneId);
      
      if (!milestone) {
        return res.status(404).json({ message: 'Milestone not found' });
      }
      
      // Check permissions
      if (req.user.role === 'teacher' && milestone.teacherId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      if (req.user.role === 'parent') {
        const children = await storage.getStudentsByParent(req.user.id);
        const childIds = children.map(c => c.id);
        
        if (!childIds.includes(milestone.studentId)) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      
      res.json(milestone);
    } catch (err) {
      console.error('Error fetching milestone:', err);
      res.status(500).json({ message: 'Server error while fetching milestone details' });
    }
  });
  
  app.post('/api/milestones', authenticateToken, authorizeRole(['teacher', 'director']), async (req: Request, res: Response) => {
    try {
      // Create milestone with teacher ID from the token
      const milestone = await storage.createMilestone({
        ...req.body,
        teacherId: req.body.teacherId || req.user.id
      });
      
      res.status(201).json(milestone);
    } catch (err) {
      console.error('Error creating milestone:', err);
      res.status(500).json({ message: 'Server error while creating milestone' });
    }
  });
  
  app.put('/api/milestones/:id', authenticateToken, authorizeRole(['teacher', 'director']), async (req: Request, res: Response) => {
    try {
      const milestoneId = Number(req.params.id);
      const milestone = await storage.getMilestone(milestoneId);
      
      if (!milestone) {
        return res.status(404).json({ message: 'Milestone not found' });
      }
      
      // Check if this teacher created the milestone
      if (req.user.role === 'teacher' && milestone.teacherId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update milestone
      const updatedMilestone = await storage.updateMilestone(milestoneId, req.body);
      
      res.json(updatedMilestone);
    } catch (err) {
      console.error('Error updating milestone:', err);
      res.status(500).json({ message: 'Server error while updating milestone' });
    }
  });
  
  // Badge routes
  app.get('/api/badges', authenticateToken, async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      
      let badges = [];
      if (category) {
        badges = await storage.getBadgesByCategory(category);
      } else {
        badges = await storage.getAllBadges();
      }
      
      res.json(badges);
    } catch (err) {
      console.error('Error fetching badges:', err);
      res.status(500).json({ message: 'Server error while fetching badges' });
    }
  });
  
  app.get('/api/badges/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const badgeId = Number(req.params.id);
      const badge = await storage.getBadge(badgeId);
      
      if (!badge) {
        return res.status(404).json({ message: 'Badge not found' });
      }
      
      res.json(badge);
    } catch (err) {
      console.error('Error fetching badge:', err);
      res.status(500).json({ message: 'Server error while fetching badge details' });
    }
  });
  
  app.post('/api/badges', authenticateToken, authorizeRole(['teacher', 'director', 'admin']), async (req: Request, res: Response) => {
    try {
      const badge = await storage.createBadge(req.body);
      res.status(201).json(badge);
    } catch (err) {
      console.error('Error creating badge:', err);
      res.status(500).json({ message: 'Server error while creating badge' });
    }
  });
  
  // Student Badge routes
  app.get('/api/student-badges', authenticateToken, async (req: Request, res: Response) => {
    try {
      const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
      
      if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
      }
      
      // Check permissions
      if (req.user.role === 'parent') {
        const children = await storage.getStudentsByParent(req.user.id);
        const childIds = children.map(c => c.id);
        
        if (!childIds.includes(studentId)) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      
      const studentBadges = await storage.getStudentBadgesByStudent(studentId);
      
      // Enhance with badge details
      const badgesWithDetails = await Promise.all(
        studentBadges.map(async (sb) => {
          const badge = await storage.getBadge(sb.badgeId);
          return { ...sb, badge };
        })
      );
      
      res.json(badgesWithDetails);
    } catch (err) {
      console.error('Error fetching student badges:', err);
      res.status(500).json({ message: 'Server error while fetching student badges' });
    }
  });
  
  app.post('/api/student-badges', authenticateToken, authorizeRole(['teacher', 'director']), async (req: Request, res: Response) => {
    try {
      // Set the awarded by to the current user if not specified
      const awardData = {
        ...req.body,
        awardedBy: req.body.awardedBy || req.user.id,
        dateAwarded: req.body.dateAwarded || new Date().toISOString().split('T')[0]
      };
      
      const studentBadge = await storage.awardBadgeToStudent(awardData);
      res.status(201).json(studentBadge);
    } catch (err) {
      console.error('Error awarding badge:', err);
      res.status(500).json({ message: 'Server error while awarding badge' });
    }
  });
  
  // Admin routes
  app.get('/api/admin/stats', authenticateToken, authorizeRole(['admin', 'director']), async (req: Request, res: Response) => {
    try {
      // Get all users
      const allUsers = await Promise.all(
        Array.from({ length: 100 }, (_, i) => i + 1).map(async (id) => {
          return await storage.getUser(id);
        })
      ).then(users => users.filter(Boolean) as User[]);
      
      // Get all students
      const students = await Promise.all(
        Array.from({ length: 100 }, (_, i) => i + 1).map(async (id) => {
          return await storage.getStudent(id);
        })
      ).then(students => students.filter(Boolean) as Student[]);
      
      const teachers = allUsers.filter(user => user.role === 'teacher');
      const parents = allUsers.filter(user => user.role === 'parent');
      
      // Get all classes
      const classes = await storage.getAllClasses();
      
      // Get all reports
      const reports = await Promise.all(
        students.map(async (student) => {
          return await storage.getReportsByStudent(student.id);
        })
      ).then(results => results.flat());
      
      // Get reports from the last 7 days
      const today = new Date();
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      
      const recentReports = reports.filter(report => {
        const reportDate = new Date(report.date);
        return reportDate >= oneWeekAgo && reportDate <= today;
      });
      
      // Get mood statistics from reports
      const moodCounts = {
        amazing: 0,
        happy: 0,
        okay: 0,
        sad: 0,
        upset: 0
      };
      
      recentReports.forEach(report => {
        moodCounts[report.mood]++;
      });
      
      res.json({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents.length,
        totalClasses: classes.length,
        totalReports: reports.length,
        recentReportsCount: recentReports.length,
        moodCounts
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      res.status(500).json({ message: 'Server error while fetching admin statistics' });
    }
  });
  
  app.get('/api/admin/users', authenticateToken, authorizeRole(['admin', 'director']), async (req: Request, res: Response) => {
    try {
      // Get all users for admin management using our previous approach
      const users = await Promise.all(
        Array.from({ length: 100 }, (_, i) => i + 1).map(async (id) => {
          return await storage.getUser(id);
        })
      ).then(users => users.filter(Boolean) as User[]);
      
      // Filter out sensitive information
      const sanitizedUsers = users.map(user => {
        // Don't expose the password
        const { password, ...userData } = user;
        return userData;
      });
      
      res.json(sanitizedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ message: 'Server error while fetching users' });
    }
  });
  
  // Create an admin user route
  app.post('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req: Request, res: Response) => {
    try {
      // Validate user data
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        profileImage: `https://ui-avatars.com/api/?name=${validatedData.firstName}+${validatedData.lastName}`
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: err.errors });
      }
      
      console.error('Error creating user:', err);
      res.status(500).json({ message: 'Server error while creating user' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
