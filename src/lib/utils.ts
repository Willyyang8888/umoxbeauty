import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amountInCents: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency
  }).format(amountInCents / 100);
}

export function formatDate(date: Date | string) {
  const resolved = typeof date === "string" ? new Date(date) : date;
  return resolved.toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
