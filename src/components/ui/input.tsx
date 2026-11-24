import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#dfe3dc] bg-white px-3.5 py-2 text-sm text-[#283c33] shadow-sm outline-none placeholder:text-[#9ca69e] focus:border-[#72917e] focus:ring-4 focus:ring-[#214e42]/[.07] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
