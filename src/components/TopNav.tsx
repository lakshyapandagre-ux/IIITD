'use client';

import React from "react";
import { Search, Sparkles, Menu, ArrowRight } from "lucide-react";

interface TopNavProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onOpenSearch: () => void;
  onOpenJoin: () => void;
  onToggleMobileSidebar: () => void;
  searchFilter: string;
  setSearchFilter: (q: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeNav,
  setActiveNav,
  onOpenSearch,
  onOpenJoin,
  onToggleMobileSidebar,
  searchFilter,
  setSearchFilter,
}) => {
  const navLinks = [
    { id: "coalitions", label: "Coalitions" },
    { id: "capabilities", label: "Capabilities" },
    { id: "exchange", label: "Spot Exchange" },
    { id: "charters", label: "Charters & Proofs" },
    { id: "colleges", label: "Colleges" },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-lavender-200/80 bg-white/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors shadow-xs">
      {/* Left: Brand Logo + Nav Links */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden text-slate-600 hover:text-lavender-700 p-1.5 rounded-lg border border-lavender-200 bg-lavender-50/60 cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setActiveNav("coalitions")}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-lavender-600 to-lavender-400 text-white shadow-sm shadow-lavender-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
              Nexus<span className="text-lavender-600">Collab</span>
            </span>
            <span className="rounded-full bg-lavender-100 px-2 py-0.5 text-[10px] font-mono font-medium text-lavender-700 border border-lavender-200 hidden sm:inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-lavender-600" />
              <span>v1.0</span>
            </span>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {navLinks.map((link) => {
            const isActive = activeNav === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => setActiveNav(link.id)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? "text-lavender-700 font-semibold bg-lavender-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-13px] left-3 right-3 h-[2px] bg-lavender-600 rounded-full pointer-events-none" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Quick Search + CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search equipment, skills..."
            className="w-44 md:w-56 rounded-lg border border-lavender-200 bg-lavender-50/50 pl-8 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-lavender-500 focus:bg-white focus:outline-none transition-all focus:w-64"
          />
          <button
            type="button"
            onClick={onOpenSearch}
            className="absolute right-1.5 flex items-center rounded bg-white px-1.5 py-0.5 font-mono text-[9px] text-slate-400 border border-lavender-200 hover:text-slate-700 cursor-pointer shadow-2xs"
            title="Open Full Search (Cmd + K)"
          >
            <span>⌘K</span>
          </button>
        </div>

        {/* Mobile search button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="sm:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg bg-lavender-50 border border-lavender-200 cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Institutional Sign In */}
        <button
          type="button"
          onClick={onOpenJoin}
          className="hidden md:block text-xs font-semibold text-slate-600 hover:text-lavender-700 transition-colors px-2 py-1 cursor-pointer"
        >
          Sign In
        </button>

        {/* Primary Action Button (White Lavender gradient) */}
        <button
          type="button"
          onClick={onOpenJoin}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-lavender-600 to-lavender-700 hover:from-lavender-700 hover:to-lavender-800 active:scale-95 text-white text-xs font-semibold px-3.5 py-1.5 sm:py-2 transition-all shadow-md shadow-lavender-500/25 cursor-pointer"
        >
          <span>Join Network</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
