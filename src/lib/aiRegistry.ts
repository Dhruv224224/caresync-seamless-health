import { Role } from "@/types/caresync";

export type AIActionType =
  | "ask"
  | "summarize_report"
  | "explain_prescription"
  | "patient_summary"
  | "structure_notes"
  | "explain_simple"
  | "nursing_summary"
  | "reception_summary"
  | "pharmacy_summary"
  | "surgery_summary";

export interface AIActionDefinition {
  id: AIActionType;
  name: string;
  description: string;
  allowedRoles: Role[];
  contextType: "patient" | "report" | "prescription" | "ward" | "queue" | "inventory" | "surgery" | "global";
  suggestedPrompts?: string[];
  safetyAdvisory: string;
}

export const AI_ACTION_REGISTRY: Record<AIActionType, AIActionDefinition> = {
  ask: {
    id: "ask",
    name: "Ask CareSync Assistant",
    description: "Conversational intelligence assistant querying authorized patient records and department workflows.",
    allowedRoles: ["doctor", "patient", "nurse", "lab", "pharmacy", "receptionist"],
    contextType: "global",
    suggestedPrompts: [
      "What tests are still pending?",
      "Summarize recent vitals and care status",
      "What active medicines are prescribed?",
      "What is the status of this patient's workflow?",
      "Which doctor and ward is assigned?",
    ],
    safetyAdvisory: "CareSync Assistant answers are strictly synthesized from authorized electronic health records.",
  },
  explain_simple: {
    id: "explain_simple",
    name: "Plain-Language Care Journey",
    description: "Translates medical visits, prescriptions, and laboratory findings into compassionate, clear language.",
    allowedRoles: ["patient", "doctor", "nurse"],
    contextType: "patient",
    safetyAdvisory: "AI-generated explanation — always consult your attending physician for medical guidance.",
  },
  patient_summary: {
    id: "patient_summary",
    name: "Comprehensive Patient Summary",
    description: "Consolidates active prescriptions, test requisitions, vitals history, and care milestones.",
    allowedRoles: ["doctor", "nurse", "receptionist", "patient"],
    contextType: "patient",
    safetyAdvisory: "AI-generated clinical workflow assistance — verify against official medical records.",
  },
  summarize_report: {
    id: "summarize_report",
    name: "Diagnostic Report Summary",
    description: "Extracts key laboratory parameters, flags abnormal findings, and summarizes technologist observations.",
    allowedRoles: ["doctor", "lab", "patient", "nurse"],
    contextType: "report",
    safetyAdvisory: "AI-generated diagnostic summary — always refer to primary laboratory values.",
  },
  explain_prescription: {
    id: "explain_prescription",
    name: "Prescription & Medication Guidance",
    description: "Explains dosage, frequency, course duration, and administration instructions.",
    allowedRoles: ["patient", "pharmacy", "doctor", "nurse"],
    contextType: "prescription",
    safetyAdvisory: "Take medications exactly as prescribed. Do not modify dosage without doctor consultation.",
  },
  structure_notes: {
    id: "structure_notes",
    name: "Clinical Note Structuring",
    description: "Formats free-form clinical notes into Chief Complaints, Examination, Diagnosis, and Treatment Plan.",
    allowedRoles: ["doctor"],
    contextType: "patient",
    safetyAdvisory: "AI-drafted notes — clinician must review and confirm prior to final save.",
  },
  nursing_summary: {
    id: "nursing_summary",
    name: "Nursing Rounds & Inpatient Summary",
    description: "Summarizes assigned beds in Ward 3B, scheduled vitals due, and post-op care checks.",
    allowedRoles: ["nurse", "doctor"],
    contextType: "ward",
    safetyAdvisory: "Nursing workflow assistance — verify vitals and charts manually during patient rounds.",
  },
  reception_summary: {
    id: "reception_summary",
    name: "Front Desk & Queue Summary",
    description: "Summarizes OPD queue status, pending registrations, and bed occupancy.",
    allowedRoles: ["receptionist"],
    contextType: "queue",
    safetyAdvisory: "Operational front desk overview — verify patient identities before routing.",
  },
  pharmacy_summary: {
    id: "pharmacy_summary",
    name: "Pharmacy Dispensation Summary",
    description: "Summarizes pending digital prescriptions, stock levels, and dispensing activity.",
    allowedRoles: ["pharmacy"],
    contextType: "inventory",
    safetyAdvisory: "Dispensary workflow overview — verify physical barcodes and expiry dates prior to handover.",
  },
  surgery_summary: {
    id: "surgery_summary",
    name: "Surgical Milestone Overview",
    description: "Summarizes live progression across the 9 surgical milestones from pre-op to recovery.",
    allowedRoles: ["doctor", "nurse", "patient"],
    contextType: "surgery",
    safetyAdvisory: "Live milestone tracking — check OT board for real-time surgical status.",
  },
};
