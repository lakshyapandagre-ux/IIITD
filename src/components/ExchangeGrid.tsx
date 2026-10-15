"use client";

import React, { useState } from "react";
import {
  Wrench,
  Users,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  Shield,
  Search,
  ExternalLink,
} from "lucide-react";
import { ExchangeItem, Domain } from "@/types";

interface ExchangeGridProps {
  items: ExchangeItem[];
  onReserveItem: (item: ExchangeItem) => void;
}

export const ExchangeGrid: React.FC<ExchangeGridProps> = ({
  items,
  onReserveItem,
}) => {
  const [activeMarketTab, setActiveMarketTab] = useState<"surplus" | "requests">("surplus");
  const [typeFilter, setTypeFilter] = useState<"all" | "equipment" | "human_resource">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    // Tab check (surplus = available/reserved items; requests = sample needed requisitions)
    if (activeMarketTab === "requests") {
      // In requests mode, show needed items or simulate active requisitions
      return item.status === "Reserved";
    }

    // Type filter
    if (typeFilter !== "all" && item.type !== typeFilter) return false;

    // Category filter
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchInst = item.institution.toLowerCase().includes(q);
      const matchLab = item.labName.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchInst && !matchLab && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Spot Market Protocol Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Live Capability & Equipment Spot Exchange
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/20">
              Zero-Idle Infrastructure Protocol
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Time-share institutional labs, sub-micron CNC centers, wind tunnels, and student engineering squads across colleges.
          </p>
        </div>

        {/* Tab switch between Available Surplus and Active Requests */}
        <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveMarketTab("surplus")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
              activeMarketTab === "surplus"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Wrench className="h-3.5 w-3.5 text-emerald-400" />
            <span>Available Surplus ({items.filter(i => i.status === "Available").length})</span>
          </button>
          <button
            onClick={() => setActiveMarketTab("requests")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
              activeMarketTab === "requests"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>Active Reservations / Demands</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment, labs, faculty POC, specs..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-950/80 pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex rounded-md bg-zinc-950 border border-zinc-800 p-0.5">
            <button
              onClick={() => setTypeFilter("all")}
              className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                typeFilter === "all" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter("equipment")}
              className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                typeFilter === "equipment" ? "bg-zinc-800 text-emerald-400" : "text-zinc-400"
              }`}
            >
              Equipment
            </button>
            <button
              onClick={() => setTypeFilter("human_resource")}
              className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                typeFilter === "human_resource" ? "bg-zinc-800 text-blue-400" : "text-zinc-400"
              }`}
            >
              Squads
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Domains</option>
            <option value="Hardware">Hardware / CNC</option>
            <option value="Robotics">Robotics / AI</option>
            <option value="Design">Design / UI Squads</option>
            <option value="Biotech">Biotech / Field Site</option>
          </select>
        </div>
      </div>

      {/* Grid of Equipment & Human Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isEquipment = item.type === "equipment";
          const isAvailable = item.status === "Available";

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 hover:border-zinc-700 transition-all group hover:shadow-lg"
            >
              <div>
                {/* Header Image / Diagram Placeholder */}
                <div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* Badges on image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-medium backdrop-blur-md ${
                        isEquipment
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-600/40"
                          : "bg-blue-950/90 text-blue-300 border border-blue-600/40"
                      }`}
                    >
                      {isEquipment ? (
                        <Wrench className="h-3 w-3" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      <span>{isEquipment ? "Lab Equipment" : "Engineering Squad"}</span>
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium backdrop-blur-md ${
                        isAvailable
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isAvailable ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <span>{item.status}</span>
                    </span>
                  </div>

                  {/* Institution & Lab tag at bottom of image */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[11px] font-bold text-zinc-100 truncate">
                      {item.institution}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 truncate">
                      {item.labName}
                    </p>
                  </div>
                </div>

                {/* Card Title & Description */}
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                  {item.description}
                </p>

                {/* Specs / Tags */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {item.specs.map((spec, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-zinc-950 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Calendar Availability Pill */}
                <div className="mt-3 rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
                    <Calendar className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{item.availability}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>POC: {item.facultyPOC}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: One-Click Reserve Resource */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 truncate mr-2">
                  Capacity: {item.capacity}
                </span>

                <button
                  onClick={() => onReserveItem(item)}
                  disabled={!isAvailable}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all shrink-0 ${
                    isAvailable
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{isAvailable ? "Reserve Resource" : "Currently Booked"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-400">
          <p className="text-sm font-mono">No matching spot exchange items found.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setCategoryFilter("all");
            }}
            className="mt-2 text-xs text-emerald-400 underline font-mono"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
