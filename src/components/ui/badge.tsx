import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#edf3ec] px-2.5 py-1 text-[11px] font-semibold text-[#41614f]",
        className,
      )}
      {...props}
    />
  );
}
