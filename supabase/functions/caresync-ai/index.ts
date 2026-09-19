import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AIRequest {
  action: "ask" | "summarize_report" | "explain_prescription" | "patient_summary" | "structure_notes" | "explain_simple";
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

    // Optional: Fetch user session to ensure authenticated request
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const body = (await req.json()) as AIRequest;
    const { action, role, patientId, query, contextData } = body;

    // Strict System Prompt for Healthcare Workflow Operations
    const systemPrompt = `You are CareSync Assistant, a specialized healthcare workflow and clinical communication AI for a digital hospital management system.

Strict Safety & Operational Guidelines:
1. You summarize, organize, explain, and retrieve authorized patient workflow data.
2. NEVER diagnose illnesses, invent diagnoses, recommend unprescribed medications, or change dosages.
3. NEVER fabricate missing clinical records. If an item is missing from the record, explicitly state that it is unavailable.
4. If a user asks medical diagnosis or treatment advice, state that you are a workflow assistant and direct them to consult their attending doctor.
5. In patient-facing explanations, use clear, compassionate, and non-technical language.
6. In clinical staff-facing responses, use concise, standard medical terminology.
7. Output responses in clean, formatted markdown with bullet points where appropriate.`;

    let userPrompt = "";

    switch (action) {
      case "ask":
        userPrompt = `User Role: ${role || "Staff"}
Patient Context: ${JSON.stringify(contextData || {})}
User Query: "${query || "What is the status of this patient?"}"

Please provide a helpful, concise answer based strictly on the provided patient context without guessing.`;
        break;

      case "summarize_report":
        userPrompt = `Please generate a clear, patient-friendly summary of the following laboratory/diagnostic report:
${JSON.stringify(contextData?.report || contextData || {})}

Highlight the test purpose, key parameter status (Normal vs Abnormal), and note that final clinical evaluation must be confirmed by the physician.`;
        break;

      case "explain_prescription":
        userPrompt = `Please explain the following prescription in simple, clear language for the patient:
${JSON.stringify(contextData?.prescription || contextData || {})}

Explain the medicine name, prescribed dosage/frequency, duration, and instructions. Remind the patient to adhere strictly to the prescription.`;
        break;

      case "structure_notes":
        userPrompt = `Please structure the following doctor's rough clinical consultation notes into a standard medical format (Chief Complaints, Clinical Examination, Provisional Diagnosis, Treatment & Follow-up Plan):
Raw Notes: "${contextData?.rawNotes || contextData?.symptoms || query || ""}"

IMPORTANT: Do not invent new diagnoses not mentioned or implied by the doctor.`;
        break;

      case "explain_simple":
      case "patient_summary":
      default:
        userPrompt = `Please provide an overview of the patient's current hospital care journey:
${JSON.stringify(contextData || {})}

Summarize current status, attending doctor, active medicines, lab test progress, and recent milestones.`;
        break;
    }

    // 3. Call OpenAI API if key is present
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
          max_tokens: 800,
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
            warnings: ["AI-generated clinical workflow assistance — verify against official medical records."],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fallback if OpenAI key is not configured in Edge Function environment
    return new Response(
      JSON.stringify({
        success: false,
        error: "OPENAI_API_KEY secret not configured in Supabase Edge Functions. Please set it via Supabase Dashboard.",
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
