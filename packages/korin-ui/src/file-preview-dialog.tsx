import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@monorepo/shadcn-ui/dialog";
import { Button } from "@monorepo/shadcn-ui/button";
import { getFileCategory, getFileName } from "@korinai/libs";
import { getFileIcon } from "@korinai/libs/ui/getFileIcon";
import { useRef, useState, useEffect, useCallback, memo } from "react";
import { useGalleryDetail } from "@korinai/libs/hooks/useGalleryDetail";
import { cn } from "@monorepo/shadcn-ui/libs/utils";

interface FilePreviewDialogProps {
  url: string;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showSelectButton?: boolean;
  onSelect?: () => void;
  itemId?: string;
}

// Create a memoized version of FilePreviewDialog
const FilePreviewDialog = memo(function FilePreviewDialogInner({
  url,
  name,
  open,
  onOpenChange,
  showSelectButton = false,
  onSelect,
  itemId,
}: FilePreviewDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const { detail } = useGalleryDetail(open && itemId ? itemId : null);

  const displayUrl = detail?.file_url || url;
  const fileCategory = getFileCategory(displayUrl);
  const displayName = getFileName(displayUrl);

  // Remove console logs for better performance
  // console.log("File Category:", fileCategory);
  // console.log("Display URL:", displayUrl);
  // console.log("Name:", displayName);

  // Calculate these values once
  const urlExtension = displayUrl.split(".").pop()?.toLowerCase();
  const nameExtension = displayName.split(".").pop()?.toLowerCase();
  const isPdf = (urlExtension === "pdf" || nameExtension === "pdf") && fileCategory === "document";

  // Force image category if URL ends with image extension
  const isImage = fileCategory === "image" || /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(displayUrl.toLowerCase());
  const isVideo =
    fileCategory === "video" || /\.(mp4|mpeg|mov|avi|flv|mpg|webm|wmv|3gpp)$/i.test(displayUrl.toLowerCase());
  const isAudio = fileCategory === "audio" || /\.(wav|mp3|aiff|aac|ogg|flac)$/i.test(displayUrl.toLowerCase());

  // Remove console logs
  // console.log("Is PDF:", isPdf, { urlExtension, nameExtension, fileCategory });

  // Use useCallback to prevent recreating this function
  const getFileUrl = useCallback(async () => {
    if (!isPdf || !open) return;

    setIsLoading(true);
    setError(null);
    try {
      // TODO: rewrite without firebase
      // Extract the path from the Firebase Storage URL
      // const urlObj = new URL(displayUrl);
      // const pathStart = urlObj.pathname.indexOf("/o/") + 3;
      // const pathEnd = urlObj.pathname.indexOf("?", pathStart);
      // const path = decodeURIComponent(
      //   urlObj.pathname.substring(
      //     pathStart,
      //     pathEnd !== -1 ? pathEnd : undefined
      //   )
      // );
      // // Get a fresh download URL
      // const storageRef = ref(storage, path);
      // const url = await getDownloadURL(storageRef);
      // setDownloadUrl(url);
    } catch (err) {
      console.error("Error getting download URL:", err);
      setError(err instanceof Error ? err : new Error("Failed to load file"));
    } finally {
      setIsLoading(false);
    }
  }, [isPdf, displayUrl, open]);

  useEffect(() => {
    if (open) {
      // Reset image loaded state on dialog open
      setIsImageLoaded(false);
      getFileUrl();
    } else {
      // Cleanup on dialog close
      setDownloadUrl(null);
      setError(null);
    }
  }, [open, getFileUrl]);

  // Memoized handlers to prevent recreating functions on every render
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      console.error("Image failed to load:", displayUrl);
      e.currentTarget.style.display = "none";
    },
    [displayUrl],
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSelect = useCallback(() => {
    onSelect?.();
  }, [onSelect]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg">{displayName}</DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
          <div className="h-full flex flex-col items-center justify-center">
            {isImage ? (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg p-2">
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">Loading image...</div>
                  </div>
                )}
                <img
                  key={displayUrl}
                  src={displayUrl}
                  alt={displayName}
                  className={cn("max-w-full max-h-[70vh] object-contain rounded transition-opacity duration-200", {
                    "opacity-100": isImageLoaded,
                    "opacity-0": !isImageLoaded,
                  })}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              </div>
            ) : isVideo ? (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg p-2">
                <video
                  src={displayUrl}
                  controls
                  className="max-w-full max-h-[70vh] object-contain rounded"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : isAudio ? (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg p-2">
                <audio src={displayUrl} controls className="w-full max-w-[500px]" preload="metadata">
                  Your browser does not support the audio tag.
                </audio>
              </div>
            ) : isPdf ? (
              <div className="w-full h-full flex flex-col items-center bg-secondary rounded-lg p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[50vh]">
                    <p>Loading PDF...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full min-h-[50vh]">
                    <p>Error loading PDF. Please try again.</p>
                  </div>
                ) : downloadUrl ? (
                  <iframe src={downloadUrl} className="w-full h-[65vh] border-0 rounded" title="PDF Preview" />
                ) : null}
              </div>
            ) : (
              <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-secondary rounded-lg">
                <div className="text-4xl">{getFileIcon(displayUrl)}</div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t mt-4 pt-4">
          <div className="w-full flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 justify-end">
            <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              Close
            </Button>
            {showSelectButton && onSelect && (
              <Button onClick={handleSelect} className="w-full sm:w-auto">
                Select File
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// Add display name for React DevTools
FilePreviewDialog.displayName = "FilePreviewDialog";

export { FilePreviewDialog };
