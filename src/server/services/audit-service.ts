import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AuditInput = {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function createAuditLog(input: AuditInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined
      }
    });
  } catch {
    return null;
  }
}
