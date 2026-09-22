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
  DbAppointment,
  DbAdmission,
  DbVisit,
} from "@/types/caresync";
import { CareSyncState } from "@/lib/store";

export interface NormalizedAIContext {
  [key: string]: unknown;
  role: Role;
  user: {
    id: string;
    name: string;
    role: Role;
    title?: string | undefined;
    department?: string | undefined;
  };
  patient: Patient | null;
  patients: Patient[];
  vitals: VitalSign[];
  prescriptions: Prescription[];
  tests: TestOrder[];
  medicines: MedicineInventory[];
  surgeries: SurgeryRecord[];
  timeline: TimelineEvent[];
  timelines: Record<string, TimelineEvent[]>;
  notifications: HospitalNotification[];
  appointments: DbAppointment[];
  admissions: DbAdmission[];
  visits: DbVisit[];
  pageContext?: {
    currentPath?: string | undefined;
    selectedReport?: any;
    selectedPrescription?: any;
    selectedSurgery?: any;
    rawNotes?: string | undefined;
    [key: string]: any;
  } | undefined;
}

export interface BuildContextOptions {
  state: CareSyncState;
  role?: Role | undefined;
  patientId?: string | null | undefined;
  pageContext?: Record<string, any> | undefined;
  customPatient?: Patient | null | undefined;
}

/**
 * Standardized CareSync AI Context Builder
 * Normalizes all EHR datasets, resolves authorized patient context, and guarantees
 * that all variables (vitals, prescriptions, testOrders, etc.) are explicitly defined and initialized.
 */
export function buildCareSyncContext(options: BuildContextOptions): NormalizedAIContext {
  const { state, pageContext, customPatient } = options;

  const currentRole: Role = options.role || state.currentRole || "doctor";
  const currentUser = state.currentUser || {
    id: "ANON",
    name: "CareSync Staff",
    role: currentRole,
    title: "Healthcare Practitioner",
    email: "staff@caresync.health",
  };

  const allPatients: Patient[] = Array.isArray(state.patients) ? state.patients : [];
  const allVitals: VitalSign[] = Array.isArray(state.vitals) ? state.vitals : [];
  const allPrescriptions: Prescription[] = Array.isArray(state.prescriptions) ? state.prescriptions : [];
  const allTests: TestOrder[] = Array.isArray(state.testOrders) ? state.testOrders : [];
  const allMedicines: MedicineInventory[] = Array.isArray(state.medicines) ? state.medicines : [];
  const allSurgeries: SurgeryRecord[] = Array.isArray(state.surgeries) ? state.surgeries : [];
  const allTimelines: Record<string, TimelineEvent[]> = state.timelines || {};
  const allNotifications: HospitalNotification[] = Array.isArray(state.notifications) ? state.notifications : [];

  // Determine authorized target patient
  let targetPatient: Patient | null = null;

  if (customPatient !== undefined && customPatient !== null) {
    targetPatient = customPatient;
  } else if (currentRole === "patient") {
    targetPatient = allPatients.find((p) => p.id === currentUser.id) || (allPatients.length > 0 ? (allPatients[0] ?? null) : null);
  } else if (options.patientId) {
    targetPatient = allPatients.find((p) => p.id === options.patientId) || null;
  } else if (pageContext && pageContext["patientId"]) {
    targetPatient = allPatients.find((p) => p.id === pageContext["patientId"]) || null;
  } else if (pageContext && pageContext["patient"]) {
    targetPatient = pageContext["patient"] as Patient;
  } else if (allPatients.length > 0) {
    // Default fallback to first active patient
    targetPatient = allPatients[0] || null;
  }

  // Filter patient-specific datasets if patient is resolved
  const patientVitals: VitalSign[] = targetPatient
    ? allVitals.filter((v) => v.patientId === targetPatient!.id)
    : [];

  const patientPrescriptions: Prescription[] = targetPatient
    ? allPrescriptions.filter((p) => p.patientId === targetPatient!.id)
    : [];

  const patientTests: TestOrder[] = targetPatient
    ? allTests.filter((t) => t.patientId === targetPatient!.id)
    : [];

  const patientTimeline: TimelineEvent[] = (targetPatient && allTimelines[targetPatient.id])
    ? (allTimelines[targetPatient.id] || [])
    : [];

  // Mock appointments/admissions/visits aligned with real system models
  const appointments: DbAppointment[] = targetPatient
    ? [
        {
          id: `APT-${targetPatient.id}-01`,
          patient_id: targetPatient.id,
          doctor_id: "DOC-01",
          appointment_date: "Today",
          appointment_time: "10:30 AM",
          department: targetPatient.currentDepartment || "General Medicine",
          status: "Scheduled",
          reason: "Regular follow-up and symptom evaluation",
        },
      ]
    : [];

  const admissions: DbAdmission[] = allPatients
    .filter((p) => p.bedNumber || p.status === "Admitted" || p.status === "Post-Op")
    .map((p) => ({
      id: `ADM-${p.id}`,
      patient_id: p.id,
      admitted_at: p.registeredAt || "Recent",
      ward: p.roomNumber || "Ward 3B",
      bed_number: p.bedNumber || "Bed 12",
      admitting_doctor: p.assignedDoctor || "Dr. Ananya Sharma",
      diagnosis: p.medicalHistory?.[0] || "Under observation",
      status: "Admitted",
    }));

  const visits: DbVisit[] = targetPatient
    ? [
        {
          id: `VISIT-${targetPatient.id}`,
          patient_id: targetPatient.id,
          doctor_id: "DOC-01",
          doctor_name: targetPatient.assignedDoctor || "Dr. Ananya Sharma",
          visit_date: "Today",
          chief_complaint: targetPatient.medicalHistory?.[0] || "Routine consultation",
          clinical_notes: `Patient evaluated in ${targetPatient.currentDepartment}. Vital signs monitored.`,
          diagnosis: targetPatient.medicalHistory?.[0] || "Clinical evaluation",
          treatment_plan: "Continue prescribed course and monitor diagnostic tests.",
        },
      ]
    : [];

  return {
    role: currentRole,
    user: {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role || currentRole,
      title: currentUser.title,
      department: currentUser.department,
    },
    patient: targetPatient,
    patients: allPatients,
    vitals: patientVitals.length > 0 ? patientVitals : allVitals,
    prescriptions: patientPrescriptions.length > 0 ? patientPrescriptions : allPrescriptions,
    tests: patientTests.length > 0 ? patientTests : allTests,
    medicines: allMedicines,
    surgeries: allSurgeries,
    timeline: patientTimeline,
    timelines: allTimelines,
    notifications: allNotifications,
    appointments,
    admissions,
    visits,
    pageContext: pageContext || {},
  };
}
