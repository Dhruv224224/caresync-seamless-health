import { supabase } from "./supabase";
import {
  DbPatient,
  DbVisit,
  DbPrescription,
  DbPrescriptionItem,
  DbTestOrder,
  DbPatientTimeline,
  DbNotification,
  Patient,
  Prescription,
  PrescriptionItem,
  TestOrder,
  TimelineEvent,
  HospitalNotification,
  Role,
} from "@/types/caresync";

// ==========================================
// 1. PATIENTS SERVICE
// ==========================================

export function mapDbPatientToPatient(row: Record<string, unknown>): Patient {
  const rowId = String(row["id"] || "");
  const fullName = String(row["name"] || row["full_name"] || "Unknown Patient");
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

export async function fetchPatientsFromDb(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[CareSync DB] fetchPatients error:", error.message);
    throw new Error(error.message);
  }

  return (data || []).map((row) => mapDbPatientToPatient(row as Record<string, unknown>));
}

export async function fetchPatientByIdFromDb(patientId: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .maybeSingle();

  if (error) {
    console.error("[CareSync DB] fetchPatientById error:", error.message);
    throw new Error(error.message);
  }

  return data ? mapDbPatientToPatient(data as Record<string, unknown>) : null;
}

export interface CreatePatientInput {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  phone: string;
  email?: string;
  address: string;
  allergies: string[];
  medicalHistory: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status?: Patient["status"];
  currentDepartment?: string;
  assignedDoctor?: string;
}

export async function createPatientInDb(input: CreatePatientInput): Promise<Patient> {
  const dbPayload = {
    name: input.name,
    age: input.age,
    gender: input.gender,
    blood_group: input.bloodGroup,
    phone: input.phone,
    address: input.address,
    allergies: input.allergies,
    medical_history: input.medicalHistory,
    status: input.status || "Waiting",
    current_department: input.currentDepartment || "Outpatient Clinic",
    assigned_doctor: input.assignedDoctor || "Dr. Ananya Sharma",
  };

  const { data, error } = await supabase
    .from("patients")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error("[CareSync DB] createPatient error:", error.message);
    throw new Error(error.message);
  }

  return mapDbPatientToPatient(data as Record<string, unknown>);
}

export async function updatePatientStatusInDb(
  patientId: string,
  status: Patient["status"],
  department?: string,
): Promise<void> {
  const updatePayload: Record<string, unknown> = { status };
  if (department) {
    updatePayload["current_department"] = department;
  }

  const { error } = await supabase
    .from("patients")
    .update(updatePayload)
    .eq("id", patientId);

  if (error) {
    console.error("[CareSync DB] updatePatientStatus error:", error.message);
    throw new Error(error.message);
  }
}

// ==========================================
// 2. VISITS / CONSULTATION SERVICE
// ==========================================

export interface CreateVisitInput {
  patientId: string;
  doctorId: string;
  doctorName: string;
  chiefComplaint: string;
  clinicalNotes: string;
  diagnosis: string;
  treatmentPlan: string;
}

export async function createVisitInDb(input: CreateVisitInput): Promise<DbVisit> {
  const dbPayload = {
    patient_id: input.patientId,
    doctor_id: input.doctorId,
    doctor_name: input.doctorName,
    visit_date: new Date().toISOString(),
    chief_complaint: input.chiefComplaint,
    clinical_notes: input.clinicalNotes,
    diagnosis: input.diagnosis,
    treatment_plan: input.treatmentPlan,
  };

  const { data, error } = await supabase
    .from("visits")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error("[CareSync DB] createVisit error:", error.message);
    throw new Error(error.message);
  }

  return data as DbVisit;
}

export async function fetchVisitsByPatientFromDb(patientId: string): Promise<DbVisit[]> {
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[CareSync DB] fetchVisitsByPatient error:", error.message);
    throw new Error(error.message);
  }

  return (data || []) as DbVisit[];
}

// ==========================================
// 3. PRESCRIPTIONS SERVICE
// ==========================================

export interface CreatePrescriptionInput {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  notes?: string;
  items: {
    medicineName: string;
    strength?: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity?: number;
    instructions: string;
  }[];
}

export async function createPrescriptionInDb(input: CreatePrescriptionInput): Promise<Prescription> {
  // 1. Insert Prescription header
  const rxPayload = {
    patient_id: input.patientId,
    patient_name: input.patientName,
    doctor_id: input.doctorId,
    doctor_name: input.doctorName,
    status: "Pending",
    notes: input.notes || "",
  };

  const { data: rxData, error: rxError } = await supabase
    .from("prescriptions")
    .insert([rxPayload])
    .select()
    .single();

  if (rxError) {
    console.error("[CareSync DB] createPrescription error:", rxError.message);
    throw new Error(rxError.message);
  }

  const prescriptionId = rxData.id;

  // 2. Insert Prescription items
  const itemsPayload = input.items.map((it) => ({
    prescription_id: prescriptionId,
    medicine_name: it.medicineName,
    dosage: it.dosage,
    frequency: it.frequency,
    duration: it.duration,
    instructions: it.instructions,
  }));

  const { data: itemsData, error: itemsError } = await supabase
    .from("prescription_items")
    .insert(itemsPayload)
    .select();

  if (itemsError) {
    console.error("[CareSync DB] createPrescriptionItems error:", itemsError.message);
    throw new Error(itemsError.message);
  }

  const mappedItems: PrescriptionItem[] = (itemsData || []).map((i) => ({
    id: String(i.id),
    medicine: String(i.medicine_name),
    dosage: String(i.dosage),
    frequency: String(i.frequency),
    duration: String(i.duration),
    instructions: String(i.instructions),
  }));

  return {
    id: String(prescriptionId),
    patientId: input.patientId,
    patientName: input.patientName,
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    status: "Pending",
    createdAt: "Just now",
    items: mappedItems,
    notes: input.notes,
  };
}

export async function fetchPrescriptionsByPatientFromDb(patientId: string): Promise<Prescription[]> {
  const { data: rxList, error: rxError } = await supabase
    .from("prescriptions")
    .select("*, prescription_items(*)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (rxError) {
    console.error("[CareSync DB] fetchPrescriptionsByPatient error:", rxError.message);
    throw new Error(rxError.message);
  }

  return (rxList || []).map((row: any) => ({
    id: String(row.id),
    patientId: String(row.patient_id),
    patientName: String(row.patient_name || ""),
    doctorId: String(row.doctor_id || ""),
    doctorName: String(row.doctor_name || ""),
    status: (row.status as "Pending" | "Dispensed" | "Partial") || "Pending",
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Recent",
    dispensedAt: row.dispensed_at,
    notes: row.notes,
    items: (row.prescription_items || []).map((it: any) => ({
      id: String(it.id),
      medicine: String(it.medicine_name),
      dosage: String(it.dosage),
      frequency: String(it.frequency),
      duration: String(it.duration),
      instructions: String(it.instructions),
    })),
  }));
}

// ==========================================
// 4. DIAGNOSTIC TEST ORDERS SERVICE
// ==========================================

export interface CreateTestOrderInput {
  patientId: string;
  patientName: string;
  doctorName: string;
  testName: string;
  priority: "Routine" | "Urgent" | "Stat";
}

export async function createTestOrderInDb(input: CreateTestOrderInput): Promise<TestOrder> {
  const dbPayload = {
    patient_id: input.patientId,
    patient_name: input.patientName,
    doctor_name: input.doctorName,
    test_name: input.testName,
    priority: input.priority,
    status: "Pending",
  };

  const { data, error } = await supabase
    .from("test_orders")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error("[CareSync DB] createTestOrder error:", error.message);
    throw new Error(error.message);
  }

  return {
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

export async function fetchTestOrdersByPatientFromDb(patientId: string): Promise<TestOrder[]> {
  const { data, error } = await supabase
    .from("test_orders")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[CareSync DB] fetchTestOrdersByPatient error:", error.message);
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: String(row.id),
    patientId: String(row.patient_id),
    patientName: String(row.patient_name),
    doctorName: String(row.doctor_name),
    testName: String(row.test_name),
    priority: row.priority as "Routine" | "Urgent" | "Stat",
    status: row.status as "Pending" | "In Progress" | "Completed",
    orderedAt: row.created_at
      ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Recent",
    completedAt: row.completed_at,
    labNotes: row.lab_notes,
  }));
}

// ==========================================
// 5. PATIENT TIMELINE SERVICE
// ==========================================

export interface CreateTimelineEventInput {
  patientId: string;
  title: string;
  department: string;
  description: string;
  actor: string;
  status: "completed" | "current" | "upcoming";
  iconType: TimelineEvent["iconType"];
}

export async function createTimelineEventInDb(input: CreateTimelineEventInput): Promise<TimelineEvent> {
  const dbPayload = {
    patient_id: input.patientId,
    title: input.title,
    department: input.department,
    description: input.description,
    actor: input.actor,
    status: input.status,
    icon_type: input.iconType,
  };

  const { data, error } = await supabase
    .from("patient_timeline")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error("[CareSync DB] createTimelineEvent error:", error.message);
    throw new Error(error.message);
  }

  return {
    id: String(data.id),
    patientId: String(data.patient_id),
    title: String(data.title),
    department: String(data.department),
    description: String(data.description),
    timestamp: "Just now",
    actor: String(data.actor),
    status: data.status as "completed" | "current" | "upcoming",
    iconType: data.icon_type as TimelineEvent["iconType"],
  };
}

export async function fetchTimelineByPatientFromDb(patientId: string): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from("patient_timeline")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[CareSync DB] fetchTimelineByPatient error:", error.message);
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: String(row.id),
    patientId: String(row.patient_id),
    title: String(row.title),
    department: String(row.department),
    description: String(row.description),
    timestamp: row.created_at
      ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Just now",
    actor: String(row.actor || "CareSync Staff"),
    status: (row.status as "completed" | "current" | "upcoming") || "completed",
    iconType: (row.icon_type as TimelineEvent["iconType"]) || "registration",
  }));
}

// ==========================================
// 6. NOTIFICATIONS SERVICE
// ==========================================

export interface CreateNotificationInput {
  title: string;
  message: string;
  targetRole?: Role;
  patientId?: string;
  type: HospitalNotification["type"];
}

export async function createNotificationInDb(input: CreateNotificationInput): Promise<HospitalNotification> {
  const dbPayload = {
    title: input.title,
    message: input.message,
    target_role: input.targetRole,
    patient_id: input.patientId,
    read: false,
    type: input.type,
  };

  const { data, error } = await supabase
    .from("notifications")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error("[CareSync DB] createNotification error:", error.message);
    throw new Error(error.message);
  }

  return {
    id: String(data.id),
    title: String(data.title),
    message: String(data.message),
    targetRole: data.target_role as Role | undefined,
    patientId: data.patient_id ? String(data.patient_id) : undefined,
    timestamp: "Just now",
    read: false,
    type: data.type as HospitalNotification["type"],
  };
}
