"use client";

import { AlertDescription } from "@monorepo/shadcn-ui/components/ui/alert";
import { cn } from "@monorepo/shadcn-ui/lib/utils";

export default function ChatLimited({
  className,
  warning,
  shaking,
  ownerEmail,
}: {
  className?: string;
  warning?: boolean;
  shaking?: boolean;
  ownerEmail?: string;
}) {
  return (
    <div
      className={cn("mx-2 px-3 py-2 rounded-lg border shadow-sm", className, shaking && "animate-shake", {
        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20": warning,
        "bg-red-500/10 text-red-500 border-red-500/20": !warning,
      })}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          {ownerEmail ? (
            <AlertDescription className="mr-4">
              {warning
                ? "You almost reached your credit limit. Please contact your "
                : "You have reached your credit limit. Please contact your "}
              <a className="underline" href={`mailto:${ownerEmail}`}>
                Administrator
              </a>
            </AlertDescription>
          ) : (
            <AlertDescription className="mr-4">
              {warning
                ? "You almost reached your credit limit. Please add more credits to your account."
                : "You have reached your credit limit. Please add more credits to your account."}
            </AlertDescription>
          )}
        </div>
      </div>
    </div>
  );
}
