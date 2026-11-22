import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CloudOff,
  RefreshCw,
  Send,
  Wifi,
} from 'lucide-react';
import { AttendanceStatus, Batch, Notice, Student } from '../types';
import { getTodayISO } from '../data/seedData';

interface TeacherScreenProps {
  batches: Batch[];
  students: Student[];
  onSaveBatchAttendance: (
    batchId: string,
    dateISO: string,
    attendanceMap: Record<string, AttendanceStatus>,
    sendAlerts: boolean
  ) => void;
  onPublishNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
  onPublishTestScores: (
    testName: string,
    subject: string,
    maxScore: number,
    scoresMap: Record<string, number>
  ) => void;
}

export const TeacherScreen: React.FC<TeacherScreenProps> = ({
  batches,
  students,
  onSaveBatchAttendance,
  onPublishNotice,
  onPublishTestScores,
}) => {
  const today = getTodayISO();
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id ?? 'batch-a');
  const [offlineMode, setOfflineMode] = useState(false);
  const [queuedBatches, setQueuedBatches] = useState<
    { batchId: string; map: Record<string, AttendanceStatus> }[]
  >([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Local draft attendance map for the selected batch
  const batchStudents = students.filter((s) => s.batchId === selectedBatchId);
  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? batches[0];

  const [draftMap, setDraftMap] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students
      .filter((s) => s.batchId === selectedBatchId)
      .forEach((s) => {
        initial[s.id] = s.attendance[today] ?? 'present';
      });
    setDraftMap(initial);
  }, [selectedBatchId, students, today]);

  // Right column composer state
  const [composerTab, setComposerTab] = useState<'notice' | 'scores'>('notice');
  const [noticeTitle, setNoticeTitle] = useState('Weekly Test Results');
  const [noticeTargetBatch, setNoticeTargetBatch] = useState(selectedBatchId);
  const [noticeBody, setNoticeBody] = useState(
    'Weekly test scores have been published. Please check your Student app for detailed marks.'
  );

  const [testName, setTestName] = useState('Weekly Class Test #09');
  const [maxScore, setMaxScore] = useState('50');
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setNoticeTargetBatch(selectedBatchId);
    const initScores: Record<string, string> = {};
    students
      .filter((s) => s.batchId === selectedBatchId)
      .forEach((s, idx) => {
        initScores[s.id] = String(42 - idx * 2);
      });
    setScoreInputs(initScores);
  }, [selectedBatchId, students]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const toggleStudentStatus = (studentId: string) => {
    setDraftMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? 'present' : 'absent',
    }));
  };

  const markAllPresent = () => {
    const next: Record<string, AttendanceStatus> = {};
    batchStudents.forEach((s) => {
      next[s.id] = 'present';
    });
    setDraftMap(next);
  };

  const handleSaveAttendance = () => {
    const absentCount = Object.values(draftMap).filter((v) => v === 'absent').length;
    if (offlineMode) {
      onSaveBatchAttendance(selectedBatchId, today, draftMap, false);
      setQueuedBatches((prev) => [
        ...prev.filter((item) => item.batchId !== selectedBatchId),
        { batchId: selectedBatchId, map: draftMap },
      ]);
      showFeedback(
        `${selectedBatch.name} saved offline on device. Will send ${absentCount} WhatsApp alert(s) once internet returns.`
      );
    } else {
      onSaveBatchAttendance(selectedBatchId, today, draftMap, true);
      showFeedback(
        `${selectedBatch.name} attendance saved. ${
          absentCount > 0
            ? `${absentCount} parent WhatsApp alert(s) dispatched.`
            : 'All students marked present.'
        }`
      );
    }
  };

  const handleSyncOfflineQueue = () => {
    queuedBatches.forEach((q) => {
      onSaveBatchAttendance(q.batchId, today, q.map, true);
    });
    const count = queuedBatches.length;
    setQueuedBatches([]);
    showFeedback(`Synced ${count} queued batch(es) and dispatched parent WhatsApp alerts.`);
  };

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) {
      showFeedback('Please enter both a topic and message before sending.');
      return;
    }
    onPublishNotice({
      title: noticeTitle.trim(),
      batchId: noticeTargetBatch,
      body: noticeBody.trim(),
      authorRole: 'Teacher',
      category: 'Notice',
    });
    showFeedback(`Announcement sent to ${noticeTargetBatch === 'all' ? 'All Batches' : selectedBatch.name}.`);
    setNoticeTitle('');
    setNoticeBody('');
  };

  const handleSaveScores = (e: React.FormEvent) => {
    e.preventDefault();
    const max = Number(maxScore);
    if (!testName.trim() || !Number.isFinite(max) || max <= 0) {
      showFeedback('Enter a valid test name and maximum score.');
      return;
    }
    const parsed: Record<string, number> = {};
    batchStudents.forEach((s) => {
      const val = Number(scoreInputs[s.id] ?? 0);
      parsed[s.id] = Math.max(0, Math.min(max, Number.isFinite(val) ? val : 0));
    });
    onPublishTestScores(testName.trim(), selectedBatch.subject, max, parsed);
    showFeedback(`Published "${testName.trim()}" scores for ${selectedBatch.name} students.`);
  };

  const presentCount = batchStudents.filter((s) => draftMap[s.id] !== 'absent').length;
  const absentCount = batchStudents.length - presentCount;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-12 flex-1 flex flex-col gap-6 sm:gap-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-5 sm:pb-6">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-px bg-on-surface shrink-0" aria-hidden="true" />
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-amber-ink">
              Teacher Panel · Daily Batches
            </span>
          </div>
          <h1 className="font-headline text-[30px] leading-[36px] sm:text-[34px] sm:leading-[40px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface">
            30-Second Batch Roll Call
          </h1>
        </div>

        {/* Offline / Online Simulator Control */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setOfflineMode((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-label text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              offlineMode
                ? 'border-brand-amber-large bg-surface-container text-on-surface'
                : 'border-outline-variant bg-surface-container-low text-on-surface hover:border-primary'
            }`}
          >
            {offlineMode ? (
              <>
                <CloudOff className="w-4 h-4 text-brand-amber-ink" aria-hidden="true" />
                <span>Offline Mode (On)</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-on-surface" aria-hidden="true" />
                <span>Online · Auto-Sync</span>
              </>
            )}
          </button>

          {!offlineMode && queuedBatches.length > 0 && (
            <button
              type="button"
              onClick={handleSyncOfflineQueue}
              className="inline-flex items-center gap-2 rounded-full bg-brand-amber text-primary px-4 py-2 font-label text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sync {queuedBatches.length} queued</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Feedback */}
      {feedback && (
        <div
          role="status"
          className="rounded-xl border border-outline-variant bg-primary text-on-primary px-5 py-3 flex items-center gap-2.5 text-[14px]"
        >
          <CheckCircle2 className="w-4 h-4 text-brand-amber shrink-0" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Batch Switcher Strip */}
      <section aria-label="Today's Batches" className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {batches.map((batch) => {
          const isSelected = batch.id === selectedBatchId;
          const count = students.filter((s) => s.batchId === batch.id).length;
          return (
            <button
              key={batch.id}
              type="button"
              onClick={() => setSelectedBatchId(batch.id)}
              className={`text-left rounded-[18px] border p-4 sm:p-5 transition-colors cursor-pointer flex flex-col gap-2 min-w-0 ${
                isSelected
                  ? 'border-primary bg-primary text-on-primary shadow-[0_12px_32px_-12px_rgba(26,26,26,0.16)]'
                  : 'border-outline-variant bg-surface-container-low text-on-surface hover:border-primary'
              }`}
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span
                  className={`font-label text-[12px] font-semibold uppercase tracking-[1px] min-w-0 truncate ${
                    isSelected ? 'text-brand-amber' : 'text-brand-amber-ink'
                  }`}
                >
                  {batch.name} · {batch.room}
                </span>
                <span
                  className={`font-mono text-[12px] tabular-nums shrink-0 ${
                    isSelected ? 'text-inverse-muted' : 'text-on-surface-variant'
                  }`}
                >
                  {count} students
                </span>
              </div>
              <h2 className="font-headline text-[22px] sm:text-[24px] leading-[28px] sm:leading-[30px]">
                {batch.subject}
              </h2>
              <p
                className={`font-body text-[13px] ${
                  isSelected ? 'text-inverse-muted' : 'text-on-surface-variant'
                }`}
              >
                {batch.timing} · {batch.teacherName}
              </p>
            </button>
          );
        })}
      </section>

      {/* Main Two-Column Teacher Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Tactile Attendance Roll Call */}
        <section className="lg:col-span-7 rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-outline-variant pb-4">
            <div className="min-w-0">
              <h2 className="font-headline text-[23px] sm:text-[26px] leading-[29px] sm:leading-[32px] text-on-surface">
                {selectedBatch.name} · Attendance
              </h2>
              <p className="font-body text-[13px] sm:text-[14px] text-on-surface-variant tabular-nums">
                {today} · {presentCount} Present · {absentCount} Absent
              </p>
            </div>
            <button
              type="button"
              onClick={markAllPresent}
              className="rounded-full border border-outline-variant bg-white px-4 py-2 font-label text-[12px] font-medium text-on-surface hover:border-primary transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mark all present
            </button>
          </div>

          <div className="divide-y divide-outline-variant">
            {batchStudents.map((stu) => {
              const isPresent = draftMap[stu.id] !== 'absent';
              return (
                <div
                  key={stu.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-headline text-[16px] font-semibold text-on-surface shrink-0">
                      {stu.name.charAt(0)}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-body text-[15px] font-medium text-on-surface truncate">
                        {stu.name}
                      </span>
                      <span className="font-mono text-[12px] text-on-surface-variant tabular-nums truncate">
                        {stu.rollNo} · {stu.parentName}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPresent}
                    onClick={() => toggleStudentStatus(stu.id)}
                    className="inline-flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px] py-2 pl-2 pr-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span
                      className={`font-label text-[13px] font-medium ${
                        isPresent ? 'text-on-surface' : 'text-brand-amber-ink'
                      }`}
                    >
                      {isPresent ? 'Present' : 'Absent'}
                    </span>
                    <span
                      className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors ${
                        isPresent
                          ? 'bg-primary justify-end'
                          : 'bg-brand-amber justify-start'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full ${
                          isPresent ? 'bg-on-primary' : 'bg-primary'
                        }`}
                      />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-outline-variant">
            <span className="font-body text-[13px] text-on-surface-variant">
              {offlineMode
                ? 'Offline queue active — alerts send when synced.'
                : 'Parents of absent students receive a WhatsApp alert immediately.'}
            </span>
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary text-on-primary px-6 py-3 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {offlineMode ? 'Save offline to device' : 'Save attendance'}
            </button>
          </div>
        </section>

        {/* Right: Announcement & Weekly Test Marks Composer */}
        <aside className="lg:col-span-5 rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-5">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container border border-outline-variant">
            <button
              type="button"
              onClick={() => setComposerTab('notice')}
              className={`flex-1 py-2 px-2.5 sm:px-3 rounded-lg font-label text-[12px] sm:text-[13px] font-medium whitespace-nowrap text-center transition-colors cursor-pointer ${
                composerTab === 'notice'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              New Announcement
            </button>
            <button
              type="button"
              onClick={() => setComposerTab('scores')}
              className={`flex-1 py-2 px-2.5 sm:px-3 rounded-lg font-label text-[12px] sm:text-[13px] font-medium whitespace-nowrap text-center transition-colors cursor-pointer ${
                composerTab === 'scores'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Publish Test Marks
            </button>
          </div>

          {composerTab === 'notice' ? (
            <form onSubmit={handleSendNotice} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-brand-amber-ink">
                  Class Circular
                </span>
                <h2 className="font-headline text-[24px] leading-[30px] text-on-surface">
                  Message your batch in one tap
                </h2>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Topic
                </span>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Weekly Test Results"
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  To
                </span>
                <select
                  value={noticeTargetBatch}
                  onChange={(e) => setNoticeTargetBatch(e.target.value)}
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value={selectedBatchId}>
                    {selectedBatch.name} · {selectedBatch.subject}
                  </option>
                  <option value="all">All Batches</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Circular Message
                </span>
                <textarea
                  rows={4}
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  placeholder="Write timetable changes, homework, or test updates..."
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary py-3 px-6 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 text-brand-amber" aria-hidden="true" />
                <span>Send notification to phone</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveScores} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[1px] text-brand-amber-ink">
                  Weekly Assessment
                </span>
                <h2 className="font-headline text-[24px] leading-[30px] text-on-surface">
                  Enter marks for {selectedBatch.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="sm:col-span-2 flex flex-col gap-1">
                  <span className="font-label text-[13px] font-medium text-on-surface">
                    Test Name
                  </span>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="rounded-xl border border-outline-variant bg-white px-3 py-2 text-[14px] text-on-surface focus:outline-none focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label text-[13px] font-medium text-on-surface">
                    Max Marks
                  </span>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="rounded-xl border border-outline-variant bg-white px-3 py-2 font-mono text-[14px] text-on-surface tabular-nums focus:outline-none focus:border-primary"
                  />
                </label>
              </div>

              <div className="divide-y divide-outline-variant border-t border-b border-outline-variant max-h-60 overflow-y-auto">
                {batchStudents.map((stu) => (
                  <div
                    key={stu.id}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <span className="font-body text-[14px] text-on-surface truncate">
                      {stu.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={Number(maxScore) || 100}
                        value={scoreInputs[stu.id] ?? ''}
                        onChange={(e) =>
                          setScoreInputs((prev) => ({
                            ...prev,
                            [stu.id]: e.target.value,
                          }))
                        }
                        aria-label={`Score for ${stu.name}`}
                        className="w-16 rounded-lg border border-outline-variant bg-white px-2.5 py-1 text-right font-mono text-[14px] text-on-surface tabular-nums focus:outline-none focus:border-primary"
                      />
                      <span className="font-mono text-[12px] text-on-surface-variant tabular-nums">
                        / {maxScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-primary text-on-primary py-3 px-6 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Publish Scores to Student App
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
};
