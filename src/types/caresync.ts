// Supabase Table Mirror Types & Database Contracts

export type Role = "doctor" | "patient" | "nurse" | "lab" | "pharmacy" | "receptionist";

// Table: users
export interface DbUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  title: string;
  department?: string | undefined;
  avatar_url?: string | undefined;
  created_at?: string | undefined;
}

// Table: patients
export interface DbPatient {
  id: string; // UHID e.g. 'CS-001'
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  blood_group: string;
  phone: string;
  address: string;
  allergies: string[];
  medical_history: string[];
  status: "Waiting" | "In Consultation" | "Diagnostics" | "Admitted" | "Post-Op" | "Discharged";
  current_department: string;
  assigned_doctor: string;
  bed_number?: string | undefined;
  room_number?: string | undefined;
  registered_at: string;
  created_at?: string | undefined;
}

// Table: appointments
export interface DbAppointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  department: string;
  status: "Scheduled" | "Waiting" | "Completed" | "Cancelled";
  reason?: string | undefined;
  created_at?: string | undefined;
}

// Table: admissions
export interface DbAdmission {
  id: string;
  patient_id: string;
  admitted_at: string;
  discharged_at?: string | undefined;
  ward: string;
  bed_number: string;
  admitting_doctor: string;
  diagnosis: string;
  status: "Admitted" | "Discharged" | "Transferred";
}

// Table: visits
export interface DbVisit {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
  visit_date: string;
  chief_complaint: string;
  clinical_notes: string;
  diagnosis: string;
  treatment_plan: string;
}

// Table: vitals
export interface DbVital {
  id: string;
  patient_id: string;
  temperature: string; // e.g. "98.6 °F"
  blood_pressure: string; // e.g. "120/80 mmHg"
  pulse: string; // e.g. "72 bpm"
  spo2: string; // e.g. "98%"
  recorded_at: string;
  recorded_by: string;
  notes?: string | undefined;
}

// Table: prescriptions
export interface DbPrescription {
  id: string; // e.g. 'RX-101'
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  status: "Pending" | "Dispensed" | "Partial";
  created_at: string;
  dispensed_at?: string | undefined;
  notes?: string | undefined;
}

// Table: prescription_items
export interface DbPrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id?: string | undefined;
  medicine_name: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1"
  duration: string; // e.g. "5 days"
  instructions: string; // e.g. "After meals"
}

// Table: test_orders
export interface DbTestOrder {
  id: string; // e.g. 'LAB-801'
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  test_name: string;
  priority: "Routine" | "Urgent" | "Stat";
  status: "Pending" | "In Progress" | "Completed";
  ordered_at: string;
  completed_at?: string | undefined;
  lab_notes?: string | undefined;
}

// Table: test_results
export interface DbTestResult {
  id: string;
  test_order_id: string;
  parameter: string;
  value: string;
  reference_range: string;
  status: "Normal" | "High" | "Low";
}

// Table: medicines
export interface DbMedicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  reorder_level: number;
}

// Table: pharmacy_orders
export interface DbPharmacyOrder {
  id: string;
  prescription_id: string;
  patient_id: string;
  pharmacist_id: string;
  dispensed_at: string;
  total_amount: number;
  status: "Completed" | "Cancelled";
}

// Table: surgeries
export interface DbSurgery {
  id: string;
  patient_id: string;
  patient_name: string;
  procedure_name: string;
  surgeon: string;
  anesthesiologist: string;
  scheduled_date: string;
  status: "Scheduled" | "Pre-Op" | "In Progress" | "Post-Op" | "Completed";
  milestones: {
    title: string;
    status: "completed" | "in_progress" | "pending";
    timestamp?: string | undefined;
  }[];
  notes?: string | undefined;
}

// Table: patient_timeline
export interface DbPatientTimeline {
  id: string;
  patient_id: string;
  title: string;
  department: string;
  description: string;
  timestamp: string;
  actor: string;
  status: "completed" | "current" | "upcoming";
  icon_type:
    "registration" | "consultation" | "lab" | "pharmacy" | "nurse" | "surgery" | "discharge";
}

// Table: notifications
export interface DbNotification {
  id: string;
  title: string;
  message: string;
  target_role?: Role | undefined;
  patient_id?: string | undefined;
  timestamp: string;
  read: boolean;
  type: "order" | "prescription" | "result" | "surgery" | "alert";
}

// Frontend Convenience Types
export type UserProfile = DbUser;
export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  phone: string;
  address: string;
  allergies: string[];
  medicalHistory: string[];
  status: "Waiting" | "In Consultation" | "Diagnostics" | "Admitted" | "Post-Op" | "Discharged";
  currentDepartment: string;
  assignedDoctor: string;
  bedNumber?: string | undefined;
  roomNumber?: string | undefined;
  registeredAt: string;
};
export type VitalSign = {
  id: string;
  patientId: string;
  temperature: string;
  bloodPressure: string;
  pulse: string;
  spO2: string;
  recordedAt: string;
  recordedBy: string;
  notes?: string | undefined;
};
export type PrescriptionItem = {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};
export type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  items: PrescriptionItem[];
  status: "Pending" | "Dispensed" | "Partial";
  createdAt: string;
  dispensedAt?: string | undefined;
  notes?: string | undefined;
};
export type TestOrder = {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  testName: string;
  priority: "Routine" | "Urgent" | "Stat";
  status: "Pending" | "In Progress" | "Completed";
  orderedAt: string;
  completedAt?: string | undefined;
  results?:
    | {
        parameter: string;
        value: string;
        referenceRange: string;
        status: "Normal" | "High" | "Low";
      }[]
    | undefined;
  labNotes?: string | undefined;
};
export type MedicineInventory = DbMedicine;
export type SurgeryRecord = {
  id: string;
  patientId: string;
  patientName: string;
  procedureName: string;
  surgeon: string;
  anesthesiologist: string;
  scheduledDate: string;
  status: "Scheduled" | "Pre-Op" | "In Progress" | "Post-Op" | "Completed";
  milestones: {
    title: string;
    status: "completed" | "in_progress" | "pending";
    timestamp?: string | undefined;
  }[];
  notes?: string | undefined;
};
export type TimelineEvent = {
  id: string;
  patientId: string;
  title: string;
  department: string;
  description: string;
  timestamp: string;
  actor: string;
  status: "completed" | "current" | "upcoming";
  iconType:
    "registration" | "consultation" | "lab" | "pharmacy" | "nurse" | "surgery" | "discharge";
};
export type HospitalNotification = {
  id: string;
  title: string;
  message: string;
  targetRole?: Role | undefined;
  patientId?: string | undefined;
  timestamp: string;
  read: boolean;
  type: "order" | "prescription" | "result" | "surgery" | "alert";
};
