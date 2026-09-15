import { Link, createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowRight, ClipboardList, FlaskConical, HeartPulse, Hospital, Pill, ShieldCheck, Stethoscope, Users, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JourneyStrip, WorkflowSteps } from "@/components/care-sync/WorkflowSteps";
import { Logo } from "@/components/care-sync/Logo";
import { SectionLabel } from "@/components/care-sync/SectionLabel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareSync — One Patient. Every Department. In Sync." },
      { name: "description", content: "CareSync connects registration, consultations, diagnostics, pharmacy, nursing, surgery, and recovery into one seamless digital workflow." },
      { property: "og:title", content: "CareSync — One Patient. Every Department. In Sync." },
      { property: "og:description", content: "A connected digital patient journey for modern hospitals and care facilities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const problems = [
  ["P1", "Paper-based records", "Patient information is repeatedly written, transferred, and stored by hand."],
  ["P2", "Disconnected departments", "Doctors, nurses, labs, and pharmacies each run separate processes."],
  ["P3", "Delayed information", "Physical slips and paperwork slow communication between teams."],
  ["P4", "Fragmented history", "Important records become hard to organize and retrieve later."],
] as const;

const features = [
  [ClipboardList, "Digital registration", "Create a digital patient record instead of repeatedly filling paper forms."],
  [Stethoscope, "Doctor workspace", "View queue, history, consultations, prescriptions, and test orders."],
  [Pill, "Digital prescriptions", "Record prescriptions digitally and share them with authorized pharmacy staff."],
  [FlaskConical, "Connected diagnostics", "Send test orders digitally straight to the laboratory."],
  [Hospital, "Pharmacy workflow", "View pending prescriptions and update dispensing status in real time."],
  [Activity, "Patient timeline", "Keep a chronological digital record of important patient events."],
] as const;

const roles = [
  [Users, "Patient", "View appointments, prescriptions, reports, bills, and personal timeline."],
  [ClipboardList, "Receptionist", "Register patients, manage appointments, and admissions."],
  [Stethoscope, "Doctor", "Manage consultation, prescriptions, diagnostics, and history."],
  [HeartPulse, "Nurse", "Manage assigned patients, care tasks, and vitals."],
  [FlaskConical, "Laboratory", "Manage diagnostic orders and upload test results."],
  [Pill, "Pharmacy", "Manage prescriptions, dispensing, and inventory."],
] as const;

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-ink/70 md:flex">
            <a href="#solution" className="transition-colors hover:text-ink">The Journey</a>
            <a href="#features" className="transition-colors hover:text-ink">Features</a>
            <a href="#roles" className="transition-colors hover:text-ink">Roles</a>
            <a href="#how" className="transition-colors hover:text-ink">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#how" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:text-ink sm:block">See How It Works</a>
            <Button asChild className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-brand/20 hover:bg-brand/90">
              <Link to="/demo">Explore Demo <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-surf">
          <div className="pointer-events-none absolute -left-24 top-10 size-[26rem] rounded-full bg-calm/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-24 size-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-28">
            <div className="sync-rise lg:col-span-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-brand/80 ring-1 ring-border backdrop-blur">
                <span className="size-1.5 rounded-full bg-calm" /> Workflow automation
              </span>
              <h1 className="mt-6 max-w-[19ch] text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">One Patient. Every Department. In&nbsp;Sync.</h1>
              <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink/70 sm:text-lg">CareSync connects patient registration, consultations, diagnostics, pharmacy, nursing, surgery, and recovery into one continuous digital workflow — no more chasing paper slips between departments.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild className="rounded-lg bg-brand px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-brand/25 hover:bg-brand/90">
                  <Link to="/demo">Explore Demo <ArrowRight className="size-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="rounded-lg border-border bg-card/70 px-5 py-3 text-sm font-medium text-ink backdrop-blur hover:bg-card">
                  <a href="#how">See How It Works</a>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/45"><span className="size-1.5 rounded-full bg-calm" /> Live status <span className="text-ink/30">/</span> 09:41</div>
            </div>

            <div className="sync-rise lg:col-span-7">
              <div className="relative rounded-2xl bg-card/65 p-6 ring-1 ring-border backdrop-blur-xl sm:p-8">
                <div className="flex items-center justify-between">
                  <div><div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45">Patient journey</div><div className="mt-1 text-sm font-semibold text-ink">Case 0417 · R. Alvarez</div></div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-tealsoft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-calm"><span className="size-1.5 rounded-full bg-calm" /> In sync</span>
                </div>
                <div className="relative mt-6"><div className="pointer-events-none absolute inset-x-6 top-1/2 hidden h-px -translate-y-1/2 bg-calm/30 sm:block" /><WorkflowSteps /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="max-w-[34ch]"><SectionLabel>The problem</SectionLabel><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink">Healthcare workflows shouldn't depend on paperwork.</h2></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{problems.map(([code, title, copy]) => <div key={code} className="rounded-xl bg-card p-5 ring-1 ring-border transition-transform hover:-translate-y-0.5"><div className="grid size-9 place-items-center rounded-lg bg-surf font-mono text-xs font-medium text-ink/60">{code}</div><div className="mt-4 text-sm font-semibold text-ink">{title}</div><p className="mt-2 text-sm leading-relaxed text-ink/60">{copy}</p></div>)}</div></div></section>

        <section id="solution" className="bg-surf"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="max-w-[36ch]"><SectionLabel>The solution</SectionLabel><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink">A connected digital patient journey</h2></div><div className="mt-10"><JourneyStrip /></div></div></section>

        <section id="features" className="bg-card"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="max-w-[36ch]"><SectionLabel>Key features</SectionLabel><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink">Everything a facility needs, in one thread</h2></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon, title, copy]) => <div key={title} className="rounded-xl bg-card p-5 ring-1 ring-border transition-transform hover:-translate-y-0.5"><div className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand"><Icon className="size-4" /></div><div className="mt-4 text-sm font-semibold text-ink">{title}</div><p className="mt-2 text-sm leading-relaxed text-ink/60">{copy}</p></div>)}</div></div></section>

        <section id="how" className="bg-surf"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="max-w-[36ch]"><SectionLabel>How it works</SectionLabel><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink">Five steps from front desk to full record</h2></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["01","Register","Patient or family enters required information once."],["02","Connect","Relevant departments receive the information they need."],["03","Treat","Doctor records consultation, prescription, and test orders."],["04","Coordinate","Lab, pharmacy, and nursing act on digital requests."],["05","Track","Important events land on the patient's digital timeline."]].map(([number,title,copy]) => <div key={number} className="rounded-xl bg-card/60 p-5 ring-1 ring-border backdrop-blur"><div className="font-mono text-2xl font-medium text-brand/30">{number}</div><div className="mt-2 text-sm font-semibold text-ink">{title}</div><p className="mt-2 text-sm leading-relaxed text-ink/60">{copy}</p></div>)}</div></div></section>

        <section id="roles" className="bg-card"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-6"><div className="max-w-[30ch]"><SectionLabel>Role-based access</SectionLabel><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink">One system. Every role.</h2></div><Button asChild className="rounded-lg bg-brand px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-brand/25 hover:bg-brand/90"><Link to="/demo">Explore CareSync Demo <ArrowRight className="size-4" /></Link></Button></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{roles.map(([Icon, title, copy]) => <div key={title} className="rounded-xl bg-card p-5 ring-1 ring-border"><div className="grid size-9 place-items-center rounded-lg bg-surf text-ink/60"><Icon className="size-4" /></div><div className="mt-4 text-sm font-semibold text-ink">{title}</div><p className="mt-2 text-sm leading-relaxed text-ink/60">{copy}</p></div>)}</div></div></section>
      </main>

      <footer className="bg-ink"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 lg:flex-row lg:items-center lg:px-8"><Logo compact /><div className="text-xs text-primary-foreground/55">Fictional demo data only · Not a clinical decision-making or diagnosis tool.</div></div></footer>
    </div>
  );
}