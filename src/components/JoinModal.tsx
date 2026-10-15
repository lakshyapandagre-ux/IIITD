'use client';

import React, { useState } from "react";
import { X, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orgName: string) => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [institutionName, setInstitutionName] = useState("");
  const [eduEmail, setEduEmail] = useState("");
  const [domainRole, setDomainRole] = useState("Robotics & Autonomous Systems");
  const [primaryOffer, setPrimaryOffer] = useState("");
  const [primaryNeed, setPrimaryNeed] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7C5CFC", "#A78BFA", "#C4B5FD", "#818CF8", "#F5F3FF"],
        });
      } catch (err) {
        // fallback
      }

      setTimeout(() => {
        setIsSuccess(false);
        onSuccess(institutionName || "Your Institution");
        onClose();
      }, 1200);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-lavender-200 bg-white p-6 shadow-elevated-card space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-lavender-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lavender-100 text-lavender-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Join NexusCollab Network
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Institutional .edu / .ac.in registration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
              University / Institution
            </label>
            <input
              type="text"
              required
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g. IIT Indore, SGSITS, DAVV"
              className="w-full rounded-lg border border-lavender-200 bg-lavender-50/40 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-lavender-500 focus:bg-white focus:outline-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
              Institutional Email (.ac.in / .edu)
            </label>
            <input
              type="email"
              required
              value={eduEmail}
              onChange={(e) => setEduEmail(e.target.value)}
              placeholder="lead@iiti.ac.in"
              className="w-full rounded-lg border border-lavender-200 bg-lavender-50/40 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-lavender-500 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
              Primary Engineering Focus
            </label>
            <select
              value={domainRole}
              onChange={(e) => setDomainRole(e.target.value)}
              className="w-full rounded-lg border border-lavender-200 bg-lavender-50/40 px-3 py-2 text-xs text-slate-700 focus:border-lavender-500 focus:bg-white focus:outline-none font-sans"
            >
              <option value="Robotics & Autonomous Systems">Robotics & Autonomous Systems</option>
              <option value="Industrial Design & Prototyping">Industrial Design & Prototyping</option>
              <option value="Biotech & Environmental Sensing">Biotech & Environmental Sensing</option>
              <option value="Avionics & Drone Telemetry">Avionics & Drone Telemetry</option>
              <option value="AI & Perception Models">AI & Perception Models</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                Surplus (What You Offer)
              </label>
              <input
                type="text"
                required
                value={primaryOffer}
                onChange={(e) => setPrimaryOffer(e.target.value)}
                placeholder="e.g. 5-Axis CNC, ROS2"
                className="w-full rounded-lg border border-lavender-200 bg-lavender-50/40 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-lavender-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                Need (What You Seek)
              </label>
              <input
                type="text"
                required
                value={primaryNeed}
                onChange={(e) => setPrimaryNeed(e.target.value)}
                placeholder="e.g. Field Permits, LoRa link"
                className="w-full rounded-lg border border-lavender-200 bg-lavender-50/40 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-lavender-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg bg-lavender-50/80 p-3 border border-lavender-200 flex items-center gap-2 text-[11px] text-slate-600 font-sans">
            <ShieldCheck className="h-4 w-4 text-lavender-600 shrink-0" />
            <span>
              All submissions undergo faculty co-signature verification and receive an automatic verified tenant credential.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-lavender-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="flex items-center gap-2 rounded-lg bg-lavender-600 hover:bg-lavender-700 active:scale-95 text-white px-4 py-2 text-xs font-semibold transition-all shadow-md shadow-lavender-500/20 cursor-pointer"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Node Registered!</span>
                </>
              ) : isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <span>Submit Node</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
