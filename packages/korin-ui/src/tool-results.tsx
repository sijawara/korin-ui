import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@monorepo/shadcn-ui/components/ui/alert-dialog";
import { Button } from "@monorepo/shadcn-ui/components/ui/button";
import { AlertCircle, BookOpen, Download, ExternalLink, Maximize2 } from "lucide-react";
import Image from "next/image";
import React, { memo } from "react";

// Helper function to get favicon URL from a website URL
const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    return null;
  }
};

// Web Search Results Component
export const WebSearchResults = memo(function WebSearchResults({ results }: { results: any[] }) {
  if (!results || !Array.isArray(results)) return null;

  return (
    <div className="w-full overflow-x-auto pb-2 mt-2">
      <div className="flex gap-4 min-w-max">
        {results.map((result, index) => {
          const faviconUrl = getFaviconUrl(result.url);

          return (
            <a
              key={result.id || index}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors duration-200 min-w-[280px] max-w-[280px]"
            >
              {result.image && (
                <div className="relative w-full h-32 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={result.image}
                    alt={result.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Hide the image container on error
                      const target = e.target as HTMLImageElement;
                      target.parentElement!.style.display = "none";
                    }}
                    unoptimized // Since these are external URLs
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {faviconUrl && (
                      <Image
                        src={faviconUrl}
                        alt=""
                        width={16}
                        height={16}
                        className="flex-shrink-0 mt-0.5"
                        onError={(e) => {
                          // Hide favicon on error
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                        unoptimized
                      />
                    )}
                    <h3 className="font-medium text-sm line-clamp-2 flex-1">{result.title}</h3>
                  </div>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{result.text}</p>
                {result.publishedDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(result.publishedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
});

// Image Generation Results Component
// Skeleton loader for image grid
const ImageSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="flex flex-wrap gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="w-[96px] h-[96px] rounded-lg bg-muted/50 animate-pulse" />
    ))}
  </div>
);

export const ImageGenerationResults = memo(function ImageGenerationResults({
  part,
  results,
}: {
  part: any;
  results: any[];
}) {
  const [fullscreenIndex, setFullscreenIndex] = React.useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = React.useState<{
    [key: number]: boolean;
  }>({});
  const state = part?.state || "input-streaming";
  const isLoading = state === "input-streaming" || state === "input-available";
  const hasError = state === "output-error";
  const hasResults = results && Array.isArray(results) && results.length > 0;

  // Show skeleton when loading or no results yet
  if (isLoading || !hasResults) {
    return (
      <div className="w-full mt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-muted/50 animate-pulse" />
          <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
        </div>
        <ImageSkeleton count={3} />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="w-full mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to generate images. Please try again.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full mt-2">
        <div className="flex flex-wrap gap-4 justify-start">
          {results.map((result, index) => (
            <div
              key={index}
              className="group cursor-pointer relative flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-lg w-[96px]"
              onClick={() => setFullscreenIndex(index)}
              title="Click to view fullscreen"
              aria-label={result.alt || "View generated image fullscreen"}
              style={{ minWidth: 0 }}
            >
              <div className="relative w-[96px] h-[96px] overflow-hidden rounded-lg border border-border bg-muted shadow-sm group-hover:scale-105 group-focus:scale-105 transition-transform duration-200">
                <Image
                  src={result.url}
                  alt={result.alt || "Generated image"}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  onLoad={() => setImageLoaded((prev) => ({ ...prev, [index]: true }))}
                  onError={(e) => {
                    // Hide the image on error
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    setImageLoaded((prev) => ({ ...prev, [index]: false }));
                  }}
                  unoptimized // Since these are temporary generated images
                />
                {/* Placeholder overlay: show if not loaded, or always on hover/focus */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-100 bg-black/40">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenIndex(index);
                    }}
                    className="p-1.5 rounded-full bg-white/80 text-foreground hover:bg-white transition-colors"
                    title="View fullscreen"
                    aria-label="View fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <a
                    href={result.url}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full bg-white/80 text-foreground hover:bg-white transition-colors"
                    title="Download"
                    aria-label="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
              {result.alt && (
                <p className="text-xs text-muted-foreground mt-2 text-center line-clamp-2 max-w-[96px]">{result.alt}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      {results.length > 0 && (
        <AlertDialog open={fullscreenIndex !== null} onOpenChange={(open) => !open && setFullscreenIndex(null)}>
          <AlertDialogContent className="max-w-4xl w-full flex flex-col items-center bg-transparent shadow-none border-none p-0">
            <AlertDialogTitle className="sr-only">
              {results[fullscreenIndex ?? 0].filename || results[fullscreenIndex ?? 0].alt || "Generated image"}
            </AlertDialogTitle>
            <div className="relative flex flex-col items-center justify-center w-full px-4">
              <Image
                src={results[fullscreenIndex ?? 0].url}
                alt={results[fullscreenIndex ?? 0].filename || results[fullscreenIndex ?? 0].alt || "Generated image"}
                width={1024}
                height={1024}
                className="object-contain max-h-[80vh] w-auto h-auto"
                unoptimized
                priority
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setFullscreenIndex(null)}>
                Close
              </Button>
              <Button
                variant="destructive"
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = results[fullscreenIndex ?? 0].url;
                  link.download = results[fullscreenIndex ?? 0].filename;
                  link.target = "_blank";
                  link.rel = "noopener noreferrer";
                  link.click();
                  setFullscreenIndex(null);
                }}
              >
                Download
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
});

// Knowledge Result interface
export interface KnowledgeResult {
  id: string;
  content: string;
  source?: string;
  score?: number;
  metadata?: Record<string, string | number | boolean>;
  timestamp?: string;
}

// Knowledge Results Component
export const KnowledgeResults = memo(function KnowledgeResults({ results }: { results: KnowledgeResult[] }) {
  if (!results || !Array.isArray(results)) return null;

  const truncateContent = (content: string) => {
    return content.length > 150 ? content.substring(0, 150) + "..." : content;
  };

  return (
    <div className="w-full overflow-x-auto pb-2 mt-2">
      <div className="flex gap-4 min-w-max">
        {results.map((result, index) => (
          <a
            key={result.id || index}
            href={`/knowledge/${result.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors duration-200 min-w-[280px] max-w-[280px]"
          >
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm">{truncateContent(result.content)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});
