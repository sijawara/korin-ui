import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@monorepo/shadcn-ui/avatar";
import { cn } from "@monorepo/shadcn-ui/libs/utils";

interface AvatarKorinProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  src?: string;
  fallback?: string;
  alt?: string;
}

export const AvatarKorin = React.forwardRef<React.ElementRef<typeof Avatar>, AvatarKorinProps>(
  ({ className, src, fallback, alt, ...props }, ref) => {
    return (
      <Avatar ref={ref} className={cn("rounded-full bg-white", className)} {...props}>
        {src && <AvatarImage src={src} alt={alt || "Avatar"} className="object-cover" />}
        <AvatarFallback className="bg-white text-primary">
          {fallback || alt?.charAt(0).toUpperCase() || "u"}
        </AvatarFallback>
      </Avatar>
    );
  },
);

AvatarKorin.displayName = "AvatarKorin";
