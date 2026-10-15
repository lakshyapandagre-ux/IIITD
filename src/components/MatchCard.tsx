"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Send,
  Zap,
  Building,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Award,
} from "lucide-react";
import { Club } from "@/types";

interface MatchCardProps {
  club: Club;
  onQuickPitch: (club: Club) => void;
  onAddToCoalition: (club: Club) => void;
  isInCoalition: boolean;
  activeTenantCollege: Club;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  club,
  onQuickPitch,
  onAddToCoalition,
  isInCoalition,
  activeTenantCollege,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { scores } = club;

  // Visual verification tier styling
  const getVerificationBadge = (tier: string) => {
    if (tier.includes("Dean") || tier.includes("Tier 1")) {
      return {
        bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        icon: Award,
        label: tier,
      };
    }
    if (tier.includes("DST") || tier.includes("Gov")) {
      return {
        bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        icon: ShieldCheck,
        label: tier,
      };
    }
    return {
      bg: "bg-zinc-800 text-zinc-300 border-zinc-700",
      icon: ShieldCheck,
      label: tier,
    };
  };

  const badgeConfig = getVerificationBadge(club.verificationStatus);
  const BadgeIcon = badgeConfig.icon;

  // Score color helper
  const getScoreColor = (val: number) => {
    if (val >= 90) return "text-emerald-400";
    if (val >= 80) return "text-blue-400";
    return "text-amber-400";
  };

  const getScoreBarBg = (val: number) => {
    if (val >= 90) return "bg-emerald-500";
    if (val >= 80) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <div
      className={`group relative rounded-xl border bg-zinc-900/90 backdrop-blur-sm p-4 sm:p-5 transition-all duration-200 hover:border-zinc-700 hover:shadow-xl ${
        isInCoalition
          ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          : "border-zinc-800/90"
      }`}
    >
      {/* Top Banner Accent */}
      <div
        className={`absolute inset-x-0 top-0 h-[2px] rounded-t-xl bg-gradient-to-r ${club.bannerGradient}`}
      />

      {/* Overlooked Exploration Callout */}
      {club.isOverlooked && (
        <div className="mb-2 flex items-center gap-1.5 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-300 border border-amber-500/20 w-fit">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Exploration Spotlight: High Complementarity Overlooked Lab</span>
        </div>
      )}

      {/* Club Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/80 text-xl shadow-inner">
            {club.avatarUrl}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                {club.name}
              </h3>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-300 border border-zinc-700">
                {club.campusCode}
              </span>
              <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                {club.domain}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-zinc-300">
                <Building className="h-3 w-3 text-zinc-500" />
                {club.institution}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-[11px] text-zinc-500">
                {club.domainAttestation}
              </span>
              <span className="text-zinc-600">•</span>
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${badgeConfig.bg}`}
              >
                <BadgeIcon className="h-3 w-3" />
                <span>{badgeConfig.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithmic Score Composite Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 transition-all text-left"
            title="Click to view Algorithmic Score Breakdown: S(A, B) = f(C, G, R, T)"
          >
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 leading-none">
                Score S(A,B)
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-lg font-mono font-bold tabular-nums leading-none ${getScoreColor(
                    scores.composite
                  )}`}
                >
                  {scores.composite}%
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Match</span>
              </div>
            </div>
            <div className="pl-1 border-l border-zinc-800 text-zinc-400">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Expandable Algorithmic Breakdown Micro-Gauges: C, G, R, T */}
      {isExpanded && (
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/90 p-3.5 space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[11px] font-mono text-zinc-400">
              Algorithmic Objective Function Breakdown:{" "}
              <code className="text-emerald-400">S(A, B) = w₁C + w₂G + w₃R + w₄T</code>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Tenant: {activeTenantCollege.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* C: Skill Complementarity */}
            <div className="rounded bg-zinc-900/90 border border-zinc-800 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">C: Skills</span>
                <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                  {scores.skillComplementarity}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${scores.skillComplementarity}%` }}
                />
              </div>
              <p className="mt-1 text-[9px] text-zinc-500">Symmetric skill overlap</p>
            </div>

            {/* G: Goal Alignment */}
            <div className="rounded bg-zinc-900/90 border border-zinc-800 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">G: Alignment</span>
                <span className="text-xs font-mono font-bold text-blue-400 tabular-nums">
                  {scores.goalAlignment}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${scores.goalAlignment}%` }}
                />
              </div>
              <p className="mt-1 text-[9px] text-zinc-500">Milestone objective sync</p>
            </div>

            {/* R: Resource Availability */}
            <div className="rounded bg-zinc-900/90 border border-zinc-800 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">R: Resource</span>
                <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
                  {scores.resourceAvailability}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${scores.resourceAvailability}%` }}
                />
              </div>
              <p className="mt-1 text-[9px] text-zinc-500">{club.weeklyAvailableHours} hrs/wk capacity</p>
            </div>

            {/* T: Verification / Trust */}
            <div className="rounded bg-zinc-900/90 border border-zinc-800 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">T: Trust</span>
                <span className="text-xs font-mono font-bold text-purple-400 tabular-nums">
                  {scores.verificationTrust}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${scores.verificationTrust}%` }}
                />
              </div>
              <p className="mt-1 text-[9px] text-zinc-500">Multi-sig & faculty co-sign</p>
            </div>
          </div>

          <div className="rounded bg-zinc-900/50 px-2.5 py-1.5 border border-zinc-800 text-[11px] text-zinc-300 font-mono flex items-start gap-2">
            <span className="text-emerald-400 font-bold shrink-0">MATCH RATIONALE:</span>
            <span>{scores.rationale}</span>
          </div>
        </div>
      )}

      {/* Complementarity Split Bar (Hero Unit feature) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80">
        {/* Left: Surplus / Offers (Skills & Equipment Offered) */}
        <div className="rounded-lg bg-zinc-950/60 p-3 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Surplus Capabilities (Offers)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {club.offers.length} capabilities
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {club.offers.map((offer, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-mono text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                title={`${offer.category.toUpperCase()}: ${offer.capacity}`}
              >
                {offer.title}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Deficits / Needs (Skills Required) */}
        <div className="rounded-lg bg-zinc-950/60 p-3 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span>Capability Deficits (Needs)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {club.needs.length} bottlenecks
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {club.needs.map((need, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-mono border transition-colors ${
                  need.urgency === "Blocker"
                    ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    : "bg-zinc-800/70 text-zinc-300 border-zinc-700/80"
                }`}
                title={`Urgency: ${need.urgency} • ${need.category}`}
              >
                {need.title}
                {need.urgency === "Blocker" && (
                  <span className="rounded bg-rose-500/30 px-1 py-0.2 text-[9px] font-bold text-rose-300">
                    BLOCKER
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls: Quick Pitch + Add to Coalition */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800/80">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="font-mono text-[11px]">
            <span className="text-zinc-200 font-semibold">{club.activeProjectsCount}</span> active charters
          </span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-[11px]">
            <span className="text-zinc-200 font-semibold">{club.completedChartersCount}</span> proofs minted
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Pitch Action Button */}
          <button
            onClick={() => onQuickPitch(club)}
            className="flex items-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white px-3 py-1.5 text-xs font-medium transition-colors border border-zinc-700"
          >
            <Send className="h-3 w-3 text-zinc-400" />
            <span>Quick Pitch</span>
          </button>

          {/* Add to Coalition Action Button */}
          <button
            onClick={() => onAddToCoalition(club)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              isInCoalition
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
            }`}
          >
            {isInCoalition ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>In Coalition</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Add to Coalition</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
