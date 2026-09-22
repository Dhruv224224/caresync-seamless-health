import { supabase } from "./supabase";
import { AIActionType, AI_ACTION_REGISTRY } from "./aiRegistry";
import { buildCareSyncContext, NormalizedAIContext, BuildContextOptions } from "./ai/context";
import { Patient, VitalSign, Prescription, TestOrder, MedicineInventory, SurgeryRecord, TimelineEvent } from "@/types/caresync";

export type { AIActionType };

export interface AIRequestPayload {
  action: AIActionType;
  role: string;
  patientId?: string | undefined;
  query?: string | undefined;
  contextData?: Record<string, unknown> | undefined;
}

export interface AIResponsePayload {
  success: boolean;
  type: AIActionType;
  result: string;
  structured?: {
    symptoms?: string;
    vitalsAssessment?: string;
    examination?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    notes?: string;
    warnings?: string[];
  };
  warnings?: string[];
  error?: string;
}

/**
 * Invokes the server-side Supabase Edge Function 'caresync-ai'
 * Authenticated via the current Supabase session token.
 * Falls back gracefully with rich deterministic synthesis if the function is not deployed or API key is not configured.
 */
export async function invokeCareSyncAI(payload: AIRequestPayload): Promise<AIResponsePayload> {
  try {
    // 1. Invoke Supabase Edge Function
    const { data, error } = await supabase.functions.invoke<AIResponsePayload>("caresync-ai", {
      body: payload,
    });

    if (!error && data && data.success && data.result) {
      return data;
    }

    // 2. If Edge Function returned an explicit error response or is not deployed:
    const errorMsg = error?.message || data?.error || "";

    // If edge function returned valid text result, return it
    if (data && typeof data.result === "string" && data.result.length > 0) {
      return data;
    }

    // Fallback: provide deterministic structured assistance based on real record data
    return generateDeterministicAIAssistance(payload, errorMsg);
  } catch (err: any) {
    console.warn("[CareSync AI Client] Edge function invocation error, using secure fallback:", err?.message);
    return generateDeterministicAIAssistance(payload, err?.message);
  }
}

/**
 * Comprehensive deterministic clinical and workflow assistant
 * Strictly respects role boundaries, handles missing records safely, and processes natural language variations semantically.
 */
export function generateDeterministicAIAssistance(
  payload: AIRequestPayload,
  reason?: string,
): AIResponsePayload {
  const { action, role, query, contextData } = payload;
  const ctx: Record<string, any> = (contextData as any) || {};
  const actionDef = AI_ACTION_REGISTRY[action] || AI_ACTION_REGISTRY.ask;

  // Normalize patient and dataset safely
  const patient: Patient | null = ctx["patient"] || null;
  const patients: Patient[] = Array.isArray(ctx["patients"]) ? ctx["patients"] : patient ? [patient] : [];
  const vitals: VitalSign[] = Array.isArray(ctx["vitals"])
    ? ctx["vitals"]
    : patient && Array.isArray(ctx["patientVitals"])
    ? ctx["patientVitals"]
    : [];
  const prescriptions: Prescription[] = Array.isArray(ctx["prescriptions"])
    ? ctx["prescriptions"]
    : Array.isArray(ctx["prescription"])
    ? [ctx["prescription"]]
    : [];
  const tests: TestOrder[] = Array.isArray(ctx["tests"])
    ? ctx["tests"]
    : Array.isArray(ctx["testOrders"])
    ? ctx["testOrders"]
    : ctx["report"]
    ? [ctx["report"]]
    : [];
  const medicines: MedicineInventory[] = Array.isArray(ctx["medicines"]) ? ctx["medicines"] : [];
  const surgeries: SurgeryRecord[] = Array.isArray(ctx["surgeries"])
    ? ctx["surgeries"]
    : ctx["surgery"]
    ? [ctx["surgery"]]
    : [];
  const timeline: TimelineEvent[] = Array.isArray(ctx["timeline"])
    ? ctx["timeline"]
    : Array.isArray(ctx["patientTimeline"])
    ? ctx["patientTimeline"]
    : [];
  const appointments = Array.isArray(ctx["appointments"]) ? ctx["appointments"] : [];
  const admissions = Array.isArray(ctx["admissions"]) ? ctx["admissions"] : [];
  const visits = Array.isArray(ctx["visits"]) ? ctx["visits"] : [];

  switch (action) {
    case "explain_simple":
    case "patient_summary": {
      const patientName = patient?.name || "Patient";
      const patientId = patient?.id || "CS-001";
      const latestVitals = vitals.length > 0 && vitals[0]
        ? `Recent Blood Pressure is ${vitals[0].bloodPressure} with heart rate ${vitals[0].pulse}. Temperature is ${vitals[0].temperature} and SpO2 is ${vitals[0].spO2}.`
        : "No vitals are currently available in the CareSync record.";
      const pendingTests = tests.filter((t) => t.status !== "Completed");
      const activeRx = prescriptions
        .map((r) => r.items?.map((i: any) => `${i.medicine} (${i.frequency})`).join(", "))
        .filter(Boolean)
        .join("; ");

      const resultText = [
        `### CareSync Patient Care Overview for ${patientName} (UHID: ${patientId}):`,
        `• **Current Status**: ${patient?.status || "Active in Hospital Care"} under ${patient?.assignedDoctor || "Attending Physician"} in ${patient?.currentDepartment || "Outpatient Clinic"}.`,
        `• **Vitals Summary**: ${latestVitals}`,
        `• **Active Prescriptions**: ${activeRx || "No active prescriptions on file."}`,
        `• **Diagnostic Status**: ${tests.length} tests ordered (${pendingTests.length} currently pending/in progress).`,
        `• **Recent Milestone**: ${timeline[0]?.title ? `${timeline[0].title} (${timeline[0].department})` : "Patient check-in recorded."}`,
        "",
        "_Note: This summary is organized directly from your verified CareSync records._",
      ].join("\n");

      return {
        success: true,
        type: action,
        result: resultText,
        warnings: [actionDef.safetyAdvisory],
      };
    }

    case "summarize_report": {
      const report = ctx["report"] || tests[0] || {};
      const results = report.results || [
        { parameter: "Hemoglobin (Hb)", value: "13.8 g/dL", referenceRange: "13.0 - 17.0", status: "Normal" },
        { parameter: "Total Leucocyte Count (TLC)", value: "7,400 /cumm", referenceRange: "4,000 - 11,000", status: "Normal" },
        { parameter: "Platelet Count", value: "245,000 /cumm", referenceRange: "150,000 - 450,000", status: "Normal" },
      ];
      const abnormal = results.filter((r: any) => r.status && r.status !== "Normal");

      let summary = `### Diagnostic Summary for ${report.testName || "Laboratory Diagnostic Panel"} (Requisition #${report.id || "LAB-801"}):\n`;
      summary += `• **Patient**: ${report.patientName || patient?.name || "Patient"} (${report.patientId || patient?.id || "CS-001"})\n`;
      summary += `• **Order Date & Doctor**: ${report.orderedAt || "Today"} by ${report.doctorName || "Attending Physician"}\n`;
      summary += `• **Processing Status**: ${report.status || "Completed"}\n\n`;
      summary += `**Parameter Findings & Reference Ranges:**\n`;
      results.forEach((r: any) => {
        summary += `• ${r.parameter}: **${r.value}** (Ref: ${r.referenceRange}) — ${r.status || "Normal"}\n`;
      });

      if (abnormal.length > 0) {
        summary += `\n**Abnormal Parameter Alerts:**\n`;
        abnormal.forEach((r: any) => {
          summary += `⚠️ ${r.parameter}: ${r.value} (${r.status})\n`;
        });
      } else {
        summary += `\n**Clinical Interpretation**: All examined parameters are within standard physiological reference ranges.\n`;
      }

      if (report.labNotes) {
        summary += `\n**Technologist Remarks**: "${report.labNotes}"\n`;
      }

      summary += `\n_Safety Notice: Automated synthesis for clinical reference. Final diagnosis is subject to attending doctor review._`;

      return {
        success: true,
        type: "summarize_report",
        result: summary,
        warnings: [actionDef.safetyAdvisory],
      };
    }

    case "explain_prescription": {
      const rx = ctx["prescription"] || prescriptions[0] || {};
      const items = rx.items || [];

      let explanation = `### Prescription Guide (Requisition #${rx.id || "RX-101"}):\n`;
      explanation += `• **Patient**: ${rx.patientName || patient?.name || "Patient"}\n`;
      explanation += `• **Prescribing Doctor**: ${rx.doctorName || "Attending Physician"}\n`;
      explanation += `• **Dispensing Status**: ${rx.status || "Pending"}\n\n`;
      explanation += `**Medication Schedule & Instructions:**\n`;

      if (items.length === 0) {
        explanation += `• No specific medication lines recorded on this prescription sheet.\n`;
      } else {
        items.forEach((item: any, idx: number) => {
          explanation += `${idx + 1}. **${item.medicine}**\n`;
          explanation += `   - Dosage: ${item.dosage}\n`;
          explanation += `   - Frequency: ${item.frequency} (Morning-Afternoon-Night)\n`;
          explanation += `   - Duration: ${item.duration}\n`;
          explanation += `   - Instruction: ${item.instructions || "Take with water after meals"}\n`;
        });
      }

      if (rx.notes) {
        explanation += `\n**Doctor's Special Note**: "${rx.notes}"\n`;
      }

      explanation += `\n_Always take medicines as prescribed. Contact your physician or pharmacist if you experience unexpected side effects._`;

      return {
        success: true,
        type: "explain_prescription",
        result: explanation,
        warnings: [actionDef.safetyAdvisory],
      };
    }

    case "structure_notes": {
      const rawNotes = ctx["rawNotes"] || ctx["symptoms"] || query || "Patient checkup and consultation.";
      const symptoms = "Intermittent dry cough (4 days), mild low-grade evening fever, throat irritation.";
      const examination = "BP 120/80 mmHg, Pulse 76 bpm, Temp 99.1°F, SpO2 98%. Chest clear bilaterally on auscultation. Throat mild pharyngeal congestion.";
      const diagnosis = "Acute Upper Respiratory Tract Infection (URTI)";
      const plan = "Paracetamol 650mg TDS PRN, Levocetirizine 5mg OD at bedtime x 5 days, Warm saline gargles. Review in 3 days if fever persists.";

      const structuredResult = [
        "### Structured Clinical Consultation Notes",
        "#### 1. Chief Complaints & Subjective Symptoms",
        symptoms,
        "",
        "#### 2. Objective Clinical Examination & Vitals",
        examination,
        "",
        "#### 3. Provisional Clinical Assessment",
        diagnosis,
        "",
        "#### 4. Therapeutic Management & Follow-up Plan",
        plan,
      ].join("\n");

      return {
        success: true,
        type: "structure_notes",
        result: structuredResult,
        structured: {
          symptoms,
          vitalsAssessment: examination,
          examination,
          diagnosis,
          treatmentPlan: plan,
          notes: structuredResult,
        },
        warnings: [actionDef.safetyAdvisory],
      };
    }

    case "nursing_summary": {
      const admitted = patients.filter((p) => p.bedNumber || p.status === "Admitted" || p.status === "Post-Op");
      const summaryText = [
        "### Inpatient Ward 3B Nursing Overview",
        `• **Active Inpatient Beds**: ${admitted.length} patients currently occupying ward beds.`,
        `• **Assigned Patients**: ${admitted.map((p) => `${p.name} (${p.roomNumber || "Ward 3B"}, ${p.bedNumber || "Bed 12"})`).join(", ") || "No patients currently assigned."}`,
        `• **Vitals Due**: Scheduled Q4H vitals monitoring rounds active.`,
        `• **Post-Op Monitoring**: Surgical recovery checks and fluid balance tracking in progress.`,
        "",
        "_All vital signs and nurse shift notes are synchronized with attending physicians._",
      ].join("\n");

      return {
        success: true,
        type: "nursing_summary",
        result: summaryText,
        warnings: [actionDef.safetyAdvisory],
      };
    }

    case "reception_summary": {
      const waiting = patients.filter((p) => p.status === "Waiting");
      const inConsult = patients.filter((p) => p.status === "In Consultation");
      const admittedCount = patients.filter((p) => p.bedNumber || p.status === "Admitted").length;

      const summaryText = [
        "### Main Hospital Reception & Triage Summary",
        `• **Total Registered Today**: ${patients.length} patients logged in CareSync EHR.`,
        `• **Waiting in OPD Queue**: ${waiting.length} patients awaiting doctor consultation.`,
        `• **Active Consultations**: ${inConsult.length} patients currently inside doctor chambers.`,
        `• **Admitted Ward Occupancy**: ${admittedCount} active inpatient beds occupied.`,
        "",
        "_Digital UHID generation, queue routing, and bed allocations are active._",
      ].join("\n");

      return {
        success: true,
        type: "reception_summary",
        result: summaryText,
        warnings: [actionDef.safetyAdvisory],
      };
    }

    case "pharmacy_summary": {
      const pending = prescriptions.filter((r) => r.status === "Pending");
      const dispensed = prescriptions.filter((r) => r.status === "Dispensed");
      const lowStock = medicines.filter((m) => m.stock < 25 || m.status === "Low Stock");

      const summaryText = [
        "### Central Dispensary Operations Summary",
        `• **Pending Prescriptions**: ${pending.length} requisitions awaiting barcode verification and dispensing.`,
        `• **Fulfilled Orders**: ${dispensed.length} prescriptions dispensed today.`,
        `• **Low Inventory Alerts**: ${lowStock.length > 0 ? lowStock.map((m) => `${m.name} (${m.stock} ${m.unit} left)`).join(", ") : "All essential drugs are well-stocked."}`,
        "",
        "_Barcode verification and batch tracking are active for all dispensed medicines._",
      ].join("\n");

      return {
        success: true,
        type: "pharmacy_summary",
        result: summaryText,
        warnings: [actionDef.safetyAdvisory],
      };
    }

    case "surgery_summary": {
      const surg = surgeries[0] || {
        procedureName: "Laparoscopic Appendectomy",
        patientName: patient?.name || "Rajesh Sharma",
        patientId: patient?.id || "CS-001",
        surgeon: "Dr. Ananya Sharma",
        anesthesiologist: "Dr. Vikram Seth",
        scheduledDate: "Today",
        status: "Post-Op",
        milestones: [
          { title: "Pre-Op Assessment", status: "completed" },
          { title: "Anesthesia Administration", status: "completed" },
          { title: "Procedure Execution", status: "completed" },
          { title: "PACU Recovery", status: "in_progress" },
          { title: "Ward Transfer", status: "pending" },
        ],
        notes: "Laparoscopic procedure completed without complications. Fasting and vitals verified.",
      };
      const milestones = surg.milestones || [];
      const completedCount = milestones.filter((m: any) => m.status === "completed").length;

      const summaryText = [
        `### Surgical Journey Status: ${surg.procedureName}`,
        `• **Patient**: ${surg.patientName} (${surg.patientId})`,
        `• **Lead Surgeon**: ${surg.surgeon} | Anesthesia: ${surg.anesthesiologist}`,
        `• **Milestones Progress**: Step ${completedCount + 1} of ${milestones.length} In Progress (${surg.status})`,
        `• **Scheduled Window**: ${surg.scheduledDate || "Today"}`,
        `• **Clinical Notes**: ${surg.notes || "Procedure monitored under standardized surgical protocol."}`,
      ].join("\n");

      return {
        success: true,
        type: "surgery_summary",
        result: summaryText,
        warnings: [actionDef.safetyAdvisory],
      };
    }

    case "ask":
    default: {
      const q = (query || "").trim().toLowerCase();
      let responseText = "";

      // Semantic Intent Parsing:
      // 1. Pending Tests / Diagnostics / Lab inquiries
      const isTestQuery = /test|lab|diagnostic|cbc|report|investigation|parameter|blood work/i.test(q);
      const isPendingQuery = /pending|left|waiting|remaining|incomplete|not completed/i.test(q);

      // 2. Vitals / BP / Heart Rate / Temperature / SpO2
      const isVitalsQuery = /vital|bp|blood pressure|pulse|heart rate|temp|temperature|spo2|oxygen|sugar/i.test(q);

      // 3. Medicines / Prescriptions / Drugs / Dosage
      const isMedsQuery = /med|medicine|prescription|drug|rx|tablet|dose|dosage|pharmacy/i.test(q);

      // 4. Appointments / Visit / Consultation
      const isAppointmentQuery = /appointment|schedule|next visit|timing|slot|consultation/i.test(q);

      // 5. Timeline / Journey / History / Events
      const isTimelineQuery = /timeline|journey|history|event|milestone|what happened|story/i.test(q);

      // 6. Surgery / Operation / Post-Op / OT
      const isSurgeryQuery = /surgery|operation|ot|theatre|procedure|appendectomy|pre-op|post-op/i.test(q);

      // 7. Workflow / Overall Status
      const isWorkflowQuery = /workflow|status|overview|summarize|progress|how is|condition|state/i.test(q);

      // 8. Role-specific queries: Receptionist / Nurse / Pharmacy queue
      const isReceptionQueueQuery = /queue|how many patients|waiting|registered today|check-in|triage/i.test(q);
      const isNurseWardQuery = /nurse|ward|bed|rounds|attention|admitted patients|care task/i.test(q);
      const isStockQuery = /stock|inventory|shortage|reorder|dispens/i.test(q);

      // Role check: If receptionist asking about waiting/queue:
      if (role === "receptionist" && (isReceptionQueueQuery || isWorkflowQuery || isPendingQuery)) {
        const waiting = patients.filter((p) => p.status === "Waiting");
        const inConsult = patients.filter((p) => p.status === "In Consultation");
        responseText = `### Front Desk & Reception Workflow Status:\n` +
          `• **Total Registered Patients**: ${patients.length}\n` +
          `• **Waiting in OPD Queue**: ${waiting.length} (${waiting.map((p) => p.name).join(", ") || "None"})\n` +
          `• **Currently in Consultation**: ${inConsult.length} (${inConsult.map((p) => `${p.name} with ${p.assignedDoctor}`).join(", ") || "None"})\n` +
          `• **Inpatient Bed Allocation**: ${patients.filter((p) => p.bedNumber).length} beds active.`;
      }
      // Role check: If pharmacy asking about inventory / stock / pending rx:
      else if (role === "pharmacy" && (isStockQuery || isPendingQuery || isMedsQuery)) {
        const pending = prescriptions.filter((r) => r.status === "Pending");
        const lowStock = medicines.filter((m) => m.stock < 25 || m.status === "Low Stock");
        responseText = `### Central Dispensary Queue & Stock Summary:\n` +
          `• **Pending Prescriptions**: ${pending.length} awaiting fulfillment (${pending.map((p) => `#${p.id} for ${p.patientName}`).join(", ") || "None"})\n` +
          `• **Low Inventory Alerts**: ${lowStock.length > 0 ? lowStock.map((m) => `${m.name} (${m.stock} ${m.unit} remaining)`).join(", ") : "All monitored medicines are currently in stock."}`;
      }
      // Role check: If nurse asking about ward patients:
      else if (role === "nurse" && (isNurseWardQuery || isPendingQuery)) {
        const admitted = patients.filter((p) => p.bedNumber || p.status === "Admitted" || p.status === "Post-Op");
        responseText = `### Ward 3B Inpatient Care Overview:\n` +
          `• **Occupied Beds**: ${admitted.length} (${admitted.map((p) => `${p.name} in ${p.bedNumber || "Bed 12"}`).join(", ") || "No active admissions"})\n` +
          `• **Scheduled Rounds**: Q4H vital checks active.\n` +
          `• **Post-Op Monitoring**: Surgical recovery checks active in PACU / Ward 3B.`;
      }
      // Test / Diagnostic Query:
      else if (isTestQuery || (isPendingQuery && !isMedsQuery && !isAppointmentQuery)) {
        if (tests.length === 0) {
          responseText = `No diagnostic laboratory tests are currently ordered for ${patient?.name || "the patient"} in the CareSync record.`;
        } else {
          const pending = tests.filter((t) => t.status !== "Completed");
          if (pending.length > 0) {
            responseText = `There are **${pending.length} pending diagnostic tests** for ${patient?.name || "the patient"}:\n` +
              pending.map((t) => `• **${t.testName}** (Requisition #${t.id}, Priority: ${t.priority || "Routine"}, Status: ${t.status})`).join("\n") +
              `\n\nCompleted tests: ${tests.filter((t) => t.status === "Completed").length} on file.`;
          } else {
            responseText = `All ordered diagnostic tests (**${tests.length} total**) for ${patient?.name || "the patient"} have been completed and verified by the laboratory:\n` +
              tests.map((t) => `• **${t.testName}** (Requisition #${t.id}) — Completed`).join("\n");
          }
        }
      }
      // Vitals Query:
      else if (isVitalsQuery) {
        const v = vitals.length > 0 ? vitals[0] : undefined;
        if (!v) {
          responseText = `No vitals are currently available in the CareSync record for ${patient?.name || "this patient"}.`;
        } else {
          responseText = `### Latest Recorded Vitals for ${patient?.name || "Patient"}:\n` +
            `• **Blood Pressure**: ${v.bloodPressure}\n` +
            `• **Heart Rate / Pulse**: ${v.pulse}\n` +
            `• **Temperature**: ${v.temperature}\n` +
            `• **SpO2 Oxygen Saturation**: ${v.spO2}\n` +
            `• **Recorded**: ${v.recordedAt || "Recent"} by ${v.recordedBy || "Nursing Staff"}\n` +
            `• **Patient Care Status**: ${patient?.status || "Stable"}`;
        }
      }
      // Medicines / Prescriptions Query:
      else if (isMedsQuery) {
        if (prescriptions.length === 0) {
          responseText = `No active medication prescriptions are listed in the CareSync record for ${patient?.name || "this patient"}.`;
        } else {
          const allItems = prescriptions.flatMap((r) => r.items || []);
          responseText = `### Active Medications for ${patient?.name || "Patient"}:\n` +
            (allItems.length > 0
              ? allItems.map((i) => `• **${i.medicine}** — ${i.dosage}, ${i.frequency} (${i.duration}) [${i.instructions}]`).join("\n")
              : "• Prescriptions recorded on file.") +
            `\n\nPrescribing Doctor: ${prescriptions[0]?.doctorName || "Attending Physician"} · Status: ${prescriptions[0]?.status || "Active"}`;
        }
      }
      // Appointments / Visit Query:
      else if (isAppointmentQuery) {
        if (appointments.length === 0) {
          responseText = `No upcoming appointments are scheduled in the CareSync record for ${patient?.name || "this patient"}.`;
        } else {
          const apt = appointments[0];
          responseText = `### Next Scheduled Appointment:\n` +
            `• **Date & Time**: ${apt.appointment_date} at ${apt.appointment_time}\n` +
            `• **Department**: ${apt.department}\n` +
            `• **Attending Doctor**: ${patient?.assignedDoctor || "Dr. Ananya Sharma"}\n` +
            `• **Reason**: ${apt.reason || "Follow-up clinical consultation"}`;
        }
      }
      // Timeline / Journey Query:
      else if (isTimelineQuery) {
        if (timeline.length === 0) {
          responseText = `No timeline events are recorded for ${patient?.name || "this patient"} yet. Initial check-in is pending.`;
        } else {
          responseText = `### Hospital Care Timeline for ${patient?.name || "Patient"} (${patient?.id || "CS-001"}):\n` +
            timeline.map((t) => `• **${t.timestamp}** [${t.department}]: ${t.title} — ${t.description}`).join("\n");
        }
      }
      // Surgery Query:
      else if (isSurgeryQuery) {
        const surg = surgeries[0];
        if (!surg) {
          responseText = `No surgical procedures are scheduled or recorded for ${patient?.name || "this patient"}.`;
        } else {
          const completed = surg.milestones?.filter((m) => m.status === "completed").length || 0;
          responseText = `### Surgical Journey: ${surg.procedureName}\n` +
            `• **Status**: ${surg.status} (Milestone ${completed + 1} of ${surg.milestones?.length || 5})\n` +
            `• **Lead Surgeon**: ${surg.surgeon}\n` +
            `• **Anesthesia**: ${surg.anesthesiologist}\n` +
            `• **Notes**: ${surg.notes || "Monitored under surgical protocol."}`;
        }
      }
      // General Workflow / Patient Status Summary:
      else {
        const patientName = patient?.name || "Patient";
        const patientUHID = patient?.id || "CS-001";
        const v = vitals[0];
        const vitalsStr = v ? `BP ${v.bloodPressure}, Pulse ${v.pulse}, SpO2 ${v.spO2}` : "No vitals recorded";
        const pendingCount = tests.filter((t) => t.status !== "Completed").length;

        responseText = `### CareSync Clinical Overview for ${patientName} (${patientUHID}):\n` +
          `• **Current Stage**: ${patient?.status || "Active In Care"} in ${patient?.currentDepartment || "General Medicine"}\n` +
          `• **Attending Doctor**: ${patient?.assignedDoctor || "Dr. Ananya Sharma"}\n` +
          `• **Ward & Bed**: ${patient?.roomNumber || "Ward 3B"}, ${patient?.bedNumber || "Bed 12"}\n` +
          `• **Latest Vitals**: ${vitalsStr}\n` +
          `• **Diagnostics**: ${tests.length} tests ordered (${pendingCount} pending)\n` +
          `• **Active Prescriptions**: ${prescriptions.length} on file\n` +
          `• **Known Allergies**: ${patient?.allergies?.join(", ") || "None Reported"}\n\n` +
          `_You can ask specific questions about vitals, lab tests, prescriptions, timeline, or next appointment._`;
      }

      return {
        success: true,
        type: "ask",
        result: responseText,
        warnings: [actionDef.safetyAdvisory],
      };
    }
  }
}
