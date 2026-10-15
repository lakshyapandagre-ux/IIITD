'use client';

import React from "react";
import {
  Sparkles,
  Layers,
  Wrench,
  ShieldCheck,
  Building,
  Flame,
  X,
  CheckCircle2,
} from "lucide-react";

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  setActiveCategory,
  isOpenMobile,
  onCloseMobile,
}) => {
  const sections = [
    {
      title: "EXPLORE",
      icon: "✨",
      items: [
        { id: "overview", label: "Overview & Blueprint", badge: "Live", badgeColor: "lavender" },
        { id: "active-coalitions", label: "Active Coalitions", hot: true },
        { id: "spot-market", label: "Equipment Exchange", badge: "6 Rigs", badgeColor: "teal" },
      ],
    },
    {
      title: "PARTNER COLLEGES",
      icon: "🏛️",
      items: [
        { id: "iit-indore", label: "IIT Indore", domain: "Robotics" },
        { id: "sgsits-design", label: "SGSITS Indore", domain: "Design" },
        { id: "davv-biotech", label: "DAVV Indore", domain: "Biotech" },
        { id: "medicaps-drone", label: "Medi-Caps Univ", domain: "Avionics" },
      ],
    },
    {
      title: "PROTOCOLS",
      icon: "📜",
      items: [
        { id: "match-score", label: "Algorithmic Match S(A, B)" },
        { id: "charters-ledger", label: "Multi-Sig Charters" },
      ],
    },
  ];

  const content = (
    <aside className="w-full h-full py-6 pr-4 space-y-6 overflow-y-auto">
      {/* Network Quorum Widget */}
      <div className="mx-2 p-3 rounded-xl border border-lavender-200 bg-white shadow-soft-lavender space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 flex items-center gap-1.5 font-sans font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Consortium Nodes
          </span>
          <span className="text-lavender-700 font-bold">4 Verified</span>
        </div>
        <div className="h-1.5 w-full bg-lavender-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-lavender-500 to-lavender-700 rounded-full w-[100%]" />
        </div>
        <p className="text-[11px] text-slate-500">
          Indore Regional Engineering Cluster
        </p>
      </div>

      {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-1">
          <div className="px-3 mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            <span>{section.icon}</span>
            <span>{section.title}</span>
          </div>

          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full group text-xs py-2 px-3 rounded-lg flex items-center justify-between transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-lavender-100/90 text-lavender-900 font-semibold border-l-2 border-lavender-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-lavender-50/70"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-lavender-600 shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                        item.badgeColor === "teal"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-lavender-100 text-lavender-700 border border-lavender-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.hot && (
                    <span className="flex items-center gap-0.5 text-[10px] font-mono text-rose-600 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.2">
                      <Flame className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />
                      <span>HOT</span>
                    </span>
                  )}

                  {item.domain && (
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600">
                      {item.domain}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:block w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-lavender-200/80 bg-white/40">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/40 backdrop-blur-xs flex animate-in fade-in">
          <div className="w-72 bg-white p-4 border-r border-lavender-200 h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-lavender-100 mb-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-500">
                Navigation
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {content}
            </div>
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};
