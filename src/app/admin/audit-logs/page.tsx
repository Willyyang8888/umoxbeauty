import { Card } from "@/components/ui/card";
import { getAuditLogs } from "@/server/services/admin-service";
import { formatDate } from "@/lib/utils";

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Audit logs</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Administrative activity</h1>
      </div>
      <Card>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-black/5 bg-zinc-50 p-4 text-sm">
              <p className="font-medium text-ink">
                {log.action} | {log.entityType}
              </p>
              <p className="mt-1 text-zinc-600">
                {(log.adminUser.name ?? log.adminUser.email) || "Unknown admin"} | {formatDate(log.createdAt)}
              </p>
            </div>
          ))}
          {logs.length === 0 ? (
            <p className="text-sm leading-7 text-zinc-600">
              No audit log entries are recorded yet.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
