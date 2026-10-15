'use client';

import React, { useState } from "react";
import { Calendar, X, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ExchangeItem } from "@/types";

interface ReserveResourceModalProps {
  item: ExchangeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReservation: (item: ExchangeItem, date: string, scopeOfUse: string) => void;
}

export const ReserveResourceModal: React.FC<ReserveResourceModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirmReservation,
}) => {
  if (!isOpen || !item) return null;

  const [reservationDate, setReservationDate] = useState("2026-10-24");
  const [timeSlot, setTimeSlot] = useState("09:00 - 13:00 (Morning Slot)");
  const [scopeOfUse, setScopeOfUse] = useState(
    "Prototype validation and telemetry testing under designated lab supervision."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        onConfirmReservation(item, reservationDate, scopeOfUse);
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-lavender-200 bg-white p-5 sm:p-6 shadow-elevated-card space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-lavender-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender-100 text-lavender-700">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Reserve Equipment Slot
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                Zero-Idle Spot Market
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resource info card */}
        <div className="rounded-xl bg-lavender-50/70 p-3.5 border border-lavender-200 space-y-1.5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
              <p className="text-[11px] font-mono text-lavender-700 mt-0.5">
                {item.institution} • {item.labName}
              </p>
            </div>
            <span className="rounded bg-white px-2 py-0.5 text-[10px] font-mono text-slate-600 border border-lavender-100">
              {item.category}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-lavender-200/60 flex items-center justify-between">
            <span>Faculty: {item.facultyPOC}</span>
            <span className="text-emerald-700 font-semibold">{item.availability}</span>
          </div>
        </div>

        {/* Form: Date Picker + Time Slot + Scope of Use */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                Reservation Date
              </label>
              <input
                type="date"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
                className="w-full rounded-md border border-lavender-200 bg-lavender-50/40 px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-lavender-500 focus:bg-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                Time Window
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-md border border-lavender-200 bg-lavender-50/40 px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-lavender-500 focus:bg-white focus:outline-none"
              >
                <option value="09:00 - 13:00 (Morning Slot)">09:00 - 13:00 (Morning)</option>
                <option value="14:00 - 18:00 (Afternoon Slot)">14:00 - 18:00 (Afternoon)</option>
                <option value="Full Weekend Intensive">Full Weekend Intensive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
              Purpose / Experiment Scope
            </label>
            <textarea
              rows={2}
              value={scopeOfUse}
              onChange={(e) => setScopeOfUse(e.target.value)}
              placeholder="Brief details of your team's hardware test..."
              className="w-full rounded-md border border-lavender-200 bg-lavender-50/40 p-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-lavender-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="rounded-lg bg-lavender-50/70 p-2.5 border border-lavender-200 text-[10px] font-mono text-slate-600 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-lavender-600 shrink-0" />
            <span>
              Booking issues an automated confirmation voucher in the capability ledger.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-lavender-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || confirmed}
              className="flex items-center gap-1.5 rounded-lg bg-lavender-600 hover:bg-lavender-700 active:scale-95 text-white px-4 py-1.5 text-xs font-semibold transition-all shadow-md shadow-lavender-500/20 cursor-pointer"
            >
              {confirmed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Reserved!</span>
                </>
              ) : isSubmitting ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Confirm Slot</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
