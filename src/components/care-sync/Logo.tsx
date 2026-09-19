import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function Logo({ compact = false, onDark = false }: { compact?: boolean; onDark?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="CareSync home">
      <span
        className={`relative grid size-9 shrink-0 place-items-center rounded-lg shadow-sm transition-transform group-hover:-translate-y-px ${
          onDark
            ? "bg-white/15 text-white ring-1 ring-white/25 shadow-black/10"
            : "bg-brand text-primary-foreground shadow-brand/20"
        }`}
      >
        <Activity className="size-4" strokeWidth={2.4} />
        <span
          className={`absolute bottom-1.5 right-1.5 size-1.5 rounded-full ${
            onDark ? "bg-emerald-300" : "bg-calm"
          }`}
        />
      </span>
      <span className={compact ? "hidden sm:block" : "block"}>
        <span
          className={`block text-[15px] font-semibold leading-none tracking-tight ${
            onDark ? "text-white" : "text-ink"
          }`}
        >
          CareSync
        </span>
        <span
          className={`mt-1 block font-mono text-[10px] font-medium uppercase tracking-[0.14em] ${
            onDark ? "text-blue-100/80" : "text-ink/60"
          }`}
        >
          Patient workflow
        </span>
      </span>
    </Link>
  );
}
