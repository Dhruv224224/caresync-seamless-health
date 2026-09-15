import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  HeartPulse,
  Bed,
  CheckCircle2,
  Clock,
  Plus,
  Save,
  Activity,
  AlertTriangle,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCareSync } from "@/lib/store";
import { Patient } from "@/types/caresync";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/dashboard")({
  head: () => ({
    meta: [{ title: "Nursing Station & Inpatient Ward | CareSync" }],
  }),
  component: NurseDashboardPage,
});

function NurseDashboardPage() {
  const { patients, vitals, addVital } = useCareSync();

  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<Patient | null>(null);
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);

  // Vitals form state
  const [temperature, setTemperature] = useState("98.6 °F");
  const [bloodPressure, setBloodPressure] = useState("124/82 mmHg");
  const [pulse, setPulse] = useState("74 bpm");
  const [spO2, setSpO2] = useState("99%");

  const admittedPatients = patients.filter(
    (p) => p.bedNumber || p.status === "Admitted" || p.status === "In Consultation",
  );

  const handleOpenVitalsModal = (patient: Patient) => {
    setSelectedPatientForVitals(patient);
    setVitalsModalOpen(true);
  };

  const handleSaveVitals = () => {
    if (!selectedPatientForVitals) return;

    addVital({
      patientId: selectedPatientForVitals.id,
      temperature,
      bloodPressure,
      pulse,
      spO2,
      notes: "Routine nursing round checks. Patient comfortable.",
    });

    setVitalsModalOpen(false);
    toast.success(`Vitals recorded for ${selectedPatientForVitals.name}! Patient chart updated.`);
  };

  return (
    <AppShell activeRole="nurse">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink/50">
              <span>Inpatient Ward 3B & Recovery</span>
              <span>•</span>
              <span className="text-calm font-medium">Staff Nurse: Priya Verma</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-0.5">
              Nursing Station & Inpatient Care
            </h1>
            <p className="text-xs text-ink/60">
              Manage inpatient bed assignments, perform scheduled rounds, and log vital signs.
            </p>
          </div>
        </div>

        {/* 4 Nursing Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Assigned Beds
                </div>
                <div className="text-2xl font-bold text-ink mt-0.5">{admittedPatients.length}</div>
                <div className="text-[10px] text-ink/45 mt-0.5">Ward 3B & 2A</div>
              </div>
              <div className="size-9 rounded-md bg-brand/10 text-brand grid place-items-center">
                <Bed className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Care Tasks Due
                </div>
                <div className="text-2xl font-bold text-warn mt-0.5">3</div>
                <div className="text-[10px] text-ink/45 mt-0.5">IV drips & antibiotics</div>
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
                  Vitals Due
                </div>
                <div className="text-2xl font-bold text-brand mt-0.5">2</div>
                <div className="text-[10px] text-ink/45 mt-0.5">Q4H routine check</div>
              </div>
              <div className="size-9 rounded-md bg-brand/15 text-brand grid place-items-center">
                <HeartPulse className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Post-Op Inpatients
                </div>
                <div className="text-2xl font-bold text-crit mt-0.5">1</div>
                <div className="text-[10px] text-ink/45 mt-0.5">OT-2 Recovery</div>
              </div>
              <div className="size-9 rounded-md bg-crit/15 text-crit grid place-items-center">
                <Activity className="size-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inpatient Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
              Active Ward Inpatients
            </h2>
            <span className="text-xs font-mono text-ink/50">
              {admittedPatients.length} Active Beds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {admittedPatients.map((patient) => {
              const latestVital = vitals.find((v) => v.patientId === patient.id);
              return (
                <Card
                  key={patient.id}
                  className="border-border bg-card shadow-2xs hover:border-brand/40 transition-all"
                >
                  <CardHeader className="p-3.5 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded bg-surf border border-border text-brand font-bold text-xs grid place-items-center font-mono">
                        {patient.bedNumber || "OPD"}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-ink">{patient.name}</div>
                        <div className="text-[10px] font-mono text-ink/50">
                          {patient.id} · {patient.age}y · {patient.bloodGroup}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-brand/15 text-brand text-[10px] font-mono">
                      {patient.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-3.5 space-y-2.5">
                    <div className="text-xs text-ink/75">
                      <div>
                        <strong>Attending:</strong> {patient.assignedDoctor}
                      </div>
                      <div>
                        <strong>Allergies:</strong>{" "}
                        <span className="text-crit font-semibold">
                          {patient.allergies.join(", ") || "None"}
                        </span>
                      </div>
                    </div>

                    {latestVital && (
                      <div className="bg-surf p-2.5 rounded border border-border/70 grid grid-cols-4 gap-2 text-center text-xs">
                        <div>
                          <div className="text-[9px] font-mono text-ink/40 uppercase">BP</div>
                          <div className="font-bold text-ink mt-0.5">
                            {latestVital.bloodPressure.split(" ")[0]}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-mono text-ink/40 uppercase">Pulse</div>
                          <div className="font-bold text-ink mt-0.5">
                            {latestVital.pulse.split(" ")[0]}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-mono text-ink/40 uppercase">Temp</div>
                          <div className="font-bold text-ink mt-0.5">
                            {latestVital.temperature.split(" ")[0]}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-mono text-ink/40 uppercase">SpO2</div>
                          <div className="font-bold text-calm mt-0.5">{latestVital.spO2}</div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-ink/50">
                        Next vitals due: 14:00
                      </span>
                      <Button
                        onClick={() => handleOpenVitalsModal(patient)}
                        size="sm"
                        className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs h-7 px-3"
                      >
                        <HeartPulse className="size-3.5 mr-1" /> Record Vitals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Record Vitals Dialog */}
        <Dialog open={vitalsModalOpen} onOpenChange={setVitalsModalOpen}>
          <DialogContent className="max-w-md border border-border bg-card shadow-2xl">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
                <HeartPulse className="size-5 text-brand" />
                Record Vitals — {selectedPatientForVitals?.name}
              </DialogTitle>
              <div className="text-xs font-mono text-ink/50 mt-1">
                {selectedPatientForVitals?.id} · {selectedPatientForVitals?.bedNumber || "Ward Bed"}
              </div>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink">Blood Pressure (mmHg)</Label>
                  <Input
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    className="text-xs bg-surf h-8 font-mono"
                    placeholder="120/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink">Pulse (bpm)</Label>
                  <Input
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="text-xs bg-surf h-8 font-mono"
                    placeholder="72 bpm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink">Temperature (°F)</Label>
                  <Input
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="text-xs bg-surf h-8 font-mono"
                    placeholder="98.6 °F"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink">Oxygen Saturation (SpO2)</Label>
                  <Input
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value)}
                    className="text-xs bg-surf h-8 font-mono"
                    placeholder="98%"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVitalsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveVitals}
                  className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs"
                >
                  <Save className="size-3.5 mr-1" /> Save Vitals to Chart
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
