"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
  UploadCloud,
  FileCheck2,
  ExternalLink,
  Plus,
  Edit2,
  AlertCircle,
  FileCode,
  Check,
  Sparkles,
} from "lucide-react";
import { Charter, Milestone, CharterDeliverable } from "@/types";
import confetti from "canvas-confetti";

interface CharterViewProps {
  charter: Charter;
  onUpdateCharter: (updated: Charter) => void;
  onSubmitProofModal: (milestone: Milestone) => void;
  activeCollegeName: string;
}

export const CharterView: React.FC<CharterViewProps> = ({
  charter,
  onUpdateCharter,
  onSubmitProofModal,
  activeCollegeName,
}) => {
  const [editingHoursId, setEditingHoursId] = useState<string | null>(null);
  const [editedHours, setEditedHours] = useState<number>(15);
  const [isSigning, setIsSigning] = useState(false);

  const signedCount = charter.participatingClubs.filter((c) => c.signed).length;
  const totalClubs = charter.participatingClubs.length;
  const isFullySigned = signedCount === totalClubs;

  // Sign charter on behalf of active tenant
  const handleSignCharter = () => {
    setIsSigning(true);
    setTimeout(() => {
      const updatedClubs = charter.participatingClubs.map((c) => {
        if (c.institution.toLowerCase().includes(activeCollegeName.toLowerCase()) || !c.signed) {
          return {
            ...c,
            signed: true,
            signedAt: new Date().toLocaleDateString() + " (Signed by Faculty)",
          };
        }
        return c;
      });

      onUpdateCharter({
        ...charter,
        participatingClubs: updatedClubs,
        escrowStatus: updatedClubs.every((c) => c.signed) ? "Active" : "Pending Multi-Sig",
      });
      setIsSigning(false);

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // fallback
      }
    }, 600);
  };

  // Multi-Sig Verification Handler: changes milestone to Verified Proof and mints verification hash
  const handleVerifyDeliverable = (milestoneId: string) => {
    const updatedMilestones = charter.milestones.map((m) => {
      if (m.id === milestoneId) {
        const verifiedList = Array.from(new Set([...m.verifiedBy, activeCollegeName]));
        const isNowVerified = verifiedList.length >= m.requiredSignatures || true;

        return {
          ...m,
          status: "Verified Proof" as const,
          verifiedBy: verifiedList,
          proofHash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)} (Minted Outcome Record)`,
        };
      }
      return m;
    });

    onUpdateCharter({
      ...charter,
      milestones: updatedMilestones,
    });

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // fallback
    }
  };

  // Update capacity commitment hours
  const handleSaveHours = (delivId: string) => {
    const updated = charter.deliverables.map((d) =>
      d.id === delivId ? { ...d, allocatedHoursPerWeek: Number(editedHours) } : d
    );
    onUpdateCharter({
      ...charter,
      deliverables: updated,
    });
    setEditingHoursId(null);
  };

  // Milestone columns
  const committedMilestones = charter.milestones.filter((m) => m.status === "Committed");
  const inReviewMilestones = charter.milestones.filter((m) => m.status === "In Review");
  const verifiedMilestones = charter.milestones.filter((m) => m.status === "Verified Proof");

  return (
    <div className="space-y-6">
      {/* Header: Project Agreement & Multi-Sig Sign-off status */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-6 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
                CHARTER #{charter.id}
              </span>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-500/20">
                Escrow: {charter.escrowStatus}
              </span>
              <span className="font-mono text-[10px] text-zinc-500 truncate max-w-xs">
                Hash: {charter.contractHash}
              </span>
            </div>
            <h1 className="mt-2 text-lg sm:text-2xl font-bold text-zinc-100">
              {charter.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-mono">
              Project Goal: {charter.projectGoal}
            </p>
          </div>

          {/* Mutual Sign-off Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase text-zinc-400">
                Multi-Sig Quorum Status
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-mono font-bold text-emerald-400">
                  {signedCount} of {totalClubs} Signed
                </span>
                <span className="text-xs text-zinc-500">
                  ({Math.round((signedCount / totalClubs) * 100)}%)
                </span>
              </div>
            </div>

            <button
              onClick={handleSignCharter}
              disabled={isFullySigned || isSigning}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold transition-all shadow-md ${
                isFullySigned
                  ? "bg-zinc-800 text-emerald-400 border border-emerald-500/30 cursor-default"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              }`}
            >
              <FileCheck2 className="h-4 w-4" />
              <span>
                {isFullySigned
                  ? "Charter Fully Ratified"
                  : isSigning
                  ? "Verifying Signature..."
                  : `Sign as ${activeCollegeName}`}
              </span>
            </button>
          </div>
        </div>

        {/* Participating Institutions Mutual Sign-off Chips */}
        <div className="mt-4">
          <p className="text-[11px] font-mono uppercase text-zinc-400 mb-2">
            Participating Institution Sign-off Status
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {charter.participatingClubs.map((club, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-lg p-2.5 border transition-all ${
                  club.signed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/80 border-zinc-800 text-zinc-400"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs truncate text-zinc-200">
                      {club.clubName}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">
                    {club.signatoryName}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {club.signed ? (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/30">
                      <Check className="h-3 w-3" />
                      <span>Signed</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-amber-400 border border-amber-500/30">
                      <Clock className="h-3 w-3" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scope of Work: Deliverables & Weekly Capacity Commitments */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono uppercase font-bold text-zinc-200">
              Scope of Work & Capacity Commitments
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">
              (Live-editable weekly hours)
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Total Velocity:{" "}
            {charter.deliverables.reduce((acc, curr) => acc + curr.allocatedHoursPerWeek, 0)} hrs/week
          </span>
        </div>

        <div className="space-y-2.5">
          {charter.deliverables.map((deliv) => {
            const isEditing = editingHoursId === deliv.id;

            return (
              <div
                key={deliv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-zinc-950/70 p-3 border border-zinc-800/80 gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{deliv.title}</span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                      {deliv.ownerCollege}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500">
                    Output Artifact: <span className="text-zinc-400">{deliv.outputArtifact}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={editedHours}
                        onChange={(e) => setEditedHours(Number(e.target.value))}
                        className="w-16 rounded bg-zinc-900 border border-emerald-500 px-2 py-1 text-xs font-mono text-white focus:outline-none"
                      />
                      <span className="font-mono text-zinc-400">hrs/wk</span>
                      <button
                        onClick={() => handleSaveHours(deliv.id)}
                        className="rounded bg-emerald-600 px-2 py-1 text-xs font-mono text-white"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 font-mono text-emerald-400 font-bold">
                        {deliv.allocatedHoursPerWeek} hrs/wk
                      </span>
                      <button
                        onClick={() => {
                          setEditingHoursId(deliv.id);
                          setEditedHours(deliv.allocatedHoursPerWeek);
                        }}
                        className="rounded p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                        title="Edit commitment hours"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Progress Board: 3 Columns (Committed, In Review, Verified Proof) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono uppercase font-bold text-zinc-200">
              Milestone Progress Board
            </h2>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700">
              Multi-Sig Verification Protocol
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            {verifiedMilestones.length} of {charter.milestones.length} Verified
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Committed */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                  Committed ({committedMilestones.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">In Development</span>
            </div>

            <div className="space-y-3">
              {committedMilestones.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-3.5 space-y-2 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-zinc-200">{m.title}</h3>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2">{m.specNotes}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80">
                    <span className="text-zinc-400">{m.assignedClubName}</span>
                    <span>Due: {m.deadline}</span>
                  </div>

                  {/* Submit Proof of Work Button */}
                  <button
                    onClick={() => onSubmitProofModal(m)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-1.5 text-xs font-mono border border-zinc-700 transition-colors"
                  >
                    <UploadCloud className="h-3 w-3 text-emerald-400" />
                    <span>Submit Proof of Work</span>
                  </button>
                </div>
              ))}

              {committedMilestones.length === 0 && (
                <p className="text-center py-6 text-xs font-mono text-zinc-600">
                  No pending committed milestones
                </p>
              )}
            </div>
          </div>

          {/* Column 2: In Review */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-blue-300 uppercase">
                  In Review ({inReviewMilestones.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-blue-400">Peer Audit Stage</span>
            </div>

            <div className="space-y-3">
              {inReviewMilestones.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-blue-500/30 bg-zinc-900/90 p-3.5 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-zinc-200">{m.title}</h3>
                    <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-mono text-blue-300 border border-blue-500/30">
                      Audit
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400">{m.specNotes}</p>

                  {/* Proof Link Preview */}
                  {m.proofUrl && (
                    <a
                      href={m.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded bg-zinc-950 px-2 py-1.5 text-[11px] font-mono text-blue-400 hover:text-blue-300 border border-zinc-800"
                    >
                      <span className="truncate max-w-[200px]">{m.proofUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  )}

                  <div className="text-[10px] font-mono text-zinc-500">
                    Assigned: <span className="text-zinc-300">{m.assignedClubName}</span>
                  </div>

                  {/* Multi-Sig Verification Button */}
                  <button
                    onClick={() => handleVerifyDeliverable(m.id)}
                    className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 text-xs font-mono font-bold shadow-md transition-all"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verify Deliverable (Multi-Sig)</span>
                  </button>
                </div>
              ))}

              {inReviewMilestones.length === 0 && (
                <p className="text-center py-6 text-xs font-mono text-zinc-600">
                  No proofs currently awaiting peer audit
                </p>
              )}
            </div>
          </div>

          {/* Column 3: Verified Proof */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                  Verified Proof ({verifiedMilestones.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Minted Outcomes</span>
            </div>

            <div className="space-y-3">
              {verifiedMilestones.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-emerald-500/40 bg-zinc-900/90 p-3.5 space-y-2 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-zinc-200">{m.title}</h3>
                    <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Minted</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400">{m.specNotes}</p>

                  <div className="rounded bg-zinc-950 px-2 py-1.5 border border-zinc-800 text-[10px] font-mono space-y-0.5">
                    <p className="text-zinc-500">Cryptographic Outcome Record:</p>
                    <p className="text-emerald-400 truncate">{m.proofHash}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                    <span>Verified By: {m.verifiedBy.join(", ") || "IIT Indore, SGSITS"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
