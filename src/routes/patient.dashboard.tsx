import { createFileRoute } from "@tanstack/react-router";
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
    meta: [{ title: "Patient Portal — Rajesh Sharma | CareSync" }],
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
      <div className="space-y-6">
        {/* Patient Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink/50">
              <span>Patient Portal</span>
              <span>•</span>
              <span className="text-calm font-medium">UHID: {patient.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
              Welcome, {patient.name}
            </h1>
            <p className="text-xs text-ink/60 mt-0.5">
              Your continuous digital health records, active prescriptions, and lab results.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AIPlaceholderButton
              label="Explain in Simple Language"
              featureName="AI Medical Explainer"
              className="text-xs h-9"
            />
            <Button
              onClick={() => toast.success("Digital Health Summary downloaded.")}
              variant="outline"
              className="border-border text-xs h-9 bg-card"
            >
              <Download className="size-4 mr-1.5 text-brand" /> Download Health Summary
            </Button>
          </div>
        </div>

        {/* 5 Patient Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">Upcoming Visit</span>
                <Calendar className="size-4 text-brand" />
              </div>
              <div className="mt-2 text-base font-bold text-ink">Tomorrow</div>
              <div className="text-[10px] font-mono text-ink/45 mt-0.5">10:30 AM · Follow-up</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">Active Rx</span>
                <Pill className="size-4 text-calm" />
              </div>
              <div className="mt-2 text-2xl font-bold text-calm">{patientPrescriptions.length}</div>
              <div className="text-[10px] font-mono text-ink/45 mt-0.5">3 medications</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">Test Reports</span>
                <FileText className="size-4 text-warn" />
              </div>
              <div className="mt-2 text-2xl font-bold text-warn">{patientTests.length}</div>
              <div className="text-[10px] font-mono text-ink/45 mt-0.5">CBC available</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">Current Bill</span>
                <CreditCard className="size-4 text-ink/60" />
              </div>
              <div className="mt-2 text-base font-bold text-ink">₹ 14,250</div>
              <div className="text-[10px] font-mono text-calm mt-0.5">Insurance Pre-Auth OK</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs col-span-2 lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">Admission</span>
                <Bed className="size-4 text-crit" />
              </div>
              <div className="mt-2 text-base font-bold text-ink">
                {patient.roomNumber || "Ward 3B"}
              </div>
              <div className="text-[10px] font-mono text-ink/45 mt-0.5">
                {patient.bedNumber || "Bed 12"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Tabs */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="bg-card border border-border p-1 rounded-xl h-auto flex flex-wrap gap-1">
            <TabsTrigger
              value="timeline"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              My Timeline
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              My Prescriptions
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              My Reports
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: My Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="p-4 border-b border-border/60">
                <CardTitle className="text-base font-bold text-ink">
                  Your Connected Medical Timeline
                </CardTitle>
                <p className="text-xs text-ink/50">
                  Real-time updates as care happens across hospital departments
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {patientTimeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative">
                      <span
                        className={`absolute -left-6 top-1 size-5 rounded-full border-2 border-card flex items-center justify-center text-[10px] text-white shadow-xs ${
                          item.status === "completed"
                            ? "bg-calm"
                            : item.status === "current"
                              ? "bg-brand ring-4 ring-brand/15"
                              : "bg-ink/30"
                        }`}
                      >
                        {item.status === "completed" ? "✓" : item.status === "current" ? "●" : "○"}
                      </span>

                      <div className="rounded-xl border border-border/80 bg-surf/40 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-ink">{item.title}</span>
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Prescriptions */}
          <TabsContent value="prescriptions" className="space-y-4">
            {patientPrescriptions.map((rx) => (
              <Card key={rx.id} className="border-border bg-card shadow-xs">
                <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-ink">
                      Prescription {rx.id}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-ink/50">
                      Dr. Ananya Sharma · {rx.createdAt}
                    </span>
                  </div>
                  <Badge className="bg-calm/15 text-calm">{rx.status}</Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {rx.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-surf border border-border text-xs"
                    >
                      <div>
                        <div className="font-semibold text-ink">{item.medicine}</div>
                        <div className="text-ink/60 text-[11px]">{item.instructions}</div>
                      </div>
                      <div className="text-right font-mono text-brand font-medium">
                        {item.frequency} ({item.duration})
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* TAB 3: Reports */}
          <TabsContent value="reports" className="space-y-4">
            {patientTests.map((test) => (
              <Card key={test.id} className="border-border bg-card shadow-xs">
                <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-ink">{test.testName}</CardTitle>
                  <Badge className="bg-calm/15 text-calm">{test.status}</Badge>
                </CardHeader>
                <CardContent className="p-4">
                  {test.results ? (
                    <div className="space-y-2">
                      {test.results.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-1 border-b border-border/50"
                        >
                          <span className="font-medium text-ink">{r.parameter}</span>
                          <span className="font-mono font-bold text-brand">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-ink/50">
                      Sample currently being analyzed in Central Lab.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
