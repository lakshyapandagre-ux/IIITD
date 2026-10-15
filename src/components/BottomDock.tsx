'use client';

import React from "react";
import {
  ArrowLeft,
  Eye,
  Code,
  Laptop,
  Tablet,
  Smartphone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface BottomDockProps {
  viewMode: "preview" | "code";
  setViewMode: (mode: "preview" | "code") => void;
  viewportSize: "desktop" | "tablet" | "mobile";
  setViewportSize: (size: "desktop" | "tablet" | "mobile") => void;
  onJoinCoalition: () => void;
  onResetView?: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  viewMode,
  setViewMode,
  viewportSize,
  setViewportSize,
  onJoinCoalition,
  onResetView,
}) => {
  return (
    <aside aria-label="Component preview controls" className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-full border border-lavender-200/90 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 shadow-elevated-card transition-all">
        {/* Reset View */}
        {onResetView && (
          <button
            type="button"
            onClick={onResetView}
            className="flex items-center gap-1 rounded-full p-1.5 text-slate-500 hover:text-slate-900 hover:bg-lavender-50 transition-colors cursor-pointer"
            title="Reset view to default"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* View Toggle Tabs: Preview | Code */}
        <div className="flex rounded-full bg-lavender-50 border border-lavender-200 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
              viewMode === "preview"
                ? "bg-white text-lavender-900 font-semibold shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
              viewMode === "code"
                ? "bg-white text-lavender-900 font-semibold shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code className="h-3 w-3" />
            <span>Code</span>
          </button>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-4 w-[1px] bg-lavender-200" />

        {/* Device Viewport Icons */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewportSize("desktop")}
            className={`rounded-full p-1.5 transition-colors cursor-pointer ${
              viewportSize === "desktop"
                ? "bg-lavender-100 text-lavender-800"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="Desktop Full Width"
          >
            <Laptop className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewportSize("tablet")}
            className={`rounded-full p-1.5 transition-colors cursor-pointer ${
              viewportSize === "tablet"
                ? "bg-lavender-100 text-lavender-800"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="Tablet View"
          >
            <Tablet className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewportSize("mobile")}
            className={`rounded-full p-1.5 transition-colors cursor-pointer ${
              viewportSize === "mobile"
                ? "bg-lavender-100 text-lavender-800"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="Mobile View"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-lavender-200" />

        {/* Quorum indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-semibold">Quorum Active</span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onJoinCoalition}
          className="flex items-center gap-1.5 rounded-full bg-lavender-600 hover:bg-lavender-700 active:scale-95 text-white text-xs font-semibold px-4 py-1.5 transition-all shadow-md shadow-lavender-500/25 cursor-pointer"
        >
          <span>Join</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </aside>
  );
};
