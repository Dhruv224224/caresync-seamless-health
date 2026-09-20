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
  Sun,
  Moon,
  Loader2,
  UserPlus,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/care-sync/Logo";
import { useTheme } from "@/components/care-sync/ThemeToggle";
import { useCareSync, getRoleHomePath } from "@/lib/store";
import { Role } from "@/types/caresync";
import { toast } from "sonner";

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
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("ananya.sharma@caresync.health");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const { setRole, loginWithSupabase, signUpWithSupabase } = useCareSync();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      toast.error("Please enter a valid email address (e.g. user@gmail.com)");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    if (isSignUpMode) {
      if (!fullName.trim()) {
        toast.error("Please enter your full name for patient profile registration");
        setLoading(false);
        return;
      }

      const res = await signUpWithSupabase(cleanEmail, password, fullName.trim(), phone.trim());
      setLoading(false);

      if (res.success) {
        toast.success("Account created successfully! Redirecting to Patient Portal...");
        navigate({ to: "/patient/dashboard" });
      } else {
        const err = res.error || "";
        if (err.includes("already registered") || err.includes("already exists")) {
          toast.error("This email is already registered. Please sign in instead.");
          setIsSignUpMode(false);
        } else if (err.includes("weak_password") || err.includes("password")) {
          toast.error("Weak password: Password must be at least 6 characters.");
        } else if (err.includes("email_address_invalid")) {
          toast.error("Invalid email address format.");
        } else {
          toast.error(err || "Sign up failed. Please check network connection.");
        }
      }
    } else {
      // Sign In Flow
      const res = await loginWithSupabase(cleanEmail, password);
      setLoading(false);

      if (res.success) {
        const targetRole = res.role || "doctor";
        toast.success(`Welcome back! Logged in as ${targetRole.toUpperCase()}`);
        navigate({ to: getRoleHomePath(targetRole) });
      } else {
        const err = res.error || "";
        if (err.includes("Invalid login credentials") || err.includes("invalid_credentials")) {
          toast.error("Invalid email or password. Please verify your credentials.");
        } else if (err.includes("Email not confirmed")) {
          toast.warning("Notice: Email confirmation required in Supabase project settings.");
        } else {
          toast.error(err || "Authentication failed. Please verify your network and credentials.");
        }
      }
    }
  };

  const handleQuickDemoRole = (role: Role, targetPath: string) => {
    setRole(role);
    toast.success(`Switched to ${role.toUpperCase()} Persona`);
    navigate({ to: targetPath });
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-12 text-foreground selection:bg-brand/20">
      {/* Top right theme toggle for public access */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-slate-700 hover:text-ink hover:bg-card/80 backdrop-blur dark:text-slate-300"
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-4 text-warn" />
          ) : (
            <Moon className="size-4 text-navy-800" />
          )}
        </Button>
      </div>

      {/* Left Column: Brand Hero — Nightshift 900 / 800 Layered Depth */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-navy-900 dark:bg-[#101F30] flex-col justify-between p-12 text-white relative overflow-hidden border-r border-border">
        <div className="pointer-events-none absolute -right-20 -bottom-20 size-[36rem] rounded-full bg-teal-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute left-10 top-10 size-72 rounded-full bg-blue-accent/15 blur-2xl" />

        <div className="relative z-10">
          <Logo compact onDark />
          <div className="mt-16 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy-800 dark:bg-[#162A3D] px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-light dark:text-[#43C7A0] ring-1 ring-teal-primary/30 backdrop-blur shadow-sm">
              <span className="size-2 rounded-full bg-teal-primary animate-pulse" /> CONNECTED CARE OPERATIONS
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              One Continuous Digital <br />
              <span className="text-[#7DBBEE]">Patient Journey.</span>
            </h1>
            <p className="mt-4 text-base text-slate-300 dark:text-[#C5D0DC] leading-relaxed font-normal">
              CareSync connects registration, clinical consultations, automated lab orders, smart
              pharmacy dispensing, nursing vitals, and surgical milestones into a unified digital
              thread.
            </p>
          </div>
        </div>

        {/* Demo Fast-Track Highlight (Nightshift Card #162A3D) */}
        <div className="relative z-10 mt-12 rounded-2xl bg-navy-800/80 dark:bg-[#162A3D] p-6 backdrop-blur-xl border border-border shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-light dark:text-[#43C7A0] font-mono text-xs font-bold uppercase tracking-wider">
              <Zap className="size-4 text-teal-primary" /> JUDGE & EVALUATOR FAST TRACK
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-300 dark:text-[#C5D0DC] bg-navy-900 dark:bg-[#101F30] px-2.5 py-0.5 rounded border border-border">
              Instant Role Switch
            </span>
          </div>
          <p className="mt-2.5 text-xs text-slate-300 dark:text-[#C5D0DC] font-normal leading-relaxed">
            Select any persona below or on the right to jump directly into full cross-department
            live workflows.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              { role: "doctor", label: "Doctor", path: "/doctor/dashboard" },
              { role: "lab", label: "Laboratory", path: "/lab/dashboard" },
              { role: "pharmacy", label: "Pharmacy", path: "/pharmacy/dashboard" },
            ].map((p) => (
              <button
                key={p.role}
                type="button"
                onClick={() => handleQuickDemoRole(p.role as Role, p.path)}
                className="p-2.5 rounded-lg bg-navy-900 dark:bg-[#101F30] hover:bg-navy-700 dark:hover:bg-[#1D354C] active:bg-navy-600 text-xs font-semibold text-white text-left border border-border hover:border-teal-primary/60 transition-all flex items-center justify-between shadow-xs cursor-pointer group"
              >
                <span className="text-white group-hover:text-teal-light dark:group-hover:text-[#7DBBEE] transition-colors">{p.label}</span>
                <ArrowRight className="size-3.5 text-teal-primary group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 dark:text-[#9EADBC] font-mono font-medium pt-4">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-blue-accent" />
            CareSync Hospital Automation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-teal-primary" />
            Supabase Auth Integrated
          </span>
        </div>
      </div>

      {/* Right Column: Sign In & Demo Role Pickers — Nightshift 900 Background */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center p-6 sm:p-10 lg:p-12 bg-background">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="lg:hidden mb-4">
            <Logo />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink">
                {isSignUpMode ? "Create Hospital Account" : "Sign In to CareSync"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9EADBC] mt-1">
                {isSignUpMode
                  ? "Register with Supabase Auth to track your patient health journey."
                  : "Enter your hospital credentials or pick a demo persona below."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSignUpMode((prev) => !prev)}
              className="text-xs border-border bg-card shrink-0 text-slate-700 dark:text-slate-300"
            >
              {isSignUpMode ? "Sign In Instead" : "Sign Up"}
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {isSignUpMode && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="bg-card dark:bg-[#101F30] border-border h-10 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Contact Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-card dark:bg-[#101F30] border-border h-10 text-sm font-mono"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {isSignUpMode ? "Email Address" : "Hospital Email"}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@hospital.org"
                className="bg-card dark:bg-[#101F30] border-border h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                {!isSignUpMode && (
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Demo Mode: Click any persona below to sign in instantly.")
                    }
                    className="text-xs text-navy-800 dark:text-[#65AEED] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-card dark:bg-[#101F30] border-border h-10 text-sm"
                required
              />
            </div>

            {!isSignUpMode && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label htmlFor="remember" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Remember my device for 30 days
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-navy-800 dark:bg-[#347FBE] dark:hover:bg-[#4EA0E8] text-white font-medium h-10 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {isSignUpMode ? "Creating Account..." : "Signing In..."}
                </>
              ) : isSignUpMode ? (
                <>
                  <UserPlus className="size-4 mr-1.5" /> Complete Sign Up
                </>
              ) : (
                <>
                  Sign In to Workspace <ArrowRight className="size-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-background px-3 text-slate-500 dark:text-[#9EADBC] font-medium">Or Enter Via Demo Mode</span>
            </div>
          </div>

          {/* 6 Demo Personas (#162A3D card surface) */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-500 dark:text-[#9EADBC] font-semibold uppercase tracking-wider">
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
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-card dark:bg-[#162A3D] hover:border-slate-300 dark:hover:border-[#467FAF] text-left transition-all group shadow-2xs cursor-pointer"
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary dark:bg-[#101F30] text-slate-700 dark:text-[#7DBBEE] group-hover:bg-navy-900 dark:group-hover:bg-[#1D354C] group-hover:text-white transition-colors border border-border">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="text-xs font-semibold text-ink group-hover:text-navy-900 dark:group-hover:text-primary truncate">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#9EADBC] truncate font-mono font-medium">{p.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs font-medium text-slate-500 dark:text-[#9EADBC] hover:text-ink transition-colors">
              ← Return to Public Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
