import React, { useState } from "react";
import { Sparkles, Bot, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AIPlaceholderButtonProps {
  label: string;
  featureName: string;
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

export function AIPlaceholderButton({
  label,
  featureName,
  variant = "outline",
  size = "sm",
  className = "",
  icon,
}: AIPlaceholderButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={`border-brand/40 text-brand hover:bg-brand/10 hover:text-brand gap-1.5 ${className}`}
      >
        {icon || <Sparkles className="size-3.5 text-calm" />}
        <span>{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border border-border bg-card shadow-2xl">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-ink flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
                <Bot className="size-4 text-brand" />
              </div>
              <span>{featureName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-ink/60 mt-1">
              AI feature coming soon to CareSync.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="rounded-xl bg-surf p-3.5 border border-border/80 text-xs text-ink/75 leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="size-4 text-brand shrink-0 mt-0.5" />
              <div>
                <strong>Prototype Notice:</strong> AI capabilities (such as clinical documentation
                summarization, simple patient explanations, and intelligent triage) are currently
                disabled in this hackathon prototype.
              </div>
            </div>
            <p className="text-[11px] text-ink/50 leading-normal">
              CareSync is designed around a continuous human-in-the-loop workflow. Automated AI
              synthesis will be enabled in future releases after rigorous verification.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="bg-brand text-white text-xs h-8"
            >
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
