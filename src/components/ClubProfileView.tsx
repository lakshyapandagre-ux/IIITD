"use client";

import React, { useState } from "react";
import {
  Cpu,
  ShieldCheck,
  Building,
  Plus,
  Sliders,
  Star,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Award,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Save,
} from "lucide-react";
import { Club, HistoricalProof } from "@/types";
import { MOCK_HISTORICAL_PROOFS } from "@/data/mockData";

interface ClubProfileViewProps {
  club: Club;
  onUpdateClub: (updated: Club) => void;
}

export const ClubProfileView: React.FC<ClubProfileViewProps> = ({
  club,
  onUpdateClub,
}) => {
  const [weeklyHours, setWeeklyHours] = useState(club.weeklyAvailableHours);
  const [offers, setOffers] = useState(club.offers);
  const [needs, setNeeds] = useState(club.needs);

  // New offer form state
  const [newOfferTitle, setNewOfferTitle] = useState("");
  const [newOfferCategory, setNewOfferCategory] = useState<"skill" | "equipment" | "space" | "dataset">("skill");
  const [newOfferCapacity, setNewOfferCapacity] = useState("");

  // New need form state
  const [newNeedTitle, setNewNeedTitle] = useState("");
  const [newNeedUrgency, setNewNeedUrgency] = useState<"Low" | "High" | "Blocker">("High");
  const [newNeedCategory, setNewNeedCategory] = useState("");

  const [savedFeedback, setSavedFeedback] = useState(false);

  // Add offer
  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle.trim()) return;

    const newOffer = {
      title: newOfferTitle.trim(),
      category: newOfferCategory,
      capacity: newOfferCapacity.trim() || "Available for collaboration",
      tags: [newOfferCategory.toUpperCase(), "Verified"],
    };

    const updated = [...offers, newOffer];
    setOffers(updated);
    setNewOfferTitle("");
    setNewOfferCapacity("");
    onUpdateClub({ ...club, offers: updated });
  };

  // Remove offer
  const handleRemoveOffer = (idx: number) => {
    const updated = offers.filter((_, i) => i !== idx);
    setOffers(updated);
    onUpdateClub({ ...club, offers: updated });
  };

  // Add need
  const handleAddNeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeedTitle.trim()) return;

    const newNeed = {
      title: newNeedTitle.trim(),
      urgency: newNeedUrgency,
      category: newNeedCategory.trim() || "Technical Requirement",
    };

    const updated = [...needs, newNeed];
    setNeeds(updated);
    setNewNeedTitle("");
    setNewNeedCategory("");
    onUpdateClub({ ...club, needs: updated });
  };

  // Remove need
  const handleRemoveNeed = (idx: number) => {
    const updated = needs.filter((_, i) => i !== idx);
    setNeeds(updated);
    onUpdateClub({ ...club, needs: updated });
  };

  const handleSaveCapacity = () => {
    onUpdateClub({
      ...club,
      weeklyAvailableHours: weeklyHours,
      offers,
      needs,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header with Institution Domain Attestation (.ac.in badge) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-3xl shadow-inner">
              {club.avatarUrl}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
                  {club.name}
                </h1>
                <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>.{club.domainAttestation} Verified Institutional Node</span>
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-300">
                  <Building className="h-3.5 w-3.5 text-zinc-500" />
                  {club.institution} ({club.campusCode})
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                  {club.labAddress}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-300 font-mono">
                  POC: {club.facultyPOC}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-300 border border-zinc-700">
                  Domain: {club.domain}
                </span>
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-mono text-blue-300 border border-blue-500/20">
                  {club.verificationStatus}
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                  Trust Score: {club.scores.verificationTrust}/100
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0 gap-2">
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase text-zinc-500">
                Weekly Syndicate Bandwidth
              </p>
              <p className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
                {weeklyHours} hrs/wk
              </p>
            </div>
            <button
              onClick={handleSaveCapacity}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-mono font-bold transition-all shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{savedFeedback ? "Saved!" : "Save Ledger State"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Capacity Commitment Slider */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-mono uppercase font-bold text-zinc-200">
              Syndicate Weekly Engineering Velocity Slider
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
            {weeklyHours} Hours Available / Week
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-3 font-mono">
          Slide to allocate student engineering hours and lab supervisor slots to the inter-college network.
        </p>
        <input
          type="range"
          min={10}
          max={120}
          step={5}
          value={weeklyHours}
          onChange={(e) => setWeeklyHours(Number(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
          <span>10 hrs (Minimum Reserve)</span>
          <span>60 hrs (Standard Cohort)</span>
          <span>120 hrs (Full Lab Immersion)</span>
        </div>
      </div>

      {/* Two-Column Capability Ledger Editor: What We Offer vs What We Need */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: What We Offer */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase">
                  What We Offer (Surplus Capabilities)
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {offers.length} Registered
              </span>
            </div>

            {/* List of Offers */}
            <div className="space-y-2">
              {offers.map((offer, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-lg bg-zinc-950/80 p-3 border border-zinc-800/90 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-zinc-200">{offer.title}</p>
                    <p className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
                      Capacity: {offer.capacity}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {offer.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded bg-zinc-900 px-1.5 py-0.2 text-[9px] font-mono text-zinc-400 border border-zinc-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveOffer(idx)}
                    className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Add New Offer */}
          <form
            onSubmit={handleAddOffer}
            className="rounded-lg bg-zinc-950/60 p-3 border border-zinc-800 space-y-2"
          >
            <p className="text-[10px] font-mono uppercase text-zinc-400">
              + Register New Surplus Capability
            </p>
            <input
              type="text"
              value={newOfferTitle}
              onChange={(e) => setNewOfferTitle(e.target.value)}
              placeholder="e.g. 5-Axis CNC Lab, Jetson AI Cluster, CAD Designers"
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newOfferCategory}
                onChange={(e) =>
                  setNewOfferCategory(e.target.value as "skill" | "equipment" | "space" | "dataset")
                }
                className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1.5 text-xs text-zinc-300 font-mono"
              >
                <option value="skill">Skill / Engineering Squad</option>
                <option value="equipment">Lab Equipment / Rig</option>
                <option value="space">Test Site / Basin</option>
                <option value="dataset">Telemetry Dataset</option>
              </select>
              <input
                type="text"
                value={newOfferCapacity}
                onChange={(e) => setNewOfferCapacity(e.target.value)}
                placeholder="Capacity: e.g. 20 hrs/wk"
                className="rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 text-xs font-mono font-bold transition-colors"
            >
              Add Capability to Ledger
            </button>
          </form>
        </div>

        {/* Right Column: What We Need (Urgency Tags) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <h3 className="text-sm font-bold text-rose-400 font-mono uppercase">
                  What We Need (Capability Deficits)
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {needs.length} Bottlenecks
              </span>
            </div>

            {/* List of Needs */}
            <div className="space-y-2">
              {needs.map((need, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-lg bg-zinc-950/80 p-3 border border-zinc-800/90 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-zinc-200">{need.title}</p>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                          need.urgency === "Blocker"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : need.urgency === "High"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {need.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      Category: {need.category}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveNeed(idx)}
                    className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Add New Need */}
          <form
            onSubmit={handleAddNeed}
            className="rounded-lg bg-zinc-950/60 p-3 border border-zinc-800 space-y-2"
          >
            <p className="text-[10px] font-mono uppercase text-zinc-400">
              + Post New Capability Deficit
            </p>
            <input
              type="text"
              value={newNeedTitle}
              onChange={(e) => setNewNeedTitle(e.target.value)}
              placeholder="e.g. Embedded C++ Firmware, Hydrodynamics Towing Tank"
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 font-mono"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newNeedUrgency}
                onChange={(e) =>
                  setNewNeedUrgency(e.target.value as "Low" | "High" | "Blocker")
                }
                className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1.5 text-xs text-zinc-300 font-mono"
              >
                <option value="Blocker">Blocker (Immediate Stop)</option>
                <option value="High">High Urgency</option>
                <option value="Low">Low / Exploratory</option>
              </select>
              <input
                type="text"
                value={newNeedCategory}
                onChange={(e) => setNewNeedCategory(e.target.value)}
                placeholder="Scope / Subsystem"
                className="rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-rose-600 hover:bg-rose-500 text-white py-1.5 text-xs font-mono font-bold transition-colors"
            >
              Broadcast Deficit to Network
            </button>
          </form>
        </div>
      </div>

      {/* Historical Proof of Work Showcase */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-mono uppercase font-bold text-zinc-200">
              Historical Proof of Work Showcase
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Cryptographically Anchored Reciprocal Milestone History
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_HISTORICAL_PROOFS.map((proof) => (
            <div
              key={proof.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                    {proof.completionDate}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span className="text-xs font-mono font-bold">{proof.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h3 className="mt-2 text-sm font-semibold text-zinc-100">
                  {proof.projectTitle}
                </h3>
                <p className="text-[11px] font-mono text-emerald-400">
                  Partner: {proof.partnerClub} ({proof.partnerCollege})
                </p>

                <p className="mt-2 text-xs text-zinc-400 italic">
                  "{proof.testimonial}"
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-[10px] font-mono">
                <span className="text-zinc-500 block">{proof.artifactPill}</span>
                <span className="text-emerald-400 font-bold block">{proof.verifiedStamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
