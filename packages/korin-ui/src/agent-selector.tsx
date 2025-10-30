"use client";

import { useAgent } from "@korinai/libs/contexts/agent-context";
import { Avatar, AvatarFallback, AvatarImage } from "@monorepo/shadcn-ui/components/ui/avatar";
import { Button } from "@monorepo/shadcn-ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@monorepo/shadcn-ui/components/ui/popover";
import { cn } from "@monorepo/shadcn-ui/lib/utils";
import { AvatarKorin } from "@monorepo/ui/avatar-korin";
import { AtSign, Bot, ChevronDown } from "lucide-react";

export function AgentSelector() {
  const { agents, currentAgent, switchAgent } = useAgent();

  return agents.length > 1 ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "cursor-pointer h-9 md:h-9 rounded-xl hover:bg-accent/40 transition-colors px-2 md:px-2 flex items-center gap-1 md:gap-1 min-w-0 max-w-[38vw] sm:max-w-[180px] md:max-w-none overflow-hidden group",
          )}
        >
          {currentAgent ? (
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <div className="h-6 w-6 md:h-6 md:w-6 rounded-full relative overflow-hidden flex-shrink-0">
                <AvatarKorin
                  src={currentAgent?.avatar_url}
                  alt={currentAgent?.name}
                  fallback={currentAgent?.name ? String(currentAgent.name).charAt(0).toUpperCase() : undefined}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-sm md:text-xs text-muted-foreground">@{currentAgent?.username}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          ) : (
            <>
              <AtSign className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm md:text-xs text-muted-foreground">Select agent</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {agents.map((agent) => (
            <div
              key={agent.agent_id}
              className="flex items-center py-2 px-3 hover:bg-accent/50 cursor-pointer"
              onClick={() => {
                switchAgent(agent.agent_id);
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
              }}
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={agent.avatar_url} alt={agent.name} />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm">{agent.name}</span>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  ) : (
    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
      <div className="h-6 w-6 md:h-6 md:w-6 rounded-full relative overflow-hidden flex-shrink-0">
        <AvatarKorin
          src={currentAgent?.avatar_url}
          alt={currentAgent?.name}
          fallback={currentAgent?.name ? String(currentAgent.name).charAt(0).toUpperCase() : undefined}
          className="h-full w-full object-cover"
        />
      </div>
      <span className="text-sm md:text-xs text-muted-foreground">@{currentAgent?.username || "username"}</span>
    </div>
  );
}
