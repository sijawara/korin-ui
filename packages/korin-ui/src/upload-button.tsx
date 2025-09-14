import { useState, useEffect, useRef } from "react";
import { Button } from "@monorepo/shadcn-ui/button";
import { Upload, Loader2 } from "lucide-react";
import { Progress } from "@monorepo/shadcn-ui/progress";
import { getFileCategory } from "@korinai/libs/fileCategories";
import { useGalleryUpload } from "@korinai/libs/hooks/useGalleryUpload";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@monorepo/shadcn-ui/drawer";
import getFileIcon from "@korinai/libs/ui/getFileIcon";
import { useKorinAI } from "@korinai/libs/contexts/korinai-context";
import { useUser } from "@korinai/libs/hooks/useUser";

interface UploadButtonProps {
  onUploadComplete: () => Promise<void>;
  isKnowledge?: boolean;
  onError?: (error: string) => void;
}

export function UploadButton({
  onUploadComplete,
  isKnowledge = false,
  onError,
}: UploadButtonProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authToken } = useKorinAI();
  const { user } = useUser();
  const drawerContentRef = useRef<HTMLDivElement>(null);

  // Use the gallery upload hook
  const { uploadFile, uploadProgress, isUploading } = useGalleryUpload();
  const isAnalyzing =
    uploadProgress.status.toLowerCase().includes("processing") ||
    uploadProgress.status.toLowerCase().includes("analyzing");

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Focus management when drawer opens/closes
  useEffect(() => {
    if (isDrawerOpen && drawerContentRef.current) {
      const focusableElements = drawerContentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isDrawerOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        onError?.("File size must be less than 10MB");
        return;
      }

      // Cleanup previous preview URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);

      // Create preview URL for the file
      try {
        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
      } catch (err) {
        console.error("Failed to create preview URL:", err);
        setPreviewUrl(null);
      }

      setIsDrawerOpen(true);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile || !authToken) {
      setError("Please select a file to upload");
      onError?.("Please select a file to upload");
      return;
    }

    setError(null);

    try {
      const result = await uploadFile(
        selectedFile,
        false, // Always private
        user?.email ? [user.email] : [], // Current user email as default access if available
        isKnowledge
      );

      if (result.success) {
        // Close drawer and reset state
        setIsDrawerOpen(false);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setSelectedFile(null);
        setError(null);

        // Refresh the gallery
        await onUploadComplete();
      } else {
        setError(result.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(
        typeof error === "string" ? error : "Upload failed. Please try again."
      );
    }
  };

  return (
    <>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.txt,.csv,.md,.js,.html,.css,.xml,.rtf,.py,.png,.jpg,.jpeg,.webp,.heic,.heif,.mp4,.mpeg,.mov,.avi,.flv,.mpg,.webm,.wmv,.3gpp,.wav,.mp3,.aiff,.aac,.ogg,.flac,audio/*"
      />
      <Button
        onClick={() => document.getElementById("file-upload")?.click()}
        className="w-full"
        aria-label="Upload file"
      >
        <Upload className="h-4 w-4" />
        <span className="hidden md:inline-block md:ml-2">Upload</span>
      </Button>

      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open: boolean) => {
          setIsDrawerOpen(open);
          if (!open) {
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }
            setSelectedFile(null);
            setError(null);
          }
        }}
      >
        <DrawerContent
          ref={drawerContentRef}
          className="focus:outline-none max-h-[85vh] flex flex-col"
        >
          <div className="flex-none px-4 pb-2 pt-4">
            <DrawerHeader className="p-0">
              <DrawerTitle>Upload File</DrawerTitle>
              <DrawerDescription>
                Preview your file before uploading
              </DrawerDescription>
            </DrawerHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* File Preview Section */}
              {selectedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    {getFileCategory(selectedFile.name) === "image" ? (
                      <div className="w-full max-w-md rounded-lg overflow-hidden">
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-auto"
                          />
                        )}
                      </div>
                    ) : getFileCategory(selectedFile.name) === "video" ? (
                      <div className="w-full max-w-md rounded-lg overflow-hidden">
                        {previewUrl && (
                          <video
                            src={previewUrl}
                            controls
                            className="w-full h-auto"
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    ) : getFileCategory(selectedFile.name) === "audio" ? (
                      <div className="w-full max-w-md bg-secondary rounded-lg overflow-hidden">
                        {previewUrl && (
                          <audio
                            src={previewUrl}
                            controls
                            className="w-full p-2"
                          >
                            Your browser does not support the audio tag.
                          </audio>
                        )}
                      </div>
                    ) : (
                      <div className="w-full max-w-md h-48 bg-secondary rounded-lg flex items-center justify-center">
                        {getFileIcon(selectedFile.name)}
                        <span className="ml-2 text-sm font-medium">
                          {selectedFile.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-500 mt-2" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Section */}
          {(isUploading || isAnalyzing) && (
            <div
              className="flex-none p-4 border-t bg-background/95 space-y-2"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center justify-between">
                <span>Upload Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(uploadProgress.progress)}%
                </span>
              </div>
              <Progress
                value={uploadProgress.progress}
                className="w-full"
                aria-label={`Upload progress: ${Math.round(
                  uploadProgress.progress
                )}%`}
              />
              <p className="text-sm text-center text-muted-foreground">
                {uploadProgress.status}
              </p>
            </div>
          )}

          <div className="flex-none p-4 mt-auto border-t bg-background">
            <DrawerFooter className="p-0">
              <Button
                onClick={handleStartUpload}
                disabled={isUploading || isAnalyzing || !selectedFile}
                aria-busy={isUploading || isAnalyzing}
                className="w-full"
              >
                {isUploading || isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? "Uploading..." : "Processing..."}
                  </>
                ) : (
                  "Start Upload"
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isUploading || isAnalyzing}
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
