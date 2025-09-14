import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@monorepo/shadcn-ui/tabs";
import { Card, CardContent } from "@monorepo/shadcn-ui/card";
import { Input } from "@monorepo/shadcn-ui/input";
import { Image, File, Search, FileVideo, FileAudio } from "lucide-react";
import { ScrollArea } from "@monorepo/shadcn-ui/scroll-area";
import { useGallery } from "@korinai/libs/hooks/useGallery";
import { getFileCategory, getFileName } from "@korinai/libs";
import { getFileIcon } from "@korinai/libs/ui/getFileIcon";
import { UploadButton } from "@monorepo/ui/upload-button";
import { FilePreviewDialog } from "@monorepo/ui/file-preview-dialog";

type TabType = "images" | "videos" | "audio" | "documents";

interface FileSelectorProps {
  onSelect: (fileInfo: {
    url: string;
    name: string;
    displayName: string;
    caption?: string;
    gallery_id?: string;
  }) => void;
  onClose: () => void;
  initialTab?: TabType;
  disabledTabs?: TabType[];
}

type StorageItem = {
  id: string;
  file_url: string;
  caption: string;
  created_at: string;
  updated_at: string;
};

const FileCard = ({ item, onSelect }: { item: StorageItem; onSelect: () => void }) => {
  const fileName = getFileName(item.file_url);
  const fileCategory = getFileCategory(item.file_url);

  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={onSelect}>
      <CardContent className="p-4 space-y-4">
        {fileCategory === "video" ? (
          <div className="aspect-square w-full overflow-hidden rounded-lg">
            <video src={item.file_url} className="w-full h-full object-cover">
              Your browser does not support the video tag.
            </video>
          </div>
        ) : fileCategory === "audio" ? (
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-secondary flex items-center justify-center">
            <div className="w-full p-4 flex flex-col items-center gap-2">
              {getFileIcon(item.file_url)}
              <audio src={item.file_url} controls className="w-full mt-2">
                Your browser does not support the audio tag.
              </audio>
            </div>
          </div>
        ) : (
          <div className="aspect-square w-full overflow-hidden rounded-lg">
            {fileCategory === "document" ? (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                {getFileIcon(item.file_url)}
              </div>
            ) : (
              <img src={item.file_url} alt={fileName} className="w-full h-full object-cover" />
            )}
          </div>
        )}
        <div className="relative w-full overflow-hidden">
          <p className="text-sm font-medium line-clamp-2 break-all" title={fileName}>
            {fileName}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export function FileSelector({ onSelect, onClose, initialTab = "images", disabledTabs = [] }: FileSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const { items, isLoading, isError, mutate } = useGallery();
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items
      .filter((item) => {
        if (!item?.file_url) return false;
        const fileCategory = getFileCategory(item.file_url);
        const fileName = getFileName(item.file_url);
        const matchesSearch =
          !searchTerm ||
          fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.caption || "").toLowerCase().includes(searchTerm.toLowerCase());

        // Match items based on their specific category
        switch (activeTab) {
          case "images":
            return fileCategory === "image" && matchesSearch;
          case "videos":
            return fileCategory === "video" && matchesSearch;
          case "audio":
            return fileCategory === "audio" && matchesSearch;
          case "documents":
            return fileCategory === "document" && matchesSearch;
          default:
            return false;
        }
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [items, searchTerm, activeTab]);

  const handleSelect = useCallback(
    (item: StorageItem) => {
      const displayName = getFileName(item.file_url);
      onSelect({
        url: item.file_url,
        name: item.file_url,
        displayName,
        caption: item.caption,
        gallery_id: item.id,
      });
      onClose();
    },
    [onSelect, onClose],
  );

  const handleUploadComplete = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const tabs: { value: TabType; icon: React.ElementType; label: string }[] = [
    { value: "images", icon: Image, label: "Images" },
    { value: "videos", icon: FileVideo, label: "Videos" },
    { value: "audio", icon: FileAudio, label: "Audio" },
    { value: "documents", icon: File, label: "Docs" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-[120px]">
          <UploadButton onUploadComplete={handleUploadComplete} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map(
            ({ value, icon: Icon, label }) =>
              !disabledTabs.includes(value) && (
                <TabsTrigger key={value} value={value} disabled={disabledTabs.includes(value)}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline-block sm:ml-2">{label}</span>
                </TabsTrigger>
              ),
          )}
        </TabsList>

        <ScrollArea className="h-[400px] mt-4 pr-4">
          {tabs
            .map((tab) => tab.value)
            .filter((tab) => !disabledTabs.includes(tab))
            .map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <p>Loading {tab}...</p>
                  </div>
                ) : isError ? (
                  <div className="flex justify-center items-center h-32">
                    <p className="text-red-500">Error loading {tab}</p>
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                      <FileCard key={item.id} item={item} onSelect={() => setPreviewItem(item)} />
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-32">
                    <p className="text-muted-foreground">No {tab} found</p>
                  </div>
                )}
              </TabsContent>
            ))}
        </ScrollArea>
      </Tabs>

      {previewItem && (
        <FilePreviewDialog
          url={previewItem.file_url}
          name={previewItem.file_url.split("/").pop()}
          open={!!previewItem}
          onOpenChange={(open) => !open && setPreviewItem(null)}
          showSelectButton
          onSelect={() => handleSelect(previewItem)}
          itemId={previewItem.id}
        />
      )}
    </div>
  );
}
