import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Search,
  Eye,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIActionButton } from "@/components/care-sync/AIActionButton";
import { exportLabReportPdf } from "@/lib/pdfGenerator";
import { useCareSync } from "@/lib/store";
import { TestOrder } from "@/types/caresync";
import { toast } from "sonner";

export const Route = createFileRoute("/lab/dashboard")({
  head: () => ({
    meta: [{ title: "Diagnostics & Laboratory Dashboard | CareSync" }],
  }),
  component: LabDashboardPage,
});

function LabDashboardPage() {
  const { testOrders, updateTestOrderStatus } = useCareSync();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<TestOrder | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  // Form state for entering test results
  const [param1Val, setParam1Val] = useState("14.2");
  const [param2Val, setParam2Val] = useState("9,800");
  const [param3Val, setParam3Val] = useState("260,000");
  const [technicianNotes, setTechnicianNotes] = useState(
    "All cellular morphology normal. Verified on automated analyzer.",
  );

  const pendingCount = testOrders.filter((t) => t.status === "Pending").length;
  const inProgressCount = testOrders.filter((t) => t.status === "In Progress").length;
  const completedTodayCount = testOrders.filter((t) => t.status === "Completed").length;
  const urgentCount = testOrders.filter(
    (t) => t.priority === "Urgent" || t.priority === "Stat",
  ).length;

  const filteredOrders = testOrders.filter(
    (t) =>
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patientId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenResultEntry = (order: TestOrder) => {
    setSelectedOrder(order);
    if (order.results && order.results.length >= 3) {
      if (order.results[0]?.value) setParam1Val(order.results[0].value);
      if (order.results[1]?.value) setParam2Val(order.results[1].value);
      if (order.results[2]?.value) setParam3Val(order.results[2].value);
    }
    setResultModalOpen(true);
  };

  const handleSaveResults = () => {
    if (!selectedOrder) return;

    const sampleResults = [
      {
        parameter: "Hemoglobin (Hb)",
        value: param1Val,
        referenceRange: "13.0 - 17.0 g/dL",
        status: "Normal" as const,
      },
      {
        parameter: "Total Leukocyte Count",
        value: param2Val,
        referenceRange: "4,000 - 10,000 /uL",
        status: "Normal" as const,
      },
      {
        parameter: "Platelet Count",
        value: param3Val,
        referenceRange: "150,000 - 450,000 /uL",
        status: "Normal" as const,
      },
    ];

    updateTestOrderStatus(selectedOrder.id, "Completed", sampleResults, technicianNotes);
    setResultModalOpen(false);
    toast.success(
      `Results validated & published for ${selectedOrder.patientName} (${selectedOrder.testName})!`,
    );
  };

  const handleProgressStatus = (order: TestOrder) => {
    if (order.status === "Pending") {
      updateTestOrderStatus(order.id, "In Progress");
      toast.info(`Test ${order.testName} marked In Progress`);
    } else if (order.status === "In Progress") {
      handleOpenResultEntry(order);
    }
  };

  return (
    <AppShell activeRole="lab">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink/50">
              <span>Central Diagnostic Lab</span>
              <span>•</span>
              <span className="text-calm font-medium">Technologist: Neha Gupta</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
              Laboratory & Diagnostics Hub
            </h1>
            <p className="text-xs text-ink/60 mt-0.5">
              Receive digital test requisitions, record findings, and publish verified reports.
            </p>
          </div>
        </div>

        {/* 4 Diagnostic Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">Pending Tests</span>
                <div className="size-8 rounded-lg bg-warn/15 text-warn grid place-items-center">
                  <Clock className="size-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-warn">{pendingCount}</div>
              <div className="text-[10px] font-mono text-ink/45 mt-0.5">
                Sample collection pending
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">In Progress</span>
                <div className="size-8 rounded-lg bg-brand/10 text-brand grid place-items-center">
                  <FlaskConical className="size-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-brand">{inProgressCount}</div>
              <div className="text-[10px] font-mono text-ink/45 mt-0.5">On analyzer queue</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">Completed Today</span>
                <div className="size-8 rounded-lg bg-calm/15 text-calm grid place-items-center">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-calm">{completedTodayCount}</div>
              <div className="text-[10px] font-mono text-ink/45 mt-0.5">
                Synced to patient timeline
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink/60">Urgent / Stat</span>
                <div className="size-8 rounded-lg bg-crit/15 text-crit grid place-items-center">
                  <AlertTriangle className="size-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-crit">{urgentCount}</div>
              <div className="text-[10px] font-mono text-ink/45 mt-0.5">
                Priority routing active
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Requisitions Table Card */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-ink">
                Active Diagnostic Orders
              </CardTitle>
              <p className="text-xs text-ink/50">
                Digital orders routed from OPD consultation & surgery
              </p>
            </div>

            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search test, patient..."
                className="h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-surf focus:outline-none focus:border-brand/50 w-48 font-mono"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surf/70 text-[11px] font-mono uppercase tracking-wider text-ink/50 border-b border-border">
                <tr>
                  <th className="p-3.5 pl-4">Order ID & Test</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Doctor</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Ordered Time</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surf/40 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div className="font-semibold text-ink">{order.testName}</div>
                      <div className="font-mono text-[10px] text-brand">{order.id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-ink">{order.patientName}</div>
                      <div className="font-mono text-[10px] text-ink/40">{order.patientId}</div>
                    </td>
                    <td className="p-3.5 text-ink/70">{order.doctorName}</td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          order.priority === "Urgent" || order.priority === "Stat"
                            ? "bg-crit/15 text-crit border-crit/30"
                            : "bg-surf text-ink/60 border-border"
                        }`}
                      >
                        {order.priority}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        className={`text-[10px] font-mono ${
                          order.status === "Completed"
                            ? "bg-calm/15 text-calm border-calm/30"
                            : order.status === "In Progress"
                              ? "bg-brand/15 text-brand border-brand/30"
                              : "bg-warn/15 text-warn border-warn/30"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-ink/50">{order.orderedAt}</td>
                    <td className="p-3.5 pr-4 text-right">
                      {order.status === "Completed" ? (
                        <Button
                          onClick={() => handleOpenResultEntry(order)}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-border bg-surf"
                        >
                          <Eye className="size-3 mr-1" /> View Report
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleProgressStatus(order)}
                          size="sm"
                          className={`text-xs h-7 ${
                            order.status === "Pending"
                              ? "bg-brand hover:bg-brand/90 text-white"
                              : "bg-calm hover:bg-calm/90 text-white"
                          }`}
                        >
                          {order.status === "Pending" ? "Start Processing" : "Enter Results"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Enter Test Results Modal */}
        <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
          <DialogContent className="max-w-xl border border-border bg-card shadow-2xl">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
                <FlaskConical className="size-5 text-brand" />
                {selectedOrder?.testName} — Result Entry
              </DialogTitle>
              <div className="text-xs font-mono text-ink/50 mt-1">
                Patient: {selectedOrder?.patientName} ({selectedOrder?.patientId}) · Requisition:{" "}
                {selectedOrder?.id}
              </div>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="rounded-lg bg-surf p-3 border border-border/80 text-xs text-ink/70">
                Enter quantitative values from the clinical laboratory analyzer. Values will
                automatically update the patient's medical record.
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 items-center gap-2">
                  <Label className="col-span-5 text-xs font-medium text-ink">
                    Hemoglobin (Hb) (g/dL)
                  </Label>
                  <Input
                    value={param1Val}
                    onChange={(e) => setParam1Val(e.target.value)}
                    className="col-span-4 text-xs bg-surf h-8 font-mono"
                  />
                  <span className="col-span-3 text-[11px] text-ink/40 font-mono">13.0 - 17.0</span>
                </div>

                <div className="grid grid-cols-12 items-center gap-2">
                  <Label className="col-span-5 text-xs font-medium text-ink">
                    Total WBC Count (/uL)
                  </Label>
                  <Input
                    value={param2Val}
                    onChange={(e) => setParam2Val(e.target.value)}
                    className="col-span-4 text-xs bg-surf h-8 font-mono"
                  />
                  <span className="col-span-3 text-[11px] text-ink/40 font-mono">
                    4,000 - 10,000
                  </span>
                </div>

                <div className="grid grid-cols-12 items-center gap-2">
                  <Label className="col-span-5 text-xs font-medium text-ink">
                    Platelet Count (/uL)
                  </Label>
                  <Input
                    value={param3Val}
                    onChange={(e) => setParam3Val(e.target.value)}
                    className="col-span-4 text-xs bg-surf h-8 font-mono"
                  />
                  <span className="col-span-3 text-[11px] text-ink/40 font-mono">150k - 450k</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-ink">
                    Technician Remarks & Microscopy
                  </Label>
                  <Textarea
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    rows={2}
                    className="text-xs bg-surf border-border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedOrder) {
                        exportLabReportPdf({
                          id: selectedOrder.id,
                          testName: selectedOrder.testName,
                          patientId: selectedOrder.patientId,
                          patientName: selectedOrder.patientName,
                          doctorName: selectedOrder.doctorName,
                          orderedAt: selectedOrder.orderedAt,
                          priority: selectedOrder.priority,
                          labNotes: technicianNotes,
                          results: [
                            { parameter: "Hemoglobin (Hb)", value: `${param1Val} g/dL`, referenceRange: "13.0 - 17.0", status: "Normal" },
                            { parameter: "Total Leucocyte Count (TLC)", value: `${param2Val} /cumm`, referenceRange: "4,000 - 11,000", status: "Normal" },
                            { parameter: "Platelet Count", value: `${param3Val} /cumm`, referenceRange: "150,000 - 450,000", status: "Normal" },
                          ],
                        });
                        toast.success(`Lab Report #${selectedOrder.id} downloaded as PDF`);
                      }
                    }}
                    className="text-xs h-8 border-border bg-surf text-ink hover:bg-card"
                  >
                    <UploadCloud className="size-3.5 mr-1 text-brand" /> Download Report PDF
                  </Button>

                  {selectedOrder && (
                    <AIActionButton
                      label="AI Summary"
                      featureName={`Diagnostic Summary — ${selectedOrder.testName}`}
                      actionType="summarize_report"
                      role="lab"
                      patientId={selectedOrder.patientId}
                      getContextData={() => ({
                        report: {
                          ...selectedOrder,
                          labNotes: technicianNotes,
                          results: [
                            { parameter: "Hemoglobin (Hb)", value: `${param1Val} g/dL`, referenceRange: "13.0 - 17.0", status: "Normal" },
                            { parameter: "Total Leucocyte Count (TLC)", value: `${param2Val} /cumm`, referenceRange: "4,000 - 11,000", status: "Normal" },
                            { parameter: "Platelet Count", value: `${param3Val} /cumm`, referenceRange: "150,000 - 450,000", status: "Normal" },
                          ],
                        },
                      })}
                      className="text-xs h-8"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResultModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveResults}
                    className="bg-calm hover:bg-calm/90 text-white text-xs"
                  >
                    <Check className="size-3.5 mr-1" /> Validate & Sign Off Report
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
