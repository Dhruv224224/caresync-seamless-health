import { useState, useEffect } from "react";
import {
  Patient,
  UserProfile,
  VitalSign,
  Prescription,
  PrescriptionItem,
  TestOrder,
  MedicineInventory,
  SurgeryRecord,
  TimelineEvent,
  HospitalNotification,
  Role,
  DbVisit,
} from "@/types/caresync";
import {
  DEMO_USERS,
  INITIAL_PATIENTS,
  INITIAL_VITALS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_TEST_ORDERS,
  INITIAL_MEDICINES,
  INITIAL_SURGERIES,
  INITIAL_TIMELINES,
  INITIAL_NOTIFICATIONS,
} from "./mockData";
import { supabase } from "./supabase";

export interface CareSyncState {
  currentRole: Role;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  authUserId: string | null;
  authLoading: boolean;
  patients: Patient[];
  vitals: VitalSign[];
  prescriptions: Prescription[];
  testOrders: TestOrder[];
  medicines: MedicineInventory[];
  surgeries: SurgeryRecord[];
  timelines: Record<string, TimelineEvent[]>;
  notifications: HospitalNotification[];
}

const STORAGE_KEY = "caresync_store_state_v1";

export function getRoleHomePath(role: Role): string {
  switch (role) {
    case "patient":
      return "/patient/dashboard";
    case "receptionist":
      return "/receptionist/dashboard";
    case "doctor":
      return "/doctor/dashboard";
    case "nurse":
      return "/nurse/dashboard";
    case "lab":
      return "/lab/dashboard";
    case "pharmacy":
      return "/pharmacy/dashboard";
    default:
      return "/patient/dashboard";
  }
}

function getInitialState(): CareSyncState {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          authLoading: true,
        };
      } catch (e) {
        console.error("Failed to parse saved state:", e);
      }
    }
  }
  return {
    currentRole: "doctor",
    currentUser: DEMO_USERS.doctor,
    isAuthenticated: false,
    authUserId: null,
    authLoading: true,
    patients: INITIAL_PATIENTS,
    vitals: INITIAL_VITALS,
    prescriptions: INITIAL_PRESCRIPTIONS,
    testOrders: INITIAL_TEST_ORDERS,
    medicines: INITIAL_MEDICINES,
    surgeries: INITIAL_SURGERIES,
    timelines: INITIAL_TIMELINES,
    notifications: INITIAL_NOTIFICATIONS,
  };
}

let globalState: CareSyncState = getInitialState();
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  }
  listeners.forEach((l) => l());
}

// Convert Supabase patient row to frontend Patient type
function mapDbPatientToPatient(row: Record<string, unknown>): Patient {
  const rowId = String(row["id"] || "");
  const fullName = String(row["full_name"] || row["name"] || "Unknown Patient");
  const age = Number(row["age"]) || 0;
  const gender = (row["gender"] as "Male" | "Female" | "Other") || "Male";
  const bloodGroup = String(row["blood_group"] || "O+");
  const phone = String(row["phone"] || "");
  const address = String(row["address"] || "");
  const rawAllergies = row["allergies"];
  const allergies: string[] = Array.isArray(rawAllergies)
    ? (rawAllergies as string[])
    : rawAllergies
      ? [String(rawAllergies)]
      : [];
  const rawMedHistory = row["medical_history"];
  const medicalHistory: string[] = Array.isArray(rawMedHistory)
    ? (rawMedHistory as string[])
    : rawMedHistory
      ? [String(rawMedHistory)]
      : [];
  const status = (row["status"] as Patient["status"]) || "Waiting";
  const currentDepartment = String(row["current_department"] || "Outpatient Clinic");
  const assignedDoctor = String(row["assigned_doctor"] || "Dr. Ananya Sharma");
  const bedNumber = row["bed_number"] ? String(row["bed_number"]) : undefined;
  const roomNumber = row["room_number"] ? String(row["room_number"]) : undefined;
  const createdAt = row["created_at"];
  const registeredAt = createdAt
    ? new Date(String(createdAt)).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  return {
    id: rowId,
    name: fullName,
    age,
    gender,
    bloodGroup,
    phone,
    address,
    allergies,
    medicalHistory,
    status,
    currentDepartment,
    assignedDoctor,
    ...(bedNumber ? { bedNumber } : {}),
    ...(roomNumber ? { roomNumber } : {}),
    registeredAt,
  };
}

// Helper to fetch live patients from Supabase
async function fetchSupabasePatients(): Promise<Patient[]> {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[CareSync Store] Error fetching patients from Supabase:", error.message);
      return [];
    }
    if (data && data.length > 0) {
      return (data as Record<string, unknown>[]).map(mapDbPatientToPatient);
    }
    return [];
  } catch (err) {
    console.error("[CareSync Store] Unexpected error fetching patients:", err);
    return [];
  }
}

// Helper to load user profile from profiles table with fallback
export async function fetchUserProfile(
  userId: string,
  userEmail?: string,
  metadata?: Record<string, unknown>,
): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[CareSync Store] Error fetching profile from Supabase:", error.message);
    }

    if (data) {
      const dataRec = data as Record<string, unknown>;
      const rawRole = String(dataRec["role"] || "").toLowerCase();
      const validRole: Role = [
        "doctor",
        "receptionist",
        "nurse",
        "lab",
        "pharmacy",
        "patient",
      ].includes(rawRole)
        ? (rawRole as Role)
        : "patient";

      const title = dataRec["title"]
        ? String(dataRec["title"])
        : `${validRole.charAt(0).toUpperCase() + validRole.slice(1)} Workspace`;
      const department = dataRec["department"] ? String(dataRec["department"]) : "Hospital Main Facility";
      const avatarUrl = dataRec["avatar_url"] ? String(dataRec["avatar_url"]) : undefined;

      return {
        id: String(dataRec["id"] || userId),
        name:
          String(dataRec["full_name"] || metadata?.["full_name"] || userEmail?.split("@")[0] || "Authenticated User"),
        email: userEmail || "",
        role: validRole,
        title,
        department,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      };
    }
  } catch (e) {
    console.error("[CareSync Store] Failed to load profile:", e);
  }

  // If profiles row not created yet (e.g. trigger delay or new auth user), default to patient role
  const defaultRole: Role = (metadata?.["role"] as Role) || "patient";
  return {
    id: userId,
    name: String(metadata?.["full_name"] || userEmail?.split("@")[0] || "User"),
    email: userEmail || "",
    role: defaultRole,
    title: `${defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)} Workspace`,
  };
}

// Synchronize session on application load
let initialized = false;
async function initializeSupabaseAuth() {
  if (initialized) return;
  initialized = true;

  try {
    // 1. Check existing active session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const profile = await fetchUserProfile(
        session.user.id,
        session.user.email,
        session.user.user_metadata,
      );
      globalState = {
        ...globalState,
        isAuthenticated: true,
        authUserId: session.user.id,
        currentRole: profile.role,
        currentUser: profile,
        authLoading: false,
      };
    } else {
      globalState = {
        ...globalState,
        isAuthenticated: false,
        authUserId: null,
        authLoading: false,
      };
    }

    // 2. Fetch remote patients & merge with initial template
    const remotePatients = await fetchSupabasePatients();
    if (remotePatients.length > 0) {
      const existingIds = new Set(remotePatients.map((p) => p.id));
      const remainingInitial = INITIAL_PATIENTS.filter((p) => !existingIds.has(p.id));
      globalState = {
        ...globalState,
        patients: [...remotePatients, ...remainingInitial],
      };
    }

    notify();

    // 3. React to auth state changes (SignIn, SignOut, TokenRefresh)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata,
        );
        globalState = {
          ...globalState,
          isAuthenticated: true,
          authUserId: session.user.id,
          currentRole: profile.role,
          currentUser: profile,
          authLoading: false,
        };
      } else if (event === "SIGNED_OUT" || !session) {
        globalState = {
          ...globalState,
          isAuthenticated: false,
          authUserId: null,
          currentUser: DEMO_USERS.doctor,
          currentRole: "doctor",
          authLoading: false,
        };
      }
      notify();
    });
  } catch (err) {
    console.error("[CareSync Store] Supabase auth init failed:", err);
    globalState = {
      ...globalState,
      authLoading: false,
    };
    notify();
  }
}

// Start auth listener on load
if (typeof window !== "undefined") {
  initializeSupabaseAuth();
}

export const useCareSync = () => {
  const [state, setState] = useState<CareSyncState>(globalState);

  useEffect(() => {
    const listener = () => setState({ ...globalState });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setRole = (role: Role) => {
    globalState = {
      ...globalState,
      currentRole: role,
      currentUser: DEMO_USERS[role],
    };
    notify();
  };

  const signUpWithSupabase = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ): Promise<{ success: boolean; role?: Role; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || "",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // If session was returned immediately (email confirmation disabled in Supabase)
        if (data.session) {
          const profile = await fetchUserProfile(
            data.user.id,
            data.user.email,
            data.user.user_metadata,
          );
          globalState = {
            ...globalState,
            isAuthenticated: true,
            authUserId: data.user.id,
            currentRole: profile.role,
            currentUser: profile,
            authLoading: false,
          };
          notify();
          return { success: true, role: profile.role };
        }
        return { success: true, role: "patient" };
      }
      return { success: true, role: "patient" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      return { success: false, error: msg };
    }
  };

  const loginWithSupabase = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; role?: Role; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchUserProfile(
          data.user.id,
          data.user.email,
          data.user.user_metadata,
        );
        globalState = {
          ...globalState,
          isAuthenticated: true,
          authUserId: data.user.id,
          currentRole: profile.role,
          currentUser: profile,
          authLoading: false,
        };
        notify();
        return { success: true, role: profile.role };
      }
      return { success: true, role: "doctor" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    globalState = {
      ...globalState,
      isAuthenticated: false,
      authUserId: null,
      currentRole: "doctor",
      currentUser: DEMO_USERS.doctor,
    };
    notify();
  };

  const refreshPatients = async () => {
    const remote = await fetchSupabasePatients();
    if (remote.length > 0) {
      const existingIds = new Set(remote.map((p) => p.id));
      const remaining = globalState.patients.filter((p) => !existingIds.has(p.id));
      globalState = {
        ...globalState,
        patients: [...remote, ...remaining],
      };
      notify();
    }
  };

  const addPatient = async (
    patientData: Omit<Patient, "id" | "registeredAt">,
  ): Promise<Patient> => {
    // 1. Attempt database insert first so real generated patient_code / ID is returned
    try {
      const dbPayload = {
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        blood_group: patientData.bloodGroup,
        phone: patientData.phone,
        address: patientData.address,
        allergies: patientData.allergies,
        medical_history: patientData.medicalHistory,
        status: patientData.status || "Waiting",
        current_department: patientData.currentDepartment || "Outpatient Clinic",
        assigned_doctor: patientData.assignedDoctor || "Dr. Ananya Sharma",
      };

      const { data, error } = await supabase
        .from("patients")
        .insert([dbPayload])
        .select();

      if (error) {
        console.warn("[CareSync Store] Supabase patient insert notice:", error.message);
      } else if (data && data[0]) {
        const createdRow = data[0];
        const createdPatient = mapDbPatientToPatient(createdRow);

        const initialTimeline: TimelineEvent = {
          id: `EV-${Date.now()}`,
          patientId: createdPatient.id,
          title: "Patient Registered",
          department: "Reception",
          description: `Patient checked in by ${globalState.currentUser.name}. UHID ${createdPatient.id} issued.`,
          timestamp: "Just now",
          actor: globalState.currentUser.name,
          status: "completed",
          iconType: "registration",
        };

        // Persist timeline event to Supabase
        try {
          await supabase.from("patient_timeline").insert([{
            patient_id: createdPatient.id,
            title: initialTimeline.title,
            department: initialTimeline.department,
            description: initialTimeline.description,
            actor: initialTimeline.actor,
            status: initialTimeline.status,
            icon_type: initialTimeline.iconType,
          }]);
        } catch (e) {
          console.warn("[CareSync Store] Timeline insert notice:", e);
        }

        globalState = {
          ...globalState,
          patients: [createdPatient, ...globalState.patients.filter((p) => p.id !== createdPatient.id)],
          timelines: {
            ...globalState.timelines,
            [createdPatient.id]: [initialTimeline],
          },
        };
        notify();
        return createdPatient;
      }
    } catch (err) {
      console.error("[CareSync Store] Failed to save patient to Supabase:", err);
    }

    // Fallback if offline or demo mode
    const nextNum = globalState.patients.length + 1;
    const fallbackId = `CS-${String(nextNum).padStart(3, "0")}`;
    const newPatient: Patient = {
      ...patientData,
      id: fallbackId,
      registeredAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const initialTimeline: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: fallbackId,
      title: "Patient Registered",
      department: "Reception",
      description: `Patient checked in by ${globalState.currentUser.name}.`,
      timestamp: "Just now",
      actor: globalState.currentUser.name,
      status: "completed",
      iconType: "registration",
    };

    globalState = {
      ...globalState,
      patients: [newPatient, ...globalState.patients],
      timelines: {
        ...globalState.timelines,
        [fallbackId]: [initialTimeline],
      },
    };
    notify();
    return newPatient;
  };

  const updatePatientStatus = (
    patientId: string,
    status: Patient["status"],
    department?: string,
  ) => {
    globalState = {
      ...globalState,
      patients: globalState.patients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status,
              currentDepartment: department || p.currentDepartment,
            }
          : p,
      ),
    };
    notify();

    void (async () => {
      try {
        const updateObj: Record<string, unknown> = { status };
        if (department) updateObj["current_department"] = department;
        const { error } = await supabase
          .from("patients")
          .update(updateObj)
          .eq("id", patientId);
        if (error) console.warn("[CareSync Store] Supabase status update notice:", error.message);
      } catch (e) {
        console.warn(e);
      }
    })();
  };

  const addVital = (vital: Omit<VitalSign, "id" | "recordedAt" | "recordedBy">) => {
    const newVital: VitalSign = {
      ...vital,
      id: `VIT-${Date.now()}`,
      recordedAt: "Just now",
      recordedBy: globalState.currentUser.name,
    };

    const timelineEntry: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: vital.patientId,
      title: "Vitals Recorded",
      department: "Nursing",
      description: `BP: ${vital.bloodPressure}, Pulse: ${vital.pulse}, SpO2: ${vital.spO2}, Temp: ${vital.temperature}`,
      timestamp: "Just now",
      actor: globalState.currentUser.name,
      status: "completed",
      iconType: "nurse",
    };

    const existingTimeline = globalState.timelines[vital.patientId] || [];

    globalState = {
      ...globalState,
      vitals: [newVital, ...globalState.vitals],
      timelines: {
        ...globalState.timelines,
        [vital.patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();
  };

  const addVisit = async (
    visit: Omit<DbVisit, "id" | "created_at" | "visit_date"> & { visit_date?: string },
  ): Promise<DbVisit> => {
    let createdVisit: DbVisit | null = null;
    try {
      const { data, error } = await supabase
        .from("visits")
        .insert([
          {
            patient_id: visit.patient_id || (visit as any).patientId,
            doctor_id: visit.doctor_id || (visit as any).doctorId,
            doctor_name: visit.doctor_name || (visit as any).doctorName,
            visit_date: visit.visit_date || new Date().toISOString(),
            chief_complaint: visit.chief_complaint || (visit as any).chiefComplaint || "",
            clinical_notes: visit.clinical_notes || (visit as any).clinicalNotes || "",
            diagnosis: visit.diagnosis || "",
            treatment_plan: visit.treatment_plan || (visit as any).treatmentPlan || "",
          },
        ])
        .select()
        .single();

      if (!error && data) {
        createdVisit = data as DbVisit;
      } else if (error) {
        console.warn("[CareSync Store] Supabase visit insert notice:", error.message);
      }
    } catch (e) {
      console.warn("[CareSync Store] Visit insert error:", e);
    }

    const patientId = visit.patient_id || (visit as any).patientId;
    const doctorName = visit.doctor_name || (visit as any).doctorName || globalState.currentUser.name;
    const diagnosis = visit.diagnosis || "Clinical Review";

    const fallbackVisit: DbVisit = createdVisit || {
      id: `VISIT-${Date.now()}`,
      patient_id: patientId,
      doctor_id: visit.doctor_id || (visit as any).doctorId || globalState.currentUser.id,
      doctor_name: doctorName,
      visit_date: new Date().toISOString(),
      chief_complaint: visit.chief_complaint || (visit as any).chiefComplaint || "",
      clinical_notes: visit.clinical_notes || (visit as any).clinicalNotes || "",
      diagnosis: diagnosis,
      treatment_plan: visit.treatment_plan || (visit as any).treatmentPlan || "",
    };

    const timelineEntry: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: patientId,
      title: `Consultation Completed: ${diagnosis}`,
      department: "Doctor OPD",
      description: `Seen by ${doctorName}. Diagnosis: ${diagnosis}.`,
      timestamp: "Just now",
      actor: doctorName,
      status: "completed",
      iconType: "consultation",
    };

    try {
      await supabase.from("patient_timeline").insert([
        {
          patient_id: patientId,
          title: timelineEntry.title,
          department: timelineEntry.department,
          description: timelineEntry.description,
          actor: timelineEntry.actor,
          status: timelineEntry.status,
          icon_type: timelineEntry.iconType,
        },
      ]);
    } catch (e) {
      console.warn("[CareSync Store] Timeline insert notice:", e);
    }

    const existingTimeline = globalState.timelines[patientId] || [];
    globalState = {
      ...globalState,
      timelines: {
        ...globalState.timelines,
        [patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();

    return fallbackVisit;
  };

  const addPrescription = async (
    prescriptionData: {
      patientId: string;
      patientName: string;
      doctorId: string;
      doctorName: string;
      items: { medicine: string; dosage: string; frequency: string; duration: string; instructions: string }[];
      notes?: string;
    },
  ): Promise<Prescription> => {
    let createdPrescription: Prescription | null = null;
    try {
      const rxPayload = {
        patient_id: prescriptionData.patientId,
        patient_name: prescriptionData.patientName,
        doctor_id: prescriptionData.doctorId,
        doctor_name: prescriptionData.doctorName,
        status: "Pending",
        notes: prescriptionData.notes || "",
      };

      const { data: rxData, error: rxError } = await supabase
        .from("prescriptions")
        .insert([rxPayload])
        .select()
        .single();

      if (!rxError && rxData) {
        const itemsPayload = prescriptionData.items.map((it) => ({
          prescription_id: rxData.id,
          medicine_name: it.medicine,
          dosage: it.dosage,
          frequency: it.frequency,
          duration: it.duration,
          instructions: it.instructions,
        }));

        const { data: itemsData } = await supabase
          .from("prescription_items")
          .insert(itemsPayload)
          .select();

        const mappedItems: PrescriptionItem[] = (itemsData || prescriptionData.items).map((i: any, idx: number) => ({
          id: String(i.id || `ITEM-${idx}`),
          medicine: String(i.medicine_name || i.medicine),
          dosage: String(i.dosage),
          frequency: String(i.frequency),
          duration: String(i.duration),
          instructions: String(i.instructions),
        }));

        createdPrescription = {
          id: String(rxData.id),
          patientId: prescriptionData.patientId,
          patientName: prescriptionData.patientName,
          doctorId: prescriptionData.doctorId,
          doctorName: prescriptionData.doctorName,
          status: "Pending",
          createdAt: "Just now",
          items: mappedItems,
          notes: prescriptionData.notes,
        };
      }
    } catch (e) {
      console.warn("[CareSync Store] Prescription insert error:", e);
    }

    const fallbackPrescription: Prescription = createdPrescription || {
      id: `RX-${Date.now()}`,
      patientId: prescriptionData.patientId,
      patientName: prescriptionData.patientName,
      doctorId: prescriptionData.doctorId,
      doctorName: prescriptionData.doctorName,
      status: "Pending",
      createdAt: "Just now",
      items: prescriptionData.items.map((it, idx) => ({ ...it, id: `ITEM-${Date.now()}-${idx}` })),
      notes: prescriptionData.notes,
    };

    const timelineEntry: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: prescriptionData.patientId,
      title: "Prescription Issued",
      department: "Doctor OPD",
      description: `${prescriptionData.items.length} medication(s) prescribed by ${prescriptionData.doctorName}. Routed to Dispensary.`,
      timestamp: "Just now",
      actor: prescriptionData.doctorName,
      status: "completed",
      iconType: "pharmacy",
    };

    const notif: HospitalNotification = {
      id: `NOTIF-${Date.now()}`,
      title: "New Prescription Received",
      message: `${prescriptionData.patientName}: ${prescriptionData.items.length} item(s) pending dispensing.`,
      targetRole: "pharmacy",
      patientId: prescriptionData.patientId,
      timestamp: "Just now",
      read: false,
      type: "prescription",
    };

    try {
      await supabase.from("patient_timeline").insert([
        {
          patient_id: prescriptionData.patientId,
          title: timelineEntry.title,
          department: timelineEntry.department,
          description: timelineEntry.description,
          actor: timelineEntry.actor,
          status: timelineEntry.status,
          icon_type: timelineEntry.iconType,
        },
      ]);
    } catch (e) {
      console.warn("[CareSync Store] Timeline insert notice:", e);
    }

    const existingTimeline = globalState.timelines[prescriptionData.patientId] || [];
    globalState = {
      ...globalState,
      prescriptions: [fallbackPrescription, ...globalState.prescriptions],
      notifications: [notif, ...globalState.notifications],
      timelines: {
        ...globalState.timelines,
        [prescriptionData.patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();

    return fallbackPrescription;
  };

  const dispensePrescription = async (prescriptionId: string) => {
    const rx = globalState.prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;

    try {
      await supabase
        .from("prescriptions")
        .update({ status: "Dispensed", dispensed_at: new Date().toISOString() })
        .eq("id", prescriptionId);
    } catch (e) {
      console.warn("[CareSync Store] Prescription dispense update notice:", e);
    }

    const timelineEntry: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: rx.patientId,
      title: "Medications Dispensed",
      department: "Pharmacy",
      description: `All items verified and handed over by ${globalState.currentUser.name}.`,
      timestamp: "Just now",
      actor: globalState.currentUser.name,
      status: "completed",
      iconType: "pharmacy",
    };

    try {
      await supabase.from("patient_timeline").insert([
        {
          patient_id: rx.patientId,
          title: timelineEntry.title,
          department: timelineEntry.department,
          description: timelineEntry.description,
          actor: timelineEntry.actor,
          status: timelineEntry.status,
          icon_type: timelineEntry.iconType,
        },
      ]);
    } catch (e) {
      console.warn("[CareSync Store] Timeline insert notice:", e);
    }

    const existingTimeline = globalState.timelines[rx.patientId] || [];
    globalState = {
      ...globalState,
      prescriptions: globalState.prescriptions.map((p) =>
        p.id === prescriptionId ? { ...p, status: "Dispensed", dispensedAt: "Just now" } : p,
      ),
      timelines: {
        ...globalState.timelines,
        [rx.patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();
  };

  const addTestOrder = async (
    orderData: {
      patientId: string;
      patientName: string;
      doctorName: string;
      testName: string;
      priority: "Routine" | "Urgent" | "Stat";
    },
  ): Promise<TestOrder> => {
    let createdOrder: TestOrder | null = null;
    try {
      const dbPayload = {
        patient_id: orderData.patientId,
        patient_name: orderData.patientName,
        doctor_name: orderData.doctorName,
        test_name: orderData.testName,
        priority: orderData.priority,
        status: "Pending",
      };

      const { data, error } = await supabase
        .from("test_orders")
        .insert([dbPayload])
        .select()
        .single();

      if (!error && data) {
        createdOrder = {
          id: String(data.id),
          patientId: String(data.patient_id),
          patientName: String(data.patient_name),
          doctorName: String(data.doctor_name),
          testName: String(data.test_name),
          priority: data.priority as "Routine" | "Urgent" | "Stat",
          status: data.status as "Pending" | "In Progress" | "Completed",
          orderedAt: "Just now",
        };
      }
    } catch (e) {
      console.warn("[CareSync Store] Test order insert notice:", e);
    }

    const fallbackOrder: TestOrder = createdOrder || {
      id: `ORD-${Date.now()}`,
      patientId: orderData.patientId,
      patientName: orderData.patientName,
      doctorName: orderData.doctorName,
      testName: orderData.testName,
      priority: orderData.priority,
      status: "Pending",
      orderedAt: "Just now",
    };

    const timelineEntry: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: orderData.patientId,
      title: `Diagnostic Ordered: ${orderData.testName}`,
      department: "Doctor OPD",
      description: `${orderData.priority} priority requisition placed by ${orderData.doctorName}. Routed to Central Lab.`,
      timestamp: "Just now",
      actor: orderData.doctorName,
      status: "completed",
      iconType: "lab",
    };

    const notif: HospitalNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `New Lab Requisition (${orderData.priority})`,
      message: `${orderData.patientName}: ${orderData.testName} ordered.`,
      targetRole: "lab",
      patientId: orderData.patientId,
      timestamp: "Just now",
      read: false,
      type: "order",
    };

    try {
      await supabase.from("patient_timeline").insert([
        {
          patient_id: orderData.patientId,
          title: timelineEntry.title,
          department: timelineEntry.department,
          description: timelineEntry.description,
          actor: timelineEntry.actor,
          status: timelineEntry.status,
          icon_type: timelineEntry.iconType,
        },
      ]);
    } catch (e) {
      console.warn("[CareSync Store] Timeline insert notice:", e);
    }

    const existingTimeline = globalState.timelines[orderData.patientId] || [];
    globalState = {
      ...globalState,
      testOrders: [fallbackOrder, ...globalState.testOrders],
      notifications: [notif, ...globalState.notifications],
      timelines: {
        ...globalState.timelines,
        [orderData.patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();

    return fallbackOrder;
  };

  const updateTestOrderStatus = async (
    orderId: string,
    status: TestOrder["status"],
    results?: TestOrder["results"],
    labNotes?: string,
  ) => {
    try {
      const updatePayload: Record<string, unknown> = {
        status,
        ...(status === "Completed" ? { completed_at: new Date().toISOString() } : {}),
        ...(labNotes !== undefined ? { lab_notes: labNotes } : {}),
      };

      const { error } = await supabase
        .from("test_orders")
        .update(updatePayload)
        .eq("id", orderId);

      if (error) {
        console.warn("[CareSync Store] Supabase test_orders status update notice:", error.message);
      }
    } catch (e) {
      console.warn("[CareSync Store] test_orders update error:", e);
    }

    const order = globalState.testOrders.find((o) => o.id === orderId);
    const patientId = order?.patientId || "CS-001";
    const patientName = order?.patientName || "Patient";
    const testName = order?.testName || "Diagnostic Test";

    let updatedTimeline = globalState.timelines[patientId] || [];

    if (status === "Completed") {
      const timelineEntry: TimelineEvent = {
        id: `EV-${Date.now()}`,
        patientId,
        title: `Test Completed: ${testName}`,
        department: "Laboratory",
        description: `Results validated and signed off by ${globalState.currentUser.name}.`,
        timestamp: "Just now",
        actor: globalState.currentUser.name,
        status: "completed",
        iconType: "lab",
      };
      updatedTimeline = [timelineEntry, ...updatedTimeline];

      try {
        await supabase.from("patient_timeline").insert([
          {
            patient_id: patientId,
            title: timelineEntry.title,
            department: timelineEntry.department,
            description: timelineEntry.description,
            actor: timelineEntry.actor,
            status: timelineEntry.status,
            icon_type: timelineEntry.iconType,
          },
        ]);
      } catch (e) {
        console.warn("[CareSync Store] Timeline insert notice:", e);
      }

      const notif: HospitalNotification = {
        id: `NOTIF-${Date.now()}`,
        title: `Test Result Available: ${testName}`,
        message: `Verified report for ${patientName} is ready for review.`,
        targetRole: "doctor",
        patientId,
        timestamp: "Just now",
        read: false,
        type: "result",
      };
      globalState.notifications = [notif, ...globalState.notifications];
    }

    globalState = {
      ...globalState,
      testOrders: globalState.testOrders.map((o) => {
        if (o.id !== orderId) return o;
        const updated: TestOrder = {
          ...o,
          status,
          ...(status === "Completed" ? { completedAt: "Just now" } : {}),
          ...(results !== undefined ? { results } : {}),
          ...(labNotes !== undefined ? { labNotes } : {}),
        };
        return updated;
      }),
      timelines: {
        ...globalState.timelines,
        [patientId]: updatedTimeline,
      },
    };
    notify();
  };

  const updateSurgeryMilestone = (
    surgeryId: string,
    milestoneIndex: number,
    newStatus: "completed" | "in_progress" | "pending",
  ) => {
    const surgery = globalState.surgeries.find((s) => s.id === surgeryId);
    if (!surgery || !surgery.milestones[milestoneIndex]) return;

    const currentItem = surgery.milestones[milestoneIndex];
    const updatedItem = {
      title: currentItem.title,
      status: newStatus,
      ...(newStatus === "completed" ? { timestamp: "Just now" } : {}),
    };

    const updatedMilestones = [...surgery.milestones];
    updatedMilestones[milestoneIndex] = updatedItem;

    const notif: HospitalNotification = {
      id: `NOTIF-${Date.now()}`,
      title: "Surgery Milestone Updated",
      message: `${surgery.patientName}: ${updatedItem.title} (${newStatus})`,
      targetRole: "nurse",
      patientId: surgery.patientId,
      timestamp: "Just now",
      read: false,
      type: "surgery",
    };

    globalState = {
      ...globalState,
      surgeries: globalState.surgeries.map((s) =>
        s.id === surgeryId ? { ...s, milestones: updatedMilestones } : s,
      ),
      notifications: [notif, ...globalState.notifications],
    };
    notify();
  };

  const markNotificationRead = (notifId: string) => {
    globalState = {
      ...globalState,
      notifications: globalState.notifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n,
      ),
    };
    notify();
  };

  const resetToDefault = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    globalState = {
      currentRole: "doctor",
      currentUser: DEMO_USERS.doctor,
      isAuthenticated: false,
      authUserId: null,
      authLoading: false,
      patients: INITIAL_PATIENTS,
      vitals: INITIAL_VITALS,
      prescriptions: INITIAL_PRESCRIPTIONS,
      testOrders: INITIAL_TEST_ORDERS,
      medicines: INITIAL_MEDICINES,
      surgeries: INITIAL_SURGERIES,
      timelines: INITIAL_TIMELINES,
      notifications: INITIAL_NOTIFICATIONS,
    };
    notify();
  };

  return {
    ...state,
    setRole,
    signUpWithSupabase,
    loginWithSupabase,
    logout,
    refreshPatients,
    addPatient,
    updatePatientStatus,
    addVital,
    addVisit,
    addPrescription,
    dispensePrescription,
    addTestOrder,
    updateTestOrderStatus,
    updateSurgeryMilestone,
    markNotificationRead,
    resetToDefault,
  };
};

