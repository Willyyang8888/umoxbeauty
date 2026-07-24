import { Card } from "@/components/ui/card";
import { getReleaseReadiness } from "@/lib/release-readiness";

export default async function DeploymentReadinessPage() {
  const readiness = await getReleaseReadiness();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Release readiness</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Production launch gate</h1>
      </div>

      <Card className={readiness.canPublishToProduction ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}>
        <p className="text-sm font-semibold text-ink">
          {readiness.canPublishToProduction
            ? "Current configuration passes the production gate."
            : "Production publishing is currently blocked."}
        </p>
        {!readiness.canPublishToProduction ? (
          <ul className="mt-4 space-y-2 text-sm leading-7 text-zinc-700">
            {readiness.blockers.map((blocker) => (
              <li key={blocker}>- {blocker}</li>
            ))}
          </ul>
        ) : null}
      </Card>

      <Card>
        <p className="text-sm font-semibold text-ink">Checks</p>
        <div className="mt-4 space-y-3">
          {readiness.checks.map((check) => (
            <div key={check.key} className="rounded-2xl border border-black/5 bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">{check.label}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    check.status === "pass"
                      ? "bg-emerald-100 text-emerald-800"
                      : check.status === "warn"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {check.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-zinc-600">{check.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-ink">Operational documents</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-zinc-600">
          <li>- `docs/production-deployment-checklist.md`</li>
          <li>- `docs/database-backup-and-recovery.md`</li>
          <li>- `docs/logging-and-monitoring.md`</li>
        </ul>
      </Card>
    </div>
  );
}
