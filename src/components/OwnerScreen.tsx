import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Send,
  UserPlus,
  X,
} from 'lucide-react';
import {
  Batch,
  FeeReceipt,
  Notice,
  Student,
  WhatsAppLog,
} from '../types';
import { getTodayISO } from '../data/seedData';

interface OwnerScreenProps {
  students: Student[];
  batches: Batch[];
  receipts: FeeReceipt[];
  whatsappLogs: WhatsAppLog[];
  onRecordPayment: (
    studentId: string,
    amount: number,
    mode: 'UPI' | 'Cash' | 'Bank Transfer'
  ) => FeeReceipt;
  onSendFeeReminder: (student: Student) => void;
  onAddStudent: (data: {
    name: string;
    batchId: string;
    parentName: string;
    parentPhone: string;
    feeTotal: number;
  }) => void;
  onPublishNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
}

type OwnerTab = 'fees' | 'directory' | 'whatsapp' | 'receipts';
type FeeFilter = 'all' | 'pending' | 'paid';

export const OwnerScreen: React.FC<OwnerScreenProps> = ({
  students,
  batches,
  receipts,
  whatsappLogs,
  onRecordPayment,
  onSendFeeReminder,
  onAddStudent,
  onPublishNotice,
}) => {
  const [activeTab, setActiveTab] = useState<OwnerTab>('fees');
  const [feeFilter, setFeeFilter] = useState<FeeFilter>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment Drawer / Modal state
  const [payingStudent, setPayingStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [paymentError, setPaymentError] = useState('');

  // Add Student Modal state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStuName, setNewStuName] = useState('');
  const [newStuBatch, setNewStuBatch] = useState(batches[0]?.id ?? 'batch-a');
  const [newStuParent, setNewStuParent] = useState('');
  const [newStuPhone, setNewStuPhone] = useState('');
  const [newStuFee, setNewStuFee] = useState('18000');
  const [addStuError, setAddStuError] = useState('');

  // Publish Notice Modal state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBatch, setNoticeBatch] = useState('all');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticeError, setNoticeError] = useState('');

  // Receipt Preview Modal
  const [activeReceipt, setActiveReceipt] = useState<FeeReceipt | null>(null);

  // WhatsApp Estimator
  const [estStudents, setEstStudents] = useState(150);

  const today = getTodayISO();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const metrics = useMemo(() => {
    const totalCollected = students.reduce((sum, s) => sum + s.feePaid, 0);
    const totalExpected = students.reduce((sum, s) => sum + s.feeTotal, 0);
    const totalPending = totalExpected - totalCollected;
    const pendingCount = students.filter((s) => s.feeTotal > s.feePaid).length;

    const markedToday = students.filter((s) => Boolean(s.attendance[today]));
    const presentToday = markedToday.filter((s) => s.attendance[today] === 'present');
    const attendanceRate =
      markedToday.length > 0
        ? Math.round((presentToday.length / markedToday.length) * 100)
        : 100;

    const totalWaCost = whatsappLogs.reduce((sum, l) => sum + l.costInr, 0);

    return {
      totalCollected,
      totalPending,
      pendingCount,
      attendanceRate,
      presentTodayCount: presentToday.length,
      totalStudents: students.length,
      waCount: whatsappLogs.length,
      totalWaCost,
    };
  }, [students, today, whatsappLogs]);

  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      const pending = stu.feeTotal - stu.feePaid;
      if (feeFilter === 'pending' && pending <= 0) return false;
      if (feeFilter === 'paid' && pending > 0) return false;
      if (batchFilter !== 'all' && stu.batchId !== batchFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = stu.name.toLowerCase().includes(q);
        const matchesRoll = stu.rollNo.toLowerCase().includes(q);
        const matchesParent = stu.parentName.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesParent) return false;
      }
      return true;
    });
  }, [students, feeFilter, batchFilter, searchQuery]);

  const getBatchLabel = (batchId: string) => {
    const b = batches.find((item) => item.id === batchId);
    return b ? `${b.name} · ${b.subject}` : batchId;
  };

  const getStudentAttendancePct = (stu: Student) => {
    const values = Object.values(stu.attendance);
    if (values.length === 0) return 100;
    const present = values.filter((v) => v === 'present').length;
    return Math.round((present / values.length) * 100);
  };

  const openPaymentDrawer = (stu: Student) => {
    const remaining = stu.feeTotal - stu.feePaid;
    setPayingStudent(stu);
    setPaymentAmount(String(remaining));
    setPaymentMode('UPI');
    setPaymentError('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingStudent) return;
    const amt = Number(paymentAmount);
    const remaining = payingStudent.feeTotal - payingStudent.feePaid;
    if (!Number.isFinite(amt) || amt <= 0) {
      setPaymentError('Enter a valid amount greater than ₹0.');
      return;
    }
    if (amt > remaining) {
      setPaymentError(`Amount cannot exceed pending balance (₹${remaining.toLocaleString('en-IN')}).`);
      return;
    }

    const receipt = onRecordPayment(payingStudent.id, amt, paymentMode);
    setPayingStudent(null);
    setActiveReceipt(receipt);
    showToast(`Recorded ₹${amt.toLocaleString('en-IN')} (${paymentMode}) for ${payingStudent.name}.`);
  };

  const handleReminderClick = (stu: Student) => {
    onSendFeeReminder(stu);
    showToast(`WhatsApp UPI reminder sent to ${stu.parentName} (${stu.parentPhone}).`);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(newStuFee);
    if (!newStuName.trim() || !newStuParent.trim() || !newStuPhone.trim()) {
      setAddStuError('Please fill student name, parent name, and WhatsApp phone.');
      return;
    }
    if (!Number.isFinite(fee) || fee <= 0) {
      setAddStuError('Enter a valid total fee amount.');
      return;
    }
    onAddStudent({
      name: newStuName.trim(),
      batchId: newStuBatch,
      parentName: newStuParent.trim(),
      parentPhone: newStuPhone.trim(),
      feeTotal: fee,
    });
    showToast(`${newStuName.trim()} added to ${getBatchLabel(newStuBatch)}.`);
    setNewStuName('');
    setNewStuParent('');
    setNewStuPhone('');
    setAddStuError('');
    setShowAddStudent(false);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) {
      setNoticeError('Please enter a notice title and message.');
      return;
    }
    onPublishNotice({
      title: noticeTitle.trim(),
      batchId: noticeBatch,
      body: noticeBody.trim(),
      authorRole: 'Owner',
      category: 'Notice',
    });
    showToast('Notice published to Student & Parent app.');
    setNoticeTitle('');
    setNoticeBody('');
    setNoticeError('');
    setShowNoticeModal(false);
  };

  // Monthly WhatsApp estimation math (4 absence/notice alerts + 1 fee reminder per student/month * ₹0.78 Meta utility rate)
  const estMessages = Math.round(estStudents * 3.8);
  const estMonthlyInr = Math.round(estMessages * 0.78);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-12 flex-1 flex flex-col gap-6 sm:gap-8">
      {/* Top Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-5 sm:pb-6">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-px bg-on-surface shrink-0" aria-hidden="true" />
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-amber-ink">
              Owner Dashboard · Full Centre Control
            </span>
          </div>
          <h1 className="font-headline text-[30px] leading-[36px] sm:text-[34px] sm:leading-[40px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface">
            Centre Ledger &amp; Operations
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowNoticeModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-transparent text-on-surface px-4 py-2.5 font-label text-[13px] sm:text-[14px] font-medium hover:bg-surface-container transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Send notice</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddStudent(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary px-4 sm:px-5 py-2.5 font-label text-[13px] sm:text-[14px] font-medium hover:bg-primary-hover transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-brand-amber shrink-0" aria-hidden="true" />
            <span>Add student</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          className="rounded-xl border border-outline-variant bg-primary text-on-primary px-4 sm:px-5 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 text-[14px] min-w-0">
            <CheckCircle2 className="w-4 h-4 text-brand-amber shrink-0" aria-hidden="true" />
            <span className="min-w-0">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-inverse-muted hover:text-white shrink-0 cursor-pointer p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4-Column Divided KPI Strip */}
      <section
        aria-label="Centre summary metrics"
        className="rounded-[18px] border border-outline-variant bg-surface-container-low shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] overflow-hidden"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 sm:p-6 flex flex-col gap-1 border-b sm:border-r lg:border-b-0 border-outline-variant">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-on-surface-variant">
              Fees Collected
            </span>
            <p className="font-headline text-[30px] sm:text-[34px] leading-[36px] sm:leading-[40px] text-on-surface tabular-nums">
              ₹{metrics.totalCollected.toLocaleString('en-IN')}
            </p>
            <span className="font-body text-[13px] text-on-surface-variant tabular-nums">
              Across {metrics.totalStudents} active students
            </span>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-1 border-b lg:border-b-0 lg:border-r border-outline-variant">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-brand-amber-ink">
              Pending Dues
            </span>
            <p className="font-headline text-[30px] sm:text-[34px] leading-[36px] sm:leading-[40px] text-brand-amber-large tabular-nums">
              ₹{metrics.totalPending.toLocaleString('en-IN')}
            </p>
            <span className="font-body text-[13px] text-on-surface-variant tabular-nums">
              {metrics.pendingCount} students with open instalments
            </span>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-outline-variant">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-on-surface-variant">
              Today&apos;s Attendance
            </span>
            <p className="font-headline text-[30px] sm:text-[34px] leading-[36px] sm:leading-[40px] text-on-surface tabular-nums">
              {metrics.attendanceRate}%
            </p>
            <span className="font-body text-[13px] text-on-surface-variant tabular-nums">
              {metrics.presentTodayCount} of {metrics.totalStudents} present today
            </span>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-1">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-on-surface-variant">
              WhatsApp Alerts
            </span>
            <p className="font-headline text-[30px] sm:text-[34px] leading-[36px] sm:leading-[40px] text-on-surface tabular-nums">
              {metrics.waCount} sent
            </p>
            <span className="font-body text-[13px] text-on-surface-variant tabular-nums">
              Est. Meta bill: ₹{metrics.totalWaCost.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Segmented Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div
          role="tablist"
          aria-label="Owner workspace sections"
          className="w-full lg:w-auto grid grid-cols-2 sm:inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-container border border-outline-variant"
        >
          {(
            [
              { id: 'fees', label: 'Fees & Dues' },
              { id: 'directory', label: 'Students Directory' },
              { id: 'whatsapp', label: 'WhatsApp Logs' },
              { id: 'receipts', label: 'Receipts' },
            ] as { id: OwnerTab; label: string }[]
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl font-label text-[12px] sm:text-[13px] font-medium whitespace-nowrap text-center transition-colors cursor-pointer ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {(activeTab === 'fees' || activeTab === 'directory') && (
          <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="relative w-full sm:w-56">
              <Search
                className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or roll no..."
                aria-label="Search students"
                className="w-full rounded-full border border-outline-variant bg-surface-container-low pl-9 pr-4 py-2 text-[14px] text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              aria-label="Filter by batch"
              className="w-full sm:w-auto rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: FEES & DUES LEDGER */}
      {activeTab === 'fees' && (
        <section className="rounded-[18px] border border-outline-variant bg-surface-container-low shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-baseline gap-2 min-w-0">
              <h2 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px] text-on-surface">
                Student Fee Ledger
              </h2>
              <span className="font-body text-[13px] text-on-surface-variant tabular-nums">
                · {filteredStudents.length} records
              </span>
            </div>

            <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending Dues' },
                  { id: 'paid', label: 'Paid in Full' },
                ] as { id: FeeFilter; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFeeFilter(f.id)}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg font-label text-[12px] font-medium transition-colors whitespace-nowrap text-center cursor-pointer ${
                    feeFilter === f.id
                      ? 'bg-surface-container-low text-on-surface shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-8 sm:p-10 text-center flex flex-col items-center gap-3">
              <p className="font-headline text-[22px] text-on-surface">
                No matching student records
              </p>
              <p className="font-body text-[14px] text-on-surface-variant">
                Clear your search or batch filter to see all students.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFeeFilter('all');
                  setBatchFilter('all');
                }}
                className="rounded-full border border-primary px-4 py-2 font-label text-[13px] font-medium text-on-surface hover:bg-surface-container cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Card View (< md) */}
              <div className="md:hidden divide-y divide-outline-variant">
                {filteredStudents.map((stu) => {
                  const pending = stu.feeTotal - stu.feePaid;
                  const isPaid = pending <= 0;
                  return (
                    <div key={stu.id} className="p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-[15px] text-on-surface truncate">
                            {stu.name}
                          </span>
                          <span className="font-mono text-[12px] text-on-surface-variant tabular-nums truncate">
                            {stu.rollNo} · {stu.parentName}
                          </span>
                          <span className="font-body text-[12px] text-on-surface-variant truncate mt-0.5">
                            {getBatchLabel(stu.batchId)}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`block font-mono text-[14px] font-semibold tabular-nums ${
                              isPaid ? 'text-on-surface-variant' : 'text-brand-amber-large'
                            }`}
                          >
                            {isPaid ? '₹0 due' : `₹${pending.toLocaleString('en-IN')} due`}
                          </span>
                          <span className="block font-mono text-[11px] text-on-surface-variant tabular-nums">
                            Paid ₹{stu.feePaid.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-on-surface">
                            <CheckCircle2 className="w-3.5 h-3.5 text-on-surface shrink-0" aria-hidden="true" />
                            Paid in full
                          </span>
                        ) : (
                          <>
                            <span className="text-[12px] font-medium text-brand-amber-ink">
                              Due {stu.dueDate}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => handleReminderClick(stu)}
                                className="flex-1 sm:flex-initial rounded-full border border-outline-variant bg-white px-3 py-2 font-label text-[12px] font-medium text-on-surface hover:border-primary transition-colors whitespace-nowrap text-center cursor-pointer"
                              >
                                Send UPI Reminder
                              </button>
                              <button
                                type="button"
                                onClick={() => openPaymentDrawer(stu)}
                                className="flex-1 sm:flex-initial rounded-full bg-primary text-on-primary px-3.5 py-2 font-label text-[12px] font-medium hover:bg-primary-hover transition-colors whitespace-nowrap text-center cursor-pointer"
                              >
                                Record Payment
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container/50 font-label text-[12px] font-semibold uppercase tracking-[0.8px] text-on-surface-variant">
                    <th className="py-3.5 px-5">Student</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4 text-right">Paid</th>
                    <th className="py-3.5 px-4 text-right">Pending</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body text-[14px]">
                  {filteredStudents.map((stu) => {
                    const pending = stu.feeTotal - stu.feePaid;
                    const isPaid = pending <= 0;
                    return (
                      <tr
                        key={stu.id}
                        className="hover:bg-surface-container/35 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">
                              {stu.name}
                            </span>
                            <span className="font-mono text-[12px] text-on-surface-variant tabular-nums">
                              {stu.rollNo} · {stu.parentName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant">
                          {getBatchLabel(stu.batchId)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[13px] text-on-surface tabular-nums">
                          ₹{stu.feePaid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[13px] tabular-nums">
                          <span
                            className={
                              isPaid
                                ? 'text-on-surface-variant'
                                : 'font-semibold text-brand-amber-large'
                            }
                          >
                            ₹{pending.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-on-surface">
                              <CheckCircle2 className="w-3.5 h-3.5 text-on-surface" aria-hidden="true" />
                              Paid in full
                            </span>
                          ) : (
                            <span className="text-[13px] font-medium text-brand-amber-ink">
                              Due {stu.dueDate}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {isPaid ? (
                            <span className="font-label text-[12px] text-on-surface-variant">
                              Settled
                            </span>
                          ) : (
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleReminderClick(stu)}
                                className="rounded-full border border-outline-variant bg-white px-3 py-1.5 font-label text-[12px] font-medium text-on-surface hover:border-primary transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Send UPI Reminder
                              </button>
                              <button
                                type="button"
                                onClick={() => openPaymentDrawer(stu)}
                                className="rounded-full bg-primary text-on-primary px-3.5 py-1.5 font-label text-[12px] font-medium hover:bg-primary-hover transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Record Payment
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </>
          )}
        </section>
      )}

      {/* TAB 2: STUDENTS DIRECTORY */}
      {activeTab === 'directory' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredStudents.map((stu) => {
            const pct = getStudentAttendancePct(stu);
            const pending = stu.feeTotal - stu.feePaid;
            return (
              <article
                key={stu.id}
                className="rounded-[18px] border border-outline-variant bg-surface-container-low p-5 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col justify-between gap-4 min-w-0"
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[12px] text-on-surface-variant tabular-nums">
                      {stu.rollNo}
                    </span>
                    <span className="font-label text-[12px] font-semibold text-brand-amber-ink shrink-0">
                      {getBatchLabel(stu.batchId).split(' · ')[0]}
                    </span>
                  </div>
                  <h3 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px] text-on-surface truncate">
                    {stu.name}
                  </h3>
                  <p className="font-body text-[14px] text-on-surface-variant break-words">
                    Parent: {stu.parentName} ·{' '}
                    <span className="font-mono text-[13px] tabular-nums">
                      {stu.parentPhone}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant">
                  <div>
                    <span className="block font-label text-[11px] uppercase tracking-[0.8px] text-on-surface-variant">
                      Attendance
                    </span>
                    <span className="font-headline text-[22px] text-on-surface tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div>
                    <span className="block font-label text-[11px] uppercase tracking-[0.8px] text-on-surface-variant">
                      Fee Balance
                    </span>
                    <span
                      className={`font-headline text-[22px] tabular-nums ${
                        pending > 0 ? 'text-brand-amber-large' : 'text-on-surface'
                      }`}
                    >
                      ₹{pending.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* TAB 3: WHATSAPP LOGS & COST CALCULATOR */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* WhatsApp Log Feed */}
          <section className="lg:col-span-7 rounded-[18px] border border-outline-variant bg-surface-container-low p-5 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-outline-variant pb-4">
              <div className="min-w-0">
                <h2 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px] text-on-surface">
                  WhatsApp Dispatch Log
                </h2>
                <p className="font-body text-[14px] text-on-surface-variant">
                  Automated alerts sent directly to parents at Meta&apos;s exact rate.
                </p>
              </div>
              <span className="font-mono text-[13px] text-on-surface tabular-nums shrink-0">
                {whatsappLogs.length} msgs
              </span>
            </div>

            <div className="divide-y divide-outline-variant">
              {whatsappLogs.map((log) => (
                <div key={log.id} className="py-4 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-amber-ink shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-on-surface shrink-0">
                        {log.messageType}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-on-surface-variant min-w-0 break-words">{log.recipientName}</span>
                    </div>
                    <span className="font-mono text-[12px] text-on-surface-variant tabular-nums shrink-0">
                      {log.sentAt} · ₹{log.costInr.toFixed(2)}
                    </span>
                  </div>
                  <p className="font-body text-[14px] leading-[21px] text-on-surface-variant">
                    &ldquo;{log.summary}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Monthly Cost Calculator */}
          <aside className="lg:col-span-5 rounded-[18px] border border-outline-variant bg-surface-container-low p-5 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                Transparent Billing
              </span>
              <h2 className="font-headline text-[26px] leading-[32px] text-on-surface">
                WhatsApp Cost Estimator
              </h2>
              <p className="font-body text-[14px] text-on-surface-variant">
                Zero markup on Meta&apos;s per-message utility rate (₹0.78 / message).
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="student-strength-slider"
                  className="font-label text-[14px] font-medium text-on-surface"
                >
                  Centre strength
                </label>
                <span className="font-mono text-[15px] font-semibold text-on-surface tabular-nums">
                  {estStudents} students
                </span>
              </div>
              <input
                id="student-strength-slider"
                type="range"
                min={30}
                max={500}
                step={10}
                value={estStudents}
                onChange={(e) => setEstStudents(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[11px] text-on-surface-variant tabular-nums">
                <span>30</span>
                <span>150</span>
                <span>300</span>
                <span>500</span>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container border border-outline-variant p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-on-surface-variant">Est. monthly messages</span>
                <span className="font-mono font-medium text-on-surface tabular-nums">
                  ~{estMessages} alerts
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
                <span className="font-medium text-on-surface">Estimated monthly bill</span>
                <span className="font-headline text-[28px] text-brand-amber-large tabular-nums">
                  ₹{estMonthlyInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="font-body text-[12px] leading-[18px] text-on-surface-variant">
              Includes daily absence alerts, monthly fee reminders, and instant payment receipts. Start or pause WhatsApp anytime.
            </p>
          </aside>
        </div>
      )}

      {/* TAB 4: RECEIPTS ARCHIVE */}
      {activeTab === 'receipts' && (
        <section className="rounded-[18px] border border-outline-variant bg-surface-container-low shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-outline-variant flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px] text-on-surface">
              Issued Fee Receipts
            </h2>
            <span className="font-mono text-[13px] text-on-surface-variant tabular-nums shrink-0">
              {receipts.length} receipts
            </span>
          </div>
          <div className="divide-y divide-outline-variant">
            {receipts.map((rec) => {
              const stu = students.find((s) => s.id === rec.studentId);
              return (
                <div
                  key={rec.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-surface-container/35 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-mono text-[13px] font-semibold text-on-surface tabular-nums">
                        {rec.receiptNo}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-body text-[14px] font-medium text-on-surface truncate">
                        {stu?.name ?? 'Student'}
                      </span>
                    </div>
                    <span className="font-body text-[13px] text-on-surface-variant">
                      Paid on {rec.paidAt} via {rec.mode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0">
                    <span className="font-headline text-[22px] text-on-surface tabular-nums">
                      ₹{rec.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveReceipt(rec)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-white px-4 py-1.5 font-label text-[12px] font-medium text-on-surface hover:border-primary transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>View receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* RECORD PAYMENT MODAL */}
      {payingStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[18px] bg-surface-container-low border border-outline-variant p-5 sm:p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setPayingStudent(null)}
              aria-label="Close payment modal"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleConfirmPayment} className="flex flex-col gap-4">
              <div className="pr-10">
                <span className="font-label text-[11px] font-semibold uppercase tracking-[1px] text-brand-amber-ink">
                  Record Fee Instalment
                </span>
                <h3 className="font-headline text-[24px] sm:text-[26px] leading-[30px] sm:leading-[32px] text-on-surface">
                  {payingStudent.name}
                </h3>
                <p className="font-body text-[14px] text-on-surface-variant tabular-nums">
                  Pending balance: ₹
                  {(payingStudent.feeTotal - payingStudent.feePaid).toLocaleString('en-IN')}
                </p>
              </div>

              {paymentError && (
                <p className="rounded-lg bg-surface-container border border-brand-amber-large px-3 py-2 text-[13px] text-on-surface">
                  {paymentError}
                </p>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Amount Received (₹)
                </span>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 font-mono text-[15px] text-on-surface tabular-nums focus:outline-none focus:border-primary"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Payment Mode
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['UPI', 'Cash', 'Bank Transfer'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`flex-1 min-w-[96px] py-2 px-3 rounded-xl border font-label text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        paymentMode === mode
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-white text-on-surface border-outline-variant hover:border-primary'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-primary text-on-primary py-3 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Confirm &amp; Generate Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[18px] bg-surface-container-low border border-outline-variant p-5 sm:p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setShowAddStudent(false)}
              aria-label="Close add student modal"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleCreateStudent} className="flex flex-col gap-4">
              <div className="pr-10">
                <span className="font-label text-[11px] font-semibold uppercase tracking-[1px] text-brand-amber-ink">
                  New Admission
                </span>
                <h3 className="font-headline text-[24px] sm:text-[26px] leading-[30px] sm:leading-[32px] text-on-surface">
                  Add student to batch
                </h3>
              </div>

              {addStuError && (
                <p className="rounded-lg bg-surface-container border border-brand-amber-large px-3 py-2 text-[13px] text-on-surface">
                  {addStuError}
                </p>
              )}

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Student Full Name
                </span>
                <input
                  type="text"
                  value={newStuName}
                  onChange={(e) => setNewStuName(e.target.value)}
                  placeholder="e.g. Kabir Malhotra"
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Batch
                </span>
                <select
                  value={newStuBatch}
                  onChange={(e) => setNewStuBatch(e.target.value)}
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} · {b.subject}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-label text-[13px] font-medium text-on-surface">
                    Parent Name
                  </span>
                  <input
                    type="text"
                    value={newStuParent}
                    onChange={(e) => setNewStuParent(e.target.value)}
                    placeholder="e.g. Vivek Malhotra"
                    className="rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label text-[13px] font-medium text-on-surface">
                    Parent WhatsApp
                  </span>
                  <input
                    type="tel"
                    value={newStuPhone}
                    onChange={(e) => setNewStuPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Total Course Fee (₹)
                </span>
                <input
                  type="number"
                  value={newStuFee}
                  onChange={(e) => setNewStuFee(e.target.value)}
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2 font-mono text-[14px] text-on-surface tabular-nums focus:outline-none focus:border-primary"
                />
              </label>

              <button
                type="submit"
                className="mt-1 w-full rounded-full bg-primary text-on-primary py-3 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Save Student Record
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH NOTICE MODAL */}
      {showNoticeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[18px] bg-surface-container-low border border-outline-variant p-5 sm:p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setShowNoticeModal(false)}
              aria-label="Close notice modal"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleCreateNotice} className="flex flex-col gap-4">
              <div className="pr-10">
                <span className="font-label text-[11px] font-semibold uppercase tracking-[1px] text-brand-amber-ink">
                  Circular / Announcement
                </span>
                <h3 className="font-headline text-[24px] sm:text-[26px] leading-[30px] sm:leading-[32px] text-on-surface">
                  Send notice to phones
                </h3>
              </div>

              {noticeError && (
                <p className="rounded-lg bg-surface-container border border-brand-amber-large px-3 py-2 text-[13px] text-on-surface">
                  {noticeError}
                </p>
              )}

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Topic
                </span>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Sunday Holiday Notice"
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Target Batch
                </span>
                <select
                  value={noticeBatch}
                  onChange={(e) => setNoticeBatch(e.target.value)}
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} · {b.subject}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Message
                </span>
                <textarea
                  rows={3}
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  placeholder="Write your notice for students and parents..."
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-primary text-on-primary py-3 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Publish Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT MODAL */}
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
              aria-label="Close receipt preview"
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

              {(() => {
                const stu = students.find((s) => s.id === activeReceipt.studentId);
                return (
                  <div className="flex flex-col gap-2.5 text-[14px]">
                    <div className="flex justify-between gap-3">
                      <span className="text-on-surface-variant shrink-0">Student</span>
                      <span className="font-medium text-on-surface text-right">{stu?.name}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-on-surface-variant shrink-0">Roll No</span>
                      <span className="font-mono text-on-surface tabular-nums text-right">
                        {stu?.rollNo}
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
                );
              })()}

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
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
