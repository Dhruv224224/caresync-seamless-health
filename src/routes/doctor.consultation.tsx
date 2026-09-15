import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Stethoscope,
  Pill,
  FlaskConical,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileCheck,
  UserRound,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIPlaceholderButton } from "@/components/care-sync/AIPlaceholderButton";
import { useCareSync } from "@/lib/store";
import { PrescriptionItem } from "@/types/caresync";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/consultation")({
  head: () => ({
    meta: [{ title: "Digital Consultation & Prescription Builder | CareSync" }],
  }),
  component: DoctorConsultationPage,
});

function DoctorConsultationPage() {
  const { patients, addPrescription, addTestOrder, updatePatientStatus } = useCareSync();
  const navigate = useNavigate();

  const [selectedPatientId, setSelectedPatientId] = useState("CS-001");
  const [symptoms, setSymptoms] = useState(
    "Persistent right lower abdominal pain (3 days), low grade fever, nausea.",
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    "Tenderness elicited at McBurney point. Rebound tenderness positive. Guarding noted.",
  );
  const [diagnosis, setDiagnosis] = useState("Acute Appendicitis (K35.80)");
  const [treatmentPlan, setTreatmentPlan] = useState(
    "Admit for laparoscopic appendectomy. Pre-op antibiotic coverage and IV hydration.",
  );

  // Prescription Items state
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([
    {
      id: "1",
      medicine: "Paracetamol 500mg",
      dosage: "500mg",
      frequency: "1-0-1",
      duration: "5 days",
      instructions: "After food",
    },
    {
      id: "2",
      medicine: "Cefixime 200mg",
      dosage: "200mg",
      frequency: "1-0-1",
      duration: "5 days",
      instructions: "Take on empty stomach",
    },
    {
      id: "3",
      medicine: "Pantoprazole 40mg",
      dosage: "40mg",
      frequency: "1-0-0",
      duration: "7 days",
      instructions: "Before breakfast",
    },
  ]);

  // Lab Test state
  const [selectedLabTest, setSelectedLabTest] = useState("Complete Blood Count (CBC)");
  const [labPriority, setLabPriority] = useState<"Routine" | "Urgent" | "Stat">("Urgent");

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0] || {
    id: "CS-001",
    name: "Rajesh Sharma",
    age: 54,
    gender: "Male" as const,
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    address: "Bengaluru",
    allergies: ["Penicillin"],
    medicalHistory: ["Hypertension"],
    status: "Waiting" as const,
    currentDepartment: "General Medicine",
    assignedDoctor: "Dr. Ananya Sharma",
    registeredAt: "08:30 AM",
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: String(Date.now()),
        medicine: "",
        dosage: "500mg",
        frequency: "1-0-1",
        duration: "5 days",
        instructions: "After meals",
      },
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const handleMedicineChange = (id: string, field: keyof PrescriptionItem, val: string) => {
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  };

  const handleCreatePrescription = () => {
    if (medicines.length === 0) {
      toast.error("Add at least one medicine");
      return;
    }

    addPrescription({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: "DOC-01",
      doctorName: "Dr. Ananya Sharma",
      items: medicines,
      notes: clinicalNotes,
    });

    toast.success(`Digital Prescription generated & dispatched to Pharmacy!`);
  };

  const handleOrderLabTest = () => {
    addTestOrder({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: "Dr. Ananya Sharma",
      testName: selectedLabTest,
      priority: labPriority,
    });

    toast.success(`Lab Test "${selectedLabTest}" ordered & sent to Diagnostics!`);
  };

  const handleCompleteConsultation = () => {
    handleCreatePrescription();
    updatePatientStatus(selectedPatient.id, "Diagnostics", "Central Laboratory");
    toast.success(`Consultation recorded. Patient ${selectedPatient.id} moved to Diagnostics.`);
    navigate({ to: "/doctor/patient/$id", params: { id: selectedPatient.id } });
  };

  return (
    <AppShell activeRole="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink/50">
              <span>OPD Consultation Room</span>
              <span>•</span>
              <span className="text-calm font-medium">Digital Charting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
              Clinical Consultation & Rx Builder
            </h1>
            <p className="text-xs text-ink/60 mt-0.5">
              Record diagnosis, construct digital prescriptions, and order connected diagnostic
              tests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AIPlaceholderButton
              label="Structure Notes with AI"
              featureName="AI Clinical Note Assistant"
              className="text-xs h-9"
            />
            <Button
              onClick={handleCompleteConsultation}
              className="bg-brand hover:bg-brand/90 text-white text-xs h-9 shadow-sm"
            >
              <CheckCircle2 className="size-4 mr-1.5" /> Save & Finalize Consultation
            </Button>
          </div>
        </div>

        {/* Patient Selector Strip */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserRound className="size-5 text-brand" />
              <div>
                <Label className="text-xs font-semibold text-ink">Active Patient</Label>
                <div className="flex items-center gap-2 mt-0.5">
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="w-56 h-8 text-xs font-medium bg-surf">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name} ({p.id}) — {p.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ink/70">
              <div>
                <strong>Age:</strong> {selectedPatient.age}y
              </div>
              <div>
                <strong>Gender:</strong> {selectedPatient.gender}
              </div>
              <div>
                <strong>Blood:</strong>{" "}
                <span className="text-brand font-bold">{selectedPatient.bloodGroup}</span>
              </div>
              <div>
                <strong>Allergies:</strong>{" "}
                <span className="text-crit font-semibold">
                  {selectedPatient.allergies.join(", ") || "None"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Symptoms, Notes, Diagnosis (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Stethoscope className="size-4 text-brand" /> Clinical Observations & Diagnosis
                </CardTitle>
                <AIPlaceholderButton
                  label="Format with AI"
                  featureName="Clinical Note Formatter"
                  size="sm"
                  className="text-[11px] h-7"
                />
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-ink">
                    Chief Complaints / Symptoms
                  </Label>
                  <Textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={2}
                    className="text-xs bg-surf border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-ink">
                    Clinical Examination & Vitals Assessment
                  </Label>
                  <Textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    rows={3}
                    className="text-xs bg-surf border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-ink">Provisional Diagnosis</Label>
                  <Input
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="text-xs bg-surf border-border h-8 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-ink">
                    Treatment Plan & Directives
                  </Label>
                  <Textarea
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    rows={2}
                    className="text-xs bg-surf border-border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Order Diagnostic Lab Test */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="p-4 border-b border-border/60">
                <CardTitle className="text-sm font-semibold text-ink flex items-center gap-2">
                  <FlaskConical className="size-4 text-warn" /> Direct Diagnostic Requisition
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-ink">Select Test</Label>
                    <Select value={selectedLabTest} onValueChange={setSelectedLabTest}>
                      <SelectTrigger className="text-xs bg-surf h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Complete Blood Count (CBC)">
                          Complete Blood Count (CBC)
                        </SelectItem>
                        <SelectItem value="Fasting Blood Sugar & HbA1c">
                          Fasting Blood Sugar & HbA1c
                        </SelectItem>
                        <SelectItem value="Lipid Profile">Lipid Profile</SelectItem>
                        <SelectItem value="Chest X-Ray (PA View)">
                          Chest X-Ray (PA View)
                        </SelectItem>
                        <SelectItem value="Urinalysis Routine">Urinalysis Routine</SelectItem>
                        <SelectItem value="Ultrasound Whole Abdomen">
                          Ultrasound Whole Abdomen
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-ink">Priority</Label>
                    <Select value={labPriority} onValueChange={(v: any) => setLabPriority(v)}>
                      <SelectTrigger className="text-xs bg-surf h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Routine">Routine</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Stat">Stat (Immediate)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleOrderLabTest}
                  variant="outline"
                  className="w-full text-xs h-8 border-warn/40 text-warn hover:bg-warn/10 hover:text-warn"
                >
                  <FlaskConical className="size-3.5 mr-1" /> Dispatch Order to Central Lab
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Digital Prescription Builder (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Pill className="size-4 text-calm" /> Digital Prescription Builder
                </CardTitle>
                <Button
                  onClick={handleAddMedicine}
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-border"
                >
                  <Plus className="size-3 mr-1" /> Add Drug
                </Button>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {medicines.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-surf border border-border/70 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-ink/40 uppercase">
                        Item #{index + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveMedicine(item.id)}
                        className="text-ink/40 hover:text-crit transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-7">
                        <Input
                          placeholder="Medicine name (e.g. Paracetamol 500mg)"
                          value={item.medicine}
                          onChange={(e) =>
                            handleMedicineChange(item.id, "medicine", e.target.value)
                          }
                          className="text-xs bg-card h-8 font-medium"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          placeholder="Dosage (e.g. 500mg)"
                          value={item.dosage}
                          onChange={(e) => handleMedicineChange(item.id, "dosage", e.target.value)}
                          className="text-xs bg-card h-8"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <Input
                          placeholder="Freq (1-0-1)"
                          value={item.frequency}
                          onChange={(e) =>
                            handleMedicineChange(item.id, "frequency", e.target.value)
                          }
                          className="text-xs bg-card h-8 font-mono text-brand"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Duration (5 days)"
                          value={item.duration}
                          onChange={(e) =>
                            handleMedicineChange(item.id, "duration", e.target.value)
                          }
                          className="text-xs bg-card h-8 font-mono"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Instructions"
                          value={item.instructions}
                          onChange={(e) =>
                            handleMedicineChange(item.id, "instructions", e.target.value)
                          }
                          className="text-xs bg-card h-8"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleCreatePrescription}
                    className="flex-1 bg-calm hover:bg-calm/90 text-white text-xs h-9"
                  >
                    <Pill className="size-3.5 mr-1" /> Forward Rx to Pharmacy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.success("Prescription draft saved to local chart.")}
                    className="text-xs h-9 border-border"
                  >
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
