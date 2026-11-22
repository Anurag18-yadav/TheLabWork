import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { DemoRequest } from '../types';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (req: Omit<DemoRequest, 'id' | 'submittedAt'>) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
}) => {
  const [centreName, setCentreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [studentCount, setStudentCount] = useState('50 – 150 students');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/\s+/g, '');
    if (!centreName.trim() || !ownerName.trim() || !city.trim()) {
      setError('Please enter your centre name, your name, and city.');
      return;
    }
    if (!/^[+\d][\d-]{8,14}$/.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }

    onSubmitRequest({
      centreName: centreName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      studentCount,
    });
    setError('');
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setCentreName('');
    setOwnerName('');
    setPhone('');
    setCity('');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div className="w-full max-w-lg rounded-[18px] bg-surface-container-low border border-outline-variant shadow-[0_20px_44px_-12px_rgba(27,59,43,0.24)] p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleResetAndClose}
          aria-label="Close demo dialog"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 pr-11">
              <div className="flex items-center gap-2">
                <span className="w-5 h-px bg-on-surface shrink-0" aria-hidden="true" />
                <span className="font-label text-[12px] font-semibold tracking-[1.1px] uppercase text-brand-amber-ink">
                  Free Live Setup
                </span>
              </div>
              <h2
                id="demo-modal-title"
                className="font-headline text-[26px] leading-[32px] sm:text-[30px] sm:leading-[36px] text-on-surface"
              >
                Book a free demo for your centre
              </h2>
              <p className="font-body text-[15px] leading-[22px] text-on-surface-variant">
                We import your first batch list and show you attendance, fees, and notices working live.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-brand-amber-large bg-surface-container px-4 py-2.5 text-[14px] text-on-surface"
              >
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Coaching Centre Name
                </span>
                <input
                  type="text"
                  value={centreName}
                  onChange={(e) => setCentreName(e.target.value)}
                  placeholder="e.g. Sankalp Academy"
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[15px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  Your Name
                </span>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rajesh Verma"
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[15px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  WhatsApp Number
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 00000"
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[15px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary tabular-nums"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-label text-[13px] font-medium text-on-surface">
                  City
                </span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune / Jaipur"
                  className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[15px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="font-label text-[13px] font-medium text-on-surface">
                Approximate Student Strength
              </span>
              <select
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                className="rounded-xl border border-outline-variant bg-white px-3.5 py-2.5 text-[15px] text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Under 50 students">Under 50 students</option>
                <option value="50 – 150 students">50 – 150 students</option>
                <option value="150 – 400 students">150 – 400 students</option>
                <option value="400+ / Multi-branch">400+ / Multi-branch</option>
              </select>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant">
              <p className="font-body text-[13px] text-on-surface-variant">
                ₹5,499 one-time only after you see it working.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-primary text-on-primary px-6 py-3 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Confirm demo request
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-start gap-4 py-2">
            <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-brand-amber-ink">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-headline text-[30px] leading-[36px] text-on-surface">
              Demo scheduled for {centreName}
            </h2>
            <p className="font-body text-[16px] leading-[24px] text-on-surface-variant">
              Thank you, <strong className="text-on-surface font-medium">{ownerName}</strong>. Our setup team will reach out on{' '}
              <span className="font-mono text-[14px] text-on-surface tabular-nums">{phone}</span> within 24 hours to load your batch list.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="inline-flex items-center justify-center rounded-full bg-primary text-on-primary px-6 py-2.5 font-label text-[14px] font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Back to app
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
