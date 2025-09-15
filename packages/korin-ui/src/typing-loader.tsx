import { cn } from "@monorepo/shadcn-ui/libs/utils";
import { useEffect, useState } from "react";

interface TypingLoaderProps {
  className?: string;
  messages?: string[];
  interval?: number;
}

// Animated square to circle component
function AnimatedSquareCircle() {
  return (
    <div className="relative w-3 h-3">
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500 dark:from-blue-300 dark:via-cyan-200 dark:to-cyan-300 opacity-90"
        style={{
          backgroundSize: "200% 100%",
          animation: "korinai-morphShape 2s ease-in-out infinite, korinai-gradientShift 3s ease-in-out infinite",
          borderRadius: "2px",
        }}
      />
      <style>{`
        @keyframes korinai-morphShape {
          0%,
          100% {
            border-radius: 2px;
            transform: rotate(0deg);
          }
          50% {
            border-radius: 50%;
            transform: rotate(180deg);
          }
        }
        @keyframes korinai-gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}

export function TypingLoader({
  className,
  messages = ["Thinking", "Working", "Implementing", "Almost there"],
  interval = 3000,
}: TypingLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <AnimatedSquareCircle />
      <span
        className="bg-gradient-to-r from-slate-600 via-slate-800 to-slate-600 dark:from-gray-400 dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent animate-gradient-x text-xs font-medium"
        style={{
          backgroundSize: "200% 100%",
        }}
      >
        {messages[currentMessageIndex]}
      </span>
    </div>
  );
}
