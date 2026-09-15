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
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink/50">
              <span>Central Hospital Dispensary</span>
              <span>•</span>
              <span className="text-calm font-medium">Pharmacist: Amit Singh</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-0.5">
              Pharmacy & Medication Fulfillment
            </h1>
            <p className="text-xs text-ink/60">
              Dispense digital prescriptions from OPD consultations, verify inventory, and notify care teams.
            </p>
          </div>
        </div>

        {/* 4 Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Pending Orders
                </div>
                <div className="text-2xl font-bold text-warn mt-0.5">{pendingPrescriptions.length}</div>
                <div className="text-[10px] text-ink/45 mt-0.5">Awaiting fulfillment</div>
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
                  Orders Today
                </div>
                <div className="text-2xl font-bold text-brand mt-0.5">{prescriptions.length + 6}</div>
                <div className="text-[10px] text-ink/45 mt-0.5">From 3 consulting doctors</div>
              </div>
              <div className="size-9 rounded-md bg-brand/10 text-brand grid place-items-center">
                <Pill className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Dispensed
                </div>
                <div className="text-2xl font-bold text-calm mt-0.5">{dispensedCount}</div>
                <div className="text-[10px] text-ink/45 mt-0.5">Synced with timeline</div>
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
                  Low Stock Items
                </div>
                <div className="text-2xl font-bold text-crit mt-0.5">{lowStockCount}</div>
                <div className="text-[10px] text-ink/45 mt-0.5">Reorder threshold hit</div>
              </div>
              <div className="size-9 rounded-md bg-crit/15 text-crit grid place-items-center">
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
                <p className="text-xs text-ink/55">Orders routed directly from doctor consultations</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {pendingPrescriptions.length} Pending
              </Badge>
            </div>

            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <Card
                  key={rx.id}
                  className={`border-border bg-card shadow-2xs ${
                    rx.status === "Pending"
                      ? "border-l-4 border-l-warn"
                      : "border-l-4 border-l-calm"
                  }`}
                >
                  <CardHeader className="p-3.5 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink">{rx.patientName}</span>
                        <span className="font-mono text-xs text-brand font-medium">
                          {rx.patientId}
                        </span>
                      </div>
                      <div className="text-[10px] text-ink/50 font-mono mt-0.5">
                        Prescribed by {rx.doctorName} · {rx.createdAt}
                      </div>
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

                  <CardContent className="p-3.5 space-y-2.5">
                    <div className="space-y-1.5">
                      {rx.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded bg-surf border border-border/70 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-ink">{item.medicine}</div>
                            <div className="text-ink/60 text-[10px]">{item.instructions}</div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-brand font-medium text-[11px]">{item.frequency}</div>
                            <div className="text-ink/50 text-[10px]">{item.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-[10px] text-ink/50 font-mono">
                        Requisition #{rx.id} · Barcode Verified
                      </div>

                      {rx.status === "Pending" ? (
                        <Button
                          onClick={() => handleDispense(rx.id, rx.patientName)}
                          size="sm"
                          className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs h-7 px-3 shadow-xs"
                        >
                          <PackageCheck className="size-3.5 mr-1.5" /> Dispense Medicines
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-calm font-semibold font-mono">
                          <CheckCircle2 className="size-3.5" /> Dispensed at {rx.dispensedAt || "Recent"}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Medicine Inventory Table (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <Card className="border-border bg-card shadow-2xs">
              <CardHeader className="p-3.5 pb-2 border-b border-border/60 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                    Dispensary Stock & Inventory
                  </CardTitle>
                  <span className="text-[11px] font-mono text-ink/50">{medicines.length} SKUs</span>
                </div>
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicines..."
                    className="h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-surf focus:outline-none focus:border-brand w-full font-mono"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto max-h-[520px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surf/80 text-[10px] font-mono uppercase tracking-wider text-ink/50 border-b border-border">
                    <tr>
                      <th className="p-2.5 pl-3.5">Medicine</th>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5 pr-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredMedicines.map((med) => (
                      <tr key={med.id} className="hover:bg-surf/40 transition-colors">
                        <td className="p-2.5 pl-3.5">
                          <div className="font-semibold text-ink">{med.name}</div>
                          <div className="text-[10px] text-ink/50">{med.category}</div>
                        </td>
                        <td className="p-2.5 font-mono">
                          <span
                            className={
                              med.stock < med.reorder_level ? "text-crit font-bold" : "text-ink"
                            }
                          >
                            {med.stock}
                          </span>{" "}
                          <span className="text-[10px] text-ink/40">{med.unit}</span>
                        </td>
                        <td className="p-2.5 font-mono text-ink/70">₹{med.price}</td>
                        <td className="p-2.5 pr-3.5 text-right">
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-mono ${
                              med.status === "Low Stock"
                                ? "bg-crit/15 text-crit border-crit/30"
                                : "bg-calm/15 text-calm border-calm/30"
                            }`}
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
