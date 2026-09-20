import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { invokeCareSyncAI, AIActionType } from "@/lib/aiService";
import { toast } from "sonner";

interface AIActionButtonProps {
  label: string;
  featureName?: string;
  actionType: AIActionType;
  role?: string;
  patientId?: string;
  getContextData?: () => Record<string, unknown>;
  onStructuredResult?: (data: any) => void;
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

export function AIActionButton({
  label,
  featureName,
  actionType,
  role = "staff",
  patientId,
  getContextData,
  onStructuredResult,
  variant = "outline",
  size = "sm",
  className = "",
  icon,
}: AIActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const displayName = featureName || label;

  const handleOpen = async () => {
    setOpen(true);
    // If not "ask" mode (which needs user question), trigger immediately
    if (actionType !== "ask" && !response) {
      await runAI();
    }
  };

  const runAI = async (customQuery?: string) => {
    if (loading) return;
    setLoading(true);
    setResponse(null);

    try {
      const contextData = getContextData ? getContextData() : {};
      const res = await invokeCareSyncAI({
        action: actionType,
        role,
        patientId,
        query: customQuery || query,
        contextData,
      });

      if (res.result) {
        setResponse(res.result);
        if (res.structured && onStructuredResult) {
          onStructuredResult(res.structured);
        }
      } else {
        toast.error(res.error || "CareSync Assistant could not complete this request.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to contact CareSync AI Assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success("AI response copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpen}
        disabled={loading}
        className={`border-indigo-ai/30 text-indigo-ai dark:text-semantic-ai hover:bg-indigo-soft/60 dark:hover:bg-indigo-ai/15 hover:border-indigo-ai/50 gap-1.5 cursor-pointer shadow-2xs font-medium ${className}`}
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin text-indigo-ai" />
        ) : (
          icon || <Sparkles className="size-3.5 text-indigo-ai" />
        )}
        <span>{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col border border-indigo-ai/20 dark:border-indigo-ai/30 bg-card shadow-xl overflow-hidden p-0">
          <DialogHeader className="p-4 pb-3 border-b border-border bg-gradient-to-r from-indigo-soft/40 via-background to-transparent dark:from-indigo-soft/10 dark:via-card">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold text-ink flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-indigo-ai text-white shadow-xs">
                  <Bot className="size-4" />
                </div>
                <span>{displayName}</span>
              </DialogTitle>
              <span className="text-[10px] font-mono text-indigo-ai bg-indigo-soft dark:bg-indigo-ai/20 px-2 py-0.5 rounded border border-indigo-ai/20 font-medium">
                CareSync AI Assistant
              </span>
            </div>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              {actionType === "ask"
                ? "Ask natural-language questions about this patient's authorized records."
                : "Continuous clinical intelligence and verified health record synthesis."}
            </DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {actionType === "ask" && (
              <div className="space-y-2">
                <div className="text-[11px] font-medium text-slate-700">Suggested Prompts:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "What tests are still pending?",
                    "Summarize recent vitals and care status",
                    "What active medicines are prescribed?",
                    "Which doctor and ward is assigned?",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(preset);
                        runAI(preset);
                      }}
                      className="px-2.5 py-1 rounded-full bg-surf hover:bg-blue-soft hover:text-navy-900 text-[11px] text-slate-700 border border-border transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runAI()}
                    placeholder="Type your question about patient workflow..."
                    className="flex-1 h-9 px-3 text-xs rounded-lg border border-border bg-surf focus:outline-none focus:border-navy-600 font-sans"
                    disabled={loading}
                  />
                  <Button
                    size="sm"
                    onClick={() => runAI()}
                    disabled={loading || !query.trim()}
                    className="bg-navy-900 hover:bg-navy-800 text-white h-9 px-3"
                  >
                    {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  </Button>
                </div>
              </div>
            )}

            {loading && (
              <div className="p-8 text-center space-y-2 bg-surf/50 rounded-xl border border-border">
                <Loader2 className="size-6 animate-spin text-navy-700 dark:text-blue-accent mx-auto" />
                <div className="text-xs font-semibold text-ink">CareSync Assistant is synthesizing...</div>
                <div className="text-[11px] font-mono text-slate-500">Retrieving authorized medical records</div>
              </div>
            )}

            {response && !loading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-teal-dark dark:text-calm flex items-center gap-1.5">
                    <Sparkles className="size-3 text-teal-primary" /> AI-Generated Summary
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 text-[11px] text-slate-500 hover:text-ink gap-1"
                  >
                    {copied ? <Check className="size-3 text-calm" /> : <Copy className="size-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="rounded-xl bg-surf p-4 border border-border text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {response}
                </div>

                <div className="rounded-lg bg-amber-soft border border-amber-muted/30 p-2.5 text-[11px] text-amber-muted dark:text-warn flex items-start gap-2">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-amber-muted" />
                  <span>
                    <strong>Medical Safety Notice:</strong> AI responses are derived strictly from electronic records and are not a medical diagnosis. Clinicians and patients must refer to official test sheets and prescription orders.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-surf/50 flex justify-between items-center">
            {actionType !== "ask" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => runAI()}
                disabled={loading}
                className="text-xs h-8 border-border"
              >
                Regenerate
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="bg-navy-900 hover:bg-navy-800 text-white text-xs h-8 px-4"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
