import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  FileText,
  IndianRupee,
  X,
} from 'lucide-react';
import {
  Batch,
  FeeReceipt,
  Notice,
  Student,
  TestScore,
} from '../types';
import { getTodayISO } from '../data/seedData';

interface StudentScreenProps {
  students: Student[];
  batches: Batch[];
  notices: Notice[];
  testScores: TestScore[];
  receipts: FeeReceipt[];
  onPayPendingUpi: (studentId: string, amount: number) => FeeReceipt;
}

export const StudentScreen: React.FC<StudentScreenProps> = ({
  students,
  batches,
  notices,
  testScores,
  receipts,
  onPayPendingUpi,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id ?? 'stu-1'
  );
  const [activeReceipt, setActiveReceipt] = useState<FeeReceipt | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const student =
    students.find((s) => s.id === selectedStudentId) ?? students[0];
  const batch = batches.find((b) => b.id === student?.batchId);
  const today = getTodayISO();

  const attendanceEntries = useMemo(() => {
    if (!student) return [];
    return Object.entries(student.attendance)
      .sort(([dateA], [dateB]) => (dateA < dateB ? 1 : -1))
      .slice(0, 14);
  }, [student]);

  const attendanceStats = useMemo(() => {
    const total = attendanceEntries.length;
    const present = attendanceEntries.filter(([, st]) => st === 'present').length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 100;
    return { total, present, pct };
  }, [attendanceEntries]);

  const studentNotices = useMemo(() => {
    if (!student) return [];
    return notices.filter(
      (n) => n.batchId === 'all' || n.batchId === student.batchId
    );
  }, [notices, student]);

  const studentScores = useMemo(() => {
    if (!student) return [];
    return testScores.filter((t) => t.studentId === student.id);
  }, [testScores, student]);

  const studentReceipts = useMemo(() => {
    if (!student) return [];
    return receipts.filter((r) => r.studentId === student.id);
  }, [receipts, student]);

  if (!student) return null;

  const pendingAmount = student.feeTotal - student.feePaid;
  const todayStatus = student.attendance[today];
  const latestScore = studentScores[0];

  const handleUpiPayment = () => {
    if (pendingAmount <= 0) return;
    const rec = onPayPendingUpi(student.id, pendingAmount);
    setActiveReceipt(rec);
    setPaymentSuccessMsg(
      `Paid ₹${pendingAmount.toLocaleString('en-IN')} via UPI. Receipt ${rec.receiptNo} issued.`
    );
    setTimeout(() => {
      setPaymentSuccessMsg(null);
    }, 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-12 flex-1 flex flex-col gap-6 sm:gap-8">
      {/* Header & Student Login Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-5 sm:pb-6">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-px bg-on-surface shrink-0" aria-hidden="true" />
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-amber-ink">
              Student &amp; Parent App · Personal View
            </span>
          </div>
          <h1 className="font-headline text-[30px] leading-[36px] sm:text-[34px] sm:leading-[40px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface">
            {student.name}
          </h1>
          <p className="font-body text-[14px] text-on-surface-variant tabular-nums">
            {student.rollNo} · {batch?.name} ({batch?.subject}) · Parent: {student.parentName}
          </p>
        </div>

        <label className="flex flex-col gap-1 w-full md:w-auto min-w-0 shrink-0">
          <span className="font-label text-[12px] font-medium text-on-surface-variant">
            Switch logged-in student
          </span>
          <select
            value={student.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full md:w-auto max-w-full rounded-full border border-outline-variant bg-surface-container-low px-4 py-2.5 font-label text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary cursor-pointer"
          >
            {students.map((s) => {
              const due = s.feeTotal - s.feePaid;
              return (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNo}) {due > 0 ? `· ₹${due.toLocaleString('en-IN')} due` : ''}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      {paymentSuccessMsg && (
        <div
          role="status"
          className="rounded-xl border border-outline-variant bg-primary text-on-primary px-4 sm:px-5 py-3 flex items-center gap-2.5 text-[14px]"
        >
          <CheckCircle2 className="w-4 h-4 text-brand-amber shrink-0" aria-hidden="true" />
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {/* 4-Column Student Summary Strip */}
      <section className="rounded-[18px] border border-outline-variant bg-surface-container-low shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 sm:p-6 flex flex-col gap-1 border-b sm:border-r lg:border-b-0 border-outline-variant">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-on-surface-variant">
              Attendance Rate
            </span>
            <p className="font-headline text-[30px] sm:text-[34px] leading-[36px] sm:leading-[40px] text-on-surface tabular-nums">
              {attendanceStats.pct}%
            </p>
            <span className="font-body text-[13px] text-on-surface-variant tabular-nums">
              {attendanceStats.present} of {attendanceStats.total} classes attended
            </span>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-1 border-b lg:border-b-0 lg:border-r border-outline-variant">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-on-surface-variant">
              Today&apos;s Roll Call
            </span>
            <p
              className={`font-headline text-[30px] sm:text-[34px] leading-[36px] sm:leading-[40px] ${
                todayStatus === 'absent' ? 'text-brand-amber-large' : 'text-on-surface'
              }`}
            >
              {todayStatus === 'absent' ? 'Absent' : 'Present'}
            </p>
            <span className="font-body text-[13px] text-on-surface-variant">
              {todayStatus === 'absent'
                ? 'WhatsApp alert sent to parent'
                : `${batch?.timing ?? 'Scheduled batch'}`}
            </span>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-outline-variant">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-brand-amber-ink">
              Pending Fees
            </span>
            <p
              className={`font-headline text-[30px] sm:text-[34px] leading-[36px] sm:leading-[40px] tabular-nums ${
                pendingAmount > 0 ? 'text-brand-amber-large' : 'text-on-surface'
              }`}
            >
              ₹{pendingAmount.toLocaleString('en-IN')}
            </p>
            <span className="font-body text-[13px] text-on-surface-variant">
              {pendingAmount > 0 ? `Due ${student.dueDate}` : 'All instalments paid'}
            </span>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-1">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-on-surface-variant">
              Latest Test Score
            </span>
            <p className="font-headline text-[30px] sm:text-[34px] leading-[36px] sm:leading-[40px] text-on-surface tabular-nums">
              {latestScore ? `${latestScore.score}/${latestScore.maxScore}` : '—'}
            </p>
            <span className="font-body text-[13px] text-on-surface-variant truncate">
              {latestScore ? latestScore.testName : 'No tests graded yet'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Attendance Log + Fee Receipts */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Fees & UPI Payment Card */}
          <section className="rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-4">
              <div className="min-w-0">
                <h2 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px] text-on-surface">
                  Fees &amp; Receipts
                </h2>
                <p className="font-body text-[14px] text-on-surface-variant tabular-nums">
                  Paid ₹{student.feePaid.toLocaleString('en-IN')} of ₹
                  {student.feeTotal.toLocaleString('en-IN')}
                </p>
              </div>
              {pendingAmount > 0 ? (
                <button
                  type="button"
                  onClick={handleUpiPayment}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-primary text-on-primary px-5 py-2.5 font-label text-[13px] font-medium hover:bg-primary-hover transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <IndianRupee className="w-3.5 h-3.5 text-brand-amber shrink-0" aria-hidden="true" />
                  <span>Pay ₹{pendingAmount.toLocaleString('en-IN')} via UPI</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-label text-[13px] font-medium text-on-surface shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-on-surface shrink-0" aria-hidden="true" />
                  Settled
                </span>
              )}
            </div>

            {studentReceipts.length > 0 ? (
              <div className="divide-y divide-outline-variant">
                {studentReceipts.map((rec) => (
                  <div
                    key={rec.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="block font-mono text-[13px] font-medium text-on-surface tabular-nums truncate">
                        {rec.receiptNo}
                      </span>
                      <span className="font-body text-[12px] text-on-surface-variant">
                        {rec.paidAt} · {rec.mode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[14px] font-semibold text-on-surface tabular-nums">
                        ₹{rec.amount.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(rec)}
                        className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-white px-3 py-1.5 font-label text-[12px] text-on-surface hover:border-primary whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <FileText className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-[14px] text-on-surface-variant">
                No receipts recorded yet for this term.
              </p>
            )}
          </section>

          {/* 14-Day Attendance Log */}
          <section className="rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-4">
              <h2 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px] text-on-surface">
                Recent Attendance
              </h2>
              <span className="font-mono text-[12px] text-on-surface-variant tabular-nums shrink-0">
                Last {attendanceEntries.length} sessions
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {attendanceEntries.map(([dateStr, status]) => {
                const isAbsent = status === 'absent';
                const formatted = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                });
                return (
                  <div
                    key={dateStr}
                    className={`rounded-xl border p-3 flex flex-col gap-1 ${
                      isAbsent
                        ? 'border-brand-amber-large bg-surface-container'
                        : 'border-outline-variant bg-white'
                    }`}
                  >
                    <span className="font-mono text-[12px] text-on-surface-variant tabular-nums">
                      {formatted}
                    </span>
                    <span
                      className={`font-label text-[13px] font-semibold ${
                        isAbsent ? 'text-brand-amber-ink' : 'text-on-surface'
                      }`}
                    >
                      {isAbsent ? 'Absent' : 'Present'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Notices + Weekly Test Scores */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Batch Circulars & Notices */}
          <section className="rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-4">
              <div className="flex items-center gap-2 min-w-0">
                <Bell className="w-4 h-4 text-brand-amber-ink shrink-0" aria-hidden="true" />
                <h2 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px] text-on-surface">
                  Class Notices &amp; Circulars
                </h2>
              </div>
              <span className="font-mono text-[12px] text-on-surface-variant tabular-nums shrink-0">
                {studentNotices.length} updates
              </span>
            </div>

            <div className="divide-y divide-outline-variant">
              {studentNotices.map((notice) => (
                <article key={notice.id} className="py-4 first:pt-1 last:pb-1 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <span className="font-label font-semibold uppercase tracking-[0.8px] text-brand-amber-ink min-w-0">
                      {notice.category} · {notice.authorRole}
                    </span>
                    <span className="font-mono text-on-surface-variant shrink-0">
                      {notice.createdAt}
                    </span>
                  </div>
                  <h3 className="font-headline text-[20px] sm:text-[21px] leading-[26px] sm:leading-[27px] text-on-surface">
                    {notice.title}
                  </h3>
                  <p className="font-body text-[14px] leading-[22px] text-on-surface-variant text-pretty">
                    {notice.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Weekly Test Scores */}
          <section className="rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant pb-4">
              <h2 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px] text-on-surface">
                Weekly Test Scores
              </h2>
              <span className="font-mono text-[12px] text-on-surface-variant tabular-nums shrink-0">
                {studentScores.length} tests
              </span>
            </div>

            {studentScores.length > 0 ? (
              <div className="divide-y divide-outline-variant">
                {studentScores.map((ts) => {
                  const pct = Math.round((ts.score / ts.maxScore) * 100);
                  return (
                    <div
                      key={ts.id}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-body text-[15px] font-medium text-on-surface truncate">
                          {ts.testName}
                        </span>
                        <span className="font-body text-[12px] text-on-surface-variant">
                          {ts.subject} · {ts.date}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-headline text-[22px] text-on-surface tabular-nums">
                          {ts.score}
                          <span className="text-[15px] text-on-surface-variant">
                            /{ts.maxScore}
                          </span>
                        </span>
                        <span className="block font-mono text-[11px] text-brand-amber-ink tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-body text-[14px] text-on-surface-variant">
                No test scores published for {student.name} yet.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {activeReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[18px] bg-surface-container-low border border-outline-variant p-5 sm:p-7 shadow-xl relative">
            <button
              type="button"
              onClick={() => setActiveReceipt(null)}
              aria-label="Close receipt modal"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-5">
              <div className="border-b border-outline-variant pb-4 pr-10">
                <span className="font-label text-[11px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                  Official Fee Receipt
                </span>
                <h3 className="font-headline text-[24px] sm:text-[28px] leading-[30px] sm:leading-[34px] text-on-surface">
                  TheLabWork Academy
                </h3>
                <p className="font-mono text-[13px] text-on-surface-variant tabular-nums">
                  {activeReceipt.receiptNo} · {activeReceipt.paidAt}
                </p>
              </div>

              <div className="flex flex-col gap-2.5 text-[14px]">
                <div className="flex justify-between gap-3">
                  <span className="text-on-surface-variant shrink-0">Student</span>
                  <span className="font-medium text-on-surface text-right">{student.name}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-on-surface-variant shrink-0">Roll No</span>
                  <span className="font-mono text-on-surface tabular-nums text-right">
                    {student.rollNo}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-on-surface-variant shrink-0">Payment Mode</span>
                  <span className="font-medium text-on-surface text-right">
                    {activeReceipt.mode}
                  </span>
                </div>
                <div className="flex justify-between gap-3 pt-3 border-t border-outline-variant items-baseline">
                  <span className="font-medium text-on-surface shrink-0">Amount Paid</span>
                  <span className="font-headline text-[28px] sm:text-[30px] text-brand-amber-large tabular-nums">
                    ₹{activeReceipt.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-full bg-primary text-on-primary py-2.5 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Print / Save PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
