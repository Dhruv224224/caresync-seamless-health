import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

interface AIRequest {
  action: AIActionType;
  role: string;
  patientId?: string;
  query?: string;
  contextData?: Record<string, unknown>;
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const openAiModel = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

    // 2. Extract Auth header and verify caller identity
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Verify session
    const { data: { user } } = await supabase.auth.getUser();

    const body = (await req.json()) as AIRequest;
    const { action, role, patientId, query, contextData } = body;

    // Authorization safeguard: If caller is authenticated as a patient, verify they are only requesting their own data
    if (user && role === "patient" && patientId) {
      // Query profiles or user metadata to ensure patient owns patientId
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, patient_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && profile.role === "patient" && profile.patient_id && profile.patient_id !== patientId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Unauthorized: Patients may only access their own electronic health records.",
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Strict Healthcare AI System Guidelines
    const systemPrompt = `You are CareSync Assistant, an intelligent clinical communication and hospital workflow assistant for the CareSync connected hospital platform.

Strict Clinical Safety & Operational Guidelines:
1. You summarize, organize, retrieve, and explain existing electronic health record (EHR) data.
2. NEVER diagnose diseases, invent diagnoses, recommend new medications, or alter dosages.
3. NEVER fabricate missing records. If a data item (such as vitals, prescriptions, or test results) is missing from the provided context, explicitly state: "No vitals/records are currently available in the CareSync record."
4. If a user asks for medical diagnosis, clinical prescribing, or changing treatment, explain that CareSync is a clinical workflow assistant and direct them to consult their attending doctor.
5. In patient-facing responses: Use clear, friendly, compassionate, non-technical language.
6. In doctor-facing responses: Use concise, structured clinical and workflow summaries.
7. In nurse-facing responses: Focus on vitals, bed assignments, and post-op care tasks.
8. In lab-facing responses: Focus on test parameters, normal ranges, and technologist notes.
9. In pharmacy-facing responses: Focus on medication details, dosage frequency, dispensing verification, and stock.
10. In receptionist-facing responses: Focus on queue volume, waiting status, admissions, and triage.
11. Output responses in clean, formatted markdown with bullet points where appropriate.`;

    let userPrompt = "";

    switch (action) {
      case "ask":
        userPrompt = `Caller Role: ${role || "Staff"}
Patient Context Data: ${JSON.stringify(contextData || {})}
User Question: "${query || "Please summarize the current status."}"

Please interpret the user's question semantically in the context of their role and the provided EHR data. Answer concisely and accurately based ONLY on the verified context provided. If requested data (e.g. vitals) is empty, clearly state that no vitals are currently recorded.`;
        break;

      case "summarize_report":
        userPrompt = `Please generate an accurate diagnostic summary of the following laboratory/pathology test order:
${JSON.stringify(contextData?.report || contextData || {})}

Identify the investigation name, status, parameter results (highlighting any abnormal findings), and note that final clinical correlation must be done by the attending doctor.`;
        break;

      case "explain_prescription":
        userPrompt = `Please explain the following prescription in simple, actionable terms:
${JSON.stringify(contextData?.prescription || contextData || {})}

Explain each medicine, dosage, frequency, course duration, and food/safety instructions. Remind the patient to follow doctor instructions strictly.`;
        break;

      case "structure_notes":
        userPrompt = `Please organize the following clinical notes into a structured medical consultation format:
Raw Doctor Input: "${contextData?.rawNotes || contextData?.symptoms || query || ""}"

Structure into:
- Chief Complaints & Symptoms
- Clinical Observations & Vitals
- Provisional Assessment
- Management & Follow-up Plan

IMPORTANT: Do not invent symptoms or diagnoses not mentioned or implied by the clinician.`;
        break;

      case "nursing_summary":
        userPrompt = `Please generate a nursing rounds overview for the following ward inpatients and vitals:
${JSON.stringify(contextData || {})}

Summarize assigned beds, scheduled vitals due, post-op recovery checks, and pending nursing tasks.`;
        break;

      case "reception_summary":
        userPrompt = `Please generate an operational front desk summary based on current registration and queue data:
${JSON.stringify(contextData || {})}

Summarize waiting patients, active consultations, bed occupancy, and today's registration volume.`;
        break;

      case "pharmacy_summary":
        userPrompt = `Please summarize the current pharmacy dispensary queue and medication stock:
${JSON.stringify(contextData || {})}

Highlight pending prescriptions, dispensed items, and any medications with low stock.`;
        break;

      case "surgery_summary":
        userPrompt = `Please summarize the surgical workflow and milestone progression for this procedure:
${JSON.stringify(contextData?.surgery || contextData || {})}

Highlight current milestone status, attending surgeon, scheduled window, and recovery stage.`;
        break;

      case "explain_simple":
      case "patient_summary":
      default:
        userPrompt = `Please provide a clear, patient-friendly overview of the patient's care journey:
${JSON.stringify(contextData || {})}

Summarize current care status, attending doctor, active medications, test results, and recent timeline milestones in reassuring language.`;
        break;
    }

    // 3. Call OpenAI API if server key is configured
    if (openAiKey) {
      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: openAiModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 900,
        }),
      });

      if (openAiResponse.ok) {
        const data = await openAiResponse.json();
        const content = data.choices?.[0]?.message?.content || "No response generated.";
        return new Response(
          JSON.stringify({
            success: true,
            type: action,
            result: content,
            warnings: ["AI-generated clinical workflow assistance — verify against official hospital records."],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        const errJson = await openAiResponse.json().catch(() => ({}));
        console.error("OpenAI API call failed:", errJson);
      }
    }

    // Explicit notice if OpenAI secret is not set
    return new Response(
      JSON.stringify({
        success: false,
        error: "OPENAI_API_KEY secret not configured in Supabase Edge Functions. Please configure it in Supabase Project Settings.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal AI function error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
