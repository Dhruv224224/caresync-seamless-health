import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  FlaskConical,
  Stethoscope,
  Pill,
  Activity,
  ArrowRight,
  UserCheck,
  Search,
  PlusCircle,
  FileText,
  AlertCircle,
  Sparkles,
  Phone,
  Bed,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIPlaceholderButton } from "@/components/care-sync/AIPlaceholderButton";
import { useCareSync } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/dashboard")({
  head: () => ({
    meta: [{ title: "Doctor Dashboard — Dr. Ananya Sharma | CareSync" }],
  }),
  component: DoctorDashboardPage,
});

function DoctorDashboardPage() {
  const { patients, testOrders, updatePatientStatus } = useCareSync();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const waitingPatients = patients.filter((p) => p.status === "Waiting");
  const completedPatientsCount = 8;
  const pendingLabResultsCount = testOrders.filter((t) => t.status !== "Completed").length;

  const filteredQueue = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const nextPatient = waitingPatients[0] || patients[0];

  const handleStartConsultation = (patientId: string) => {
    updatePatientStatus(patientId, "In Consultation", "General Medicine Consultation");
    toast.success("Patient called into consultation");
    navigate({ to: "/doctor/patient/$id", params: { id: patientId } });
  };

  return (
    <AppShell activeRole="doctor">
      <div className="space-y-4">
        {/* Header & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink/50">
              <span>OPD Consultation Room 4</span>
              <span>•</span>
              <span className="text-calm font-medium">Session Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-0.5">
              Good morning, Dr. Ananya Sharma
            </h1>
            <p className="text-xs text-ink/60">
              Department of General Medicine · CareSync Hospital Indiranagar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AIPlaceholderButton
              label="Structure Notes with AI"
              featureName="AI Clinical Note Assistant"
              className="text-xs h-8"
            />
            <Button
              asChild
              className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs h-8 shadow-xs"
            >
              <Link to="/doctor/consultation">
                <PlusCircle className="size-3.5 mr-1.5" /> New Consultation
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border text-xs h-8 bg-card">
              <Link to="/doctor/patient/$id" params={{ id: "CS-001" }}>
                <FileText className="size-3.5 mr-1.5 text-brand" /> Active Patient (CS-001)
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 Clinical Operations Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Today's Queue
                </div>
                <div className="text-2xl font-bold text-ink mt-0.5">12</div>
                <div className="text-[10px] text-ink/45 mt-0.5">4 scheduled, 8 seen</div>
              </div>
              <div className="size-9 rounded-md bg-brand/10 text-brand grid place-items-center">
                <Users className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Waiting in OPD
                </div>
                <div className="text-2xl font-bold text-warn mt-0.5">
                  {waitingPatients.length + 2}
                </div>
                <div className="text-[10px] text-ink/45 mt-0.5">Avg wait: 14 mins</div>
              </div>
              <div className="size-9 rounded-md bg-warn/15 text-warn grid place-items-center">
                <Clock className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Consults Done
                </div>
                <div className="text-2xl font-bold text-calm mt-0.5">{completedPatientsCount}</div>
                <div className="text-[10px] text-ink/45 mt-0.5">Prescriptions synced</div>
              </div>
              <div className="size-9 rounded-md bg-calm/15 text-calm grid place-items-center">
                <CheckCircle2 className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Lab Tests Pending
                </div>
                <div className="text-2xl font-bold text-crit mt-0.5">{pendingLabResultsCount}</div>
                <div className="text-[10px] text-ink/45 mt-0.5">1 urgent CBC flagged</div>
              </div>
              <div className="size-9 rounded-md bg-crit/15 text-crit grid place-items-center">
                <FlaskConical className="size-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Patient Callout Banner */}
        {nextPatient && (
          <div className="bg-brand/5 border border-brand/30 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-calm animate-ping" />
              <div>
                <div className="text-[11px] font-mono uppercase text-brand font-semibold">
                  Next Patient in Queue
                </div>
                <div className="text-sm font-bold text-ink">
                  {nextPatient.name} · UHID: {nextPatient.id} ({nextPatient.age}y,{" "}
                  {nextPatient.gender})
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleStartConsultation(nextPatient.id)}
              className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs h-8"
            >
              Call to Consultation Room 4 <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        )}

        {/* Main Worklist & Department Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Patient Queue Table (8 Cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
                  OPD Consultation Queue
                </h2>
                <p className="text-xs text-ink/55">
                  Active outpatient waiting list and triage status
                </p>
              </div>

              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter queue by name/ID..."
                  className="h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-card focus:outline-none focus:border-brand w-48 font-mono"
                />
              </div>
            </div>

            <Card className="border-border bg-card shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surf/80 text-[10px] font-mono uppercase tracking-wider text-ink/50 border-b border-border">
                    <tr>
                      <th className="p-3 pl-4">Patient</th>
                      <th className="p-3">UHID</th>
                      <th className="p-3">Demographics</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredQueue.map((patient) => (
                      <tr key={patient.id} className="hover:bg-surf/40 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="font-semibold text-ink">{patient.name}</div>
                          <div className="text-[10px] text-ink/50">{patient.phone}</div>
                        </td>
                        <td className="p-3 font-mono font-medium text-brand">{patient.id}</td>
                        <td className="p-3 text-ink/70">
                          {patient.age}y · {patient.gender} · {patient.bloodGroup}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-mono ${
                              patient.status === "In Consultation"
                                ? "bg-calm/10 text-calm border-calm/30"
                                : "bg-surf text-ink/60 border-border"
                            }`}
                          >
                            {patient.status === "In Consultation" ? "Priority" : "Routine"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`text-[10px] font-mono ${
                              patient.status === "Waiting"
                                ? "bg-warn/15 text-warn border-warn/30"
                                : patient.status === "In Consultation"
                                  ? "bg-calm/15 text-calm border-calm/30"
                                  : "bg-brand/15 text-brand border-brand/30"
                            }`}
                          >
                            {patient.status}
                          </Badge>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          {patient.status === "Waiting" ? (
                            <Button
                              size="sm"
                              onClick={() => handleStartConsultation(patient.id)}
                              className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs h-7 px-2.5"
                            >
                              Call In
                            </Button>
                          ) : (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="border-border text-xs h-7 px-2.5 bg-surf hover:bg-card"
                            >
                              <Link to="/doctor/patient/$id" params={{ id: patient.id }}>
                                Open Chart <ArrowRight className="size-3 ml-1" />
                              </Link>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Side: Quick Clinical Actions & Recent Activity Feed (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="p-3.5 pb-2 border-b border-border/60">
                <CardTitle className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                  Clinical Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start text-xs border-border h-8 hover:bg-brand/5 hover:text-brand"
                >
                  <Link to="/doctor/consultation">
                    <Stethoscope className="size-3.5 mr-2 text-brand" /> New Consultation Note
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start text-xs border-border h-8 hover:bg-brand/5 hover:text-brand"
                >
                  <Link to="/doctor/patient/$id" params={{ id: "CS-001" }}>
                    <Pill className="size-3.5 mr-2 text-calm" /> Prescribe Medication
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start text-xs border-border h-8 hover:bg-brand/5 hover:text-brand"
                >
                  <Link to="/lab/dashboard">
                    <FlaskConical className="size-3.5 mr-2 text-warn" /> Order Diagnostic Lab Test
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start text-xs border-border h-8 hover:bg-brand/5 hover:text-brand"
                >
                  <Link to="/surgery">
                    <Activity className="size-3.5 mr-2 text-crit" /> View Surgery & OT Schedule
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Department Live Activity Feed */}
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="p-3.5 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                  Hospital Sync Feed
                </CardTitle>
                <span className="size-1.5 rounded-full bg-calm" />
              </CardHeader>
              <CardContent className="p-3.5 space-y-3">
                {[
                  {
                    title: "CBC report ready for review",
                    patient: "Rajesh Sharma (CS-001)",
                    time: "10:15 AM",
                  },
                  {
                    title: "Prescription dispensed at Pharmacy",
                    patient: "Priya Verma (CS-002)",
                    time: "08:50 AM",
                  },
                  {
                    title: "Vitals recorded (BP 128/84)",
                    patient: "Rajesh Sharma (CS-001)",
                    time: "09:00 AM",
                  },
                  {
                    title: "Patient registered at Desk",
                    patient: "Amit Singh (CS-003)",
                    time: "09:25 AM",
                  },
                ].map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="size-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1 leading-snug">
                      <div className="font-semibold text-ink truncate">{act.title}</div>
                      <div className="text-[10px] text-ink/50 mt-0.5 flex items-center justify-between font-mono">
                        <span>{act.patient}</span>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
