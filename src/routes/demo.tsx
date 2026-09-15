import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, Bell, CalendarDays, ChevronRight, ClipboardList, FlaskConical, HeartPulse, LayoutDashboard, Menu, Pill, Search, Settings, ShieldAlert, Stethoscope, UserRound, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/care-sync/Logo";
import { SectionLabel } from "@/components/care-sync/SectionLabel";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "CareSync Demo Workspace" },
      { name: "description", content: "Explore a fictional CareSync command center for connected hospital workflows." },
      { property: "og:title", content: "CareSync Demo Workspace" },
      { property: "og:description", content: "A fictional command center for connected hospital workflows." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoWorkspace,
});

const navItems = [
  [LayoutDashboard, "Overview", ""],
  [Users, "Patients", "12"],
  [CalendarDays, "Appointments", "08"],
  [FlaskConical, "Diagnostics", "02"],
  [Pill, "Pharmacy", "05"],
  [HeartPulse, "Nursing", ""],
  [ClipboardList, "Surgery", ""],
] as const;

const patientRows = [
  { name: "R. Alvarez", id: "Case 0417", status: "In sync", tone: "calm", path: ["Reg", "Doctor", "Diagnostics", "Pharmacy"] },
  { name: "M. Chen", id: "Case 0418", status: "Awaiting lab", tone: "warn", path: ["Reg", "Doctor", "Diagnostics", "Pharmacy"] },
  { name: "T. Nwosu", id: "Case 0419", status: "Critical", tone: "crit", path: ["Admitted", "Surgery", "Recovery"] },
] as const;

function DemoWorkspace() {
  const [selected, setSelected] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredPatients = useMemo(() => patientRows.filter((patient) => `${patient.name} ${patient.id}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="min-h-screen bg-surf text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="text-ink lg:hidden" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}>{sidebarOpen ? <X /> : <Menu />}</Button><Logo /></div>
          <div className="flex items-center gap-2"><Button variant="ghost" size="icon" className="text-ink/70" aria-label="Notifications"><Bell /></Button><div className="hidden items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm text-ink/50 ring-1 ring-border sm:flex"><Search className="size-4" /><span className="font-mono text-[11px]">Demo workspace</span></div><Button variant="ghost" size="icon" className="text-ink/70" aria-label="Settings"><Settings /></Button></div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className={`${sidebarOpen ? "absolute inset-x-0 top-16 z-40 block" : "hidden"} min-h-[calc(100vh-4rem)] border-r border-border bg-card/95 p-5 backdrop-blur-xl lg:relative lg:block lg:w-60 lg:shrink-0 lg:bg-card/70`}>
          <div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-lg bg-brand text-primary-foreground"><span className="size-2 rounded-full bg-calm" /></div><span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">Command center</span></div>
          <nav className="mt-6 space-y-1 text-sm">{navItems.map(([Icon, label, count]) => <Button key={label} variant="ghost" onClick={() => { setSelected(label); setSidebarOpen(false); }} className={`h-auto w-full justify-between rounded-lg px-3 py-2 font-normal ${selected === label ? "bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand" : "text-ink/70 hover:bg-surf hover:text-ink"}`}><span className="flex items-center gap-2"><Icon className="size-4" />{label}</span>{count ? <span className={`rounded-full px-2 font-mono text-[10px] ${label === "Diagnostics" ? "bg-warn/20 text-warn" : "bg-surf text-ink/50"}`}>{count}</span> : selected === label ? <span className="font-mono text-[10px] text-brand/60">·</span> : null}</Button>)}</nav>
          <div className="mt-6 rounded-xl bg-card/70 p-3 ring-1 ring-border"><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-full bg-calm/20 text-calm"><Stethoscope className="size-4" /></div><div className="leading-none"><div className="text-xs font-semibold text-ink">Dr. Okafor</div><div className="mt-1 font-mono text-[10px] text-ink/45">Doctor · Ward A</div></div></div></div>
        </aside>

        <main className="min-w-0 flex-1 p-5 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><SectionLabel>Demo workspace · fictional data</SectionLabel><div className="mt-1 text-xl font-semibold text-ink">{selected === "Overview" ? "Good morning, Dr. Okafor" : selected}</div></div><div className="flex w-full items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm text-ink/50 ring-1 ring-border sm:w-auto"><Search className="size-4 shrink-0" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent font-mono text-[11px] outline-none placeholder:text-ink/40 sm:w-48" placeholder="Search patients…" /></div></div>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["In sync", "07", "calm", "active threads"], ["Awaiting lab", "02", "warn", "results pending"], ["Prescriptions", "05", "brand", "to dispense"], ["Critical", "01", "crit", "needs attention"]].map(([label, value, tone, helper]) => <div key={label} className="rounded-xl bg-card/70 p-4 ring-1 ring-border backdrop-blur"><div className="font-mono text-[10px] uppercase tracking-wider text-ink/45">{label}</div><div className={`mt-1 text-2xl font-semibold ${tone === "calm" ? "text-calm" : tone === "warn" ? "text-warn" : tone === "crit" ? "text-crit" : "text-brand"}`}>{value}</div><div className="mt-1 font-mono text-[10px] text-ink/40">{helper}</div></div>)}</div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3"><div className="space-y-3 lg:col-span-2"><div className="flex items-center justify-between"><div className="text-sm font-semibold text-ink">Patient workflow</div><span className="font-mono text-[10px] uppercase tracking-wider text-ink/40">{filteredPatients.length} active threads</span></div>{filteredPatients.map((patient) => <PatientRow key={patient.id} {...patient} />)}{filteredPatients.length === 0 ? <div className="rounded-xl bg-card/70 p-8 text-center text-sm text-ink/55 ring-1 ring-border">No fictional patient matches that search.</div> : null}</div><Timeline /></div>

          <div className="mt-4 rounded-xl bg-brand p-5 text-primary-foreground shadow-sm shadow-brand/15"><div className="flex items-start justify-between gap-4"><div><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">CareSync prototype</div><div className="mt-2 text-lg font-semibold">A calmer handoff for every department.</div><p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/70">This workspace uses fictional demo data and is designed to show the product structure—not to make clinical decisions.</p></div><ShieldAlert className="size-5 shrink-0 text-calm" /></div></div>
        </main>
      </div>
    </div>
  );
}

function PatientRow({ name, id, status, tone, path }: (typeof patientRows)[number]) {
  return <div className={`rounded-xl bg-card/70 p-4 ring-1 backdrop-blur transition-transform hover:-translate-y-0.5 ${tone === "crit" ? "ring-crit/25" : "ring-border"}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-surf text-ink/60"><UserRound className="size-4" /></div><div className="text-sm font-semibold text-ink">{name} <span className="font-mono text-[11px] font-normal text-ink/40">{id}</span></div></div><span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${tone === "calm" ? "bg-tealsoft text-calm" : tone === "warn" ? "bg-warn/20 text-warn" : "bg-crit/15 text-crit"}`}>{status}</span></div><div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-ink/50">{path.map((step, index) => <span key={step} className="flex items-center gap-1.5"><span className={index === path.length - 2 ? tone === "crit" ? "text-crit" : tone === "warn" ? "text-warn" : "text-brand" : index < path.length - 2 ? "text-calm" : "text-ink/50"}>{step}</span>{index < path.length - 1 ? <ChevronRight className="size-3 text-ink/25" /> : null}</span>)}</div></div>;
}

function Timeline() {
  return <div className="rounded-xl bg-card/70 p-5 ring-1 ring-border backdrop-blur"><div className="flex items-center justify-between"><div className="text-sm font-semibold text-ink">Patient timeline</div><span className="font-mono text-[10px] text-ink/40">Case 0417</span></div><ol className="mt-5 space-y-5">{[["Registered at front desk", "08:12 · Reception", "calm"], ["Consultation completed", "08:40 · Dr. Okafor", "calm"], ["Blood panel sent to lab", "09:05 · In progress", "brand"], ["Prescription to pharmacy", "Pending", "pending"]].map(([title, detail, tone]) => <li key={title} className="flex gap-3"><span className={`mt-1 size-2 shrink-0 rounded-full ${tone === "calm" ? "bg-calm" : tone === "brand" ? "bg-brand ring-4 ring-brand/15" : "bg-ink/20"}`} /><div><div className={`text-xs font-medium ${tone === "brand" ? "text-brand" : tone === "pending" ? "text-ink/50" : "text-ink"}`}>{title}</div><div className="mt-1 font-mono text-[10px] text-ink/45">{detail}</div></div></li>)}</ol></div>;
}