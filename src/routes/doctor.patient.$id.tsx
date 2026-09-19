import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  UserRound,
  Calendar,
  Phone,
  MapPin,
  AlertTriangle,
  FileHeart,
  Stethoscope,
  Pill,
  FlaskConical,
  Activity,
  Bed,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIActionButton } from "@/components/care-sync/AIActionButton";
import {
  exportPatientSummaryPdf,
  exportPrescriptionPdf,
  exportLabReportPdf,
} from "@/lib/pdfGenerator";
import { useCareSync } from "@/lib/store";
import {
  fetchPatientByIdFromDb,
  fetchTimelineByPatientFromDb,
  fetchPrescriptionsByPatientFromDb,
  fetchTestOrdersByPatientFromDb,
  fetchVisitsByPatientFromDb,
} from "@/lib/dbServices";
import { Patient, TimelineEvent, Prescription, TestOrder, DbVisit } from "@/types/caresync";

export const Route = createFileRoute("/doctor/patient/$id")({
  head: () => ({
    meta: [{ title: "Patient Profile & Timeline | CareSync" }],
  }),
  component: PatientProfilePage,
});

function PatientProfilePage() {
  const { id } = useParams({ from: "/doctor/patient/$id" });
  const { patients, vitals, prescriptions, testOrders, surgeries, timelines } = useCareSync();

  const [dbPatient, setDbPatient] = useState<Patient | null>(null);
  const [dbTimeline, setDbTimeline] = useState<TimelineEvent[]>([]);
  const [dbPrescriptions, setDbPrescriptions] = useState<Prescription[]>([]);
  const [dbTestOrders, setDbTestOrders] = useState<TestOrder[]>([]);
  const [dbVisits, setDbVisits] = useState<DbVisit[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch live record from Supabase by route param ID
  useEffect(() => {
    let mounted = true;
    async function loadPatientData() {
      if (!id) return;
      setLoading(true);
      try {
        const [patientData, timelineData, rxData, testData, visitData] = await Promise.allSettled([
          fetchPatientByIdFromDb(id),
          fetchTimelineByPatientFromDb(id),
          fetchPrescriptionsByPatientFromDb(id),
          fetchTestOrdersByPatientFromDb(id),
          fetchVisitsByPatientFromDb(id),
        ]);

        if (mounted) {
          if (patientData.status === "fulfilled" && patientData.value) {
            setDbPatient(patientData.value);
          }
          if (timelineData.status === "fulfilled" && timelineData.value) {
            setDbTimeline(timelineData.value);
          }
          if (rxData.status === "fulfilled" && rxData.value) {
            setDbPrescriptions(rxData.value);
          }
          if (testData.status === "fulfilled" && testData.value) {
            setDbTestOrders(testData.value);
          }
          if (visitData.status === "fulfilled" && visitData.value) {
            setDbVisits(visitData.value);
          }
        }
      } catch (err) {
        console.warn("[PatientProfile] Database fetch notice:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPatientData();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Resolve active patient: 1. Live DB record -> 2. Local store matching ID -> 3. Fallback
  const storePatient = patients.find((p) => p.id === id);
  const fallbackFirst = patients.length > 0 && id === "CS-001" ? patients[0] : undefined;
  const patient: Patient =
    dbPatient ||
    storePatient ||
    fallbackFirst || {
      id: id || "CS-001",
      name: "Patient Record",
      age: 45,
      gender: "Male",
      bloodGroup: "O+",
      phone: "+91 98765 00000",
      address: "Bengaluru, Karnataka",
      allergies: [],
      medicalHistory: [],
      status: "Waiting",
      currentDepartment: "Outpatient Clinic",
      assignedDoctor: "Dr. Ananya Sharma",
      registeredAt: "Just now",
    };

  const patientVitals = vitals.filter((v) => v.patientId === patient.id);
  const patientPrescriptions =
    dbPrescriptions.length > 0
      ? dbPrescriptions
      : prescriptions.filter((p) => p.patientId === patient.id);

  const patientLabOrders =
    dbTestOrders.length > 0
      ? dbTestOrders
      : testOrders.filter((t) => t.patientId === patient.id);

  const patientSurgery = surgeries.find((s) => s.patientId === patient.id);

  const patientTimeline =
    dbTimeline.length > 0
      ? dbTimeline
      : timelines[patient.id] || timelines["CS-001"] || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
            <Link to="/doctor/dashboard" className="hover:text-brand">
              Doctor Hub
            </Link>
            <span>/</span>
            <Link to="/doctor/dashboard" className="hover:text-brand">
              Patients
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold">{patient.id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AIActionButton
              label="Explain in Simple Language"
              featureName="Patient Clinical Explanation Assistant"
              actionType="explain_simple"
              role="doctor"
              patientId={patient.id}
              getContextData={() => ({
                patient,
                vitals: patientVitals,
                prescriptions: patientPrescriptions,
                tests: patientLabOrders,
                timeline: patientTimeline,
              })}
              className="text-xs h-8"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                exportPatientSummaryPdf({
                  patient,
                  vitals: patientVitals,
                  prescriptions: patientPrescriptions,
                  tests: patientLabOrders,
                  timeline: patientTimeline,
                });
                toast.success(`Patient Chart for ${patient.name} (${patient.id}) downloaded as PDF`);
              }}
              className="border-border text-xs h-8 bg-card text-ink hover:bg-surf cursor-pointer"
            >
              <FileText className="size-3.5 mr-1 text-brand" /> Download Chart PDF
            </Button>
            <Button asChild size="sm" className="bg-brand hover:bg-brand/90 text-white text-xs h-8">
              <Link to="/doctor/consultation">
                <Stethoscope className="size-3.5 mr-1" /> New Consultation Note
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-border text-xs h-8 bg-card"
            >
              <Link to="/surgery">
                <Activity className="size-3.5 mr-1 text-crit" /> Track Surgery / Ward
              </Link>
            </Button>
          </div>
        </div>

        {/* Patient Identity Header Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-16 rounded-2xl bg-brand/10 text-brand font-bold text-xl grid place-items-center shrink-0 border border-brand/20">
                {patient.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-ink">{patient.name}</h1>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs text-brand border-brand/30 bg-brand/5"
                  >
                    {patient.id}
                  </Badge>
                  <Badge
                    className={
                      patient.status === "Waiting"
                        ? "bg-warn/15 text-warn border-warn/30"
                        : patient.status === "In Consultation"
                          ? "bg-calm/15 text-calm border-calm/30"
                          : "bg-brand/15 text-brand border-brand/30"
                    }
                  >
                    {patient.status}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink/70">
                  <span>
                    <strong>Age:</strong> {patient.age} yrs
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Gender:</strong> {patient.gender}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Blood Group:</strong>{" "}
                    <span className="text-brand font-semibold">{patient.bloodGroup}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3 text-ink/40" /> {patient.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Inpatient / Location Badge */}
            <div className="flex items-center gap-3 bg-surf rounded-xl p-3 border border-border/80 lg:min-w-[240px]">
              <Bed className="size-5 text-brand shrink-0" />
              <div className="text-xs">
                <div className="font-semibold text-ink">
                  {patient.roomNumber || "Outpatient Clinic"} ·{" "}
                  {patient.bedNumber || "No Bed Assigned"}
                </div>
                <div className="text-ink/50 text-[11px]">Assigned to: {patient.assignedDoctor}</div>
              </div>
            </div>
          </div>

          {/* Medical Alerts Banner */}
          <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-crit flex items-center gap-1">
                <AlertTriangle className="size-3.5" /> Allergies:
              </span>
              {patient.allergies.map((allergy) => (
                <Badge
                  key={allergy}
                  variant="destructive"
                  className="text-[10px] bg-crit/15 text-crit border-crit/20"
                >
                  {allergy}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ink/60 font-semibold">Medical History:</span>
              {patient.medicalHistory.map((hist) => (
                <Badge key={hist} variant="outline" className="text-[10px] bg-surf border-border">
                  {hist}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 8 Patient Chart Tabs */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="bg-card border border-border p-1 rounded-xl h-auto flex flex-wrap gap-1">
            <TabsTrigger
              value="timeline"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              Timeline Journey
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              Prescriptions ({patientPrescriptions.length})
            </TabsTrigger>
            <TabsTrigger
              value="diagnostics"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              Diagnostics ({patientLabOrders.length})
            </TabsTrigger>
            <TabsTrigger
              value="vitals"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              Vitals ({patientVitals.length})
            </TabsTrigger>
            <TabsTrigger
              value="surgery"
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              Surgery & OT
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Digital Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="p-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-ink">
                      Continuous Patient Timeline
                    </CardTitle>
                    <p className="text-xs text-ink/50 mt-0.5">
                      Chronological record across all departments
                    </p>
                  </div>
                  <span className="font-mono text-xs text-calm bg-tealsoft px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-calm animate-pulse" /> Live In Sync
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {patientTimeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative group">
                      {/* Timeline Node */}
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

                      {/* Content Card */}
                      <div className="rounded-xl border border-border/80 bg-surf/40 p-4 transition-all hover:bg-surf hover:border-brand/30">
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
                        <div className="mt-2 text-[11px] font-mono text-ink/40 flex items-center gap-1">
                          <span>Recorded by:</span>
                          <span className="text-ink/60 font-medium">{item.actor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="p-4 border-b border-border/60">
                  <CardTitle className="text-sm font-semibold text-ink">
                    Demographics & Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <div>
                    <strong>Full Name:</strong> {patient.name}
                  </div>
                  <div>
                    <strong>Address:</strong> {patient.address}
                  </div>
                  <div>
                    <strong>Emergency Contact:</strong> Sunita Sharma (Wife) · +91 98765 00000
                  </div>
                  <div>
                    <strong>Registration Date:</strong> {patient.registeredAt}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="p-4 border-b border-border/60">
                  <CardTitle className="text-sm font-semibold text-ink">
                    Current Care Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <div>
                    <strong>Attending Physician:</strong> Dr. Ananya Sharma
                  </div>
                  <div>
                    <strong>Assigned Ward Nurse:</strong> Priya Verma
                  </div>
                  <div>
                    <strong>Diagnostics Lead:</strong> Neha Gupta
                  </div>
                  <div>
                    <strong>Dispensing Pharmacist:</strong> Amit Singh
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: Prescriptions */}
          <TabsContent value="prescriptions" className="space-y-4">
            {patientPrescriptions.length === 0 ? (
              <div className="text-center py-10 text-xs text-ink/50 bg-card rounded-xl border border-border">
                No prescriptions created yet.
              </div>
            ) : (
              patientPrescriptions.map((rx) => (
                <Card key={rx.id} className="border-border bg-card shadow-xs">
                  <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-ink">
                        Prescription #{rx.id}
                      </CardTitle>
                      <span className="text-[11px] font-mono text-ink/50">
                        Created {rx.createdAt} by {rx.doctorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          rx.status === "Dispensed"
                            ? "bg-calm/15 text-calm border-calm/30"
                            : "bg-warn/15 text-warn border-warn/30"
                        }
                      >
                        {rx.status}
                      </Badge>
                      <AIActionButton
                        label="Explain Rx"
                        featureName={`Prescription Explanation (#${rx.id})`}
                        actionType="explain_prescription"
                        role="doctor"
                        patientId={patient.id}
                        getContextData={() => ({ prescription: rx, patient })}
                        className="text-[11px] h-7 px-2"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          exportPrescriptionPdf({
                            id: rx.id,
                            patientId: patient.id,
                            patientName: patient.name,
                            doctorName: rx.doctorName,
                            createdAt: rx.createdAt,
                            notes: rx.notes,
                            items: rx.items,
                          });
                          toast.success(`Prescription #${rx.id} downloaded as PDF`);
                        }}
                        className="text-[11px] h-7 px-2 border-border bg-card text-ink hover:bg-surf cursor-pointer"
                      >
                        <FileText className="size-3 mr-1 text-brand" /> PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {rx.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-surf border border-border/70 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-ink">{item.medicine}</div>
                            <div className="text-ink/60 text-[11px]">{item.instructions}</div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-brand font-medium">{item.frequency}</div>
                            <div className="text-ink/50 text-[10px]">{item.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* TAB 4: Diagnostics */}
          <TabsContent value="diagnostics" className="space-y-4">
            {patientLabOrders.map((test) => (
              <Card key={test.id} className="border-border bg-card shadow-xs">
                <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-ink">{test.testName}</CardTitle>
                    <span className="text-[11px] font-mono text-ink/50">
                      Requisition #{test.id} · Priority: {test.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        test.status === "Completed"
                          ? "bg-calm/15 text-calm border-calm/30"
                          : "bg-warn/15 text-warn border-warn/30"
                      }
                    >
                      {test.status}
                    </Badge>
                    <AIActionButton
                      label="AI Summary"
                      featureName={`AI Analysis — ${test.testName}`}
                      actionType="summarize_report"
                      role="doctor"
                      patientId={patient.id}
                      getContextData={() => ({ report: test, patient })}
                      className="text-[11px] h-7 px-2"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        exportLabReportPdf({
                          id: test.id,
                          testName: test.testName,
                          patientId: patient.id,
                          patientName: patient.name,
                          doctorName: test.doctorName,
                          orderedAt: test.orderedAt,
                          completedAt: test.completedAt,
                          priority: test.priority,
                          labNotes: test.labNotes,
                          results: test.results,
                        });
                        toast.success(`Lab Report #${test.id} downloaded as PDF`);
                      }}
                      className="text-[11px] h-7 px-2 border-border bg-card text-ink hover:bg-surf cursor-pointer"
                    >
                      <FileText className="size-3 mr-1 text-brand" /> PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {test.results ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 font-mono text-[11px] text-ink/50 pb-1 border-b border-border">
                        <span>Parameter</span>
                        <span>Result</span>
                        <span>Reference</span>
                        <span className="text-right">Status</span>
                      </div>
                      {test.results.map((res, i) => (
                        <div key={i} className="grid grid-cols-4 text-xs py-1 items-center">
                          <span className="font-medium text-ink">{res.parameter}</span>
                          <span className="font-mono font-bold text-ink">{res.value}</span>
                          <span className="font-mono text-ink/50 text-[11px]">
                            {res.referenceRange}
                          </span>
                          <span className="text-right">
                            <Badge
                              variant={res.status === "Normal" ? "outline" : "destructive"}
                              className="text-[10px]"
                            >
                              {res.status}
                            </Badge>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-ink/50">
                      Test in progress. Laboratory technician processing sample.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* TAB 5: Vitals */}
          <TabsContent value="vitals" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientVitals.map((v) => (
                <Card key={v.id} className="border-border bg-card shadow-xs">
                  <CardHeader className="p-3 border-b border-border/60 flex flex-row items-center justify-between">
                    <span className="text-xs font-semibold text-ink">{v.recordedAt}</span>
                    <span className="text-[10px] font-mono text-ink/40">{v.recordedBy}</span>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-surf p-2 rounded-lg">
                      <span className="text-[10px] text-ink/50 font-mono">Blood Pressure</span>
                      <div className="font-bold text-sm text-ink">{v.bloodPressure}</div>
                    </div>
                    <div className="bg-surf p-2 rounded-lg">
                      <span className="text-[10px] text-ink/50 font-mono">Pulse</span>
                      <div className="font-bold text-sm text-ink">{v.pulse}</div>
                    </div>
                    <div className="bg-surf p-2 rounded-lg">
                      <span className="text-[10px] text-ink/50 font-mono">Temperature</span>
                      <div className="font-bold text-sm text-ink">{v.temperature}</div>
                    </div>
                    <div className="bg-surf p-2 rounded-lg">
                      <span className="text-[10px] text-ink/50 font-mono">SpO2</span>
                      <div className="font-bold text-sm text-ink">{v.spO2}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 6: Surgery */}
          <TabsContent value="surgery" className="space-y-4">
            {patientSurgery ? (
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-ink">
                      {patientSurgery.procedureName}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-ink/50">
                      Surgeon: {patientSurgery.surgeon}
                    </span>
                  </div>
                  <Badge className="bg-brand/15 text-brand">{patientSurgery.status}</Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {patientSurgery.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-surf border border-border/70"
                      >
                        <span className="font-medium text-ink">{m.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${m.status === "completed" ? "bg-calm/15 text-calm border-calm/30" : m.status === "in_progress" ? "bg-brand/15 text-brand" : "text-ink/40"}`}
                        >
                          {m.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-xs text-ink/50 bg-card rounded-xl border border-border">
                No active surgeries scheduled for this patient.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
