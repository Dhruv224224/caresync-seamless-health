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

interface CareSyncState {
  currentRole: Role;
  currentUser: UserProfile;
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

function getInitialState(): CareSyncState {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state:", e);
      }
    }
  }
  return {
    currentRole: "doctor",
    currentUser: DEMO_USERS.doctor,
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

  const addPatient = (patientData: Omit<Patient, "id" | "registeredAt">) => {
    const id = `CS-${String(globalState.patients.length + 1).padStart(3, "0")}`;
    const newPatient: Patient = {
      ...patientData,
      id,
      registeredAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const initialTimeline: TimelineEvent = {
      id: `EV-${Date.now()}`,
      patientId: id,
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
        [id]: [initialTimeline],
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

  const addPrescription = (
    prescription: Omit<Prescription, "id" | "createdAt" | "status">,
  ) => {
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
        p.id === prescriptionId
          ? { ...p, status: "Dispensed", dispensedAt: "Just now" }
          : p,
      ),
      notifications: [notif, ...globalState.notifications],
      timelines: {
        ...globalState.timelines,
        [rx.patientId]: [timelineEntry, ...existingTimeline],
      },
    };
    notify();
  };

  const addTestOrder = (
    order: Omit<TestOrder, "id" | "orderedAt" | "status">,
  ) => {
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
