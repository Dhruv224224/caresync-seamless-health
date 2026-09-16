import { useState, useEffect } from "react";
import {
  Patient,
  UserProfile,
  VitalSign,
  Prescription,
  TestOrder,
  MedicineInventory,
  SurgeryRecord,
  TimelineEvent,
  HospitalNotification,
  Role,
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
function mapDbPatientToPatient(row: Record<string, any>): Patient {
  return {
    id: row.id,
    name: row.full_name || row.name || "Unknown Patient",
    age: Number(row.age) || 0,
    gender: (row.gender as "Male" | "Female" | "Other") || "Male",
    bloodGroup: row.blood_group || "O+",
    phone: row.phone || "",
    address: row.address || "",
    allergies: Array.isArray(row.allergies) ? row.allergies : row.allergies ? [row.allergies] : [],
    medicalHistory: Array.isArray(row.medical_history)
      ? row.medical_history
      : row.medical_history
        ? [row.medical_history]
        : [],
    status: (row.status as Patient["status"]) || "Waiting",
    currentDepartment: row.current_department || "Outpatient Clinic",
    assignedDoctor: row.assigned_doctor || "Dr. Ananya Sharma",
    bedNumber: row.bed_number,
    roomNumber: row.room_number,
    registeredAt: row.created_at
      ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Just now",
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
      return data.map(mapDbPatientToPatient);
    }
    return [];
  } catch (err) {
    console.error("[CareSync Store] Unexpected error fetching patients:", err);
    return [];
  }
}

// Helper to load user profile from profiles table with fallback
export async function fetchUserProfile(userId: string, userEmail?: string, metadata?: Record<string, any>): Promise<UserProfile> {
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
      const rawRole = (data.role || "").toLowerCase();
      const validRole: Role = ["doctor", "receptionist", "nurse", "lab", "pharmacy", "patient"].includes(rawRole)
        ? (rawRole as Role)
        : "patient";

      return {
        id: data.id,
        name: data.full_name || metadata?.full_name || userEmail?.split("@")[0] || "Authenticated User",
        email: userEmail || "",
        role: validRole,
        title: data.title || `${validRole.charAt(0).toUpperCase() + validRole.slice(1)} Workspace`,
        department: data.department || "Hospital Main Facility",
        avatar_url: data.avatar_url,
      };
    }
  } catch (e) {
    console.error("[CareSync Store] Failed to load profile:", e);
  }

  // If profiles row not created yet (e.g. trigger delay or new auth user), default to patient role
  const defaultRole: Role = (metadata?.role as Role) || "patient";
  return {
    id: userId,
    name: metadata?.full_name || userEmail?.split("@")[0] || "User",
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
        session.user.user_metadata
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
          session.user.user_metadata
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
          const profile = await fetchUserProfile(data.user.id, data.user.email, data.user.user_metadata);
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
    } catch (err: any) {
      return { success: false, error: err.message || "Sign up failed" };
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
        const profile = await fetchUserProfile(data.user.id, data.user.email, data.user.user_metadata);
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
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to sign in" };
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

  const addPatient = async (patientData: Omit<Patient, "id" | "registeredAt">): Promise<Patient> => {
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

    // 1. Optimistically update local store
    globalState = {
      ...globalState,
      patients: [newPatient, ...globalState.patients],
      timelines: {
        ...globalState.timelines,
        [fallbackId]: [initialTimeline],
      },
    };
    notify();

    // 2. Persist to Supabase `patients` table
    try {
      const dbPayload = {
        full_name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        blood_group: patientData.bloodGroup,
        phone: patientData.phone,
        address: patientData.address,
        allergies: patientData.allergies,
        medical_history: patientData.medicalHistory,
        status: patientData.status,
      };

      const { data, error } = await supabase
        .from("patients")
        .insert([dbPayload])
        .select();

      if (error) {
        console.warn("[CareSync Store] Supabase patient insert notice:", error.message);
      } else if (data && data[0]) {
        const createdRow = data[0];
        const assignedId = createdRow.id || fallbackId;
        const mapped = mapDbPatientToPatient(createdRow);
        
        globalState = {
          ...globalState,
          patients: globalState.patients.map((p) => (p.id === fallbackId ? mapped : p)),
          timelines: {
            ...globalState.timelines,
            [assignedId]: [initialTimeline],
          },
        };
        notify();
        return mapped;
      }
    } catch (err) {
      console.error("[CareSync Store] Failed to save patient to Supabase:", err);
    }

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

    supabase
      .from("patients")
      .update({ status })
      .eq("id", patientId)
      .then(({ error }) => {
        if (error) console.warn("[CareSync Store] Supabase status update notice:", error.message);
      })
      .catch((e) => console.warn(e));
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

  const addPrescription = (prescription: Omit<Prescription, "id" | "createdAt" | "status">) => {
    const id = `RX-${Math.floor(100 + Math.random() * 900)}`;
    const newPrescription: Prescription = {
      ...prescription,
      id,
      status: "Pending",
      createdAt: "Just now",
    };

    const timelineEntry: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: prescription.patientId,
      title: `Digital Prescription Created (${id})`,
      department: "OPD / Doctor",
      description: `${prescription.items.length} medicines prescribed. Order dispatched to Pharmacy.`,
      timestamp: "Just now",
      actor: prescription.doctorName,
      status: "completed",
      iconType: "pharmacy",
    };

    const notif: HospitalNotification = {
      id: `NOTIF-${Date.now()}`,
      title: "New Prescription Queued",
      message: `Prescription ${id} for ${prescription.patientName} received for dispensing.`,
      targetRole: "pharmacy",
      patientId: prescription.patientId,
      timestamp: "Just now",
      read: false,
      type: "prescription",
    };

    const existingTimeline = globalState.timelines[prescription.patientId] || [];

    globalState = {
      ...globalState,
      prescriptions: [newPrescription, ...globalState.prescriptions],
      notifications: [notif, ...globalState.notifications],
      timelines: {
        ...globalState.timelines,
        [prescription.patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();
  };

  const dispensePrescription = (prescriptionId: string) => {
    const rx = globalState.prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;

    const timelineEntry: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: rx.patientId,
      title: `Medicines Dispensed (${rx.id})`,
      department: "Pharmacy",
      description: "Prescribed medication dispensed and counseling provided to patient.",
      timestamp: "Just now",
      actor: globalState.currentUser.name,
      status: "completed",
      iconType: "pharmacy",
    };

    const notif: HospitalNotification = {
      id: `NOTIF-${Date.now()}`,
      title: "Medication Dispensed",
      message: `Prescription ${rx.id} for ${rx.patientName} has been dispensed.`,
      targetRole: "doctor",
      patientId: rx.patientId,
      timestamp: "Just now",
      read: false,
      type: "prescription",
    };

    const existingTimeline = globalState.timelines[rx.patientId] || [];

    globalState = {
      ...globalState,
      prescriptions: globalState.prescriptions.map((p) =>
        p.id === prescriptionId ? { ...p, status: "Dispensed", dispensedAt: "Just now" } : p,
      ),
      notifications: [notif, ...globalState.notifications],
      timelines: {
        ...globalState.timelines,
        [rx.patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();
  };

  const addTestOrder = (order: Omit<TestOrder, "id" | "orderedAt" | "status">) => {
    const id = `LAB-${Math.floor(800 + Math.random() * 200)}`;
    const newOrder: TestOrder = {
      ...order,
      id,
      status: "Pending",
      orderedAt: "Just now",
    };

    const timelineEntry: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: order.patientId,
      title: `Diagnostic Test Ordered: ${order.testName}`,
      department: "Laboratory",
      description: `Requisition ${id} routed to central diagnostic lab.`,
      timestamp: "Just now",
      actor: order.doctorName,
      status: "completed",
      iconType: "lab",
    };

    const notif: HospitalNotification = {
      id: `NOTIF-${Date.now()}`,
      title: "New Diagnostic Request",
      message: `${order.testName} requested for ${order.patientName} by ${order.doctorName}.`,
      targetRole: "lab",
      patientId: order.patientId,
      timestamp: "Just now",
      read: false,
      type: "order",
    };

    const existingTimeline = globalState.timelines[order.patientId] || [];

    globalState = {
      ...globalState,
      testOrders: [newOrder, ...globalState.testOrders],
      notifications: [notif, ...globalState.notifications],
      timelines: {
        ...globalState.timelines,
        [order.patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();
  };

  const updateTestOrderStatus = (
    orderId: string,
    status: TestOrder["status"],
    results?: TestOrder["results"],
    labNotes?: string,
  ) => {
    const order = globalState.testOrders.find((o) => o.id === orderId);
    if (!order) return;

    let updatedTimeline = globalState.timelines[order.patientId] || [];

    if (status === "Completed") {
      const timelineEntry: TimelineEvent = {
        id: `EV-${Date.now()}`,
        patientId: order.patientId,
        title: `Test Completed: ${order.testName}`,
        department: "Laboratory",
        description: `Results validated and signed off by ${globalState.currentUser.name}.`,
        timestamp: "Just now",
        actor: globalState.currentUser.name,
        status: "completed",
        iconType: "lab",
      };
      updatedTimeline = [timelineEntry, ...updatedTimeline];

      const notif: HospitalNotification = {
        id: `NOTIF-${Date.now()}`,
        title: `Test Result Available: ${order.testName}`,
        message: `Verified report for ${order.patientName} is ready for review.`,
        targetRole: "doctor",
        patientId: order.patientId,
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
        [order.patientId]: updatedTimeline,
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
    addPrescription,
    dispensePrescription,
    addTestOrder,
    updateTestOrderStatus,
    updateSurgeryMilestone,
    markNotificationRead,
    resetToDefault,
  };
};
