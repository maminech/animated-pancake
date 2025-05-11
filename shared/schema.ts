import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["parent", "teacher", "director", "admin"] }).notNull(),
  profileImage: text("profile_image"),
  theme: text("theme", { enum: ["light", "dark", "system"] }).default("system"),
  lastActive: timestamp("last_active"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Class model
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  teacherId: integer("teacher_id").references(() => users.id),
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

// Student model
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  profileImage: text("profile_image"),
  parentId: integer("parent_id").references(() => users.id),
  classId: integer("class_id").references(() => classes.id),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

// Attendance model
export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  date: text("date").notNull(),
  status: text("status", { enum: ["present", "absent", "late"] }).notNull(),
  notes: text("notes"),
});

export const insertAttendanceSchema = createInsertSchema(attendances).omit({
  id: true,
});

// Report model
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  date: text("date").notNull(),
  mood: text("mood", { enum: ["amazing", "happy", "okay", "sad", "upset"] }).notNull(),
  activities: json("activities"),
  notes: text("notes"),
  achievements: json("achievements"),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
});

// Activity model for tracking daily activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  classId: integer("class_id").references(() => classes.id),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Milestone model
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  category: text("category", { 
    enum: ["academic", "behavioral", "physical", "social", "creative"] 
  }).notNull(),
  completed: boolean("completed").default(false),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
});

// Achievement badges model
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category", { 
    enum: ["academic", "behavioral", "attendance", "special"] 
  }).notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});

// Student badges (earned badges)
export const studentBadges = pgTable("student_badges", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  badgeId: integer("badge_id")
    .notNull()
    .references(() => badges.id),
  dateAwarded: text("date_awarded").notNull(),
  awardedBy: integer("awarded_by")
    .notNull()
    .references(() => users.id),
});

export const insertStudentBadgeSchema = createInsertSchema(studentBadges).omit({
  id: true,
});

// Homework system
export const homeworks = pgTable("homeworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  dueDate: text("due_date").notNull(),
  assignedDate: text("assigned_date").notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium"),
  subject: text("subject").notNull(),
  attachments: json("attachments"),
  maxPoints: integer("max_points").default(100),
});

export const insertHomeworkSchema = createInsertSchema(homeworks).omit({
  id: true,
});

// Student homework submissions
export const homeworkSubmissions = pgTable("homework_submissions", {
  id: serial("id").primaryKey(),
  homeworkId: integer("homework_id").references(() => homeworks.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  submissionDate: timestamp("submission_date").defaultNow(),
  status: text("status", { 
    enum: ["not_started", "in_progress", "submitted", "graded"] 
  }).default("not_started"),
  attachments: json("attachments"),
  feedback: text("feedback"),
  score: integer("score"),
  isLate: boolean("is_late").default(false),
});

export const insertHomeworkSubmissionSchema = createInsertSchema(homeworkSubmissions).omit({
  id: true,
});

// Messaging system
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true
});

// Participants in conversations
export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadMessageId: integer("last_read_message_id"),
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).omit({
  id: true,
  joinedAt: true,
});

// Messages in conversations
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  attachments: json("attachments"),
  isRead: boolean("is_read").default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
  isRead: true,
});

// Student development roadmap
export const roadmapTemplates = pgTable("roadmap_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ageGroup: text("age_group").notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRoadmapTemplateSchema = createInsertSchema(roadmapTemplates).omit({
  id: true,
  createdAt: true,
});

// Roadmap milestones in templates
export const roadmapStages = pgTable("roadmap_stages", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => roadmapTemplates.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  expectedDuration: integer("expected_duration"), // in days
  skillCategory: text("skill_category", {
    enum: ["cognitive", "physical", "social", "emotional", "language", "creativity"]
  }).notNull(),
});

export const insertRoadmapStageSchema = createInsertSchema(roadmapStages).omit({
  id: true,
});

// Student specific roadmaps
export const studentRoadmaps = pgTable("student_roadmaps", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  templateId: integer("template_id").references(() => roadmapTemplates.id).notNull(),
  startDate: timestamp("start_date").defaultNow(),
  currentStageId: integer("current_stage_id").references(() => roadmapStages.id),
  teacherNotes: text("teacher_notes"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertStudentRoadmapSchema = createInsertSchema(studentRoadmaps).omit({
  id: true,
  startDate: true,
  lastUpdated: true,
});

// Student progress on roadmap stages
export const stageProgress = pgTable("stage_progress", {
  id: serial("id").primaryKey(),
  studentRoadmapId: integer("student_roadmap_id").references(() => studentRoadmaps.id).notNull(),
  stageId: integer("stage_id").references(() => roadmapStages.id).notNull(),
  status: text("status", {
    enum: ["not_started", "in_progress", "completed", "needs_review"]
  }).default("not_started"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  teacherFeedback: text("teacher_feedback"),
  evidence: json("evidence"), // links to photos, videos, notes
});

export const insertStageProgressSchema = createInsertSchema(stageProgress).omit({
  id: true,
});

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", {
    enum: ["message", "homework", "attendance", "milestone", "badge", "system", "report"]
  }).notNull(),
  referenceId: integer("reference_id"), // ID of the related entity
  referenceType: text("reference_type"), // Type of the related entity
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Define types for all tables
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type StudentBadge = typeof studentBadges.$inferSelect;
export type InsertStudentBadge = z.infer<typeof insertStudentBadgeSchema>;

export type Homework = typeof homeworks.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;

export type HomeworkSubmission = typeof homeworkSubmissions.$inferSelect;
export type InsertHomeworkSubmission = z.infer<typeof insertHomeworkSubmissionSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type RoadmapTemplate = typeof roadmapTemplates.$inferSelect;
export type InsertRoadmapTemplate = z.infer<typeof insertRoadmapTemplateSchema>;

export type RoadmapStage = typeof roadmapStages.$inferSelect;
export type InsertRoadmapStage = z.infer<typeof insertRoadmapStageSchema>;

export type StudentRoadmap = typeof studentRoadmaps.$inferSelect;
export type InsertStudentRoadmap = z.infer<typeof insertStudentRoadmapSchema>;

export type StageProgress = typeof stageProgress.$inferSelect;
export type InsertStageProgress = z.infer<typeof insertStageProgressSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students, { relationName: "parentStudents" }),
  classes: many(classes),
  reports: many(reports),
  milestones: many(milestones),
  studentBadgesAwarded: many(studentBadges, { relationName: "badgeAwarder" }),
  homeworks: many(homeworks),
  sentMessages: many(messages, { relationName: "sender" }),
  conversations: many(conversationParticipants, { relationName: "participant" }),
  notifications: many(notifications),
  roadmapTemplates: many(roadmapTemplates, { relationName: "creator" }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(users, {
    fields: [students.parentId],
    references: [users.id],
    relationName: "parentStudents"
  }),
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id]
  }),
  attendances: many(attendances),
  reports: many(reports),
  milestones: many(milestones),
  badges: many(studentBadges),
  homeworkSubmissions: many(homeworkSubmissions),
  roadmaps: many(studentRoadmaps)
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id]
  }),
  students: many(students),
  activities: many(activities),
  homeworks: many(homeworks)
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  student: one(students, {
    fields: [attendances.studentId],
    references: [students.id]
  })
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  student: one(students, {
    fields: [reports.studentId],
    references: [students.id]
  }),
  teacher: one(users, {
    fields: [reports.teacherId],
    references: [users.id]
  })
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  class: one(classes, {
    fields: [activities.classId],
    references: [classes.id]
  })
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  student: one(students, {
    fields: [milestones.studentId],
    references: [students.id]
  }),
  teacher: one(users, {
    fields: [milestones.teacherId],
    references: [users.id]
  })
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  studentBadges: many(studentBadges)
}));

export const studentBadgesRelations = relations(studentBadges, ({ one }) => ({
  student: one(students, {
    fields: [studentBadges.studentId],
    references: [students.id]
  }),
  badge: one(badges, {
    fields: [studentBadges.badgeId],
    references: [badges.id]
  }),
  awardedBy: one(users, {
    fields: [studentBadges.awardedBy],
    references: [users.id],
    relationName: "badgeAwarder"
  })
}));

export const homeworksRelations = relations(homeworks, ({ one, many }) => ({
  class: one(classes, {
    fields: [homeworks.classId],
    references: [classes.id]
  }),
  teacher: one(users, {
    fields: [homeworks.teacherId],
    references: [users.id]
  }),
  submissions: many(homeworkSubmissions)
}));

export const homeworkSubmissionsRelations = relations(homeworkSubmissions, ({ one }) => ({
  homework: one(homeworks, {
    fields: [homeworkSubmissions.homeworkId],
    references: [homeworks.id]
  }),
  student: one(students, {
    fields: [homeworkSubmissions.studentId],
    references: [students.id]
  })
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages)
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id]
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
    relationName: "participant"
  })
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender"
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

export const roadmapTemplatesRelations = relations(roadmapTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [roadmapTemplates.createdById],
    references: [users.id],
    relationName: "creator"
  }),
  stages: many(roadmapStages),
  studentRoadmaps: many(studentRoadmaps)
}));

export const roadmapStagesRelations = relations(roadmapStages, ({ one, many }) => ({
  template: one(roadmapTemplates, {
    fields: [roadmapStages.templateId],
    references: [roadmapTemplates.id]
  }),
  progress: many(stageProgress)
}));

export const studentRoadmapsRelations = relations(studentRoadmaps, ({ one, many }) => ({
  student: one(students, {
    fields: [studentRoadmaps.studentId],
    references: [students.id]
  }),
  template: one(roadmapTemplates, {
    fields: [studentRoadmaps.templateId],
    references: [roadmapTemplates.id]
  }),
  currentStage: one(roadmapStages, {
    fields: [studentRoadmaps.currentStageId],
    references: [roadmapStages.id]
  }),
  stageProgress: many(stageProgress)
}));

export const stageProgressRelations = relations(stageProgress, ({ one }) => ({
  studentRoadmap: one(studentRoadmaps, {
    fields: [stageProgress.studentRoadmapId],
    references: [studentRoadmaps.id]
  }),
  stage: one(roadmapStages, {
    fields: [stageProgress.stageId],
    references: [roadmapStages.id]
  })
}));