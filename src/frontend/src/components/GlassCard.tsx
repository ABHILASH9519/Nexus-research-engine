import { cn } from "@/lib/utils";
import type * as React from "react";

interface GlassCardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "strong" | "subtle";
}

export function GlassCard({
  className,
  variant = "default",
  children,
  ...props
}: GlassCardProps) {
  const variantClasses = {
    default: "glass shadow-glass",
    strong: "glass-strong shadow-elevated",
    subtle: "glass-subtle shadow-glass-sm",
  };

  return (
    <div
      className={cn(
        "rounded-xl transition-smooth",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
