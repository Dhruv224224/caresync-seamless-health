import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  Calendar,
  Pill,
  FileText,
  CreditCard,
  Bed,
  CheckCircle2,
  Clock,
  Download,
  Activity,
  HeartPulse,
  Sparkles,
  Phone,
  ShieldCheck,
  FileCheck,
  ChevronRight,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIPlaceholderButton } from "@/components/care-sync/AIPlaceholderButton";
import { useCareSync } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/patient/dashboard")({
  head: () => ({
    meta: [{ title: "My Health Home — Rajesh Sharma | CareSync" }],
  }),
  component: PatientDashboardPage,
});

function PatientDashboardPage() {
  const { patients, prescriptions, testOrders, timelines } = useCareSync();
  const patient = patients.find((p) => p.id === "CS-001") ||
    patients[0] || {
      id: "CS-001",
      name: "Rajesh Sharma",
      age: 54,
      gender: "Male" as const,
      bloodGroup: "B+",
      phone: "+91 98765 43210",
      address: "Bengaluru",
      allergies: ["Penicillin"],
      medicalHistory: ["Hypertension"],
      status: "In Consultation" as const,
      currentDepartment: "General Medicine",
      assignedDoctor: "Dr. Ananya Sharma",
      bedNumber: "Bed 12",
      roomNumber: "Ward 3B",
      registeredAt: "08:30 AM",
    };

  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patient.id);
  const patientTests = testOrders.filter((t) => t.patientId === patient.id);
  const patientTimeline = timelines[patient.id] || timelines["CS-001"] || [];

  return (
    <AppShell activeRole="patient">
      <div className="space-y-5">
        {/* Patient Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-brand/10 text-brand font-bold text-base grid place-items-center shrink-0 border border-brand/20">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink/50">
                <span>Patient Portal</span>
                <span>•</span>
                <span className="text-calm font-semibold">UHID: {patient.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                Welcome, {patient.name}
              </h1>
              <p className="text-xs text-ink/60 mt-0.5">
                Your medical visits, prescriptions, test reports, and care journey in plain
                language.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AIPlaceholderButton
              label="Explain in Simple Terms"
              featureName="AI Medical Explainer"
              className="text-xs h-8"
            />
            <Button
              onClick={() => toast.success("Digital Health Record downloaded as PDF")}
              variant="outline"
              className="border-border text-xs h-8 bg-card text-ink"
            >
              <Download className="size-3.5 mr-1.5 text-brand" /> Download Record
            </Button>
          </div>
        </div>

        {/* 5 Patient Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/70">Your Next Visit</span>
                <Calendar className="size-4 text-brand" />
              </div>
              <div className="mt-2 text-base font-bold text-ink">Tomorrow, 10:30 AM</div>
              <div className="text-[10px] font-mono text-ink/50 mt-0.5">
                Dr. Ananya Sharma · OPD 4
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/70">Active Medicines</span>
                <Pill className="size-4 text-calm" />
              </div>
              <div className="mt-2 text-2xl font-bold text-calm">{patientPrescriptions.length}</div>
              <div className="text-[10px] font-mono text-ink/50 mt-0.5">
                3 active daily prescriptions
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/70">Lab Reports</span>
                <FileText className="size-4 text-warn" />
              </div>
              <div className="mt-2 text-2xl font-bold text-warn">{patientTests.length}</div>
              <div className="text-[10px] font-mono text-ink/50 mt-0.5">
                CBC verified & available
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/70">Outstanding Bill</span>
                <CreditCard className="size-4 text-brand" />
              </div>
              <div className="mt-2 text-base font-bold text-ink">₹ 14,250</div>
              <div className="text-[10px] font-mono text-calm mt-0.5">
                Insurance Pre-Auth Approved
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs col-span-2 lg:col-span-1">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/70">Care Location</span>
                <Bed className="size-4 text-crit" />
              </div>
              <div className="mt-2 text-base font-bold text-ink">
                {patient.roomNumber || "Ward 3B"}
              </div>
              <div className="text-[10px] font-mono text-ink/50 mt-0.5">
                {patient.bedNumber || "Bed 12"} · Attending Dr. Sharma
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Tabs */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="bg-card border border-border p-1 rounded-lg h-auto flex flex-wrap gap-1">
            <TabsTrigger
              value="timeline"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-primary-foreground font-semibold"
            >
              My Care Timeline
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-primary-foreground font-semibold"
            >
              My Prescriptions ({patientPrescriptions.length})
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-primary-foreground font-semibold"
            >
              My Test Reports ({patientTests.length})
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-primary-foreground font-semibold"
            >
              Patient Profile
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: My Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-ink uppercase tracking-wide">
                    Your Connected Medical Journey
                  </CardTitle>
                  <p className="text-xs text-ink/50">
                    Live updates as care happens across hospital departments
                  </p>
                </div>
                <Badge className="bg-calm/15 text-calm text-[10px] font-mono border-calm/30">
                  <span className="size-1.5 rounded-full bg-calm mr-1 animate-pulse" /> Live In Sync
                </Badge>
              </CardHeader>
              <CardContent className="p-5">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {patientTimeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative">
                      <span
                        className={`absolute -left-6 top-1 size-5 rounded-full border-2 border-card flex items-center justify-center text-[10px] text-white shadow-2xs ${
                          item.status === "completed"
                            ? "bg-calm"
                            : item.status === "current"
                              ? "bg-brand ring-4 ring-brand/20"
                              : "bg-ink/30"
                        }`}
                      >
                        {item.status === "completed" ? "✓" : item.status === "current" ? "●" : "○"}
                      </span>

                      <div className="rounded-xl border border-border bg-surf/60 p-4 transition-colors hover:bg-surf">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-ink">
                              {item.title}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono border-border bg-card"
                            >
                              {item.department}
                            </Badge>
                          </div>
                          <span className="text-xs font-mono text-ink/50">{item.timestamp}</span>
                        </div>
                        <p className="mt-1.5 text-xs text-ink/70 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="mt-2 text-[10px] font-mono text-ink/40">
                          Handled by: <span className="text-ink/60 font-medium">{item.actor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Prescriptions */}
          <TabsContent value="prescriptions" className="space-y-3">
            {patientPrescriptions.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink/50 bg-card rounded-xl border border-border">
                No active prescriptions on file.
              </div>
            ) : (
              patientPrescriptions.map((rx) => (
                <Card key={rx.id} className="border-border bg-card shadow-2xs">
                  <CardHeader className="p-3.5 border-b border-border/60 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs font-bold text-ink uppercase tracking-wide">
                        Prescription #{rx.id}
                      </CardTitle>
                      <span className="text-[11px] font-mono text-ink/50">
                        {rx.doctorName} · {rx.createdAt}
                      </span>
                    </div>
                    <Badge
                      className={`text-[10px] font-mono ${
                        rx.status === "Dispensed"
                          ? "bg-calm/15 text-calm border-calm/30"
                          : "bg-warn/15 text-warn border-warn/30"
                      }`}
                    >
                      {rx.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3.5 space-y-2">
                    {rx.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-surf border border-border text-xs gap-1"
                      >
                        <div>
                          <div className="font-bold text-ink">{item.medicine}</div>
                          <div className="text-ink/60 text-[11px]">{item.instructions}</div>
                        </div>
                        <div className="sm:text-right font-mono text-brand font-semibold text-xs">
                          {item.frequency} · {item.duration}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* TAB 3: Reports */}
          <TabsContent value="reports" className="space-y-3">
            {patientTests.map((test) => (
              <Card key={test.id} className="border-border bg-card shadow-2xs">
                <CardHeader className="p-3.5 border-b border-border/60 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-bold text-ink uppercase tracking-wide">
                      {test.testName}
                    </CardTitle>
                    <span className="text-[10px] font-mono text-ink/50">
                      Requisition #{test.id} · Ordered by {test.doctorName}
                    </span>
                  </div>
                  <Badge
                    className={`text-[10px] font-mono ${
                      test.status === "Completed"
                        ? "bg-calm/15 text-calm border-calm/30"
                        : "bg-warn/15 text-warn border-warn/30"
                    }`}
                  >
                    {test.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3.5">
                  {test.results ? (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-3 font-mono text-[10px] text-ink/40 pb-1 border-b border-border">
                        <span>Test Parameter</span>
                        <span>Your Value</span>
                        <span className="text-right">Reference Range</span>
                      </div>
                      {test.results.map((r, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-3 text-xs py-1.5 border-b border-border/50 items-center"
                        >
                          <span className="font-medium text-ink">{r.parameter}</span>
                          <span className="font-mono font-bold text-brand">{r.value}</span>
                          <span className="text-right font-mono text-ink/50 text-[11px]">
                            {r.referenceRange || "Normal"}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 text-[11px] text-ink/60 bg-surf p-2.5 rounded-md border border-border">
                        <strong>Doctor Sign-Off:</strong> All values reviewed and verified by Dr.
                        Ananya Sharma.
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-ink/50 py-2">
                      Sample currently being processed in Central Diagnostic Lab.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* TAB 4: Profile */}
          <TabsContent value="profile" className="space-y-3">
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="p-3.5 border-b border-border/60">
                <CardTitle className="text-xs font-bold text-ink uppercase tracking-wide">
                  Registered Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-ink/50 text-[11px] block">Full Name</span>
                    <span className="font-bold text-ink">{patient.name}</span>
                  </div>
                  <div>
                    <span className="text-ink/50 text-[11px] block">UHID</span>
                    <span className="font-mono font-bold text-brand">{patient.id}</span>
                  </div>
                  <div>
                    <span className="text-ink/50 text-[11px] block">Age & Gender</span>
                    <span className="text-ink">
                      {patient.age} years · {patient.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink/50 text-[11px] block">Blood Group</span>
                    <span className="font-bold text-brand">{patient.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-ink/50 text-[11px] block">Contact Phone</span>
                    <span className="font-mono text-ink">{patient.phone}</span>
                  </div>
                  <div>
                    <span className="text-ink/50 text-[11px] block">Known Allergies</span>
                    <span className="text-crit font-semibold">
                      {patient.allergies.join(", ") || "None"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
