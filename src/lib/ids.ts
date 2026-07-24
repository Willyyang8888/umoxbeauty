import { customAlphabet } from "nanoid";

const refGenerator = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

export function generatePublicReference(prefix = "SUP") {
  return `${prefix}-${refGenerator()}`;
}

export function buildIdempotencyKey(reference: string, gateway: string) {
  return `${reference}:${gateway}:${Date.now()}`;
}
