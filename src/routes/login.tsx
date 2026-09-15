import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Pill,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/care-sync/Logo";
import { useCareSync } from "@/lib/store";
import { Role } from "@/types/caresync";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "CareSync — Sign In & Role Portal" },
      { name: "description", content: "Secure access to CareSync digital hospital workflows." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("ananya.sharma@caresync.health");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const { setRole } = useCareSync();
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setRole("doctor");
    navigate({ to: "/doctor/dashboard" });
  };

  const handleQuickDemoRole = (role: Role, targetPath: string) => {
    setRole(role);
    navigate({ to: targetPath as any });
  };

  return (
    <div className="min-h-screen bg-surf grid lg:grid-cols-12 text-foreground">
      {/* Left Column: Brand Hero */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-brand flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -bottom-20 size-[36rem] rounded-full bg-calm/10 blur-3xl" />
        <div className="pointer-events-none absolute left-10 top-10 size-72 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10">
          <Logo compact />
          <div className="mt-16 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-calm ring-1 ring-white/15 backdrop-blur">
              <span className="size-1.5 rounded-full bg-calm" /> First Commit Hackathon Prototype
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              One Continuous Digital Patient Journey.
            </h1>
            <p className="mt-4 text-base text-white/80 leading-relaxed">
              CareSync connects registration, clinical consultations, automated lab orders, smart
              pharmacy dispensing, nursing vitals, and surgical milestones into a unified digital
              thread.
            </p>
          </div>
        </div>

        {/* Demo Fast-Track Highlight */}
        <div className="relative z-10 mt-12 rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-calm font-mono text-xs uppercase tracking-wider">
              <Zap className="size-4" /> Judge & Evaluator Fast Track
            </div>
            <span className="text-[11px] font-mono text-white/60">No password required</span>
          </div>
          <p className="mt-2 text-xs text-white/80">
            Select any persona below or on the right to jump directly into full cross-department
            live workflows.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { role: "doctor", label: "Doctor", path: "/doctor/dashboard" },
              { role: "lab", label: "Laboratory", path: "/lab/dashboard" },
              { role: "pharmacy", label: "Pharmacy", path: "/pharmacy/dashboard" },
            ].map((p) => (
              <button
                key={p.role}
                onClick={() => handleQuickDemoRole(p.role as Role, p.path)}
                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-left border border-white/10 transition-colors flex items-center justify-between"
              >
                <span>{p.label}</span>
                <ArrowRight className="size-3 text-calm" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/60 font-mono">
          <span>CareSync Hospital Automation</span>
          <span>Not a diagnostic tool</span>
        </div>
      </div>

      {/* Right Column: Sign In & Demo Role Pickers */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center p-6 sm:p-10 lg:p-12">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="lg:hidden mb-4">
            <Logo />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-ink">Sign In to CareSync</h2>
            <p className="text-xs sm:text-sm text-ink/60 mt-1">
              Enter your hospital credentials or pick a demo persona below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-ink">
                Hospital Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="bg-card border-border h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-ink">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => alert("Demo Mode: Click any role below to sign in instantly.")}
                  className="text-xs text-brand hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-card border-border h-10 text-sm"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
              <label htmlFor="remember" className="text-xs text-ink/70 cursor-pointer">
                Remember my device for 30 days
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand/90 text-white font-medium h-10 shadow-sm"
            >
              Sign In to Workspace <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-surf px-3 text-ink/40">Or Enter Via Demo Mode</span>
            </div>
          </div>

          {/* 6 Demo Personas */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-ink/50 uppercase tracking-wider">
              Select Demo Role (Judge Sandbox)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  role: "doctor",
                  title: "Doctor",
                  name: "Dr. Ananya Sharma",
                  icon: Stethoscope,
                  path: "/doctor/dashboard",
                },
                {
                  role: "patient",
                  title: "Patient",
                  name: "Rajesh Sharma",
                  icon: Users,
                  path: "/patient/dashboard",
                },
                {
                  role: "nurse",
                  title: "Nurse",
                  name: "Priya Verma",
                  icon: HeartPulse,
                  path: "/nurse/dashboard",
                },
                {
                  role: "lab",
                  title: "Laboratory",
                  name: "Neha Gupta",
                  icon: FlaskConical,
                  path: "/lab/dashboard",
                },
                {
                  role: "pharmacy",
                  title: "Pharmacy",
                  name: "Amit Singh",
                  icon: Pill,
                  path: "/pharmacy/dashboard",
                },
                {
                  role: "receptionist",
                  title: "Receptionist",
                  name: "Rohan Mehta",
                  icon: ClipboardList,
                  path: "/receptionist/dashboard",
                },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleQuickDemoRole(p.role as Role, p.path)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-card hover:bg-brand/5 hover:border-brand/40 text-left transition-all group"
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-surf text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="text-xs font-semibold text-ink group-hover:text-brand truncate">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-ink/50 truncate font-mono">{p.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-ink/50 hover:text-ink transition-colors">
              ← Return to Public Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
