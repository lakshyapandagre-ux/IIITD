"use client";

import React, { useState } from "react";
import { Send, X, Sparkles, Building, CheckCircle2 } from "lucide-react";
import { Club } from "@/types";

interface QuickPitchModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
  senderCollege: Club;
  onSendSuccess: (message: string) => void;
}

export const QuickPitchModal: React.FC<QuickPitchModalProps> = ({
  club,
  isOpen,
  onClose,
  senderCollege,
  onSendSuccess,
}) => {
  if (!isOpen || !club) return null;

  const [pitchMessage, setPitchMessage] = useState(
    `Hello ${club.name} team,\n\nWe at ${senderCollege.name} are developing a multi-college initiative and would like to pair our ${senderCollege.offers[0]?.title || "compute/engineering"} surplus with your expertise in ${club.offers[0]?.title || "hardware"}. Would you be open to an initial 15-minute multi-sig sync?`
  );
  const [selectedSurplus, setSelectedSurplus] = useState(senderCollege.offers[0]?.title || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onSendSuccess(`Quick pitch transmitted to ${club.facultyPOC} (${club.domainAttestation})`);
        onClose();
      }, 1000);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">
                Dispatch Quick Pitch Proposal
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Direct institutional handshake to {club.campusCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Target Details */}
        <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-xs space-y-1 font-mono">
          <div className="flex justify-between text-zinc-400">
            <span>Recipient:</span>
            <span className="text-zinc-200 font-bold">{club.name}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Faculty POC:</span>
            <span className="text-zinc-300">{club.facultyPOC}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Attestation:</span>
            <span className="text-emerald-400">verified .{club.domainAttestation}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Surplus Capability to Put in Escrow
            </label>
            <select
              value={selectedSurplus}
              onChange={(e) => setSelectedSurplus(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              {senderCollege.offers.map((offer, idx) => (
                <option key={idx} value={offer.title}>
                  {offer.title} ({offer.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Collaboration Pitch & Value Exchange
            </label>
            <textarea
              rows={4}
              value={pitchMessage}
              onChange={(e) => setPitchMessage(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-400 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || sent}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-xs font-mono font-bold transition-all shadow-sm"
            >
              {sent ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Transmitted!</span>
                </>
              ) : isSubmitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Handshake Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
