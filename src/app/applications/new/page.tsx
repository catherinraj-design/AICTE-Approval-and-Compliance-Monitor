"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, FileCheck, Building2, Layers, AlertCircle } from "lucide-react";
import { WORKFLOW_PATHS } from "@/lib/types";

export default function NewApplicationPage() {
  const router = useRouter();

  const [institutionName, setInstitutionName] = useState("Apex Institute of Technology, Bhopal");
  const [region, setRegion] = useState("Central");
  const [applicationType, setApplicationType] = useState("Extension of Approval (EoA)");
  const [stagePathId, setStagePathId] = useState("PATH_SCRUTINY_EVC");
  const [courseLevel, setCourseLevel] = useState("Under Graduate (B.Tech)");
  const [proposedIntake, setProposedIntake] = useState("120");
  const [applicantName, setApplicantName] = useState("Dr. Suresh Verma (Registrar)");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName,
          institutionId: "inst-101",
          region,
          applicationType,
          stagePathId,
          courseLevel,
          proposedIntake: parseInt(proposedIntake, 10),
          applicantName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit proposal");

      router.push(`/applications/${data.application.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-gov-blue flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Submit AICTE Approval Proposal (AY 2026-27)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Online portal for Extension of Approval, Intake Variations, New Courses and Institutional Approvals.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institution Legal Name
            </label>
            <input
              type="text"
              required
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              AICTE Regional Jurisdiction
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Central">Central Regional Office (Bhopal)</option>
              <option value="North">Northern Regional Office (Kanpur/Delhi)</option>
              <option value="South">Southern Regional Office (Bangalore/Chennai)</option>
              <option value="West">Western Regional Office (Mumbai)</option>
              <option value="East">Eastern Regional Office (Kolkata)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Authorized Signatory Name
            </label>
            <input
              type="text"
              required
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proposal Category
            </label>
            <select
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
              <option value="Increase in Intake">Increase in Intake</option>
              <option value="Introduction of New Course">Introduction of New Course</option>
              <option value="New Institution">New Technical Institution</option>
              <option value="Change of Site">Change of Site / Location</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Program / Course Level
            </label>
            <select
              value={courseLevel}
              onChange={(e) => setCourseLevel(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Under Graduate (B.Tech)">Under Graduate (B.Tech / B.E)</option>
              <option value="Post Graduate (M.Tech/MBA/MCA)">Post Graduate (M.Tech/MBA/MCA)</option>
              <option value="Diploma in Engineering">Diploma in Engineering & Technology</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proposed Sanctioned Intake
            </label>
            <input
              type="number"
              required
              min={30}
              max={1200}
              step={30}
              value={proposedIntake}
              onChange={(e) => setProposedIntake(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stage Movement Pathway
            </label>
            <select
              value={stagePathId}
              onChange={(e) => setStagePathId(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white font-medium"
            >
              {WORKFLOW_PATHS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stages.join(" ➔ ")})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pathway visual explanation */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
            <Layers className="w-4 h-4 text-gov-blue" />
            <span>Configured Stage Sequence for Selected Path:</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Upon submission, this application will auto-route to <strong>Scrutiny</strong>. Once completed by the Regional Officer, it advances automatically to the subsequent stage in this pathway.
          </p>
          <div className="flex items-center gap-2 font-mono text-[11px] text-gov-blue font-semibold">
            <span>Submitted</span>
            <span>➔</span>
            <span>Scrutiny</span>
            {stagePathId.includes("EVC") && (
              <>
                <span>➔</span>
                <span>EVC Inspection</span>
              </>
            )}
            {stagePathId.includes("SAC_SHC") && (
              <>
                <span>➔</span>
                <span>SAC/SHC Hearing</span>
              </>
            )}
            <span>➔</span>
            <span className="text-purple-700">Ready for Decision</span>
          </div>
        </div>

        {/* Submission actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gov-blue hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Routing Proposal..." : "Submit Application Dossier"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
