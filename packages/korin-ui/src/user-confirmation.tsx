import { Check, CheckCircle, ChevronDown, Loader2, ShieldCheck, X, XCircle } from "lucide-react";
import { memo, useMemo, type ReactNode } from "react";

import { Button } from "@monorepo/shadcn-ui/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@monorepo/shadcn-ui/components/ui/collapsible";

type UserConfirmationState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | string
  | null
  | undefined;

interface UserConfirmationProps {
  type: string;
  state?: UserConfirmationState;
  input?: any;
  output?: any;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirming?: boolean;
  canceling?: boolean;
  extraUI?: ReactNode;
}

function formatTypeLabel(type: string) {
  const cleaned = (type || "")
    .replace(/^tool-/, "")
    .replace(/^data-workspace-/, "")
    .replace(/[-_]/g, " ");
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function StatusPill({ state }: { state: UserConfirmationState }) {
  const normalized = state ?? "input-streaming";
  const isRunning = normalized === "input-streaming" || normalized === "input-available";
  const isComplete = normalized === "output-available";
  const isError = normalized === "output-error";

  const label =
    normalized === "input-streaming"
      ? "Pending"
      : normalized === "input-available"
        ? "Applying"
        : normalized === "output-available"
          ? "Completed"
          : normalized === "output-error"
            ? "Error"
            : "Status";

  if (isRunning) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground border border-border/50 rounded-full text-[10px] leading-4 font-medium">
        <Loader2 className="h-3 w-3 animate-spin" />
        {label}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] leading-4 font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/60">
        <XCircle className="h-3 w-3" />
        {label}
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] leading-4 font-medium bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
        <CheckCircle className="h-3 w-3" />
        {label}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] leading-4 font-medium bg-muted text-muted-foreground border border-border/50">
      {label}
    </div>
  );
}

function useSummary(input?: any, output?: any) {
  return useMemo(() => {
    // Try to produce a concise, helpful one-liner
    // Examples:
    // - For workspace operations: show path or command
    // - For generic: show a truncated JSON summary
    const truncate = (s: unknown, n = 120) => {
      const str = typeof s === "string" ? s : String(s ?? "");
      if (!str) return "";
      return str.length <= n ? str : str.slice(0, Math.max(0, n - 3)) + "...";
    };

    const safeInput = input ?? null;
    const safeOutput = output ?? null;

    // Nothing useful provided
    if (safeInput == null && safeOutput == null) return "";

    // Prefer human-readable hints
    if (safeInput && typeof safeInput === "object" && (safeInput as any).explanation)
      return String((safeInput as any).explanation);
    if (safeInput && typeof (safeInput as any).path !== "undefined")
      return `Target: ${truncate((safeInput as any).path, 64)}`;
    if (safeInput && typeof (safeInput as any).command !== "undefined")
      return `Command: ${truncate((safeInput as any).command, 64)}`;
    if (safeInput && typeof (safeInput as any).title !== "undefined")
      return `Title: ${truncate((safeInput as any).title, 64)}`;
    if (safeOutput && typeof (safeOutput as any).error !== "undefined") return truncate((safeOutput as any).error, 120);

    // Fallback to minimal JSON/text preview
    const candidate = safeInput ?? safeOutput;
    if (candidate == null) return "";
    try {
      const text = typeof candidate === "string" ? candidate : JSON.stringify(candidate);
      if (!text) return "";
      return truncate(text.replace(/\s+/g, " ").trim(), 120);
    } catch {
      return "";
    }
  }, [input, output]);
}

export const UserConfirmation = memo(function UserConfirmation({
  type,
  state,
  input,
  output,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirming = false,
  canceling = false,
  extraUI,
}: UserConfirmationProps) {
  const label = formatTypeLabel(type);
  const summary = useSummary(input, output) || "(No explanation available)";
  const isError = (state ?? "") === "output-error" || output?.success === false;
  const isComplete = (state ?? "") === "output-available";
  const showAction = !isError && !isComplete && Boolean(onConfirm || onCancel);

  return (
    <div className="w-full">
      <div className="group bg-background">
        <Collapsible defaultOpen={showAction} className="group">
          <div className="flex items-start gap-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-1 gap-2 justify-between">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1.5 flex-wrap text-left">
                    <ShieldCheck className="h-4 w-4" />
                    <h3 className="text-xs font-medium">{label || "Confirmation"}</h3>
                    <StatusPill state={state} />
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180 text-muted-foreground" />
                  </button>
                </CollapsibleTrigger>

                {showAction && (
                  <div className="flex items-center gap-2 shrink-0">
                    {onCancel && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onCancel}
                        disabled={canceling || confirming}
                      >
                        {canceling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                    {onConfirm && (
                      <Button
                        size="icon"
                        className="h-6 w-6"
                        onClick={onConfirm}
                        disabled={confirming || canceling}
                        aria-label={confirmText || "Confirm"}
                      >
                        {confirming ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {(extraUI || summary) && (
                <CollapsibleContent className="mt-1">
                  <div className="rounded-md border border-border/40 bg-background/70 p-2 text-[11px] text-muted-foreground">
                    {summary && <p className="whitespace-pre-wrap break-words">{summary}</p>}
                    {extraUI && <div className="mt-1 whitespace-pre-wrap break-words">{extraUI}</div>}
                  </div>
                </CollapsibleContent>
              )}
            </div>
          </div>
        </Collapsible>
      </div>
    </div>
  );
});
