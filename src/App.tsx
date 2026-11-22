/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  AppScreen,
  AttendanceStatus,
  Batch,
  DemoRequest,
  FeeReceipt,
  Notice,
  Student,
  TestScore,
  WhatsAppLog,
} from './types';
import {
  INITIAL_BATCHES,
  INITIAL_NOTICES,
  INITIAL_RECEIPTS,
  INITIAL_STUDENTS,
  INITIAL_TEST_SCORES,
  INITIAL_WHATSAPP_LOGS,
} from './data/seedData';
import { Header } from './components/Header';
import { OverviewScreen } from './components/OverviewScreen';
import { OwnerScreen } from './components/OwnerScreen';
import { TeacherScreen } from './components/TeacherScreen';
import { StudentScreen } from './components/StudentScreen';
import { DemoModal } from './components/DemoModal';

const STORAGE_KEY = 'thelabwork_app_state_v1';

interface PersistedState {
  students: Student[];
  notices: Notice[];
  testScores: TestScore[];
  receipts: FeeReceipt[];
  whatsappLogs: WhatsAppLog[];
  demoRequests: DemoRequest[];
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (Array.isArray(parsed.students) && parsed.students.length > 0) {
        return {
          students: parsed.students,
          notices: Array.isArray(parsed.notices) ? parsed.notices : INITIAL_NOTICES,
          testScores: Array.isArray(parsed.testScores)
            ? parsed.testScores
            : INITIAL_TEST_SCORES,
          receipts: Array.isArray(parsed.receipts) ? parsed.receipts : INITIAL_RECEIPTS,
          whatsappLogs: Array.isArray(parsed.whatsappLogs)
            ? parsed.whatsappLogs
            : INITIAL_WHATSAPP_LOGS,
          demoRequests: Array.isArray(parsed.demoRequests) ? parsed.demoRequests : [],
        };
      }
    }
  } catch {
    // Ignore storage read errors and fall back to seed data
  }

  return {
    students: INITIAL_STUDENTS,
    notices: INITIAL_NOTICES,
    testScores: INITIAL_TEST_SCORES,
    receipts: INITIAL_RECEIPTS,
    whatsappLogs: INITIAL_WHATSAPP_LOGS,
    demoRequests: [],
  };
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('overview');
  const [batches] = useState<Batch[]>(INITIAL_BATCHES);
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const formatTimeNow = () =>
    new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDateNow = () =>
    new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const handleRecordPayment = (
    studentId: string,
    amount: number,
    mode: 'UPI' | 'Cash' | 'Bank Transfer'
  ): FeeReceipt => {
    const receiptNo = `TLW-2026-${String(422 + state.receipts.length).padStart(4, '0')}`;
    const newReceipt: FeeReceipt = {
      id: `rec-${Date.now()}`,
      receiptNo,
      studentId,
      amount,
      mode,
      paidAt: formatDateNow(),
    };

    setState((prev) => {
      const targetStudent = prev.students.find((s) => s.id === studentId);
      const nextStudents = prev.students.map((s) => {
        if (s.id !== studentId) return s;
        const nextPaid = Math.min(s.feeTotal, s.feePaid + amount);
        return {
          ...s,
          feePaid: nextPaid,
          dueDate: nextPaid >= s.feeTotal ? 'Paid in full' : s.dueDate,
        };
      });

      const waEntry: WhatsAppLog | null = targetStudent
        ? {
            id: `wa-${Date.now()}`,
            recipientName: `${targetStudent.parentName} (Parent of ${targetStudent.name.split(' ')[0]})`,
            parentPhone: targetStudent.parentPhone,
            messageType: 'Fee Receipt',
            summary: `Receipt ${receiptNo} for ₹${amount.toLocaleString('en-IN')} (${mode}) confirmed.`,
            sentAt: `Today, ${formatTimeNow()}`,
            costInr: 0.78,
          }
        : null;

      return {
        ...prev,
        students: nextStudents,
        receipts: [newReceipt, ...prev.receipts],
        whatsappLogs: waEntry ? [waEntry, ...prev.whatsappLogs] : prev.whatsappLogs,
      };
    });

    return newReceipt;
  };

  const handleSendFeeReminder = (student: Student) => {
    const pending = student.feeTotal - student.feePaid;
    const newLog: WhatsAppLog = {
      id: `wa-${Date.now()}`,
      recipientName: `${student.parentName} (Parent of ${student.name.split(' ')[0]})`,
      parentPhone: student.parentPhone,
      messageType: 'Fee Reminder',
      summary: `Friendly reminder: ₹${pending.toLocaleString('en-IN')} fee instalment due (${student.dueDate}). Pay via UPI link.`,
      sentAt: `Today, ${formatTimeNow()}`,
      costInr: 0.78,
    };

    setState((prev) => ({
      ...prev,
      whatsappLogs: [newLog, ...prev.whatsappLogs],
    }));
  };

  const handleAddStudent = (data: {
    name: string;
    batchId: string;
    parentName: string;
    parentPhone: string;
    feeTotal: number;
  }) => {
    const rollNo = `TLW-${101 + state.students.length}`;
    const newStu: Student = {
      id: `stu-${Date.now()}`,
      rollNo,
      name: data.name,
      batchId: data.batchId,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      feeTotal: data.feeTotal,
      feePaid: 0,
      dueDate: '30 Nov 2026',
      attendance: {},
    };

    setState((prev) => ({
      ...prev,
      students: [newStu, ...prev.students],
    }));
  };

  const handleSaveBatchAttendance = (
    batchId: string,
    dateISO: string,
    attendanceMap: Record<string, AttendanceStatus>,
    sendAlerts: boolean
  ) => {
    setState((prev) => {
      const batchObj = batches.find((b) => b.id === batchId);
      const nextStudents = prev.students.map((stu) => {
        if (stu.batchId !== batchId) return stu;
        const status = attendanceMap[stu.id];
        if (!status) return stu;
        return {
          ...stu,
          attendance: {
            ...stu.attendance,
            [dateISO]: status,
          },
        };
      });

      const newLogs: WhatsAppLog[] = [];
      if (sendAlerts) {
        prev.students
          .filter((stu) => stu.batchId === batchId && attendanceMap[stu.id] === 'absent')
          .forEach((stu, index) => {
            newLogs.push({
              id: `wa-${Date.now()}-${index}`,
              recipientName: `${stu.parentName} (Parent of ${stu.name.split(' ')[0]})`,
              parentPhone: stu.parentPhone,
              messageType: 'Absence Alert',
              summary: `${stu.name} was marked absent in ${batchObj?.name ?? 'class'} (${batchObj?.subject ?? ''}) today.`,
              sentAt: `Today, ${formatTimeNow()}`,
              costInr: 0.78,
            });
          });
      }

      return {
        ...prev,
        students: nextStudents,
        whatsappLogs: [...newLogs, ...prev.whatsappLogs],
      };
    });
  };

  const handlePublishNotice = (notice: Omit<Notice, 'id' | 'createdAt'>) => {
    const created: Notice = {
      ...notice,
      id: `not-${Date.now()}`,
      createdAt: `Today, ${formatTimeNow()}`,
    };

    setState((prev) => ({
      ...prev,
      notices: [created, ...prev.notices],
    }));
  };

  const handlePublishTestScores = (
    testName: string,
    subject: string,
    maxScore: number,
    scoresMap: Record<string, number>
  ) => {
    const todayFormatted = formatDateNow();
    const createdScores: TestScore[] = Object.entries(scoresMap).map(
      ([studentId, score], idx) => ({
        id: `ts-${Date.now()}-${idx}`,
        studentId,
        testName,
        subject,
        score,
        maxScore,
        date: todayFormatted,
      })
    );

    setState((prev) => ({
      ...prev,
      testScores: [...createdScores, ...prev.testScores],
    }));
  };

  const handleSubmitDemoRequest = (
    req: Omit<DemoRequest, 'id' | 'submittedAt'>
  ) => {
    const newReq: DemoRequest = {
      ...req,
      id: `demo-${Date.now()}`,
      submittedAt: `Today, ${formatTimeNow()}`,
    };
    setState((prev) => ({
      ...prev,
      demoRequests: [newReq, ...prev.demoRequests],
    }));
  };

  const handleResetDemoData = () => {
    const fresh: PersistedState = {
      students: INITIAL_STUDENTS,
      notices: INITIAL_NOTICES,
      testScores: INITIAL_TEST_SCORES,
      receipts: INITIAL_RECEIPTS,
      whatsappLogs: INITIAL_WHATSAPP_LOGS,
      demoRequests: [],
    };
    setState(fresh);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface overflow-x-clip sm:overflow-x-visible">
      <Header
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        onOpenDemoModal={() => setDemoModalOpen(true)}
      />

      <main className="flex-1 flex flex-col">
        {activeScreen === 'overview' && (
          <OverviewScreen
            students={state.students}
            batches={batches}
            notices={state.notices}
            onNavigate={(screen) => {
              setActiveScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenDemoModal={() => setDemoModalOpen(true)}
          />
        )}

        {activeScreen === 'owner' && (
          <OwnerScreen
            students={state.students}
            batches={batches}
            receipts={state.receipts}
            whatsappLogs={state.whatsappLogs}
            onRecordPayment={handleRecordPayment}
            onSendFeeReminder={handleSendFeeReminder}
            onAddStudent={handleAddStudent}
            onPublishNotice={handlePublishNotice}
          />
        )}

        {activeScreen === 'teacher' && (
          <TeacherScreen
            batches={batches}
            students={state.students}
            onSaveBatchAttendance={handleSaveBatchAttendance}
            onPublishNotice={handlePublishNotice}
            onPublishTestScores={handlePublishTestScores}
          />
        )}

        {activeScreen === 'student' && (
          <StudentScreen
            students={state.students}
            batches={batches}
            notices={state.notices}
            testScores={state.testScores}
            receipts={state.receipts}
            onPayPendingUpi={(studentId, amount) =>
              handleRecordPayment(studentId, amount, 'UPI')
            }
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-outline-variant mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-body text-[14px] text-on-surface-variant">
              © 2026 TheLabWork. Built for coaching centres in India.
            </p>
            <p className="font-body text-[12px] text-on-surface-variant">
              Meta&apos;s WhatsApp rates change from time to time. The rate shown in your monthly usage report is the rate you pay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-body text-[14px] text-on-surface-variant">
            <a
              href="mailto:thelabworkteam@gmail.com"
              className="hover:text-on-surface transition-colors"
            >
              Email
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="https://instagram.com/the.labwork"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-on-surface transition-colors"
            >
              Instagram
            </a>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                setActiveScreen('overview');
                setTimeout(() => {
                  document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' });
                }, 60);
              }}
              className="hover:text-on-surface transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="hover:text-on-surface transition-colors cursor-pointer"
            >
              Reset demo data
            </button>
          </div>
        </div>
      </footer>

      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSubmitRequest={handleSubmitDemoRequest}
      />
    </div>
  );
}
