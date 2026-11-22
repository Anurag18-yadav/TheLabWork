import {
  Batch,
  FeeReceipt,
  Notice,
  Student,
  TestScore,
  WhatsAppLog,
} from '../types';

export const getTodayISO = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getPastDateISO = (daysAgo: number): string => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const makeAttendanceHistory = (
  absentOffsets: number[],
  todayStatus?: 'present' | 'absent'
): Record<string, 'present' | 'absent'> => {
  const record: Record<string, 'present' | 'absent'> = {};
  for (let i = 13; i >= 1; i -= 1) {
    const iso = getPastDateISO(i);
    record[iso] = absentOffsets.includes(i) ? 'absent' : 'present';
  }
  if (todayStatus) {
    record[getTodayISO()] = todayStatus;
  }
  return record;
};

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'batch-a',
    name: 'Batch A',
    subject: 'Class 12 Physics',
    timing: '04:00 PM – 05:30 PM',
    room: 'Hall 1',
    teacherName: 'Prof. Arvind Kulkarni',
  },
  {
    id: 'batch-b',
    name: 'Batch B',
    subject: 'JEE Foundation Maths',
    timing: '05:45 PM – 07:15 PM',
    room: 'Hall 2',
    teacherName: 'Ms. Sunita Deshmukh',
  },
  {
    id: 'batch-c',
    name: 'Batch C',
    subject: 'Class 10 Science',
    timing: '07:15 AM – 08:30 AM',
    room: 'Hall 1',
    teacherName: 'Prof. Arvind Kulkarni',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    rollNo: 'TLW-101',
    name: 'Aarav Sharma',
    batchId: 'batch-a',
    parentName: 'Rajesh Sharma',
    parentPhone: '+91 98201 44120',
    feeTotal: 18000,
    feePaid: 18000,
    dueDate: 'Paid in full',
    attendance: makeAttendanceHistory([6], 'present'),
  },
  {
    id: 'stu-2',
    rollNo: 'TLW-102',
    name: 'Priya Verma',
    batchId: 'batch-a',
    parentName: 'Meera Verma',
    parentPhone: '+91 98190 33218',
    feeTotal: 18000,
    feePaid: 18000,
    dueDate: 'Paid in full',
    attendance: makeAttendanceHistory([], 'present'),
  },
  {
    id: 'stu-3',
    rollNo: 'TLW-103',
    name: 'Rohan Mehta',
    batchId: 'batch-a',
    parentName: 'Sanjay Mehta',
    parentPhone: '+91 97654 12890',
    feeTotal: 18000,
    feePaid: 12000,
    dueDate: '25 Nov 2026',
    attendance: makeAttendanceHistory([2, 9], 'absent'),
  },
  {
    id: 'stu-4',
    rollNo: 'TLW-104',
    name: 'Kavya Iyer',
    batchId: 'batch-a',
    parentName: 'Subramanian Iyer',
    parentPhone: '+91 98450 77812',
    feeTotal: 18000,
    feePaid: 18000,
    dueDate: 'Paid in full',
    attendance: makeAttendanceHistory([11], 'present'),
  },
  {
    id: 'stu-5',
    rollNo: 'TLW-105',
    name: 'Neha Gupta',
    batchId: 'batch-b',
    parentName: 'Alok Gupta',
    parentPhone: '+91 99102 65432',
    feeTotal: 22000,
    feePaid: 11000,
    dueDate: '18 Nov 2026',
    attendance: makeAttendanceHistory([3, 7], 'present'),
  },
  {
    id: 'stu-6',
    rollNo: 'TLW-106',
    name: 'Vikram Singh',
    batchId: 'batch-b',
    parentName: 'Harpreet Singh',
    parentPhone: '+91 98114 50981',
    feeTotal: 22000,
    feePaid: 14500,
    dueDate: '20 Nov 2026',
    attendance: makeAttendanceHistory([4], 'present'),
  },
  {
    id: 'stu-7',
    rollNo: 'TLW-107',
    name: 'Ananya Joshi',
    batchId: 'batch-b',
    parentName: 'Deepak Joshi',
    parentPhone: '+91 98220 88341',
    feeTotal: 22000,
    feePaid: 22000,
    dueDate: 'Paid in full',
    attendance: makeAttendanceHistory([], 'present'),
  },
  {
    id: 'stu-8',
    rollNo: 'TLW-108',
    name: 'Siddharth Nair',
    batchId: 'batch-c',
    parentName: 'Ramesh Nair',
    parentPhone: '+91 98470 11294',
    feeTotal: 14000,
    feePaid: 7000,
    dueDate: '28 Nov 2026',
    attendance: makeAttendanceHistory([1, 8], 'present'),
  },
  {
    id: 'stu-9',
    rollNo: 'TLW-109',
    name: 'Ishita Patel',
    batchId: 'batch-c',
    parentName: 'Kiran Patel',
    parentPhone: '+91 98250 94012',
    feeTotal: 14000,
    feePaid: 14000,
    dueDate: 'Paid in full',
    attendance: makeAttendanceHistory([5], 'present'),
  },
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: 'Weekly Test Results Published',
    batchId: 'batch-a',
    body: 'Electrostatics & Current Electricity weekly test scores are live. Please review your marks and collect evaluated sheets in tomorrow’s class.',
    authorRole: 'Teacher',
    createdAt: 'Today, 10:15 AM',
    category: 'Test Update',
  },
  {
    id: 'not-2',
    title: 'Extra Doubt Session — Saturday Morning',
    batchId: 'batch-b',
    body: 'Batch B students have an optional Calculus problem-solving session this Saturday from 09:00 AM to 10:30 AM in Hall 2.',
    authorRole: 'Teacher',
    createdAt: 'Yesterday, 06:40 PM',
    category: 'Timetable',
  },
  {
    id: 'not-3',
    title: 'Term-2 Instalment Window Closing Soon',
    batchId: 'all',
    body: 'Parents with pending Term-2 fee instalments can pay directly via UPI or at the centre desk before the 28th to receive instant WhatsApp receipts.',
    authorRole: 'Owner',
    createdAt: '2 days ago',
    category: 'Notice',
  },
];

export const INITIAL_TEST_SCORES: TestScore[] = [
  {
    id: 'ts-1',
    studentId: 'stu-1',
    testName: 'Weekly Physics Test #08',
    subject: 'Class 12 Physics',
    score: 46,
    maxScore: 50,
    date: '19 Nov 2026',
  },
  {
    id: 'ts-2',
    studentId: 'stu-2',
    testName: 'Weekly Physics Test #08',
    subject: 'Class 12 Physics',
    score: 48,
    maxScore: 50,
    date: '19 Nov 2026',
  },
  {
    id: 'ts-3',
    studentId: 'stu-3',
    testName: 'Weekly Physics Test #08',
    subject: 'Class 12 Physics',
    score: 38,
    maxScore: 50,
    date: '19 Nov 2026',
  },
  {
    id: 'ts-4',
    studentId: 'stu-4',
    testName: 'Weekly Physics Test #08',
    subject: 'Class 12 Physics',
    score: 44,
    maxScore: 50,
    date: '19 Nov 2026',
  },
  {
    id: 'ts-5',
    studentId: 'stu-5',
    testName: 'JEE Algebra Mock #04',
    subject: 'JEE Foundation Maths',
    score: 78,
    maxScore: 100,
    date: '17 Nov 2026',
  },
  {
    id: 'ts-6',
    studentId: 'stu-6',
    testName: 'JEE Algebra Mock #04',
    subject: 'JEE Foundation Maths',
    score: 84,
    maxScore: 100,
    date: '17 Nov 2026',
  },
];

export const INITIAL_RECEIPTS: FeeReceipt[] = [
  {
    id: 'rec-1',
    receiptNo: 'TLW-2026-0418',
    studentId: 'stu-1',
    amount: 9000,
    mode: 'UPI',
    paidAt: '05 Nov 2026',
  },
  {
    id: 'rec-2',
    receiptNo: 'TLW-2026-0419',
    studentId: 'stu-2',
    amount: 9000,
    mode: 'UPI',
    paidAt: '06 Nov 2026',
  },
  {
    id: 'rec-3',
    receiptNo: 'TLW-2026-0420',
    studentId: 'stu-3',
    amount: 6000,
    mode: 'Cash',
    paidAt: '09 Nov 2026',
  },
  {
    id: 'rec-4',
    receiptNo: 'TLW-2026-0421',
    studentId: 'stu-5',
    amount: 11000,
    mode: 'Bank Transfer',
    paidAt: '12 Nov 2026',
  },
];

export const INITIAL_WHATSAPP_LOGS: WhatsAppLog[] = [
  {
    id: 'wa-1',
    recipientName: 'Sanjay Mehta (Parent of Rohan)',
    parentPhone: '+91 97654 12890',
    messageType: 'Absence Alert',
    summary: 'Rohan Mehta was marked absent in Batch A (04:00 PM Physics) today.',
    sentAt: 'Today, 04:08 PM',
    costInr: 0.78,
  },
  {
    id: 'wa-2',
    recipientName: 'Alok Gupta (Parent of Neha)',
    parentPhone: '+91 99102 65432',
    messageType: 'Fee Reminder',
    summary: 'Friendly reminder: ₹11,000 Term-2 instalment due for Neha Gupta.',
    sentAt: 'Yesterday, 11:30 AM',
    costInr: 0.78,
  },
  {
    id: 'wa-3',
    recipientName: 'Rajesh Sharma (Parent of Aarav)',
    parentPhone: '+91 98201 44120',
    messageType: 'Fee Receipt',
    summary: 'Receipt TLW-2026-0418 for ₹9,000 (UPI) confirmed.',
    sentAt: '05 Nov 2026',
    costInr: 0.78,
  },
];
