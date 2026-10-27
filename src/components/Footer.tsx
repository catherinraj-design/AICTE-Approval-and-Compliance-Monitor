import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      {/* Regulatory Safeguard Notice Banner */}
      <div className="bg-amber-950/80 border-b border-amber-600/40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-start gap-3 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 uppercase tracking-wider mr-2">
              Statutory Safeguard Notice:
            </span>
            <span>
              Automated alerts and workflow actions support the approval process; scrutiny, verification, inspections and decisions remain with the competent authority.
            </span>
            <span className="block mt-0.5 text-amber-300/80 italic text-[11px]">
              System architecture strictly enforces human-in-the-loop decisions: no application, inspection report, or compliance undertaking is ever auto-approved or auto-rejected by the algorithm.
            </span>
          </div>
        </div>
      </div>

      {/* Prototype & Disclaimer Footer */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-xs flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            <strong>AICTE Approval & Compliance Monitor</strong> | Prototype Web Platform (v1.0-preview)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>Fictional demonstration data only. Not an official Government of India portal.</span>
        </div>
      </div>
    </footer>
  );
}
