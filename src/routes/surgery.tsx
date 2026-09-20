import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  UserRound,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCareSync } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/surgery")({
  head: () => ({
    meta: [{ title: "Surgery & Admission Workflow Tracker | CareSync" }],
  }),
  component: SurgeryWorkflowPage,
});

function SurgeryWorkflowPage() {
  const { surgeries, updateSurgeryMilestone } = useCareSync();
  const surgery = surgeries[0] || {
    id: "SURG-01",
    patientId: "CS-001",
    patientName: "Rajesh Sharma",
    procedureName: "Laparoscopic Appendectomy",
    surgeon: "Dr. Ananya Sharma",
    anesthesiologist: "Dr. Vikram Seth",
    scheduledDate: "2026-09-15 02:30 PM (Today)",
    status: "Pre-Op" as const,
    milestones: [
      {
        title: "Admission & Bed Assignment (Ward 3B)",
        status: "completed" as const,
        timestamp: "08:30 AM",
      },
      {
        title: "Pre-operative Clinical Assessment",
        status: "completed" as const,
        timestamp: "09:00 AM",
      },
      {
        title: "Required Diagnostic Tests (CBC & Blood Sugar)",
        status: "completed" as const,
        timestamp: "10:15 AM",
      },
      {
        title: "Anesthesia Clearance & Consent Signed",
        status: "completed" as const,
        timestamp: "11:30 AM",
      },
      {
        title: "Surgery Scheduled (OT Suite 2)",
        status: "completed" as const,
        timestamp: "02:30 PM",
      },
      { title: "Surgery in Progress", status: "in_progress" as const, timestamp: "02:45 PM" },
      { title: "Post-operative Monitoring & Recovery Care", status: "pending" as const },
      { title: "Attending Doctor Review & Rounds", status: "pending" as const },
      { title: "Discharge Summary & Prescription", status: "pending" as const },
    ],
    notes: "Elective laparoscopic procedure. Patient fasting since 06:00 AM.",
  };

  const handleNextMilestone = (index: number) => {
    updateSurgeryMilestone(surgery.id, index, "completed");
    if (index + 1 < surgery.milestones.length) {
      updateSurgeryMilestone(surgery.id, index + 1, "in_progress");
    }
    const title = surgery.milestones[index]?.title || "Milestone";
    toast.success(`Milestone "${title}" marked Completed!`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              <span>Operation Theatre Suite 2</span>
              <span>•</span>
              <span className="text-teal-primary font-medium">Live Surgical Workflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
              Surgery & Admission Milestone Tracker
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live progression from admission to post-op recovery and discharge.
            </p>
          </div>
        </div>

        {/* Patient & Procedure Banner */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-14 rounded-2xl bg-danger-soft text-danger-muted font-bold text-lg grid place-items-center shrink-0 border border-danger-muted/20 dark:bg-danger-soft/20">
                <Activity className="size-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-ink">{surgery.procedureName}</h2>
                  <Badge variant="info">{surgery.status}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-slate-300">
                  <span>
                    <strong>Patient:</strong> {surgery.patientName} ({surgery.patientId})
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Lead Surgeon:</strong> {surgery.surgeon}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Anesthesia:</strong> {surgery.anesthesiologist}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs bg-secondary p-3 rounded-xl border border-border">
              <div className="font-mono text-slate-500">Scheduled Window</div>
              <div className="font-bold text-ink text-sm mt-0.5">{surgery.scheduledDate}</div>
            </div>
          </CardContent>
        </Card>

        {/* Chronological Milestone Timeline */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-ink">
                Surgical Journey Milestones
              </CardTitle>
              <span className="text-xs font-mono text-teal-dark dark:text-calm bg-teal-light dark:bg-teal-primary/20 border border-teal-primary/30 px-3 py-1 rounded-full font-semibold">
                Step 6 of 9 In Progress
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {surgery.milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Node Icon */}
                  <span
                    className={`absolute -left-6 top-1 sm:top-auto size-5 rounded-full border-2 border-card flex items-center justify-center text-[10px] text-white shadow-xs ${
                      milestone.status === "completed"
                        ? "bg-teal-primary"
                        : milestone.status === "in_progress"
                          ? "bg-navy-900 dark:bg-primary ring-4 ring-navy-900/20"
                          : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    {milestone.status === "completed"
                      ? "✓"
                      : milestone.status === "in_progress"
                        ? "●"
                        : "○"}
                  </span>

                  {/* Content */}
                  <div className="space-y-0.5">
                    <div className="font-semibold text-sm text-ink">{milestone.title}</div>
                    <div className="text-xs font-mono text-slate-500">
                      {milestone.timestamp
                        ? `Completed at ${milestone.timestamp}`
                        : milestone.status === "in_progress"
                          ? "Currently underway in OT-2"
                          : "Pending previous step"}
                    </div>
                  </div>

                  {/* Status / Action Button */}
                  <div>
                    {milestone.status === "completed" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-teal-light dark:bg-teal-primary/20 text-teal-dark dark:text-calm border border-teal-primary/30 text-[10px] font-mono font-semibold">
                        ✓ COMPLETED
                      </span>
                    ) : milestone.status === "in_progress" ? (
                      <Button
                        size="sm"
                        onClick={() => handleNextMilestone(idx)}
                        className="bg-navy-900 hover:bg-navy-800 dark:bg-primary dark:text-white text-white text-xs h-8 shadow-xs cursor-pointer"
                      >
                        Advance Milestone <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-mono text-slate-400">
                        UPCOMING
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
