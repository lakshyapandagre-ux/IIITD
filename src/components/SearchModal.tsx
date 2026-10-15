'use client';

import React, { useState, useEffect } from "react";
import { Search, X, ArrowRight, Wrench } from "lucide-react";
import { Club, ExchangeItem } from "@/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubs: Club[];
  exchangeItems: ExchangeItem[];
  onSelectResult: (category: string, id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  clubs,
  exchangeItems,
  onSelectResult,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.institution.toLowerCase().includes(query.toLowerCase()) ||
      c.offers.some((o) => o.title.toLowerCase().includes(query.toLowerCase())) ||
      c.needs.some((n) => n.title.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredItems = exchangeItems.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.labName.toLowerCase().includes(query.toLowerCase()) ||
      i.specs.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-lavender-200 bg-white p-2 shadow-elevated-card overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3 py-2.5 border-b border-lavender-100">
          <Search className="h-4 w-4 text-lavender-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search college, capability, equipment..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-sans"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded bg-lavender-50 px-1.5 font-mono text-[10px] text-slate-500 border border-lavender-200">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Results Sections */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Suggestions */}
          <div>
            <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Featured Coalition
            </p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectResult("coalition", "hydrogrid");
                  onClose();
                }}
                className="w-full flex items-center justify-between rounded-lg p-2.5 text-left hover:bg-lavender-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lavender-100 text-lavender-700 text-sm">
                    🌊
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-lavender-700">
                      Autonomous Water Monitoring Buoy
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      IIT Indore • SGSITS • DAVV • Medi-Caps
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-lavender-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Member Colleges & Labs */}
          {filteredClubs.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Verified Colleges ({filteredClubs.length})
              </p>
              <div className="space-y-1">
                {filteredClubs.slice(0, 4).map((club) => (
                  <button
                    key={club.id}
                    onClick={() => {
                      onSelectResult("college", club.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between rounded-lg p-2.5 text-left hover:bg-lavender-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{club.avatarUrl}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-lavender-700">
                          {club.name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500">
                          {club.institution}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-lavender-100 px-2 py-0.5 text-[10px] font-mono text-lavender-800 border border-lavender-200">
                      {club.domain}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spot Market Equipment */}
          {filteredItems.length > 0 && (
            <div>
              <p className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Shared Equipment ({filteredItems.length})
              </p>
              <div className="space-y-1">
                {filteredItems.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectResult("exchange", item.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between rounded-lg p-2.5 text-left hover:bg-lavender-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wrench className="h-3.5 w-3.5 text-lavender-600" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-lavender-700">
                          {item.title}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500">
                          {item.institution} • {item.availability}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                      {item.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 border-t border-lavender-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Search across 4 regional institutions</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
