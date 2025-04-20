import React from "react";

interface TypingLoaderProps {
  color?: string;
}

export function TypingLoader({ color = "currentColor" }: TypingLoaderProps) {
  return (
    <div className="flex space-x-1">
      <div 
        className="w-1.5 h-1.5 rounded-full opacity-60 animate-bounce" 
        style={{ 
          backgroundColor: color,
          animationDelay: "0ms" 
        }}
      />
      <div 
        className="w-1.5 h-1.5 rounded-full opacity-60 animate-bounce" 
        style={{ 
          backgroundColor: color,
          animationDelay: "150ms" 
        }}
      />
      <div 
        className="w-1.5 h-1.5 rounded-full opacity-60 animate-bounce" 
        style={{ 
          backgroundColor: color,
          animationDelay: "300ms" 
        }}
      />
    </div>
  );
} 