import type { UIMessage } from "ai";

export interface PromptTemplate {
  id: string;
  profile_id: string;
  title: string;
  content: string;
  created_at?: string;
  formatted_date?: string;
  updated_at?: string;
}

export interface FileAttachment {
  gallery_id: string;
  file_caption: string;
  file_url: string;
}

export interface MessageMetadata {
  sender_info?: {
    sender_id?: string;
    username?: string;
    profile_picture_url?: string;
  };
  file_attachments?: FileAttachment[];
  github?: any;
  cloned_github?: any;
}

// Export the UIMessage type with our custom metadata
export type ChatMessage = UIMessage<MessageMetadata>;
