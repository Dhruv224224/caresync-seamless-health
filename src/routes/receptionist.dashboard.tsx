import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ClipboardList,
  UserPlus,
  Calendar,
  Bed,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/care-sync/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCareSync } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/receptionist/dashboard")({
  head: () => ({
    meta: [{ title: "Front Desk & Patient Registration | CareSync" }],
  }),
  component: ReceptionistDashboardPage,
});

function ReceptionistDashboardPage() {
  const { patients, addPatient } = useCareSync();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [allergies, setAllergies] = useState("");

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !age) {
      toast.error("Please enter patient name and age");
      return;
    }

    const created = await addPatient({
      name: fullName,
      age: Number(age),
      gender,
      bloodGroup,
      phone: phone || "+91 98765 00000",
      address: address || "Bengaluru, Karnataka",
      allergies: allergies ? allergies.split(",").map((s) => s.trim()) : [],
      medicalHistory: ["New Patient Check-in"],
      status: "Waiting",
      currentDepartment: "Outpatient Clinic",
      assignedDoctor: "Dr. Ananya Sharma",
    });

    setRegisterOpen(false);
    setFullName("");
    setAge("");
    setPhone("");
    setAllergies("");
    toast.success(`Patient ${created.name} (${created.id}) registered & stored in Supabase!`);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery),
  );

  return (
    <AppShell activeRole="receptionist">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink/50">
              <span>Main Hospital Reception & Triage</span>
              <span>•</span>
              <span className="text-calm font-medium">Registrar: Rohan Mehta</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-0.5">
              Patient Registration & Check-In
            </h1>
            <p className="text-xs text-ink/60">
              Register incoming patients, generate digital UHIDs, and route directly to clinical
              queues.
            </p>
          </div>

          {/* Registration Dialog */}
          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs h-8 px-3.5 shadow-xs">
                <UserPlus className="size-3.5 mr-1.5" /> Register New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg border border-border bg-card shadow-2xl">
              <DialogHeader className="border-b border-border pb-3">
                <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
                  <UserPlus className="size-5 text-brand" /> Register Digital Patient Record
                </DialogTitle>
                <div className="text-xs text-ink/50 mt-0.5">
                  Creates hospital UHID & starts continuous digital timeline
                </div>
              </DialogHeader>

              <form onSubmit={handleRegisterPatient} className="space-y-3.5 py-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-ink">Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="text-xs bg-surf h-8"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-ink">Age</Label>
                    <Input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="45"
                      className="text-xs bg-surf h-8 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-ink">Gender</Label>
                    <Select
                      value={gender}
                      onValueChange={(v: "Male" | "Female" | "Other") => setGender(v)}
                    >
                      <SelectTrigger className="text-xs bg-surf h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-ink">Blood Group</Label>
                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
                      <SelectTrigger className="text-xs bg-surf h-8 font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-ink">Phone Number</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="text-xs bg-surf h-8 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-ink">Known Allergies</Label>
                  <Input
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts"
                    className="text-xs bg-surf h-8"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRegisterOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-brand hover:bg-brand/90 text-primary-foreground text-xs"
                  >
                    Complete Registration
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 4 Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Registered Today
                </div>
                <div className="text-2xl font-bold text-ink mt-0.5">{patients.length}</div>
                <div className="text-[10px] text-ink/45 mt-0.5">All UHIDs active</div>
              </div>
              <div className="size-9 rounded-md bg-brand/10 text-brand grid place-items-center">
                <ClipboardList className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  OPD Queue Waiting
                </div>
                <div className="text-2xl font-bold text-warn mt-0.5">
                  {patients.filter((p) => p.status === "Waiting").length}
                </div>
                <div className="text-[10px] text-ink/45 mt-0.5">Dr. Ananya Sharma</div>
              </div>
              <div className="size-9 rounded-md bg-warn/15 text-warn grid place-items-center">
                <Clock className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Beds Occupied
                </div>
                <div className="text-2xl font-bold text-calm mt-0.5">4 / 12</div>
                <div className="text-[10px] text-ink/45 mt-0.5">Ward 3B & 2A</div>
              </div>
              <div className="size-9 rounded-md bg-calm/15 text-calm grid place-items-center">
                <Bed className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-ink/60 uppercase font-mono">
                  Appointments
                </div>
                <div className="text-2xl font-bold text-ink mt-0.5">18</div>
                <div className="text-[10px] text-ink/45 mt-0.5">Today & tomorrow</div>
              </div>
              <div className="size-9 rounded-md bg-brand/10 text-brand grid place-items-center">
                <Calendar className="size-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Registry Table */}
        <Card className="border-border bg-card shadow-2xs overflow-hidden">
          <CardHeader className="p-3.5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <CardTitle className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
                Hospital Master Directory
              </CardTitle>
              <p className="text-xs text-ink/50">
                Real-time status across OPD, Lab, Pharmacy & Ward
              </p>
            </div>

            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by UHID, name, phone..."
                className="h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-surf focus:outline-none focus:border-brand w-56 font-mono"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surf/80 text-[10px] font-mono uppercase tracking-wider text-ink/50 border-b border-border">
                <tr>
                  <th className="p-2.5 pl-3.5">UHID & Name</th>
                  <th className="p-2.5">Demographics</th>
                  <th className="p-2.5">Contact</th>
                  <th className="p-2.5">Current Department</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 pr-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-surf/40 transition-colors">
                    <td className="p-2.5 pl-3.5">
                      <div className="font-semibold text-ink">{patient.name}</div>
                      <div className="font-mono text-[10px] text-brand">{patient.id}</div>
                    </td>
                    <td className="p-2.5 font-mono text-ink/70">
                      {patient.age}y · {patient.gender} · {patient.bloodGroup}
                    </td>
                    <td className="p-2.5 font-mono text-ink/70">{patient.phone}</td>
                    <td className="p-2.5 text-ink/70">{patient.currentDepartment}</td>
                    <td className="p-2.5">
                      <Badge
                        className={`text-[10px] font-mono ${
                          patient.status === "Waiting"
                            ? "bg-warn/15 text-warn border-warn/30"
                            : patient.status === "In Consultation"
                              ? "bg-calm/15 text-calm border-calm/30"
                              : "bg-brand/15 text-brand border-brand/30"
                        }`}
                      >
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="p-2.5 pr-3.5 text-right">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2.5 border-border bg-surf"
                      >
                        <Link to="/doctor/patient/$id" params={{ id: patient.id }}>
                          View Chart <ArrowRight className="size-3 ml-1" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
