"use client";

import React, { useState } from "react";
import {
  Network,
  Cpu,
  ShieldCheck,
  Scale,
  Wrench,
  GitPullRequest,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Radio,
  FileCheck2,
} from "lucide-react";
import { Club } from "@/types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeCollege: Club;
  allColleges: Club[];
  onSelectCollege: (college: Club) => void;
  coalitionCount: number;
  explorationBoost: boolean;
  setExplorationBoost: (v: boolean | ((prev: boolean) => boolean)) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenCoalitionDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeCollege,
  allColleges,
  onSelectCollege,
  coalitionCount,
  explorationBoost,
  setExplorationBoost,
  isDark,
  setIsDark,
  onOpenCoalitionDrawer,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: "explorer",
      label: "Complementarity Explorer",
      shortLabel: "Explorer",
      icon: Network,
    },
    {
      id: "coalition",
      label: "Coalition Builder",
      shortLabel: "Coalition",
      icon: Scale,
      badge: coalitionCount > 0 ? coalitionCount : undefined,
    },
    {
      id: "exchange",
      label: "Spot Exchange",
      shortLabel: "Exchange",
      icon: Wrench,
    },
    {
      id: "charter",
      label: "Charters & Milestones",
      shortLabel: "Charters",
      icon: GitPullRequest,
      dot: true,
    },
    {
      id: "ledger",
      label: "Capability Ledger",
      shortLabel: "My Club",
      icon: Cpu,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand & Network Signal */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("explorer")}
            className="flex items-center gap-2.5 text-left group transition-all"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 border border-zinc-700/80 group-hover:border-emerald-500/80 transition-colors shadow-inner">
              <Network className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wider uppercase text-zinc-100 font-mono">
                  SYNAPSE
                </span>
                <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
                  v2.4 CORE
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block font-mono">
                Inter-College Capability Grid
              </p>
            </div>
          </button>

          {/* Overlooked Exploration Boost Pill */}
          <div className="hidden lg:flex items-center pl-3 border-l border-zinc-800">
            <button
              onClick={() => setExplorationBoost((prev: boolean) => !prev)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono transition-all border ${
                explorationBoost
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
              title="Exploration Boost surfaces high-capability overlooked institutions (COEP, IIITDM)"
            >
              <Sparkles className={`h-3 w-3 ${explorationBoost ? "text-amber-400 animate-spin" : "text-zinc-500"}`} />
              <span>Exploration Boost</span>
              <span
                className={`ml-1 h-1.5 w-1.5 rounded-full ${
                  explorationBoost ? "bg-amber-400" : "bg-zinc-600"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-700/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
                {item.dot && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                )}
                {isActive && (
                  <span className="absolute -bottom-[9px] left-2 right-2 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: College Switcher, Coalition quick pill, Dark mode */}
        <div className="flex items-center gap-2">
          {/* Quick Coalition Drawer Trigger */}
          <button
            onClick={onOpenCoalitionDrawer}
            className="flex items-center gap-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 px-2.5 py-1 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
            title="Open Coalition Assembly Drawer"
          >
            <Scale className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] hidden sm:inline">Coalition:</span>
            <span className="font-mono font-bold text-[11px] text-emerald-400">
              {coalitionCount}/3
            </span>
          </button>

          {/* Active Institution Switcher (Demo Actor) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 text-left text-xs transition-colors"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950/80 text-[11px] border border-emerald-700/50">
                {activeCollege.avatarUrl}
              </div>
              <div className="hidden xl:block">
                <p className="text-[11px] font-medium text-zinc-200 leading-tight">
                  {activeCollege.name.split(" ")[0]} {activeCollege.name.split(" ")[1]}
                </p>
                <p className="text-[9px] font-mono text-emerald-400 leading-none">
                  {activeCollege.domainAttestation}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 border-b border-zinc-800">
                  <p className="text-[10px] font-mono uppercase text-zinc-400">
                    Active Operating Identity
                  </p>
                  <p className="text-xs text-zinc-300">
                    Switch demo tenant to inspect reciprocal matching from different perspectives
                  </p>
                </div>
                <div className="mt-1 space-y-0.5">
                  {allColleges.map((college) => {
                    const isSelected = college.id === activeCollege.id;
                    return (
                      <button
                        key={college.id}
                        onClick={() => {
                          onSelectCollege(college);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded px-2.5 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            : "hover:bg-zinc-800/60 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{college.avatarUrl}</span>
                          <div>
                            <p className="font-medium text-xs leading-none">{college.name}</p>
                            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                              {college.institution} • {college.domainAttestation}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium ${
                  isActive
                    ? "bg-zinc-900 text-emerald-400 border border-zinc-700"
                    : "text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Exploration Boost</span>
            <button
              onClick={() => setExplorationBoost((prev: boolean) => !prev)}
              className={`px-2.5 py-1 text-xs rounded font-mono border ${
                explorationBoost
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
            >
              {explorationBoost ? "Boost ON" : "Boost OFF"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
