import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-brand text-white hover:bg-brand-dark",
        variant === "secondary" && "bg-white text-ink ring-1 ring-black/10 hover:bg-zinc-50",
        variant === "ghost" && "bg-transparent text-ink hover:bg-black/5",
        className
      )}
      {...props}
    />
  );
});
