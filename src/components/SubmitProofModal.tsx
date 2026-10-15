"use client";

import React, { useState } from "react";
import { UploadCloud, X, GitPullRequest, FileCode, CheckCircle2, ShieldCheck } from "lucide-react";
import { Milestone } from "@/types";

interface SubmitProofModalProps {
  milestone: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProof: (milestoneId: string, proofUrl: string, specNotes: string) => void;
}

export const SubmitProofModal: React.FC<SubmitProofModalProps> = ({
  milestone,
  isOpen,
  onClose,
  onSubmitProof,
}) => {
  if (!isOpen || !milestone) return null;

  const [proofType, setProofType] = useState<"github_pr" | "file_upload">("github_pr");
  const [githubPrUrl, setGithubPrUrl] = useState(
    "https://github.com/indore-hydrogrid/buoy-firmware/pull/29"
  );
  const [fileName, setFileName] = useState("calibration_bench_matrix_v2.pdf");
  const [proofNotes, setProofNotes] = useState(
    "Executed 72-hour zero-drift benchmark at pier testbench. All metrics validated within ±1.5% tolerance."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalProofUrl = proofType === "github_pr" ? githubPrUrl : `ipfs://bafybeic.../${fileName}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setCompleted(true);
      setTimeout(() => {
        setCompleted(false);
        onSubmitProof(milestone.id, finalProofUrl, proofNotes);
        onClose();
      }, 900);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">
                Submit Verifiable Proof of Work
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Multi-Sig Peer Audit & Verification Pipeline
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

        {/* Milestone preview */}
        <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-xs font-mono space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>Milestone:</span>
            <span className="text-zinc-200 font-bold truncate max-w-xs">{milestone.title}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Assigned Club:</span>
            <span className="text-emerald-400">{milestone.assignedClubName}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Deadline:</span>
            <span className="text-zinc-300">{milestone.deadline}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Proof Type Toggle */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
              Proof Delivery Vector
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProofType("github_pr")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-mono border transition-all ${
                  proofType === "github_pr"
                    ? "bg-zinc-800 border-emerald-500/50 text-emerald-300 font-semibold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <GitPullRequest className="h-3.5 w-3.5" />
                <span>GitHub Pull Request</span>
              </button>
              <button
                type="button"
                onClick={() => setProofType("file_upload")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-mono border transition-all ${
                  proofType === "file_upload"
                    ? "bg-zinc-800 border-emerald-500/50 text-emerald-300 font-semibold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>CAD / PDF Artifact</span>
              </button>
            </div>
          </div>

          {proofType === "github_pr" ? (
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                GitHub PR / Commit Hash URL
              </label>
              <input
                type="url"
                value={githubPrUrl}
                onChange={(e) => setGithubPrUrl(e.target.value)}
                placeholder="https://github.com/organization/repo/pull/12"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Artifact File (CAD STEP, Lab Report, Spectrogram)
              </label>
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/60 p-4 text-center">
                <UploadCloud className="mx-auto h-6 w-6 text-zinc-500 mb-1" />
                <p className="text-xs font-mono text-zinc-300">{fileName}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Simulated IPFS sha256 artifact hashing enabled
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Deliverable Summary & Test Bench Results
            </label>
            <textarea
              rows={3}
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2.5 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Action buttons */}
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
              disabled={isSubmitting || completed}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 text-xs font-mono font-bold transition-all shadow-sm"
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submitted to Peer Review!</span>
                </>
              ) : isSubmitting ? (
                <span>Generating Cryptographic Proof...</span>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Submit Proof to Coalition</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
