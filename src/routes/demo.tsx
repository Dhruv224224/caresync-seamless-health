import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FlaskConical,
  LayoutDashboard,
  LucideIcon,
  Moon,
  Pill,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Sun,
  User,
  UserCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/care-sync/Logo";
import { SectionLabel } from "@/components/care-sync/SectionLabel";
import { useTheme } from "@/components/care-sync/ThemeToggle";
import { useCareSync } from "@/lib/store";
import { DEMO_USERS } from "@/lib/mockData";
import { Role } from "@/types/caresync";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "CareSync — Select Demo Role" },
      { name: "description", content: "Choose a role to test the connected hospital workflow." },
    ],
  }),
  component: DemoRoleSelectionPage,
});

const rolesList: {
  role: Role;
  title: string;
  emoji: string;
  icon: LucideIcon;
  user: (typeof DEMO_USERS)[Role];
  path: string;
  description: string;
  keyActions: string[];
}[] = [
  {
    role: "patient",
    title: "Patient",
    emoji: "👤",
    icon: Users,
    user: DEMO_USERS.patient,
    path: "/patient/dashboard",
    description:
      "Track your continuous medical timeline, digital prescriptions, lab reports, and bed status.",
    keyActions: ["View Timeline", "Download Prescriptions", "Inspect Lab Results"],
  },
  {
    role: "doctor",
    title: "Doctor",
    emoji: "👨‍⚕️",
    icon: Stethoscope,
    user: DEMO_USERS.doctor,
    path: "/doctor/dashboard",
    description:
      "Manage outpatient queues, record digital clinical consultations, prescribe meds, and order labs.",
    keyActions: ["Conduct Consultation", "Create Digital Rx", "Order Diagnostic Tests"],
  },
  {
    role: "nurse",
    title: "Nurse",
    emoji: "👩‍⚕️",
    icon: HeartPulse,
    user: DEMO_USERS.nurse,
    path: "/nurse/dashboard",
    description:
      "Inpatient ward rounds, record vitals (BP, SpO2, Pulse, Temp), and update nursing tasks.",
    keyActions: ["Record Bed Vitals", "Track Inpatient Recovery", "Post-Op Monitoring"],
  },
  {
    role: "lab",
    title: "Laboratory",
    emoji: "🧪",
    icon: FlaskConical,
    user: DEMO_USERS.lab,
    path: "/lab/dashboard",
    description:
      "Receive real-time requisitions, track sample collection, enter findings, and upload reports.",
    keyActions: ["Accept Test Orders", "Enter Lab Values", "Publish CBC / Blood Sugar"],
  },
  {
    role: "pharmacy",
    title: "Pharmacy",
    emoji: "💊",
    icon: Pill,
    user: DEMO_USERS.pharmacy,
    path: "/pharmacy/dashboard",
    description:
      "Fulfill digital prescriptions in real time, dispense medications, and manage stock levels.",
    keyActions: ["Review Pending Rx", "1-Click Dispensing", "Inventory Status"],
  },
  {
    role: "receptionist",
    title: "Receptionist",
    emoji: "🧾",
    icon: ClipboardList,
    user: DEMO_USERS.receptionist,
    path: "/receptionist/dashboard",
    description:
      "Register incoming patients, create hospital UHIDs, schedule consultations, and assign beds.",
    keyActions: ["Patient Registration", "Doctor Queue Check-In", "Bed Assignment"],
  },
];

function DemoRoleSelectionPage() {
  const { setRole, resetToDefault } = useCareSync();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSelectRole = (role: Role, path: string) => {
    setRole(role);
    navigate({ to: path });
  };

  return (
    <div className="min-h-screen bg-surf text-foreground flex flex-col selection:bg-brand/20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-ink/70 hover:text-ink hover:bg-surf"
              title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-4 text-warn" />
              ) : (
                <Moon className="size-4 text-brand" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToDefault();
                alert("Demo state reset to initial prototype baseline.");
              }}
              className="border-border text-xs text-ink/70 h-8"
            >
              <RotateCcw className="size-3.5 mr-1" /> Reset Demo Data
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs h-8 text-ink/70">
              <Link to="/login">Sign In View</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <SectionLabel>First Commit Prototype</SectionLabel>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Experience CareSync Across Every Department
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink/65 leading-relaxed">
            Select any role below to launch their customized dashboard. Actions taken in one role
            automatically synchronize with other departments and update the patient's continuous
            digital timeline.
          </p>
        </div>

        {/* 6 Role Cards Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rolesList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{item.emoji}</div>
                      <div>
                        <h3 className="text-lg font-bold text-ink group-hover:text-brand transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-xs font-mono text-brand font-medium">
                          {item.user.name}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-border bg-surf"
                    >
                      {item.user.role}
                    </Badge>
                  </div>

                  <p className="mt-4 text-xs text-ink/70 leading-relaxed min-h-[3rem]">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-border/60">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ink/40 mb-2">
                      Key Workflow Capabilities
                    </div>
                    <div className="space-y-1.5">
                      {item.keyActions.map((action) => (
                        <div key={action} className="text-xs text-ink/80 flex items-center gap-2">
                          <span className="size-1 rounded-full bg-calm" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <Button
                    onClick={() => handleSelectRole(item.role, item.path)}
                    className="w-full bg-brand/10 hover:bg-brand text-brand hover:text-white transition-all font-medium text-xs h-9 justify-between"
                  >
                    <span>Launch {item.title} Workspace</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Demo Notice */}
        <div className="mt-12 rounded-xl bg-card border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink/60">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-calm shrink-0" />
            <span>
              Connected Workflow State: Adding a prescription as Doctor will immediately appear in
              the Pharmacy queue; ordering a test will alert Laboratory.
            </span>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs border-border shrink-0">
            <Link to="/doctor/patient/$id" params={{ id: "CS-001" }}>
              Inspect Patient CS-001 Timeline →
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
