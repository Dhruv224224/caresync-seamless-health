import { ArrowRight, Check, CircleDashed } from "lucide-react";

const steps = [
  ["Registration", "Front desk · 08:12", "complete"],
  ["Consultation", "Dr. Okafor · 08:40", "complete"],
  ["Diagnostics", "Lab · in progress", "active"],
  ["Pharmacy", "Awaiting script", "pending"],
  ["Nursing", "Unassigned", "pending"],
  ["Recovery", "Not started", "pending"],
] as const;

export function WorkflowSteps({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "grid grid-cols-2 gap-3 sm:grid-cols-3"
      }
    >
      {steps.map(([name, detail, status], index) => (
        <div
          key={name}
          className={`relative rounded-xl p-4 ring-1 backdrop-blur transition-transform hover:-translate-y-0.5 ${
            status === "active"
              ? "bg-card/90 ring-brand/20 ring-2"
              : status === "complete"
                ? "bg-card/80 ring-border"
                : "bg-card/60 ring-border/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`grid size-5 place-items-center rounded-full font-mono text-[10px] font-medium ${
                status === "active"
                  ? "bg-brand text-primary-foreground"
                  : status === "complete"
                    ? "bg-tealsoft text-calm"
                    : "bg-surf text-ink/50"
              }`}
            >
              {status === "complete" ? (
                <Check className="size-3" />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </span>
            {status === "active" ? (
              <CircleDashed className="size-3 animate-spin text-calm" />
            ) : (
              <span
                className={`size-1.5 rounded-full ${status === "complete" ? "bg-calm" : "bg-ink/20"}`}
              />
            )}
          </div>
          <div
            className={`mt-3 text-sm font-semibold ${status === "active" ? "text-brand" : status === "pending" ? "text-ink/70" : "text-ink"}`}
          >
            {name}
          </div>
          <div
            className={`mt-1 font-mono text-[11px] ${status === "active" ? "text-brand/70" : "text-ink/50"}`}
          >
            {detail}
          </div>
        </div>
      ))}
    </div>
  );
}

export function JourneyStrip() {
  const journey = [
    "Patient",
    "Reception",
    "Doctor",
    "Diagnostics",
    "Pharmacy",
    "Nursing",
    "Surgery",
    "Recovery",
    "Patient Record",
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card/60 p-4 ring-1 ring-border backdrop-blur">
      {journey.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={`rounded-lg px-3 py-2 text-sm font-medium ring-1 ${index === 3 ? "bg-brand text-primary-foreground ring-brand/30" : index === journey.length - 1 ? "bg-tealsoft text-calm ring-calm/20" : "bg-card text-ink ring-border"}`}
          >
            {step}
          </span>
          {index < journey.length - 1 ? <ArrowRight className="size-3.5 text-calm/70" /> : null}
        </div>
      ))}
    </div>
  );
}
