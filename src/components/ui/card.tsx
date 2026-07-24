import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-panel border border-black/5 bg-white p-6 shadow-panel",
        className
      )}
      {...props}
    />
  );
}
