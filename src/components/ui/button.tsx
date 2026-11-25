import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--app-primary)] text-white shadow-sm hover:bg-[var(--app-primary-hover)]",
        secondary: "bg-[var(--app-primary-soft)] text-[var(--app-primary-hover)] hover:bg-[var(--app-primary-soft-hover)]",
        outline: "border border-[var(--app-border)] bg-white text-[var(--app-text)] hover:bg-[var(--app-background)]",
        ghost: "text-[var(--app-muted)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary-hover)]",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  const resolvedVariant = variant ?? "default";
  return (
    <Component
      className={cn(buttonVariants({ variant, size }), `button-variant-${resolvedVariant}`, className)}
      {...props}
    />
  );
}
