'use client';

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Building,
  Wrench,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { Sidebar } from "@/components/Sidebar";
import { ShowcaseCard } from "@/components/ShowcaseCard";
import { FaqSection } from "@/components/FaqSection";
import { BottomDock } from "@/components/BottomDock";
import { SearchModal } from "@/components/SearchModal";
import { JoinModal } from "@/components/JoinModal";
import { ReserveResourceModal } from "@/components/ReserveResourceModal";
import { LiveBlueprintModal } from "@/components/LiveBlueprintModal";
import { MOCK_CLUBS, MOCK_EXCHANGE_ITEMS } from "@/data/mockData";
import { ExchangeItem } from "@/types";

export default function Home() {
  const [activeNav, setActiveNav] = useState<string>("coalitions");
  const [activeCategory, setActiveCategory] = useState<string>("overview");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [viewportSize, setViewportSize] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [reserveTargetItem, setReserveTargetItem] = useState<ExchangeItem | null>(null);
  const [selectedBlueprintProject, setSelectedBlueprintProject] = useState<any | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showcaseProjects = [
    {
      id: "hydrogrid-coalition",
      title: "Autonomous Hydro-Grid Monitoring Buoy",
      categoryTag: "Flagship Coalition",
      tagCategory: "autonomous",
      description:
        "Edge vision buoy deployed at Sirpur Wetland. Integrates IIT Indore's Jetson Orin anomaly detection with SGSITS's IP68 SLS enclosure and Medi-Caps' 40km LoRa telemetry.",
      leadClubs: ["IIT Indore", "SGSITS", "DAVV Biotech", "Medi-Caps"],
      statusBadge: "Active Charter • 2/3 Signed",
      matchScore: 94,
      codeSnippet: `// Micro-ROS Telemetry Sync
import { Node } from 'micro-ros';
import { LoRaGateway } from '@nexuscollab/lora';

export class BuoySync extends Node {
  private gateway = new LoRaGateway({ freq: 868e6, sf: 7 });

  async broadcastWaterMetrics(payload: WaterQualityPayload) {
    const packet = await this.compressTensorRT(payload);
    await this.gateway.transmit(packet, { timeoutMs: 120 });
    this.recordMilestoneProof('ms-hydro-02', packet.hash);
  }
}`,
      hardwareSpecs: [
        { label: "Edge Compute", value: "Jetson AGX Orin 64GB" },
        { label: "Enclosure", value: "IP68 Submersible SLS" },
        { label: "RF Range", value: "868MHz 40km LoRa" },
        { label: "Field Pier", value: "DAVV Sirpur Lake Pier" },
      ],
      milestones: [
        { title: "IP68 Sub-surface Enclosure", status: "Verified" as const, owner: "SGSITS" },
        { title: "868MHz Telemetry Bridge", status: "In Review" as const, owner: "Medi-Caps" },
        { title: "Sonde Electrochemical Probe", status: "Committed" as const, owner: "DAVV" },
      ],
    },
    {
      id: "uav-mesh-relay",
      title: "Regional UAV Emergency Telemetry Mesh",
      categoryTag: "Avionics & RF",
      tagCategory: "avionics",
      description:
        "Long-range UAV airborne mesh relay connecting isolated sensor clusters during flood simulation drills. Links Medi-Caps fixed-wing airframes with IIT Indore guidance.",
      leadClubs: ["Medi-Caps Drone Lab", "IIT Indore Autonomous", "SGSITS Green Earth"],
      statusBadge: "Audit Passed • Multi-Sig Ready",
      matchScore: 89,
      codeSnippet: `// MAVLink Telemetry Mesh Router
class MeshAvionicsBridge {
  constructor(private pixhawk: Pixhawk6X, private lora: SX1302) {}

  public onEmergencyBeacon(packet: BeaconFrame) {
    const waypoint = this.optimizeVector(packet.coords);
    this.pixhawk.dispatchWaypoint(waypoint);
  }
}`,
      hardwareSpecs: [
        { label: "Airframe", value: "Carbon Fiber VTOL 5kg" },
        { label: "Autopilot", value: "Pixhawk 6X Dual-IMU" },
        { label: "Telemetry", value: "433MHz / 868MHz Mesh" },
        { label: "Flight Arena", value: "IIT Indore Flight Cage" },
      ],
      milestones: [
        { title: "Airframe CAD Stress Simulation", status: "Verified" as const, owner: "Medi-Caps" },
        { title: "ROS2 Waypoint Navigation", status: "In Review" as const, owner: "IIT Indore" },
        { title: "Field Test Scout Cohort", status: "Committed" as const, owner: "SGSITS" },
      ],
    },
    {
      id: "sls-prototyping-hub",
      title: "5-Axis CNC & Rapid Prototyping Syndicate",
      categoryTag: "Hardware Lab",
      tagCategory: "hardware",
      description:
        "High-precision subtractive & additive shared facility. IIT Indore's 5-axis milling machine shares scheduled blocks with SGSITS's SLS printer for student teams.",
      leadClubs: ["IIT Indore", "SGSITS Design Lab", "Medi-Caps"],
      statusBadge: "Open for Booking",
      matchScore: 92,
      codeSnippet: `// CNC Toolpath & CAM Verification
export function validateToolpath(gcode: string, alloy: 'Al-7075') {
  return {
    verified: true,
    estimatedCycleHours: 3.2,
    recommendedPostCMM: true
  };
}`,
      hardwareSpecs: [
        { label: "5-Axis CNC", value: "DMG MORI DMU 50" },
        { label: "SLS Additive", value: "Industrial SLS Nylon" },
        { label: "Metrology", value: "Sub-micron Optical CMM" },
        { label: "Open Slots", value: "Saturdays 09:00 - 18:00" },
      ],
      milestones: [
        { title: "Hydrodynamic Impeller Milling", status: "Verified" as const, owner: "IIT Indore" },
        { title: "Double O-Ring Pressure Housing", status: "Verified" as const, owner: "SGSITS" },
        { title: "Subsonic Wind Tunnel Drag Test", status: "In Review" as const, owner: "Medi-Caps" },
      ],
    },
  ];

  const filteredProjects = useMemo(() => {
    return showcaseProjects.filter((p) => {
      if (selectedTagFilter !== "all" && p.tagCategory !== selectedTagFilter) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchClubs = p.leadClubs.some((c) => c.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchClubs) return false;
      }
      return true;
    });
  }, [selectedTagFilter, searchFilter]);

  const handleSearchResult = (category: string, id: string) => {
    if (category === "exchange") {
      const item = MOCK_EXCHANGE_ITEMS.find((i) => i.id === id);
      if (item) setReserveTargetItem(item);
    } else if (category === "coalition") {
      setSelectedBlueprintProject(showcaseProjects[0]);
    } else {
      showToast(`Selected ${id.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FD] text-slate-800 flex flex-col font-sans ambient-top-glow relative selection:bg-lavender-500/20 selection:text-lavender-900">
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lavender-200/25 via-transparent to-transparent opacity-80" />

      {/* Top Nav */}
      <TopNav
        activeNav={activeNav}
        setActiveNav={(nav) => {
          setActiveNav(nav);
          showToast(`Nav: ${nav.toUpperCase()}`);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
      />

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto px-4 sm:px-6 relative z-10">
        <Sidebar
          activeCategory={activeCategory}
          setActiveCategory={(cat) => {
            setActiveCategory(cat);
            if (cat === "spot-market") {
              const el = document.getElementById("spot-market-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            } else if (cat === "active-coalitions") {
              const el = document.getElementById("coalitions-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Column */}
        <main
          className={`flex-1 py-8 px-4 sm:px-8 md:px-10 transition-all duration-300 ${
            viewportSize === "tablet"
              ? "max-w-3xl mx-auto border-x border-lavender-200 bg-white/50"
              : viewportSize === "mobile"
              ? "max-w-md mx-auto border-x border-lavender-200 bg-white/50"
              : "max-w-6xl"
          }`}
        >
          {/* Advisory Notice Banner */}
          <div className="mb-6 rounded-xl border border-lavender-200 bg-lavender-50/70 p-3 sm:p-3.5 text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lavender-200 text-lavender-700 shrink-0">
                <AlertCircle className="h-3 w-3" />
              </span>
              <p className="text-xs font-sans">
                <strong className="text-slate-900 font-semibold">Active Opportunity:</strong> Sirpur Wetland Buoy seeks inland testing permits & water sensors.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsJoinOpen(true)}
              className="text-xs font-semibold text-lavender-700 hover:text-lavender-900 self-start sm:self-auto cursor-pointer"
            >
              Propose Lab Partner →
            </button>
          </div>

          {/* Hero Section */}
          <div className="mb-8 pb-6 border-b border-lavender-100">
            <div className="inline-flex items-center gap-2 rounded-full border border-lavender-200 bg-lavender-50 px-3 py-1 text-xs font-mono font-medium text-lavender-700 mb-3 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-lavender-600 animate-pulse" />
              <span>INTER-COLLEGE CAPABILITY PROTOCOL</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2.5">
              Connect College Labs. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender-600 to-indigo-600">
                Build Engineering Coalitions.
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-normal mb-5">
              Time-share specialized hardware, match complementary technical strengths, and execute verified multi-sig milestone charters across universities.
            </p>

            {/* Clean KPI Cards */}
            <div className="grid grid-cols-3 gap-3 max-w-xl mb-5">
              <div className="rounded-xl border border-lavender-200 bg-white p-3 shadow-2xs">
                <div className="text-lg sm:text-xl font-bold text-slate-900">4 Universities</div>
                <div className="text-[11px] text-slate-500 font-mono">Indore Hub</div>
              </div>
              <div className="rounded-xl border border-lavender-200 bg-white p-3 shadow-2xs">
                <div className="text-lg sm:text-xl font-bold text-slate-900">18 Shared Labs</div>
                <div className="text-[11px] text-slate-500 font-mono">Zero-Idle Rigs</div>
              </div>
              <div className="rounded-xl border border-lavender-200 bg-white p-3 shadow-2xs">
                <div className="text-lg sm:text-xl font-bold text-lavender-700">94% Match</div>
                <div className="text-[11px] text-slate-500 font-mono">S(A, B) Engine</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsJoinOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-lavender-600 hover:bg-lavender-700 active:scale-95 text-white font-semibold px-4 py-2 text-xs sm:text-sm transition-all shadow-md shadow-lavender-500/25 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch New Coalition</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-white border border-lavender-200 hover:border-lavender-400 hover:bg-lavender-50/50 text-slate-700 px-4 py-2 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <Search className="h-4 w-4 text-lavender-600" />
                <span>Browse Equipment Pool</span>
              </button>
            </div>
          </div>

          {/* CODE VIEW MODE TOGGLED */}
          {viewMode === "code" ? (
            <div className="rounded-2xl border border-lavender-200 bg-white p-6 space-y-4 shadow-soft-lavender">
              <div className="flex items-center justify-between pb-3 border-b border-lavender-100">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-lavender-600" />
                  <span className="text-xs font-mono font-bold text-slate-800 uppercase">
                    nexuscollab-registry.tsx
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className="rounded-lg bg-lavender-100 text-lavender-800 hover:bg-lavender-200 px-3 py-1 text-xs font-mono cursor-pointer"
                >
                  Return to Visual Preview
                </button>
              </div>

              <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px]">
                <code>{`// NexusCollab - White Lavender Architecture
export interface CoalitionSpec {
  id: string;
  name: string;
  participatingInstitutions: string[];
  algorithmicMatchScore: number; // S(A, B) = 0.35*C + 0.20*G + 0.15*R + 0.15*Av + 0.10*T + 0.05*D
  escrowContract: string;
}`}</code>
              </pre>
            </div>
          ) : (
            <>
              {/* Category Filter Pills */}
              <div id="coalitions-section" className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {[
                    { id: "all", label: "All Coalitions" },
                    { id: "autonomous", label: "Autonomous Buoys" },
                    { id: "avionics", label: "Avionics & LoRa Mesh" },
                    { id: "hardware", label: "5-Axis CNC & SLS" },
                  ].map((filter) => {
                    const isSelected = selectedTagFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setSelectedTagFilter(filter.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-lavender-100 text-lavender-800 font-semibold border border-lavender-300 shadow-2xs"
                            : "bg-white text-slate-600 hover:text-slate-900 border border-lavender-200 hover:bg-lavender-50/50"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-mono text-slate-500">
                  Showing <span className="text-lavender-700 font-bold">{filteredProjects.length}</span> Active Blueprints
                </div>
              </div>

              {/* Showcase Cards List */}
              <div className="space-y-5">
                {filteredProjects.map((project) => (
                  <ShowcaseCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    categoryTag={project.categoryTag}
                    description={project.description}
                    leadClubs={project.leadClubs}
                    statusBadge={project.statusBadge}
                    codeSnippet={project.codeSnippet}
                    hardwareSpecs={project.hardwareSpecs}
                    milestones={project.milestones}
                    matchScore={project.matchScore}
                    onFormTeam={() => setIsJoinOpen(true)}
                    onLivePreview={() => setSelectedBlueprintProject(project)}
                  />
                ))}
              </div>

              {/* Spot Market Equipment Section */}
              <div id="spot-market-section" className="mt-14 rounded-2xl border border-lavender-200 bg-white p-6 md:p-8 shadow-soft-lavender">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-lavender-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Live Spot Market</span>
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Zero-Idle Shared Rigs
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Equipment & Lab Time-Share Exchange
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsJoinOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-lavender-50 border border-lavender-200 hover:bg-lavender-100 px-3.5 py-1.5 text-xs font-mono text-lavender-800 transition-colors self-start sm:self-auto cursor-pointer font-semibold"
                  >
                    <span>+ List Facility</span>
                    <ArrowRight className="h-3.5 w-3.5 text-lavender-700" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {MOCK_EXCHANGE_ITEMS.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-lavender-200 bg-lavender-50/30 p-4 flex flex-col justify-between hover:border-lavender-400 hover:shadow-2xs transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded bg-white px-2 py-0.5 text-[10px] font-mono text-slate-600 border border-lavender-100">
                            {item.category}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>{item.status}</span>
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-lavender-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-lavender-700 font-mono">
                          {item.institution} • {item.labName}
                        </p>
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-lavender-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500 truncate max-w-[130px]">
                          {item.capacity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setReserveTargetItem(item)}
                          className="rounded-lg bg-lavender-600 hover:bg-lavender-700 active:scale-95 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                        >
                          Reserve Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <FaqSection />
            </>
          )}

          {/* Footer */}
          <footer className="mt-14 pt-6 border-t border-lavender-200 pb-20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
            <div>
              NexusCollab • Inter-College Engineering Network v1.0
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => showToast("RFC 842 Protocol Specification Loaded")}
                className="hover:text-lavender-700 cursor-pointer"
              >
                RFC Specification
              </button>
              <button
                type="button"
                onClick={() => setIsJoinOpen(true)}
                className="hover:text-lavender-700 cursor-pointer"
              >
                Institutional Portal
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Bottom Dock */}
      <BottomDock
        viewMode={viewMode}
        setViewMode={(mode) => setViewMode(mode)}
        viewportSize={viewportSize}
        setViewportSize={(size) => setViewportSize(size)}
        onJoinCoalition={() => setIsJoinOpen(true)}
        onResetView={() => {
          setSelectedTagFilter("all");
          setSearchFilter("");
          setViewportSize("desktop");
          setViewMode("preview");
        }}
      />

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        clubs={MOCK_CLUBS}
        exchangeItems={MOCK_EXCHANGE_ITEMS}
        onSelectResult={handleSearchResult}
      />

      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={(org) =>
          showToast(`🎉 Welcome to NexusCollab! Institutional node for ${org} registered.`)
        }
      />

      <ReserveResourceModal
        item={reserveTargetItem}
        isOpen={reserveTargetItem !== null}
        onClose={() => setReserveTargetItem(null)}
        onConfirmReservation={(item, date) =>
          showToast(`Reserved ${item.title} for ${date}! Confirmation voucher generated.`)
        }
      />

      <LiveBlueprintModal
        project={selectedBlueprintProject}
        isOpen={selectedBlueprintProject !== null}
        onClose={() => setSelectedBlueprintProject(null)}
        onFormTeam={() => setIsJoinOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-lavender-200 bg-white px-4 py-3 text-xs font-sans text-slate-800 shadow-elevated-card animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
