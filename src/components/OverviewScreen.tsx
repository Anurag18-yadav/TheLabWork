import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { AppScreen, Batch, Notice, Student } from '../types';
import { getTodayISO } from '../data/seedData';

interface OverviewScreenProps {
  students: Student[];
  batches: Batch[];
  notices: Notice[];
  onNavigate: (screen: AppScreen) => void;
  onOpenDemoModal: () => void;
}

const FAQ_ITEMS = [
  {
    question: 'Teacher ko training chahiye?',
    answer:
      'Teachers learn the app in about 15 minutes. Open today’s batch, tap any absent student, and save.',
  },
  {
    question: 'Internet nahi ho to?',
    answer:
      'Yes. Attendance is saved offline on the phone and syncs automatically when internet returns.',
  },
  {
    question: 'Parents ko kya dikhega?',
    answer:
      'Attendance, notices, weekly test marks, and their child’s own fee receipts after login.',
  },
  {
    question: 'Data kahan store hota hai?',
    answer:
      'Student records are stored on secure cloud servers. Only you and your authorized staff have access.',
  },
];

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  students,
  batches,
  notices,
  onNavigate,
  onOpenDemoModal,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);

  const today = getTodayISO();
  const batchAStudents = students.filter((s) => s.batchId === 'batch-a').slice(0, 4);
  const unpaidStudents = students.filter((s) => s.feeTotal > s.feePaid);
  const totalCollected = students.reduce((acc, s) => acc + s.feePaid, 0);
  const latestNotice = notices[0];
  const latestNoticeBatch =
    latestNotice?.batchId === 'all'
      ? 'All Batches'
      : batches.find((b) => b.id === latestNotice?.batchId)?.name ?? 'Batch A';

  return (
    <div className="flex-1">
      {/* HERO SECTION (OVERSIZED EDITORIAL POSTER LAYOUT) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12 md:pt-16 md:pb-24 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 items-center">
          {/* Left Column: Oversized 4-Line Stacked Headline */}
          <div className="md:col-span-7 flex flex-col gap-5 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
              <p className="font-label text-[12px] font-semibold uppercase tracking-[1.4px] text-on-surface">
                For Coaching Centres
              </p>
            </div>

            <h1 className="font-headline text-[44px] leading-[43px] tracking-[-1.2px] sm:text-[72px] sm:leading-[70px] lg:text-[92px] lg:leading-[88px] lg:tracking-[-2.7px] font-medium text-on-surface">
              <span className="block">Run your</span>
              <span className="block">coaching</span>
              <span className="block">
                <em className="italic text-brand-amber-large font-normal">centre</em> with
              </span>
              <span className="block">less paperwork.</span>
            </h1>

            <p className="font-body text-[16px] sm:text-[17px] leading-[25px] sm:leading-[27px] text-on-surface-variant max-w-xl text-pretty pt-1">
              Attendance, fees, records and notices in one app, on your phone.{' '}
              <strong className="font-semibold text-on-surface">
                Built for private coaching centres in India. Set up with your own data in days, not months.
              </strong>
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('owner')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary px-6 py-3 font-label text-[14px] font-medium transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Open live workspace</span>
                <ArrowRight className="w-4 h-4 text-brand-amber shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenDemoModal}
                className="inline-flex items-center justify-center rounded-full border border-primary text-on-surface bg-transparent px-6 py-3 font-label text-[14px] font-medium transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary whitespace-nowrap shrink-0 cursor-pointer"
              >
                Book a free demo
              </button>
            </div>
          </div>

          {/* Right Column: Vertical Tablet Frame + Overlapping Circles + Sticky Note */}
          <div className="md:col-span-5 relative py-4 sm:py-6 flex items-center justify-center">
            <div className="relative w-full max-w-sm mx-auto px-2 sm:px-4 pt-3 pb-8">
              {/* Soft Warm Cream Circle Behind Left/Bottom */}
              <div
                className="absolute left-0 sm:-left-4 bottom-8 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-surface-container pointer-events-none"
                aria-hidden="true"
              />

              {/* Tall Vertical Deep Black Tablet Card */}
              <div className="relative z-10 rotate-1 sm:rotate-2 rounded-[18px] border-[6px] sm:border-8 border-surface-container-low bg-primary text-on-primary p-5 sm:p-7 shadow-[0_20px_44px_-12px_rgba(27,59,43,0.24)] flex flex-col justify-between gap-8 sm:gap-10 min-h-[340px] sm:min-h-[410px] overflow-hidden">
                {/* Vibrant Warm Orange Circle Overlapping Bottom-Right Side */}
                <div
                  className="absolute -right-12 -bottom-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-brand-amber pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <span className="font-label text-[11px] font-semibold uppercase tracking-[1.1px] text-inverse-muted min-w-0 truncate">
                    TheLabWork · Live Preview
                  </span>
                  <span className="font-mono text-[12px] text-brand-amber tabular-nums shrink-0">
                    {students.length} students
                  </span>
                </div>

                <h2 className="relative z-10 font-headline text-[30px] leading-[34px] md:text-[40px] md:leading-[44px] tracking-[-0.6px] text-on-primary">
                  Attendance, fees and notices. One screen.
                </h2>

                <div className="relative z-10 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('teacher')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low text-primary px-4 py-2 font-label text-[12px] font-semibold uppercase tracking-[0.8px] hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <span>Try teacher roll call</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* White Tilted Sticky-Note Card at Bottom-Left with Translucent Beige Tape */}
              <div className="relative z-20 -mt-8 sm:-mt-10 ml-1 sm:-ml-2 w-56 sm:w-60 -rotate-2 sm:-rotate-3 rounded-[6px] bg-surface-container-low border border-outline-variant p-4 pt-6 shadow-[0_10px_24px_-8px_rgba(26,26,26,0.14)]">
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-cream-tape/90 border border-outline-variant/60 rotate-1 pointer-events-none"
                  aria-hidden="true"
                />
                <p className="font-handwritten text-[20px] sm:text-[22px] leading-[24px] sm:leading-[26px] text-on-surface">
                  We don&apos;t just imagine. We engineer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULL-WIDTH 4-COLUMN PLATFORM HIGHLIGHTS STRIP */}
      <section
        aria-label="Platform views"
        className="w-full bg-surface border-t border-b border-outline-variant"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 md:divide-x divide-outline-variant">
            <button
              type="button"
              onClick={() => onNavigate('student')}
              className="py-6 sm:py-8 sm:pr-6 md:pr-6 sm:border-b md:border-b-0 border-outline-variant text-left flex flex-col gap-1.5 hover:bg-surface-container-low/60 transition-colors cursor-pointer group min-w-0"
            >
              <p className="font-headline text-[26px] sm:text-[28px] leading-[32px] sm:leading-[34px] tracking-[-0.3px] text-on-surface flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-brand-amber-large">Student</span> app
                </span>
                <ArrowUpRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors shrink-0" />
              </p>
              <p className="font-body text-[15px] leading-[23px] text-on-surface-variant">
                attendance, fees, and notices in one place
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('teacher')}
              className="py-6 sm:py-8 sm:pl-6 md:px-6 sm:border-l sm:border-b md:border-b-0 border-outline-variant text-left flex flex-col gap-1.5 hover:bg-surface-container-low/60 transition-colors cursor-pointer group min-w-0"
            >
              <p className="font-headline text-[26px] sm:text-[28px] leading-[32px] sm:leading-[34px] tracking-[-0.3px] text-on-surface flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-brand-amber-large">Teacher</span> panel
                </span>
                <ArrowUpRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors shrink-0" />
              </p>
              <p className="font-body text-[15px] leading-[23px] text-on-surface-variant">
                mark daily batches in under 30 seconds
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('owner')}
              className="py-6 sm:py-8 sm:pr-6 md:px-6 text-left flex flex-col gap-1.5 hover:bg-surface-container-low/60 transition-colors cursor-pointer group min-w-0"
            >
              <p className="font-headline text-[26px] sm:text-[28px] leading-[32px] sm:leading-[34px] tracking-[-0.3px] text-on-surface flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-brand-amber-large">Owner</span> dashboard
                </span>
                <ArrowUpRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors shrink-0" />
              </p>
              <p className="font-body text-[15px] leading-[23px] text-on-surface-variant">
                live fee collection and pending dues
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('owner')}
              className="py-6 sm:py-8 sm:pl-6 md:pl-6 sm:border-l border-outline-variant text-left flex flex-col gap-1.5 hover:bg-surface-container-low/60 transition-colors cursor-pointer group min-w-0"
            >
              <p className="font-headline text-[26px] sm:text-[28px] leading-[32px] sm:leading-[34px] tracking-[-0.3px] text-on-surface flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-brand-amber-large">WhatsApp</span> alerts
                </span>
                <ArrowUpRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors shrink-0" />
              </p>
              <p className="font-body text-[15px] leading-[23px] text-on-surface-variant">
                instant fee reminders and parent alerts
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SCREEN TRIO (BUILT FOR DAILY CENTRE OPERATIONS) */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
              <p className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-on-surface">
                Interactive Screens
              </p>
            </div>
            <h2 className="font-headline text-[30px] leading-[36px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface text-balance">
              Built for daily centre operations
            </h2>
          </div>
          <p className="font-body text-[15px] leading-[23px] text-on-surface-variant max-w-sm">
            Click any phone preview below to open the live working screen with real batch data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Batch Attendance Phone */}
          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => onNavigate('teacher')}
                className="w-full rounded-[12px] bg-surface-container border border-outline-variant flex items-center justify-center p-4 sm:p-5 hover:border-primary transition-colors cursor-pointer text-left"
              >
                <div className="w-full max-w-[244px] rounded-3xl border-[3px] border-primary bg-white p-3.5 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-outline-variant">
                    <span className="font-body text-[11px] font-semibold text-on-surface tracking-tight min-w-0 truncate">
                      Batch A · Attendance
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant tabular-nums shrink-0">
                      {batchAStudents.length} students
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {batchAStudents.map((student) => {
                      const isPresent = student.attendance[today] !== 'absent';
                      return (
                        <div key={student.id} className="flex items-center justify-between gap-2 py-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-body text-[9px] font-semibold text-on-surface shrink-0">
                              {student.name.charAt(0)}
                            </span>
                            <span className="font-body text-[11px] text-on-surface truncate">
                              {student.name}
                            </span>
                          </div>
                          <span
                            className={`w-7 h-4 rounded-full p-0.5 flex items-center shrink-0 ${
                              isPresent
                                ? 'bg-primary justify-end'
                                : 'bg-brand-amber justify-start'
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${
                                isPresent ? 'bg-on-primary' : 'bg-primary'
                              }`}
                            />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full rounded-full bg-primary text-on-primary py-1.5 text-center font-body text-[10px] font-medium">
                    Open Roll Call ↗
                  </div>
                </div>
              </button>

              <div className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                  Daily attendance
                </span>
                <h3 className="font-headline text-[22px] leading-[28px] text-on-surface">
                  Batch roll call in 30 seconds
                </h3>
                <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                  Teachers tap present or absent on their phone; parents get instant absence alerts on WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant font-label text-[12px] text-on-surface-variant">
              <span>Batch-wise</span>
              <span aria-hidden="true">·</span>
              <span>Offline sync</span>
              <span aria-hidden="true">·</span>
              <span>Parent alerts</span>
            </div>
          </article>

          {/* Card 2: Track Dues Phone */}
          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => onNavigate('owner')}
                className="w-full rounded-[12px] bg-surface-container border border-outline-variant flex items-center justify-center p-4 sm:p-5 hover:border-primary transition-colors cursor-pointer text-left"
              >
                <div className="w-full max-w-[244px] rounded-3xl border-[3px] border-primary bg-white p-3.5 flex flex-col justify-between gap-2.5">
                  <div className="pb-1.5 border-b border-outline-variant flex items-center justify-between gap-2">
                    <span className="font-body text-[11px] font-semibold text-on-surface tracking-tight min-w-0 truncate">
                      Track dues
                    </span>
                    <span className="font-mono text-[10px] text-brand-amber-ink tabular-nums shrink-0">
                      ₹{totalCollected.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="rounded-lg bg-surface-container-low border border-outline-variant p-2.5 flex flex-col gap-1">
                    <span className="font-body text-[9px] uppercase tracking-wider text-on-surface-variant">
                      Summary
                    </span>
                    <span className="font-body text-[12px] font-bold text-on-surface">
                      {unpaidStudents.length} Students Pending
                    </span>
                    <div className="flex items-center gap-2 pt-1 border-t border-outline-variant font-body text-[9px] text-on-surface-variant tabular-nums">
                      <span>{students.length} Active</span>
                      <span aria-hidden="true">·</span>
                      <span>UPI Ready</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {unpaidStudents.slice(0, 2).map((stu) => (
                      <div key={stu.id} className="flex items-center justify-between gap-2 py-0.5">
                        <span className="font-body text-[11px] text-on-surface truncate min-w-0">
                          {stu.name}
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-brand-amber-ink tabular-nums shrink-0">
                          ₹{(stu.feeTotal - stu.feePaid).toLocaleString('en-IN')} due
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full rounded-full bg-primary text-on-primary py-1.5 text-center font-body text-[10px] font-medium">
                    Open Owner Ledger ↗
                  </div>
                </div>
              </button>

              <div className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                  Fees &amp; receipts
                </span>
                <h3 className="font-headline text-[22px] leading-[28px] text-on-surface">
                  Track dues and send receipts
                </h3>
                <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                  See paid, partial, and overdue instalments at a glance, with automatic UPI &amp; WhatsApp reminders.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant font-label text-[12px] text-on-surface-variant">
              <span>Instalments</span>
              <span aria-hidden="true">·</span>
              <span>UPI links</span>
              <span aria-hidden="true">·</span>
              <span>Receipts</span>
            </div>
          </article>

          {/* Card 3: Notices & Test Scores Phone */}
          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-4 sm:p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => onNavigate('student')}
                className="w-full rounded-[12px] bg-surface-container border border-outline-variant flex items-center justify-center p-4 sm:p-5 hover:border-primary transition-colors cursor-pointer text-left"
              >
                <div className="w-full max-w-[244px] rounded-3xl border-[3px] border-primary bg-white p-3.5 flex flex-col justify-between gap-2.5">
                  <div className="pb-1.5 border-b border-outline-variant flex items-center justify-between gap-2">
                    <span className="font-body text-[11px] font-semibold text-on-surface tracking-tight min-w-0 truncate">
                      Student Notices
                    </span>
                    <span className="font-mono text-[9.5px] text-on-surface-variant shrink-0">
                      {latestNoticeBatch}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="rounded-md border border-outline-variant bg-surface-container-low px-2.5 py-1.5 font-body text-[10px] font-semibold text-on-surface truncate">
                      {latestNotice?.title ?? 'Weekly Test Results'}
                    </div>
                    <div className="rounded-md border border-outline-variant bg-surface-container-low px-2.5 py-1.5 flex items-center justify-between font-body text-[10px] text-on-surface">
                      <span>To: {latestNoticeBatch}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" aria-hidden="true" />
                    </div>
                    <div className="rounded-md border border-outline-variant bg-surface-container-low px-2.5 py-2 font-body text-[9.5px] leading-snug text-on-surface-variant line-clamp-2">
                      {latestNotice?.body ??
                        'Weekly test scores have been published for your batch.'}
                    </div>
                  </div>
                  <div className="w-full rounded-full bg-primary text-on-primary py-1.5 text-center font-body text-[10px] font-medium">
                    Open Student View ↗
                  </div>
                </div>
              </button>

              <div className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                  Records &amp; notices
                </span>
                <h3 className="font-headline text-[22px] leading-[28px] text-on-surface">
                  Test marks and batch circulars
                </h3>
                <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                  Publish holiday notices, timetables, and weekly test scores to every student phone in one tap.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant font-label text-[12px] text-on-surface-variant">
              <span>Timetables</span>
              <span aria-hidden="true">·</span>
              <span>Test scores</span>
              <span aria-hidden="true">·</span>
              <span>Circulars</span>
            </div>
          </article>
        </div>
      </section>

      {/* THE PROBLEM (PAIN POINTS GRID) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-18 border-t border-outline-variant">
        <div className="max-w-3xl flex flex-col gap-2 mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
            <p className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-on-surface">
              The Problem
            </p>
          </div>
          <h2 className="font-headline text-[30px] leading-[36px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface text-balance">
            Paper and scattered files cost you time and money every week.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-3">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
              Time
            </span>
            <p className="font-headline text-[25px] sm:text-[28px] leading-[31px] sm:leading-[34px] text-on-surface text-pretty">
              Attendance on paper takes <span className="text-brand-amber-large">30 hours</span> every week.
            </p>
          </article>

          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-3">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
              Fees
            </span>
            <p className="font-headline text-[25px] sm:text-[28px] leading-[31px] sm:leading-[34px] text-on-surface text-pretty">
              Missed fees are found at month end, when it&apos;s too late to chase.
            </p>
          </article>

          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-3">
            <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
              Trust
            </span>
            <p className="font-headline text-[25px] sm:text-[28px] leading-[31px] sm:leading-[34px] text-on-surface text-pretty">
              Parents wait 24 hours for an answer about their child.
            </p>
          </article>
        </div>
      </section>

      {/* WHAT CHANGES FOR YOU */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-18 border-t border-outline-variant">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
              <p className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-on-surface">
                What Changes
              </p>
            </div>
            <h2 className="font-headline text-[32px] leading-[38px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface">
              What changes for you
            </h2>
            <p className="font-body text-[17px] leading-[27px] text-on-surface-variant text-pretty">
              Things you can see in your own centre from day one.
            </p>
          </div>

          <ul className="md:col-span-7 border-t border-outline-variant">
            {[
              'Mark attendance for a full batch in 2 minutes',
              'See who has not paid fees, on one screen',
              'Send a notice to the whole class in one tap',
              'Find any student’s record in under 30 seconds',
              'Check attendance and fee reports before you decide',
            ].map((item) => (
              <li
                key={item}
                className="border-b border-outline-variant py-5 flex items-center gap-3.5"
              >
                <CheckCircle2 className="w-5 h-5 text-brand-amber-ink shrink-0" aria-hidden="true" />
                <span className="font-title text-[18px] leading-[26px] font-medium text-on-surface">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ONE APP, THREE VIEWS (INTERACTIVE JUMP CARDS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-18 border-t border-outline-variant">
        <div className="max-w-3xl flex flex-col gap-2 mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
            <p className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-on-surface">
              Built For Everyone
            </p>
          </div>
          <h2 className="font-headline text-[30px] leading-[36px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface">
            One app, three views.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          <button
            type="button"
            onClick={() => onNavigate('owner')}
            className="h-full text-left rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] hover:border-primary transition-colors flex flex-col justify-between gap-6 cursor-pointer group"
          >
            <div className="flex flex-col gap-2">
              <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                Full control
              </span>
              <h3 className="font-headline text-[26px] sm:text-[28px] leading-[32px] sm:leading-[34px] text-on-surface">
                Owner
              </h3>
              <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                Dashboard, fees, reports and every student and teacher record.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 font-label text-[13px] font-semibold text-on-surface group-hover:text-brand-amber-ink transition-colors">
              <span>Open Owner Dashboard</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('teacher')}
            className="h-full text-left rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] hover:border-primary transition-colors flex flex-col justify-between gap-6 cursor-pointer group"
          >
            <div className="flex flex-col gap-2">
              <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                Daily batches
              </span>
              <h3 className="font-headline text-[26px] sm:text-[28px] leading-[32px] sm:leading-[34px] text-on-surface">
                Teacher
              </h3>
              <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                Your classes for the day, attendance in a tap, and a message to the class.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 font-label text-[13px] font-semibold text-on-surface group-hover:text-brand-amber-ink transition-colors">
              <span>Open Teacher Panel</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('student')}
            className="h-full text-left rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] hover:border-primary transition-colors flex flex-col justify-between gap-6 cursor-pointer group"
          >
            <div className="flex flex-col gap-2">
              <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                Clear updates
              </span>
              <h3 className="font-headline text-[26px] sm:text-[28px] leading-[32px] sm:leading-[34px] text-on-surface">
                Student
              </h3>
              <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                Attendance, notices and your own details, after login.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 font-label text-[13px] font-semibold text-on-surface group-hover:text-brand-amber-ink transition-colors">
              <span>Open Student App</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </span>
          </button>
        </div>
      </section>

      {/* HOW IT WORKS (FOUR SIMPLE STEPS) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-18 border-t border-outline-variant">
        <div className="max-w-3xl flex flex-col gap-2 mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
            <p className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-on-surface">
              Simple Workflow
            </p>
          </div>
          <h2 className="font-headline text-[30px] leading-[36px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface">
            Four simple steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
          {[
            { num: '01', text: 'Add students and teachers' },
            { num: '02', text: 'Teachers mark attendance on their phone' },
            { num: '03', text: 'Students and parents see attendance and notices' },
            { num: '04', text: 'You track fees and reports from one screen' },
          ].map((step) => (
            <article
              key={step.num}
              className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col gap-3 sm:gap-4"
            >
              <span className="font-headline text-[34px] leading-[40px] md:text-[42px] md:leading-[48px] text-brand-amber-large tabular-nums">
                {step.num}
              </span>
              <p className="font-body text-[16px] sm:text-[17px] leading-[24px] sm:leading-[26px] font-medium text-on-surface text-pretty">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-18 border-t border-outline-variant">
        <div className="flex flex-col gap-2 mb-8 sm:mb-10 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
            <p className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-on-surface">
              Pricing
            </p>
          </div>
          <h2 className="font-headline text-[30px] leading-[36px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface">
            Pricing that stays predictable.
          </h2>
          <p className="font-body text-[16px] sm:text-[17px] leading-[25px] sm:leading-[27px] text-on-surface-variant">
            ₹5,499 once. WhatsApp billed monthly, at cost.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-5 sm:gap-6 items-stretch">
          {/* Card 1 */}
          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 shadow-[0_20px_44px_-12px_rgba(27,59,43,0.18)] flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                  Complete Centre Access
                </span>
                <p className="font-headline text-[38px] leading-[44px] md:text-[44px] md:leading-[50px] text-brand-amber-large tabular-nums">
                  ₹5,499
                </p>
                <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                  One-time payment. Lifetime access to the app.
                </p>
              </header>

              <div className="flex flex-col gap-4 border-t border-outline-variant pt-5">
                <ul className="flex flex-col gap-2.5 font-body text-[15px] leading-[23px] text-on-surface">
                  {[
                    'Student, teacher and owner panels',
                    'Attendance, fee tracking and notices',
                    'Setup and handover included',
                    'Your student data stays yours',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-amber-ink shrink-0" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-body text-[13px] text-on-surface-variant">
                  WhatsApp messaging is billed monthly, separately. See right.
                </p>
              </div>
            </div>

            <footer className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onOpenDemoModal}
                className="w-full inline-flex items-center justify-center rounded-full bg-primary text-on-primary px-6 py-3 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Book a free demo
              </button>
              <p className="font-body text-[12px] text-on-surface-variant text-center">
                Free demo first. Pay only after you see it working.
              </p>
            </footer>
          </article>

          {/* Card 2 */}
          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <header className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-brand-amber-ink">
                  WhatsApp Messaging
                </span>
                <h3 className="font-headline text-[24px] leading-[30px] text-on-surface text-balance">
                  Billed monthly, as you use it.
                </h3>
                <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                  Charged at Meta&apos;s per-message rate. No markup on the Meta rate.
                </p>
              </header>

              <div className="flex flex-col gap-4 border-t border-outline-variant pt-4">
                <ul className="flex flex-col gap-2.5 font-body text-[15px] leading-[23px] text-on-surface">
                  {[
                    'Fee reminders, attendance alerts and notices',
                    'Monthly usage report with exact message count',
                    'Start or stop anytime',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-amber-ink shrink-0 mt-1" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-body text-[13px] text-on-surface-variant">
                  A 150-student centre usually pays about ₹300 to ₹600 per month.
                </p>
              </div>
            </div>

            <footer>
              <button
                type="button"
                onClick={() => onNavigate('owner')}
                className="w-full inline-flex items-center justify-center rounded-full border border-outline text-on-surface px-5 py-3 font-label text-[14px] font-medium hover:border-primary hover:bg-surface-container transition-colors cursor-pointer"
              >
                See live WhatsApp calculator
              </button>
            </footer>
          </article>

          {/* Card 3 */}
          <article className="h-full rounded-[18px] border border-outline-variant bg-surface-container-low p-6 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <header className="flex flex-col gap-1.5">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[1.1px] text-on-surface-variant">
                  Custom Solution
                </span>
                <h3 className="font-headline text-[24px] leading-[30px] text-on-surface text-balance">
                  For multi-branch chains.
                </h3>
                <p className="font-body text-[15px] leading-[23px] text-on-surface-variant text-pretty">
                  Per-branch pricing, shared admin panel, custom quote within 2 working days.
                </p>
              </header>

              <ul className="flex flex-col gap-2.5 border-t border-outline-variant pt-4 font-body text-[15px] leading-[23px] text-on-surface">
                {[
                  'Unified multi-branch owner view',
                  'Custom institute branding & setup',
                  'Dedicated onboarding support',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-amber-ink shrink-0 mt-1" aria-hidden="true" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <footer>
              <button
                type="button"
                onClick={onOpenDemoModal}
                className="w-full inline-flex items-center justify-center rounded-full border border-outline text-on-surface px-5 py-3 font-label text-[14px] font-medium hover:border-primary hover:bg-surface-container transition-colors cursor-pointer"
              >
                Contact for custom quote
              </button>
            </footer>
          </article>
        </div>
      </section>

      {/* DATA SAFETY */}
      <section id="security" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 border-t border-outline-variant">
        <div className="rounded-[18px] border border-outline-variant bg-surface-container-low p-6 sm:p-7 md:p-9 shadow-[0_12px_32px_-12px_rgba(26,26,26,0.10)] grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
          <div className="md:col-span-4 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
              <p className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-on-surface">
                Security
              </p>
            </div>
            <h2 className="font-headline text-[30px] leading-[36px] md:text-[40px] md:leading-[46px] text-on-surface">
              Your data, safe.
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="font-body text-[16px] sm:text-[17px] leading-[25px] sm:leading-[27px] text-on-surface-variant text-pretty">
              Student records are stored on secure cloud servers. Only you and your teachers can access them, with automatic daily backups and clear role permissions.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-18 border-t border-outline-variant">
        <div className="max-w-3xl flex flex-col gap-2 mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-px bg-on-surface shrink-0" aria-hidden="true" />
            <p className="font-label text-[12px] font-semibold uppercase tracking-[1.2px] text-on-surface">
              FAQ
            </p>
          </div>
          <h2 className="font-headline text-[30px] leading-[36px] md:text-[42px] md:leading-[48px] tracking-[-0.7px] text-on-surface">
            Frequently asked questions
          </h2>
        </div>

        <div className="border-t border-outline-variant">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={item.question} className="border-b border-outline-variant">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className="font-title text-[17px] sm:text-[18px] leading-[25px] sm:leading-[26px] font-medium text-on-surface min-w-0">
                    {item.question}
                  </span>
                  <Plus
                    className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-45 text-on-surface' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="pb-5 pr-4 sm:pr-10">
                    <p className="font-body text-[15px] leading-[23px] text-on-surface-variant">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-18 border-t border-outline-variant">
        <div className="rounded-[18px] bg-primary text-on-primary p-6 sm:p-8 md:p-12 shadow-[0_20px_44px_-12px_rgba(27,59,43,0.24)] flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          <div className="max-w-xl flex flex-col gap-2">
            <h2 className="font-headline text-[30px] leading-[36px] md:text-[42px] md:leading-[48px] text-inverse-on-surface text-balance">
              Your coaching, on your phone.
            </h2>
            <p className="font-body text-[16px] sm:text-[17px] leading-[25px] sm:leading-[27px] text-inverse-muted text-pretty">
              See it working in your centre. We set it up with you.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-stretch sm:items-start md:items-end gap-2.5">
            <button
              type="button"
              onClick={onOpenDemoModal}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-amber text-primary px-7 py-3.5 font-label text-[14px] font-semibold hover:bg-on-primary transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Book a free demo</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
            <p className="font-body text-[12px] text-inverse-muted text-center sm:text-left">
              thelabworkteam@gmail.com · @the.labwork
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
