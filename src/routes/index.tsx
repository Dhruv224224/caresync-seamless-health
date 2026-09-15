import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Hospital,
  Pill,
  ShieldCheck,
  Stethoscope,
  Users,
  Workflow,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Bed,
  FileCheck,
  Building2,
  Database,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/care-sync/Logo";
import { SectionLabel } from "@/components/care-sync/SectionLabel";
import { useTheme } from "@/components/care-sync/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareSync — One Patient. Every Department. In Sync." },
      {
        name: "description",
        content:
          "CareSync connects registration, consultation, diagnostics, pharmacy, nursing, surgery, and recovery into one continuous digital patient journey.",
      },
      { property: "og:title", content: "CareSync — One Patient. Every Department. In Sync." },
      {
        property: "og:description",
        content:
          "CareSync connects registration, consultation, diagnostics, pharmacy, nursing, surgery and recovery into one digital patient journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const problems = [
  {
    code: "01",
    title: "Siloed Paper Records",
    copy: "Patient history and vitals are repeatedly written on slips that get misplaced between OPD and wards.",
    stat: "40% delays in handoffs",
  },
  {
    code: "02",
    title: "Disconnected Clinical Teams",
    copy: "Doctors, lab technicians, nurses, and pharmacists work in isolated systems with manual communication.",
    stat: "High prescription friction",
  },
  {
    code: "03",
    title: "Delayed Diagnostic Turnaround",
    copy: "Paper-based lab test orders require physical runners, slowing emergency surgical and treatment decisions.",
    stat: "Hours lost awaiting reports",
  },
  {
    code: "04",
    title: "Fragmented Patient Timeline",
    copy: "Patients cannot access their full treatment journey, leaving families anxious and misinformed.",
    stat: "Zero visibility for patients",
  },
];

const features = [
  {
    icon: ClipboardList,
    title: "Single-Point Digital Registration",
    desc: "Generate permanent hospital UHID records with demographics, emergency contacts, and allergy alerts instantly.",
    tag: "Front Desk & Triage",
  },
  {
    icon: Stethoscope,
    title: "Clinical Consultation & Rx Builder",
    desc: "Record observations, diagnoses, and structured digital prescriptions that dispatch to pharmacy in real time.",
    tag: "Doctor OPD Hub",
  },
  {
    icon: FlaskConical,
    title: "Automated Diagnostic Lab Routing",
    desc: "Requisitions sync directly to the Central Lab queue with urgent priority flags, automated value validation, and report PDFs.",
    tag: "Diagnostics Hub",
  },
  {
    icon: Pill,
    title: "Real-Time Pharmacy Dispensing",
    desc: "Pharmacists fulfill verified digital prescriptions with 1-click dispensing and live inventory stock reconciliation.",
    tag: "Dispensary Ops",
  },
  {
    icon: HeartPulse,
    title: "Inpatient Vitals & Ward Care",
    desc: "Track bed assignments in Ward 3B/2A, record scheduled Q4H vitals (BP, SpO2, Pulse, Temp), and manage nursing rounds.",
    tag: "Nursing Station",
  },
  {
    icon: Activity,
    title: "Surgical Workflow & OT Milestones",
    desc: "Track elective and emergency operations through 9 synchronized milestones from pre-op assessment to discharge.",
    tag: "Surgery & Recovery",
  },
];

const roles = [
  {
    icon: Users,
    role: "Patient",
    desc: "View upcoming appointments, active prescriptions, verified lab reports, and your continuous medical timeline in plain language.",
    path: "/patient/dashboard",
  },
  {
    icon: ClipboardList,
    role: "Receptionist",
    desc: "Register incoming patients, assign hospital UHIDs, manage OPD queues, and facilitate inpatient ward admissions.",
    path: "/receptionist/dashboard",
  },
  {
    icon: Stethoscope,
    role: "Doctor",
    desc: "Manage patient queues, chart clinical notes, prescribe medication, order lab tests, and track longitudinal progress.",
    path: "/doctor/dashboard",
  },
  {
    icon: HeartPulse,
    role: "Nurse",
    desc: "Monitor assigned inpatient beds, record vital signs, check medication schedules, and log post-operative recovery tasks.",
    path: "/nurse/dashboard",
  },
  {
    icon: FlaskConical,
    role: "Laboratory",
    desc: "Accept diagnostic test orders, enter clinical analyzer parameters, and publish signed-off digital laboratory reports.",
    path: "/lab/dashboard",
  },
  {
    icon: Pill,
    role: "Pharmacy",
    desc: "Review incoming digital prescriptions, dispense medicines with safety verification, and manage inventory stock levels.",
    path: "/pharmacy/dashboard",
  },
];

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand/20">
      {/* Global Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-7 text-xs font-semibold text-ink/70 md:flex">
            <a href="#journey" className="transition-colors hover:text-brand">
              Connected Journey
            </a>
            <a href="#roles" className="transition-colors hover:text-brand">
              Roles & Workspaces
            </a>
            <a href="#features" className="transition-colors hover:text-brand">
              Key Features
            </a>
            <a href="#how" className="transition-colors hover:text-brand">
              How It Works
            </a>
            <a href="#safety" className="transition-colors hover:text-brand">
              Safety & Standards
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle in Header */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-ink/70 hover:text-ink hover:bg-surf"
              title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme mode"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-4 text-warn transition-transform hover:rotate-45" />
              ) : (
                <Moon className="size-4 text-brand transition-transform hover:-rotate-12" />
              )}
            </Button>

            <Button
              asChild
              variant="ghost"
              className="hidden sm:inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold text-ink/80 hover:text-ink hover:bg-surf"
            >
              <Link to="/login">Sign In</Link>
            </Button>

            <Button
              asChild
              className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm shadow-brand/20 hover:bg-brand/90"
            >
              <Link to="/demo">
                Explore Demo <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-ink"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card p-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-ink">
              <a
                href="#journey"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-surf"
              >
                Connected Journey
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-surf"
              >
                Roles & Workspaces
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-surf"
              >
                Key Features
              </a>
              <a
                href="#how"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-surf"
              >
                How It Works
              </a>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-surf text-brand font-semibold"
              >
                Sign In to Portal →
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-surf py-16 sm:py-24 lg:py-28 border-b border-border/80">
          <div className="pointer-events-none absolute -left-20 top-10 size-96 rounded-full bg-calm/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-20 size-96 rounded-full bg-brand/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand ring-1 ring-border shadow-2xs backdrop-blur">
                <span className="size-1.5 rounded-full bg-calm animate-pulse" />
                CONNECTED HEALTHCARE WORKFLOW
              </span>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
                One Patient. <br />
                Every Department. <br />
                <span className="text-brand">In Sync.</span>
              </h1>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-ink/70 font-normal">
                CareSync connects registration, consultation, diagnostics, pharmacy, nursing,
                surgery and recovery into one digital patient journey.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-brand/25 hover:bg-brand/90"
                >
                  <Link to="/demo">
                    Explore Demo <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-lg border-border bg-card/80 px-5 py-2.5 text-sm font-semibold text-ink backdrop-blur hover:bg-card"
                >
                  <a href="#how">See How It Works</a>
                </Button>
              </div>

              {/* Status Bar Indicator */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/60 text-[11px] font-mono text-ink/50">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-calm" />
                  <span>Real-Time Sync</span>
                </div>
                <span>•</span>
                <span>Role-Tailored UX</span>
                <span>•</span>
                <span>Zero Paper Trails</span>
              </div>
            </div>

            {/* Right Hero: Interconnected Patient Workflow Visualizer */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl border border-border bg-card/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-brand/10 text-brand grid place-items-center font-bold text-xs font-mono">
                      CS-001
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink">Rajesh Sharma</div>
                      <div className="text-[10px] font-mono text-ink/50">
                        54y · Male · B+ · Acute Appendicitis
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-tealsoft text-calm border-calm/30 text-[10px] font-mono">
                    <span className="size-1.5 rounded-full bg-calm mr-1 animate-pulse" /> Live In
                    Sync
                  </Badge>
                </div>

                {/* Connected Step Cards Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      step: "01",
                      name: "Registration",
                      dept: "Front Desk",
                      status: "completed",
                      time: "08:30 AM",
                    },
                    {
                      step: "02",
                      name: "Consultation",
                      dept: "OPD Room 4",
                      status: "completed",
                      time: "09:00 AM",
                    },
                    {
                      step: "03",
                      name: "Diagnostics",
                      dept: "Central Lab",
                      status: "completed",
                      time: "10:15 AM",
                    },
                    {
                      step: "04",
                      name: "Pharmacy",
                      dept: "Dispensary",
                      status: "completed",
                      time: "11:00 AM",
                    },
                    {
                      step: "05",
                      name: "Nursing",
                      dept: "Ward 3B",
                      status: "active",
                      time: "01:30 PM",
                    },
                    {
                      step: "06",
                      name: "Recovery",
                      dept: "OT Suite 2",
                      status: "pending",
                      time: "Scheduled",
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        s.status === "active"
                          ? "bg-brand/10 border-brand/50 ring-1 ring-brand/30"
                          : s.status === "completed"
                            ? "bg-surf border-border/80"
                            : "bg-card/50 border-border/40 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-ink/40 font-semibold">
                          {s.step}
                        </span>
                        {s.status === "completed" ? (
                          <CheckCircle2 className="size-3.5 text-calm" />
                        ) : s.status === "active" ? (
                          <span className="size-2 rounded-full bg-brand animate-ping" />
                        ) : (
                          <Clock className="size-3 text-ink/30" />
                        )}
                      </div>
                      <div className="mt-2 font-bold text-ink truncate">{s.name}</div>
                      <div className="text-[10px] text-ink/50 truncate font-mono">{s.dept}</div>
                      <div className="mt-1 text-[9px] font-mono text-brand font-medium">
                        {s.time}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cross-Department Sync Banner */}
                <div className="mt-4 p-3 rounded-xl bg-surf border border-border/70 flex items-center justify-between text-xs text-ink/70">
                  <span className="flex items-center gap-2">
                    <Activity className="size-4 text-calm" />
                    <span>Lab verified report instantly notified Dr. Sharma & Ward 3B</span>
                  </span>
                  <Link
                    to="/doctor/patient/$id"
                    params={{ id: "CS-001" }}
                    className="font-mono text-[11px] text-brand hover:underline font-semibold"
                  >
                    View Chart →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. THE PROBLEM */}
        <section className="bg-card py-16 sm:py-20 border-b border-border/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <SectionLabel>The Problem</SectionLabel>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Healthcare workflows shouldn't depend on fragile paperwork.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink/65">
                Traditional hospital departments operate as disconnected islands, causing diagnostic
                delays, transcription errors, and patient anxiety.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {problems.map((p) => (
                <div
                  key={p.code}
                  className="rounded-xl bg-surf p-5 border border-border hover:border-brand/40 transition-all"
                >
                  <div className="font-mono text-xs font-bold text-brand">{p.code}</div>
                  <h3 className="mt-2 text-sm font-bold text-ink">{p.title}</h3>
                  <p className="mt-2 text-xs text-ink/65 leading-relaxed">{p.copy}</p>
                  <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-crit font-medium">
                    {p.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. THE SOLUTION & CONNECTED PATIENT JOURNEY */}
        <section id="journey" className="bg-surf py-16 sm:py-20 border-b border-border/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <SectionLabel>The Connected Solution</SectionLabel>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                One Continuous Digital Patient Journey
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink/65">
                Every department accesses and appends to the same verified digital thread in real
                time.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                {
                  title: "Registration",
                  icon: ClipboardList,
                  desc: "UHID created, vitals baseline taken",
                },
                {
                  title: "Consultation",
                  icon: Stethoscope,
                  desc: "Doctor charts diagnosis & orders Rx/Labs",
                },
                {
                  title: "Diagnostics",
                  icon: FlaskConical,
                  desc: "Lab analyzes sample & publishes PDF",
                },
                { title: "Pharmacy", icon: Pill, desc: "Dispensary fulfills Rx with 1 click" },
                { title: "Nursing", icon: HeartPulse, desc: "Ward bed vitals tracked Q4H" },
                {
                  title: "Discharge & Portal",
                  icon: CheckCircle2,
                  desc: "Digital summary sent to patient app",
                },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="p-4 rounded-xl bg-card border border-border hover:border-brand/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="size-8 rounded-lg bg-brand/10 text-brand grid place-items-center mb-3">
                        <Icon className="size-4" />
                      </div>
                      <div className="text-xs font-mono text-ink/40 font-semibold">
                        Stage 0{idx + 1}
                      </div>
                      <div className="text-sm font-bold text-ink mt-0.5">{step.title}</div>
                      <div className="text-xs text-ink/60 mt-1 leading-snug">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. ROLE-BASED WORKSPACES */}
        <section id="roles" className="bg-card py-16 sm:py-20 border-b border-border/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <SectionLabel>Role-Specific Workspaces</SectionLabel>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                  Designed for Each Hospital Persona
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-ink/65">
                  Not 6 copies of the same dashboard. Tailored workflows for every department role.
                </p>
              </div>
              <Button
                asChild
                className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs h-8"
              >
                <Link to="/demo">
                  Launch Sandbox Demo <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.role}
                    className="group flex flex-col justify-between rounded-xl border border-border bg-surf p-5 hover:border-brand/40 hover:bg-card transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="size-9 rounded-lg bg-card text-brand border border-border grid place-items-center">
                          <Icon className="size-4" />
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono border-border bg-card"
                        >
                          {item.role}
                        </Badge>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-ink group-hover:text-brand transition-colors">
                        {item.role} Workspace
                      </h3>
                      <p className="mt-2 text-xs text-ink/65 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/60">
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="w-full text-xs font-semibold text-brand hover:bg-brand/10 justify-between h-8 px-2"
                      >
                        <Link to={item.path}>
                          <span>Open {item.role} View</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. KEY FEATURES */}
        <section id="features" className="bg-surf py-16 sm:py-20 border-b border-border/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <SectionLabel>Platform Capabilities</SectionLabel>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Engineered for Modern Clinical Operations
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="rounded-xl bg-card p-5 border border-border hover:border-brand/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-9 rounded-lg bg-brand/10 text-brand grid place-items-center">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-[10px] font-mono text-brand font-medium">{f.tag}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-ink">{f.title}</h3>
                    <p className="mt-2 text-xs text-ink/65 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS */}
        <section id="how" className="bg-card py-16 sm:py-20 border-b border-border/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <SectionLabel>Step-by-Step</SectionLabel>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                How CareSync Keeps Departments in Sync
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  num: "01",
                  title: "Patient Checks In",
                  desc: "Receptionist generates UHID and triages patient to Doctor OPD queue.",
                },
                {
                  num: "02",
                  title: "Doctor Consults",
                  desc: "Doctor charts clinical notes, creates digital Rx, and dispatches lab orders.",
                },
                {
                  num: "03",
                  title: "Lab & Pharmacy Act",
                  desc: "Pharmacy receives Rx for dispensing; Central Lab validates test results.",
                },
                {
                  num: "04",
                  title: "Ward Care & Surgery",
                  desc: "Nurses log Q4H vitals in Ward 3B; surgical milestones update live.",
                },
                {
                  num: "05",
                  title: "Patient Digital File",
                  desc: "All event logs compile into the patient's continuous health record.",
                },
              ].map((item) => (
                <div key={item.num} className="rounded-xl bg-surf p-4 border border-border">
                  <div className="font-mono text-xl font-bold text-brand">{item.num}</div>
                  <div className="mt-2 text-sm font-bold text-ink">{item.title}</div>
                  <p className="mt-1.5 text-xs text-ink/65 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. MEDICAL SAFETY & PROTOCOL */}
        <section id="safety" className="bg-surf py-12 border-b border-border/80">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 font-mono text-[11px] font-semibold text-ink/70 border border-border">
              <ShieldCheck className="size-3.5 text-calm" /> Prototype Safety & Compliance Notice
            </div>
            <p className="mt-4 text-xs sm:text-sm text-ink/65 leading-relaxed">
              CareSync is a hackathon prototype for healthcare workflow demonstration. It is not
              intended for clinical diagnosis, treatment decisions, or real patient data. Fictional
              demo patients and simulated clinical workflows are utilized for educational review.
            </p>
          </div>
        </section>

        {/* 8. DEMO CTA */}
        <section className="bg-brand py-16 text-white text-center">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Ready to Experience Connected Healthcare?
            </h2>
            <p className="mt-3 text-sm text-white/80 max-w-xl mx-auto">
              Launch the interactive multi-persona prototype now to experience synchronized hospital
              workflows.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button
                asChild
                className="bg-white text-brand hover:bg-white/90 text-xs font-semibold h-9 px-5 shadow-lg"
              >
                <Link to="/demo">
                  Launch Demo Hub <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-card py-8 border-t border-border text-xs text-ink/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo compact />
          <div className="text-center sm:text-right text-[11px] font-mono text-ink/50">
            CareSync © 2026 · One Patient. Every Department. In Sync.
          </div>
        </div>
      </footer>
    </div>
  );
}
