"use client";

import { cn } from "@monorepo/shadcn-ui/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { codeToHtml } from "shikiji";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({ code, language = "tsx", theme = "github-light", className, ...props }: CodeBlockCodeProps) {
  const { resolvedTheme: appTheme } = useTheme();
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    async function highlight() {
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: appTheme === "dark" ? "github-dark" : "github-light",
        });
        setHighlightedHtml(html);
      } catch (error) {
        // If language is not supported, fallback to plain text highlighting
        try {
          const html = await codeToHtml(code, {
            lang: "text",
            theme: appTheme === "dark" ? "github-dark" : "github-light",
          });
          setHighlightedHtml(html);
        } catch (fallbackError) {
          // If even plain text fails, don't set highlighted HTML (will use fallback rendering)
          setHighlightedHtml(null);
        }
      }
    }
    highlight();
  }, [code, language, appTheme]);

  const classNames = cn(
    "w-full overflow-x-auto rounded-xl text-[13px] [&>pre]:px-4 [&>pre]:py-4 [&>pre]:!bg-background",
    className,
  );

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <div className={classNames} dangerouslySetInnerHTML={{ __html: highlightedHtml }} {...props} />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({ children, className, ...props }: CodeBlockGroupProps) {
  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export { CodeBlock, CodeBlockCode, CodeBlockGroup };
