import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function Logo({ compact = false, onDark = false }: { compact?: boolean; onDark?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="CareSync home">
      <span
        className={`relative grid size-9 shrink-0 place-items-center rounded-lg shadow-2xs transition-transform group-hover:-translate-y-px ${
          onDark
            ? "bg-white/10 text-white ring-1 ring-white/20 shadow-black/10"
            : "bg-navy-900 dark:bg-navy-800 text-white shadow-navy-900/20"
        }`}
      >
        <Activity className="size-4 text-white" strokeWidth={2.4} />
        <span
          className={`absolute bottom-1.5 right-1.5 size-1.5 rounded-full ${
            onDark ? "bg-teal-primary" : "bg-teal-primary"
          }`}
        />
      </span>
      <span className={compact ? "hidden sm:block" : "block"}>
        <span
          className={`block text-[15px] font-bold leading-none tracking-tight ${
            onDark ? "text-white" : "text-slate-900 dark:text-white"
          }`}
        >
          CareSync
        </span>
        <span
          className={`mt-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] ${
            onDark ? "text-slate-300/80" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          Connected Healthcare
        </span>
      </span>
    </Link>
  );
}
