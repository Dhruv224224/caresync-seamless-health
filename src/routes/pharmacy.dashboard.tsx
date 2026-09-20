import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  Search,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIActionButton } from "@/components/care-sync/AIActionButton";
import { exportPrescriptionPdf } from "@/lib/pdfGenerator";
import { useCareSync } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/pharmacy/dashboard")({
  head: () => ({
    meta: [{ title: "Pharmacy & Dispensary Dashboard | CareSync" }],
  }),
  component: PharmacyDashboardPage,
});

function PharmacyDashboardPage() {
  const { prescriptions, medicines, dispensePrescription } = useCareSync();
  const [searchQuery, setSearchQuery] = useState("");

  const pendingPrescriptions = prescriptions.filter((p) => p.status === "Pending");
  const dispensedCount = prescriptions.filter((p) => p.status === "Dispensed").length;
  const lowStockCount = medicines.filter(
    (m) => m.status === "Low Stock" || m.stock < m.reorder_level,
  ).length;

  const handleDispense = (prescriptionId: string, patientName: string) => {
    dispensePrescription(prescriptionId);
    toast.success(`Medications dispensed for ${patientName}! Patient timeline updated.`);
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppShell activeRole="pharmacy">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              <span>Central Hospital Dispensary</span>
              <span>•</span>
              <span className="text-teal-primary font-medium">Pharmacist: Amit Singh</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-0.5">
              Pharmacy & Medication Fulfillment
            </h1>
            <p className="text-xs text-slate-500">
              Dispense digital prescriptions from OPD consultations, verify inventory, and notify
              care teams.
            </p>
          </div>
        </div>

        {/* 4 Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border bg-card shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase font-mono">
                  Pending Orders
                </div>
                <div className="text-2xl font-bold text-amber-muted mt-0.5">
                  {pendingPrescriptions.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Awaiting fulfillment</div>
              </div>
              <div className="size-9 rounded-md bg-amber-soft text-amber-muted dark:bg-amber-muted/20 dark:text-warn grid place-items-center">
                <Clock className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase font-mono">
                  Orders Today
                </div>
                <div className="text-2xl font-bold text-navy-800 dark:text-primary mt-0.5">
                  {prescriptions.length + 6}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">From 3 consulting doctors</div>
              </div>
              <div className="size-9 rounded-md bg-blue-soft text-navy-800 dark:bg-navy-800 dark:text-blue-accent grid place-items-center">
                <Pill className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase font-mono">
                  Dispensed
                </div>
                <div className="text-2xl font-bold text-teal-dark dark:text-calm mt-0.5">{dispensedCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Synced with timeline</div>
              </div>
              <div className="size-9 rounded-md bg-teal-light text-teal-dark dark:bg-teal-primary/20 dark:text-calm grid place-items-center">
                <CheckCircle2 className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase font-mono">
                  Low Stock Items
                </div>
                <div className="text-2xl font-bold text-danger-muted mt-0.5">{lowStockCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Reorder threshold hit</div>
              </div>
              <div className="size-9 rounded-md bg-danger-soft text-danger-muted dark:bg-danger-soft/20 dark:text-destructive grid place-items-center">
                <AlertTriangle className="size-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Pending Prescription Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
                  Prescription Worklist Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Orders routed directly from doctor consultations
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono text-slate-700 dark:text-slate-300">
                {pendingPrescriptions.length} Pending
              </Badge>
            </div>

            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <Card
                  key={rx.id}
                  className={`border-border bg-card shadow-2xs ${
                    rx.status === "Pending"
                      ? "border-l-4 border-l-amber-muted"
                      : "border-l-4 border-l-teal-primary"
                  }`}
                >
                  <CardHeader className="p-3.5 pb-2 border-b border-border flex flex-row items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink">{rx.patientName}</span>
                        <span className="font-mono text-xs text-navy-800 dark:text-primary font-medium">
                          {rx.patientId}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Prescribed by {rx.doctorName} · {rx.createdAt}
                      </div>
                    </div>
                    <Badge
                      variant={rx.status === "Dispensed" ? "completed" : "pending"}
                      className="text-[10px] font-mono"
                    >
                      {rx.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-3.5 space-y-2.5">
                    <div className="space-y-1.5">
                      {rx.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded bg-secondary border border-border text-xs"
                        >
                          <div>
                            <div className="font-semibold text-ink">{item.medicine}</div>
                            <div className="text-slate-500 text-[10px]">{item.instructions}</div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-navy-800 dark:text-primary font-medium text-[11px]">
                              {item.frequency}
                            </div>
                            <div className="text-slate-400 text-[10px]">{item.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-500 font-mono">
                        Requisition #{rx.id} · Barcode Verified
                      </div>

                      <div className="flex items-center gap-2">
                        <AIActionButton
                          label="Explain Rx"
                          featureName={`Dosage & Administration (#${rx.id})`}
                          actionType="explain_prescription"
                          role="pharmacy"
                          patientId={rx.patientId}
                          getContextData={() => ({ prescription: rx })}
                          className="text-[10px] h-7 px-2"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            exportPrescriptionPdf({
                              id: rx.id,
                              patientId: rx.patientId,
                              patientName: rx.patientName,
                              doctorName: rx.doctorName,
                              createdAt: rx.createdAt,
                              notes: rx.notes,
                              items: rx.items,
                            });
                            toast.success(`Prescription #${rx.id} downloaded as PDF`);
                          }}
                          className="text-[10px] h-7 px-2 border-border bg-card text-slate-700 hover:text-ink hover:bg-secondary dark:text-slate-300"
                        >
                          PDF
                        </Button>

                        {rx.status === "Pending" ? (
                          <Button
                            onClick={() => handleDispense(rx.id, rx.patientName)}
                            size="sm"
                            className="bg-navy-900 hover:bg-navy-800 dark:bg-primary dark:text-white text-white text-xs h-7 px-3 shadow-xs cursor-pointer"
                          >
                            <PackageCheck className="size-3.5 mr-1.5" /> Dispense Medicines
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-teal-primary font-semibold font-mono">
                            <CheckCircle2 className="size-3.5" /> Dispensed at{" "}
                            {rx.dispensedAt || "Recent"}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Medicine Inventory Table (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="p-3.5 pb-2 border-b border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                    Dispensary Stock & Inventory
                  </CardTitle>
                  <span className="text-[11px] font-mono text-slate-500">{medicines.length} SKUs</span>
                </div>
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicines..."
                    className="h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-secondary focus:outline-none focus:border-navy-600 w-full font-mono text-ink"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto max-h-[520px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-border">
                    <tr>
                      <th className="p-2.5 pl-3.5">Medicine</th>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5 pr-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMedicines.map((med) => (
                      <tr key={med.id} className="hover:bg-secondary/60 transition-colors">
                        <td className="p-2.5 pl-3.5">
                          <div className="font-semibold text-ink">{med.name}</div>
                          <div className="text-[10px] text-slate-500">{med.category}</div>
                        </td>
                        <td className="p-2.5 font-mono">
                          <span
                            className={
                              med.stock < med.reorder_level ? "text-danger-muted font-bold" : "text-ink"
                            }
                          >
                            {med.stock}
                          </span>{" "}
                          <span className="text-[10px] text-slate-400">{med.unit}</span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">₹{med.price}</td>
                        <td className="p-2.5 pr-3.5 text-right">
                          <Badge
                            variant={med.status === "Low Stock" ? "urgent" : "completed"}
                            className="text-[9px] font-mono"
                          >
                            {med.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
