import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/15",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/15",
        className
      )}
      {...props}
    />
  );
}
