'use client';

import React, { useState } from "react";
import {
  ExternalLink,
  Eye,
  Code,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  GitPullRequest,
  Copy,
  Check,
  Terminal,
} from "lucide-react";

interface ShowcaseCardProps {
  id: string;
  title: string;
  categoryTag: string;
  description: string;
  leadClubs: string[];
  statusBadge: string;
  codeSnippet: string;
  hardwareSpecs: { label: string; value: string; icon?: string }[];
  milestones: { title: string; status: "Verified" | "In Review" | "Committed"; owner: string }[];
  matchScore: number;
  onFormTeam: () => void;
  onLivePreview: () => void;
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  id,
  title,
  categoryTag,
  description,
  leadClubs,
  statusBadge,
  codeSnippet,
  hardwareSpecs,
  milestones,
  matchScore,
  onFormTeam,
  onLivePreview,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-lavender-200 bg-white p-6 md:p-7 hover:border-lavender-400 transition-all duration-300 shadow-soft-lavender hover:shadow-elevated-card relative overflow-hidden group">
      {/* Soft top lavender accent line */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-lavender-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-lavender-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Category Badge in Soft Lavender */}
            <span className="rounded-full bg-lavender-100 px-2.5 py-0.5 text-xs font-mono font-medium text-lavender-800 border border-lavender-200/80 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lavender-600" />
              <span>{categoryTag}</span>
            </span>

            {/* Verified Status Badge */}
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-mono text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{statusBadge}</span>
            </span>

            {/* Complementarity Match Score */}
            <span className="rounded-full bg-lavender-50 px-2.5 py-0.5 text-xs font-mono text-lavender-700 font-bold border border-lavender-200 flex items-center gap-1">
              <span>{matchScore}% Complementarity</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-lavender-700 transition-colors">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-normal">
            {description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-500">
            <span className="text-slate-400 font-sans">Hubs:</span>
            {leadClubs.map((club, idx) => (
              <span
                key={idx}
                className="rounded-md bg-lavender-50/70 border border-lavender-200/70 px-2 py-0.5 text-slate-700 text-[11px]"
              >
                {club}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 pt-1 lg:pt-0">
          <button
            onClick={onLivePreview}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-lavender-200 hover:border-lavender-400 hover:bg-lavender-50/50 text-slate-700 px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs active:scale-95 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-lavender-600" />
            <span>Blueprint</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </button>

          <button
            onClick={onFormTeam}
            className="flex items-center gap-1.5 rounded-lg bg-lavender-600 hover:bg-lavender-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-1.5 transition-all shadow-md shadow-lavender-500/20 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Join Coalition</span>
          </button>
        </div>
      </div>

      {/* Card Showcase Multi-Panel Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Panel 1: Telemetry & Code */}
        <div className="rounded-xl border border-lavender-200/80 bg-lavender-50/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-lavender-200/60">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-lavender-600" />
                <span className="text-xs font-mono font-bold uppercase text-slate-700">
                  Telemetry & Micro-ROS
                </span>
              </div>

              {/* Specs / Code Toggle */}
              <div className="flex rounded-md bg-white border border-lavender-200 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-lavender-100 text-lavender-800 font-semibold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                    activeTab === "code"
                      ? "bg-lavender-100 text-lavender-800 font-semibold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Code
                </button>
              </div>
            </div>

            {activeTab === "preview" ? (
              <div className="mt-3 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between rounded bg-white px-2.5 py-1.5 border border-lavender-100 text-slate-600">
                  <span>Protocol:</span>
                  <span className="text-slate-900 font-bold">LoRaWAN 868MHz</span>
                </div>
                <div className="flex justify-between rounded bg-white px-2.5 py-1.5 border border-lavender-100 text-slate-600">
                  <span>Edge Compute:</span>
                  <span className="text-lavender-700 font-bold">Jetson AGX Orin</span>
                </div>
                <div className="flex justify-between rounded bg-white px-2.5 py-1.5 border border-lavender-100 text-slate-600">
                  <span>Stream Rate:</span>
                  <span className="text-slate-800">10Hz MQTT Telemetry</span>
                </div>
              </div>
            ) : (
              <div className="relative mt-2.5">
                <pre className="rounded-lg bg-slate-900 p-3 text-[10px] font-mono text-slate-200 overflow-x-auto max-h-36 border border-slate-800">
                  <code>{codeSnippet}</code>
                </pre>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 rounded p-1 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  title="Copy snippet"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-lavender-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Latency: &lt;45ms</span>
            <span className="text-emerald-600 font-medium">P2P Encrypted</span>
          </div>
        </div>

        {/* Panel 2: Shared Equipment Specs */}
        <div className="rounded-xl border border-lavender-200/80 bg-lavender-50/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-lavender-200/60">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-lavender-600" />
                <span className="text-xs font-mono font-bold uppercase text-slate-700">
                  Shared Hardware
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Slot Open</span>
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              {hardwareSpecs.map((spec, sIdx) => (
                <div
                  key={sIdx}
                  className="flex items-center justify-between rounded bg-white px-2.5 py-1.5 border border-lavender-100 text-xs font-mono"
                >
                  <span className="text-slate-500">{spec.label}</span>
                  <span className="text-slate-800 font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-lavender-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Availability:</span>
            <span className="text-lavender-700 font-bold">Weekends Open</span>
          </div>
        </div>

        {/* Panel 3: Milestones */}
        <div className="rounded-xl border border-lavender-200/80 bg-lavender-50/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-lavender-200/60">
              <div className="flex items-center gap-1.5">
                <GitPullRequest className="h-3.5 w-3.5 text-lavender-600" />
                <span className="text-xs font-mono font-bold uppercase text-slate-700">
                  Milestones
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-medium">
                2/3 Verified
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              {milestones.map((m, mIdx) => (
                <div
                  key={mIdx}
                  className={`rounded p-2 border text-xs font-mono flex items-center justify-between bg-white ${
                    m.status === "Verified"
                      ? "border-emerald-200 text-slate-800"
                      : "border-lavender-100 text-slate-600"
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold block truncate max-w-[150px]">{m.title}</span>
                    <span className="text-[10px] text-slate-400">{m.owner}</span>
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

          <div className="mt-3 pt-2.5 border-t border-lavender-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Escrow:</span>
            <span className="text-slate-600 font-mono">0x8fa3...b401e</span>
          </div>
        </div>
      </div>
    </div>
  );
};
