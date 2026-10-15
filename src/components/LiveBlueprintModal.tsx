'use client';

import React, { useState } from "react";
import { X, ExternalLink, ShieldCheck, Cpu, Terminal, Download, Check, Sparkles, Network, CheckCircle2 } from "lucide-react";

interface LiveBlueprintModalProps {
  project: {
    id: string;
    title: string;
    categoryTag: string;
    description: string;
    leadClubs: string[];
    statusBadge: string;
    matchScore: number;
    codeSnippet: string;
    hardwareSpecs: { label: string; value: string }[];
    milestones: { title: string; status: "Verified" | "In Review" | "Committed"; owner: string }[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onFormTeam: () => void;
}

export const LiveBlueprintModal: React.FC<LiveBlueprintModalProps> = ({
  project,
  isOpen,
  onClose,
  onFormTeam,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen || !project) return null;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-lavender-200 bg-white p-6 shadow-elevated-card space-y-4 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-lavender-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-lavender-100 px-2.5 py-0.5 text-xs font-mono font-medium text-lavender-800 border border-lavender-200">
                {project.categoryTag}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-mono text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>{project.statusBadge}</span>
              </span>
              <span className="rounded-full bg-lavender-50 px-2.5 py-0.5 text-xs font-mono text-lavender-700 font-bold border border-lavender-200">
                {project.matchScore}% Synergy
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {project.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl font-sans">
              {project.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* System Architecture Diagram */}
        <div className="rounded-xl border border-lavender-200 bg-lavender-50/50 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-lavender-200/70 pb-2">
            <span className="text-xs font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-lavender-600" />
              <span>Multi-Institution Architecture</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Verified Topology</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-lg bg-white p-3 border border-lavender-200 space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono text-lavender-700 font-bold uppercase">Node A: Edge AI</span>
              <p className="text-xs font-bold text-slate-900">IIT Indore</p>
              <p className="text-[11px] text-slate-500 font-mono">
                Jetson AGX Orin • TensorRT
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-lavender-200 space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono text-lavender-700 font-bold uppercase">Node B: Enclosure</span>
              <p className="text-xs font-bold text-slate-900">SGSITS Indore</p>
              <p className="text-[11px] text-slate-500 font-mono">
                SLS Nylon-12 • IP68 Sealed
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-lavender-200 space-y-1 shadow-2xs">
              <span className="text-[10px] font-mono text-lavender-700 font-bold uppercase">Node C: Radio Link</span>
              <p className="text-xs font-bold text-slate-900">DAVV & Medi-Caps</p>
              <p className="text-[11px] text-slate-500 font-mono">
                Sirpur Pier • 40km LoRaWAN
              </p>
            </div>
          </div>
        </div>

        {/* Specifications & Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-xl border border-lavender-200 bg-lavender-50/30 p-3.5 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-700">
              Lab Specifications
            </h3>
            <div className="space-y-1.5">
              {project.hardwareSpecs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-white border border-lavender-100"
                >
                  <span className="text-slate-500">{spec.label}</span>
                  <span className="text-slate-900 font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-lavender-200 bg-lavender-50/30 p-3.5 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-700">
              Milestone Status
            </h3>
            <div className="space-y-1.5">
              {project.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-white border border-lavender-100"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-slate-900 font-medium truncate">{m.title}</p>
                    <p className="text-[10px] text-slate-400">{m.owner}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5 ${
                      m.status === "Verified"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : m.status === "In Review"
                        ? "bg-lavender-100 text-lavender-700 border border-lavender-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {m.status === "Verified" && <Check className="h-2.5 w-2.5 text-emerald-600" />}
                    <span>{m.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3.5 border-t border-lavender-100 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-lavender-200 hover:border-lavender-400 px-3.5 py-2 text-xs font-mono text-slate-700 hover:bg-lavender-50 transition-colors w-full sm:w-auto justify-center cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Downloaded Bundle!</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Download STEP & ROS2 Bundle</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors flex-1 sm:flex-none cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onFormTeam();
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-lavender-600 hover:bg-lavender-700 active:scale-95 text-white font-semibold px-4 py-2 text-xs font-sans transition-all shadow-md shadow-lavender-500/20 flex-1 sm:flex-none cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Join Coalition</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
