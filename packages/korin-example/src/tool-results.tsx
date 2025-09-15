import React from "react";
import { WebSearchResults, KnowledgeResults, ImageGenerationResults } from "@monorepo/ui/tool-results";

export default function ToolResultsExample() {
  return (
    <div className="p-4 space-y-4">
      <WebSearchResults
        results={[
          { id: "w1", title: "Korin AI", url: "https://korinai.com", text: "AI platform website", image: "https://placehold.co/320x180" },
          { id: "w2", title: "Tailwind CSS", url: "https://tailwindcss.com", text: "Utility-first CSS framework" },
        ]}
      />
      <KnowledgeResults
        results={[
          { id: "k1", content: "How to integrate the ChatBubble in a page." },
          { id: "k2", content: "Styling guidance for shadcn with Tailwind v4." },
        ]}
      />
      <ImageGenerationResults
        part={{ state: "output-available" }}
        results={[
          { url: "https://placehold.co/256x256/png", alt: "Generated 1", filename: "img1.png" },
          { url: "https://placehold.co/256x256/jpg", alt: "Generated 2", filename: "img2.jpg" },
        ]}
      />
    </div>
  );
}
