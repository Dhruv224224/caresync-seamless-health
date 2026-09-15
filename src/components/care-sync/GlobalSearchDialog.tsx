import React, { useState } from "react";
import { Search, UserRound, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCareSync } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const { patients } = useCareSync();
  const navigate = useNavigate();

  const filteredPatients =
    query.trim() === ""
      ? patients.slice(0, 4)
      : patients.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.id.toLowerCase().includes(query.toLowerCase()) ||
            p.phone.includes(query) ||
            p.currentDepartment.toLowerCase().includes(query.toLowerCase()),
        );

  const handleSelectPatient = (patientId: string) => {
    onOpenChange(false);
    navigate({ to: "/doctor/patient/$id", params: { id: patientId } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 border border-border bg-card shadow-2xl">
        <DialogHeader className="p-4 border-b border-border bg-surf/50">
          <div className="flex items-center gap-3">
            <Search className="size-5 text-brand" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients by Name (e.g. Rajesh), ID (e.g. CS-001), or Phone..."
              className="border-0 bg-transparent text-base focus-visible:ring-0 shadow-none px-0"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-ink/40 hover:text-ink">
                <X className="size-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink/40 px-2">
            {query.trim() === ""
              ? "Recent Patients"
              : `Search Results (${filteredPatients.length})`}
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-ink/50 text-sm">
              No patients found matching "{query}"
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handleSelectPatient(patient.id)}
                className="group flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-brand/40 bg-card hover:bg-brand/5 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-brand/10 text-brand font-medium group-hover:scale-105 transition-transform">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ink">{patient.name}</span>
                      <span className="font-mono text-xs text-brand font-medium">{patient.id}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {patient.gender}, {patient.age}y
                      </Badge>
                    </div>
                    <div className="text-xs text-ink/60 mt-0.5 flex items-center gap-3">
                      <span>Dept: {patient.currentDepartment}</span>
                      <span>•</span>
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                  <ArrowRight className="size-4 text-ink/30 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-border bg-surf/30 flex items-center justify-between text-[11px] text-ink/50 font-mono">
          <span>Tip: Click any patient to view their complete digital chart & timeline</span>
          <span>CareSync Global Directory</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
