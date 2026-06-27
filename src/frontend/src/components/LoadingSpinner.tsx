import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <output
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
      aria-label={label || "Loading"}
      data-ocid="loading.spinner"
    >
      <div
        className={cn(
          "animate-spin rounded-full border-primary/30 border-t-primary",
          sizeClasses[size],
        )}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </output>
  );
}
