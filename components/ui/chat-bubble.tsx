import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle
} from "lucide-react";
import { useState, useEffect, useMemo, useRef, memo } from "react";
import { useTheme } from "next-themes";
import { MemoizedMarkdown } from "@/components/ui/memoized-markdown";

// Extended UI Message interface
interface ExtendedUIMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  parts?: Array<MessagePart>;
  annotations?: Array<{
    id?: string;
    type?: string;
    name?: string;
    username?: string;
    data?: {
      username?: string;
    };
  }>;
}

interface ChatBubbleProps {
  message: ExtendedUIMessage;
  isStreaming?: boolean;
}

// Define more specific types for message parts
interface TextPart {
  type: 'text';
  text: string;
}

interface ToolInvocationPart {
  type: 'tool-invocation';
  toolInvocation: {
    toolCallId: string;
    toolName: string;
    args?: Record<string, unknown>;
    state?: 'call' | 'result' | 'partial-call';
  };
}

interface FilePart {
  type: 'file';
  file: { 
    url: string; 
    name: string;
  };
}

interface ReasoningPart {
  type: 'reasoning';
  reasoning: string;
}

interface SourcePart {
  type: 'source';
  source: {
    url: string;
  };
}

type MessagePart = TextPart | ToolInvocationPart | FilePart | ReasoningPart | SourcePart;

type ProcessedPart = 
  | { type: 'text'; content: string }
  | { type: 'tool-invocation'; toolInvocation: ToolInvocationPart['toolInvocation'] };

// MessageBlock component for rendering markdown content with memoization
const MessageBlock = memo(
  ({
    content,
    isContrastBackground,
  }: {
    content: string;
    isContrastBackground: boolean;
  }) => {
    if (!content || content === "..." || content === "") {
      return null;
    }

    return (
      <div className="message-block w-full">
        <MemoizedMarkdown
          content={content}
          className={isContrastBackground ? "text-primary-foreground" : ""}
        />
      </div>
    );
  }
);

MessageBlock.displayName = "MessageBlock";

// ToolInvocationBlock component for rendering tool invocations
const ToolInvocationBlock = memo(
  ({
    toolInvocation,
    isContrastBackground,
  }: {
    toolInvocation: ToolInvocationPart['toolInvocation'];
    isContrastBackground: boolean;
  }) => {
    const { toolName, state } = toolInvocation;
    
    // Ensure state is always defined
    const effectiveState = state || 'result';
    
    // Format function name for display
    const functionName = useMemo(() => {
      return toolName 
        ? toolName
            .split("_")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "Processing";
    }, [toolName]);

    // Get status color and icon
    const getStatusInfo = () => {
      switch (effectiveState) {
        case 'call':
          return {
            icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
            color: isContrastBackground ? 'text-primary-foreground' : 'text-primary',
            bgColor: isContrastBackground ? 'bg-primary/20' : 'bg-primary/10'
          };
        case 'result':
          return {
            icon: <CheckCircle className="h-3.5 w-3.5" />,
            color: isContrastBackground ? 'text-green-300' : 'text-green-500',
            bgColor: isContrastBackground ? 'bg-green-500/20' : 'bg-green-500/10'
          };
        case 'partial-call':
          return {
            icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
            color: isContrastBackground ? 'text-yellow-300' : 'text-yellow-500',
            bgColor: isContrastBackground ? 'bg-yellow-500/20' : 'bg-yellow-500/10'
          };
        default:
          return {
            icon: <Loader2 className="h-3.5 w-3.5" />,
            color: isContrastBackground ? 'text-muted-foreground/80' : 'text-muted-foreground',
            bgColor: isContrastBackground ? 'bg-muted/80' : 'bg-muted'
          };
      }
    };

    const { icon, color, bgColor } = getStatusInfo();

    return (
      <div className="tool-invocation">
        <div 
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgColor}`}
        >
          <span className={`${color} flex items-center`}>{icon}</span>
          <span className={`text-xs font-medium ${color} tracking-wide`}>
            {functionName}
          </span>
        </div>
      </div>
    );
  }
);

ToolInvocationBlock.displayName = "ToolInvocationBlock";

// TypingIndicator component for showing typing animation
const TypingIndicator = memo(
  ({ isTyping }: { isTyping: boolean }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    // Handle the appearance/disappearance with useEffect
    useEffect(() => {
      if (isTyping) {
        setIsVisible(true);
      } else {
        // Small delay to allow exit animation
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 200);
        return () => clearTimeout(timer);
      }
    }, [isTyping]);
    
    if (!isTyping && !isVisible) return null;
    
    return (
      <div 
        className={`flex items-center h-4 mb-2 mt-2
          transition-all duration-200 ease-in-out
          ${isTyping 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 -translate-y-1"
          }`}
      >
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }
);

TypingIndicator.displayName = "TypingIndicator";

// Type guards for message parts
function isTextPart(part: MessagePart): part is TextPart {
  return part?.type === 'text' && typeof (part as TextPart).text === 'string';
}

function isToolInvocationPart(part: MessagePart): part is ToolInvocationPart {
  return part?.type === 'tool-invocation' && !!(part as ToolInvocationPart).toolInvocation;
}

function isReasoningPart(part: MessagePart): part is ReasoningPart {
  return part?.type === 'reasoning' && typeof (part as ReasoningPart).reasoning === 'string';
}

function isSourcePart(part: MessagePart): part is SourcePart {
  return part?.type === 'source' && !!(part as SourcePart).source?.url;
}

// Main ChatBubble component
export function ChatBubble({
  message,
  isStreaming,
}: ChatBubbleProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // Get the last annotation for the message
  const annotations = message.annotations;
  const lastAnnotation = annotations && annotations.length > 0 
    ? annotations[annotations.length - 1] 
    : undefined;

  // Get message properties
  const isMe = message.role === 'user';
  const isAI = message.role === 'assistant';
  const senderUsername = isMe 
    ? 'user'
    : (message.annotations?.find((a) => a.type === 'sender_info')?.data?.username || 
       lastAnnotation?.data?.username || 'assistant');

  // Process message parts
  const processedContent = useMemo(() => {
    const parts = message.parts || [{ type: 'text', text: message.content }];
    return parts.map(part => {
      if (!part) return null;
      
      if (isTextPart(part)) {
        return {
          type: 'text' as const,
          content: part.text
        };
      }
      
      if (isToolInvocationPart(part)) {
        return {
          type: 'tool-invocation' as const,
          toolInvocation: part.toolInvocation
        };
      }
      
      if (isReasoningPart(part)) {
        return {
          type: 'text' as const,
          content: part.reasoning
        };
      }
      
      if (isSourcePart(part)) {
        return {
          type: 'text' as const,
          content: `Source: ${part.source.url}`
        };
      }
      
      return null;
    }).filter((part): part is ProcessedPart => part !== null);
  }, [message]);

  // Container class
  const containerClass = `flex flex-col ${isMe ? "items-end" : "items-start"} relative w-full space-y-1`;

  // Message container class
  const messageContainerClass = `flex flex-col space-y-2 w-full ${isMe ? "items-end" : "items-start"}`;

  // Content area class
  const contentAreaClass = `space-y-1 overflow-x-hidden ${isMe ? "items-end" : "items-start"}`;

  // Time classes
  const timeClasses = `text-[10px] ${
    isMe ? "text-primary-foreground/75" : "text-muted-foreground"
  } ${isMe ? "" : "ml-auto"}`;

  // Format timestamp
  const timeString = useMemo(() => {
    return new Date(message.createdAt?.toISOString() || new Date()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [message.createdAt]);

  // Get bubble style based on part type
  const getBubbleStyle = (partType: ProcessedPart['type']) => {
    const baseClasses = "rounded-2xl px-4 py-3 break-words shadow-sm overflow-x-auto max-w-[95vw] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] xl:max-w-[550px]";
    if (isMe) {
      return `${baseClasses} bg-primary text-primary-foreground`;
    }
    
    // Only apply bubble style to text parts
    if (partType === 'text') {
      const isDarkMode = resolvedTheme === 'dark';
      return `${baseClasses} ${
        isDarkMode 
          ? 'bg-secondary text-secondary-foreground' 
          : 'bg-secondary text-secondary-foreground'
      } border border-border/40`;
    }
    
    // No bubble style for tool invocations
    return '';
  };

  return (
    <div className={containerClass}>
      {/* Username with modern badge */}
      <div className={`flex items-center gap-2 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        <span className="text-xs font-medium text-muted-foreground/80">
          @{senderUsername}
        </span>
        {isAI && (
          <Badge
            variant="secondary"
            className="h-5 px-2 text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/15"
          >
            AI
          </Badge>
        )}
      </div>

      <div className={messageContainerClass}>
        {/* Message content */}
        {processedContent.map((part, index) => (
          <div 
            key={index} 
            className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}
          >
            <div className={`${contentAreaClass} ${part.type === 'text' ? 'max-w-[95%] sm:max-w-[85%] md:max-w-[90%] lg:max-w-[95%]' : 'w-auto'}`}>
              {part.type === 'tool-invocation' ? (
                <ToolInvocationBlock
                  toolInvocation={part.toolInvocation}
                  isContrastBackground={isMe}
                />
              ) : (
                <div 
                  className={`relative group ${getBubbleStyle(part.type)}`}
                >
                  <div className="overflow-x-auto">
                    <MessageBlock
                      content={part.content}
                      isContrastBackground={isMe}
                    />

                    {/* Timestamp with modern styling */}
                    <div className="flex items-center justify-end mt-1">
                      <p className={timeClasses}>
                        {timeString}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={messagesEndRef} />

      {/* Show typing indicator */}
      {isStreaming && (
        <TypingIndicator isTyping={true} />
      )}
    </div>
  );
} 