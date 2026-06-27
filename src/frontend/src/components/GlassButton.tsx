import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type * as React from "react";

interface GlassButtonProps extends React.ComponentProps<typeof Button> {
  glassVariant?: "default" | "outline" | "ghost" | "hero";
}

export function GlassButton({
  className,
  glassVariant = "default",
  children,
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    default:
      "bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-md shadow-glass-sm",
    outline:
      "bg-transparent border border-border/60 hover:bg-accent/50 backdrop-blur-sm",
    ghost: "bg-transparent hover:bg-accent/30 backdrop-blur-sm",
    hero: "gradient-primary text-white hover:opacity-90 backdrop-blur-md shadow-glass",
  };

  return (
    <Button
      className={cn(
        "transition-smooth rounded-lg",
        variantClasses[glassVariant],
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
