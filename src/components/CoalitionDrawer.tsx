"use client";

import React, { useState, useMemo } from "react";
import {
  Scale,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  Cpu,
  Trash2,
  FileSignature,
  Wand2,
} from "lucide-react";
import { Club, CoalitionSlot } from "@/types";

interface CoalitionDrawerProps {
  coalitionSlots: CoalitionSlot[];
  onRemoveFromCoalition: (clubId: string) => void;
  onAddClubToSlot: (club: Club) => void;
  availableClubs: Club[];
  onDraftCharter: (goal: string, slots: CoalitionSlot[]) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isStandaloneView?: boolean;
}

export const CoalitionDrawer: React.FC<CoalitionDrawerProps> = ({
  coalitionSlots,
  onRemoveFromCoalition,
  onAddClubToSlot,
  availableClubs,
  onDraftCharter,
  isOpen = true,
  onClose,
  isStandaloneView = false,
}) => {
  const [projectGoal, setProjectGoal] = useState(
    "Autonomous Water Quality Monitoring Buoy (Indore Hydro-Grid)"
  );
  const [customRequirement, setCustomRequirement] = useState("");
  const [extractedCapabilities, setExtractedCapabilities] = useState<string[]>([
    "Long-Range Telemetry (LoRaWAN)",
    "Sub-surface Enclosure Casing (IP68)",
    "Wetland Biological Field Validation & Permits",
    "Edge AI Micro-ROS Model",
  ]);

  // Capability mapping based on selected clubs
  const coverageAnalysis = useMemo(() => {
    const coveredCapabilities = new Set<string>();
    const clubCapabilities: { [key: string]: string[] } = {};

    coalitionSlots.forEach((slot) => {
      if (!slot.club) return;
      const skills: string[] = [];
      slot.club.offers.forEach((o) => {
        skills.push(...o.tags);
        if (o.title.toLowerCase().includes("lora") || o.title.toLowerCase().includes("telemetry")) {
          coveredCapabilities.add("Long-Range Telemetry (LoRaWAN)");
        }
        if (o.title.toLowerCase().includes("cad") || o.title.toLowerCase().includes("3d") || o.title.toLowerCase().includes("prototyping") || o.title.toLowerCase().includes("sls")) {
          coveredCapabilities.add("Sub-surface Enclosure Casing (IP68)");
        }
        if (o.title.toLowerCase().includes("wetland") || o.title.toLowerCase().includes("water quality") || o.title.toLowerCase().includes("permit") || o.title.toLowerCase().includes("towing")) {
          coveredCapabilities.add("Wetland Biological Field Validation & Permits");
        }
        if (o.title.toLowerCase().includes("ros") || o.title.toLowerCase().includes("orin") || o.title.toLowerCase().includes("vision") || o.title.toLowerCase().includes("ai")) {
          coveredCapabilities.add("Edge AI Micro-ROS Model");
        }
      });
      clubCapabilities[slot.club.id] = skills;
    });

    const missing = extractedCapabilities.filter(
      (cap) => !coveredCapabilities.has(cap)
    );

    return {
      covered: Array.from(coveredCapabilities),
      missing,
      totalCount: extractedCapabilities.length,
      coveredCount: coveredCapabilities.size,
      percent: Math.round((coveredCapabilities.size / Math.max(extractedCapabilities.length, 1)) * 100),
    };
  }, [coalitionSlots, extractedCapabilities]);

  // Suggest partner based on missing capability
  const suggestedAdvisorPartner = useMemo(() => {
    if (coverageAnalysis.missing.length === 0) return null;

    const firstMissing = coverageAnalysis.missing[0];
    if (firstMissing.includes("Permit") || firstMissing.includes("Wetland")) {
      const partner = availableClubs.find((c) => c.id === "club-davv-biosciences" || c.id === "club-coep-ocean");
      if (partner) {
        return {
          capability: firstMissing,
          partner,
          reason: "Holds statutory Wetland Testing Permits, Bio-chemists and Research Jetty Access",
        };
      }
    }
    if (firstMissing.includes("Telemetry") || firstMissing.includes("LoRa")) {
      const partner = availableClubs.find((c) => c.id === "club-medicaps-drone");
      if (partner) {
        return {
          capability: firstMissing,
          partner,
          reason: "Operates 40km 868MHz high-mast ground station and telemetry stack",
        };
      }
    }
    if (firstMissing.includes("Enclosure") || firstMissing.includes("IP68")) {
      const partner = availableClubs.find((c) => c.id === "club-sgsits-design");
      if (partner) {
        return {
          capability: firstMissing,
          partner,
          reason: "Equipped with SLS Nylon-12 additive manufacturing & IP68 mold tools",
        };
      }
    }
    return null;
  }, [coverageAnalysis.missing, availableClubs]);

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRequirement.trim() && !extractedCapabilities.includes(customRequirement.trim())) {
      setExtractedCapabilities([...extractedCapabilities, customRequirement.trim()]);
      setCustomRequirement("");
    }
  };

  const handleRemoveRequirement = (req: string) => {
    setExtractedCapabilities(extractedCapabilities.filter((r) => r !== req));
  };

  const handleReanalyzeGoal = () => {
    // Demo auto-extraction AI simulation
    const lower = projectGoal.toLowerCase();
    const newCaps: string[] = [];
    if (lower.includes("drone") || lower.includes("patrol") || lower.includes("aerial")) {
      newCaps.push("Autonomous Airframe & Avionics", "Computer Vision Tracking", "Civil Aviation DGCA Permits");
    } else if (lower.includes("ev") || lower.includes("battery") || lower.includes("vehicle")) {
      newCaps.push("BMS Thermal Management", "CAN Bus Telemetry", "High-power Dyno Testing");
    } else {
      newCaps.push(
        "Long-Range Telemetry (LoRaWAN)",
        "Sub-surface Enclosure Casing (IP68)",
        "Wetland Biological Field Validation & Permits",
        "Edge AI Micro-ROS Model"
      );
    }
    setExtractedCapabilities(newCaps);
  };

  const filledSlotsCount = coalitionSlots.filter((s) => s.club !== undefined).length;

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-4 sm:p-6 transition-all ${
        isStandaloneView ? "max-w-7xl mx-auto shadow-2xl" : "shadow-2xl"
      }`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                Multi-Party Coalition Builder
              </h2>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-mono font-medium text-emerald-400 border border-emerald-500/30">
                {filledSlotsCount} of {coalitionSlots.length} Slots Filled
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Assemble cross-college institutions to satisfy composite multi-disciplinary requirements
            </p>
          </div>
        </div>

        {onClose && !isStandaloneView && (
          <button
            onClick={onClose}
            className="self-end sm:self-auto rounded-md p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Project Goal Section with Auto-Extraction */}
      <div className="mt-5 space-y-2">
        <label className="flex items-center justify-between text-xs font-mono text-zinc-300">
          <span>PROJECT MISSION & OBJECTIVE</span>
          <span className="text-zinc-500 text-[11px]">Auto-Capability Extraction Engine Active</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={projectGoal}
              onChange={(e) => setProjectGoal(e.target.value)}
              placeholder="e.g., Autonomous Water Quality Monitoring Buoy with LoRaWAN & Solar BMS"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
          <button
            onClick={handleReanalyzeGoal}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 text-xs font-mono border border-zinc-700 transition-colors shrink-0"
            title="Auto-extract required competencies from project goal"
          >
            <Wand2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Extract Capabilities</span>
          </button>
        </div>
      </div>

      {/* Auto-extracted Capability Checklist */}
      <div className="mt-4 rounded-lg bg-zinc-900/70 border border-zinc-800/90 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-zinc-300">
              Required Capability Checklist
            </span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-zinc-700">
              Coverage: {coverageAnalysis.percent}%
            </span>
          </div>

          <form onSubmit={handleAddRequirement} className="flex items-center gap-2">
            <input
              type="text"
              value={customRequirement}
              onChange={(e) => setCustomRequirement(e.target.value)}
              placeholder="+ Add requirement"
              className="rounded bg-zinc-950 px-2.5 py-1 text-[11px] font-mono text-zinc-200 border border-zinc-800 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-zinc-800 px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-white"
            >
              Add
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {extractedCapabilities.map((cap) => {
            const isCovered = coverageAnalysis.covered.includes(cap);
            return (
              <div
                key={cap}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-all border ${
                  isCovered
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-zinc-950 text-amber-300/90 border-amber-500/30 border-dashed"
                }`}
              >
                {isCovered ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
                <span>{cap}</span>
                <button
                  onClick={() => handleRemoveRequirement(cap)}
                  className="ml-1 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Clubs Grid (Drag-and-Drop / Slot-In Units) */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono uppercase text-zinc-400">
            Selected Coalition Slots ({filledSlotsCount}/{coalitionSlots.length})
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            Click trash icon to vacate a slot or swap partners
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {coalitionSlots.map((slot) => {
            const club = slot.club;
            return (
              <div
                key={slot.slotNumber}
                className={`relative rounded-xl border p-4 transition-all ${
                  club
                    ? "bg-zinc-900 border-zinc-700/80 shadow-md"
                    : "border-dashed border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">
                    Slot {slot.slotNumber}: {slot.role}
                  </span>
                  {club && (
                    <button
                      onClick={() => onRemoveFromCoalition(club.id)}
                      className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                      title="Remove club from coalition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {club ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-base border border-zinc-700">
                        {club.avatarUrl}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-100 truncate">
                          {club.name}
                        </p>
                        <p className="text-[10px] font-mono text-emerald-400 truncate">
                          {club.institution} • {club.domainAttestation}
                        </p>
                      </div>
                    </div>

                    <div className="rounded bg-zinc-950/70 p-2 border border-zinc-800 text-[11px] font-mono">
                      <p className="text-zinc-500 text-[9px] uppercase">Allocated Capability:</p>
                      <p className="text-emerald-300 font-medium truncate mt-0.5">
                        {club.offers[0]?.title || "General Engineering"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                      <span>Match S(A,B): {club.scores.composite}%</span>
                      <span className="text-zinc-300 font-bold">{club.weeklyAvailableHours}h/wk</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-zinc-500 space-y-2">
                    <div className="h-8 w-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-zinc-400">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-zinc-400">Slot Available</p>
                      <p className="text-[10px] text-zinc-600">Select club from Match Explorer feed</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Capability Advisor (Amber Banner) */}
      {suggestedAdvisorPartner && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">
                  Missing Capability Advisory: {suggestedAdvisorPartner.capability}
                </p>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  Warning: The project lacks verified capability for {suggestedAdvisorPartner.capability}. Suggested partner:{" "}
                  <strong className="underline text-amber-100 font-semibold">
                    {suggestedAdvisorPartner.partner.name} ({suggestedAdvisorPartner.partner.institution})
                  </strong>{" "}
                  — {suggestedAdvisorPartner.reason}.
                </p>
              </div>
            </div>

            <button
              onClick={() => onAddClubToSlot(suggestedAdvisorPartner.partner)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-1.5 text-xs font-mono font-bold transition-all shrink-0 shadow-sm"
            >
              <span>Slot-in {suggestedAdvisorPartner.partner.campusCode}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Action Bar: Draft Multi-Party Charter */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-zinc-800 gap-3">
        <div className="text-xs font-mono text-zinc-400">
          Status:{" "}
          <span className="text-emerald-400 font-semibold">
            {filledSlotsCount >= 2 ? "Coalition Quorum Reached" : "Awaiting Partner Slots"}
          </span>{" "}
          • Multi-Sig Escrow Active
        </div>

        <button
          onClick={() => onDraftCharter(projectGoal, coalitionSlots)}
          disabled={filledSlotsCount === 0}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-mono font-bold transition-all shadow-md ${
            filledSlotsCount > 0
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          <FileSignature className="h-4 w-4" />
          <span>Draft Multi-Party Charter & Milestones</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
