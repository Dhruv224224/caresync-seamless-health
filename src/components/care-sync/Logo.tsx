import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="CareSync home">
      <span className="relative grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-primary-foreground shadow-sm shadow-brand/20 transition-transform group-hover:-translate-y-px">
        <Activity className="size-4" strokeWidth={2.4} />
        <span className="absolute bottom-1.5 right-1.5 size-1.5 rounded-full bg-calm" />
      </span>
      <span className={compact ? "hidden sm:block" : "block"}>
        <span className="block text-[15px] font-semibold leading-none tracking-tight text-ink">
          CareSync
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
          Patient workflow
        </span>
      </span>
    </Link>
  );
}
