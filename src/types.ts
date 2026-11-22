export type AppScreen = 'overview' | 'owner' | 'teacher' | 'student';

export type AttendanceStatus = 'present' | 'absent';

export interface Batch {
  id: string;
  name: string;
  subject: string;
  timing: string;
  room: string;
  teacherName: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  batchId: string;
  parentName: string;
  parentPhone: string;
  feeTotal: number;
  feePaid: number;
  dueDate: string;
  attendance: Record<string, AttendanceStatus>;
}

export interface Notice {
  id: string;
  title: string;
  batchId: string; // 'all' or specific batchId
  body: string;
  authorRole: 'Owner' | 'Teacher';
  createdAt: string;
  category: 'Notice' | 'Test Update' | 'Timetable';
}

export interface TestScore {
  id: string;
  studentId: string;
  testName: string;
  subject: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface WhatsAppLog {
  id: string;
  recipientName: string;
  parentPhone: string;
  messageType: 'Absence Alert' | 'Fee Reminder' | 'Notice' | 'Fee Receipt';
  summary: string;
  sentAt: string;
  costInr: number;
}

export interface FeeReceipt {
  id: string;
  receiptNo: string;
  studentId: string;
  amount: number;
  mode: 'UPI' | 'Cash' | 'Bank Transfer';
  paidAt: string;
}

export interface DemoRequest {
  id: string;
  centreName: string;
  ownerName: string;
  phone: string;
  city: string;
  studentCount: string;
  submittedAt: string;
}
