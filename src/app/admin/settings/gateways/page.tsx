import { GatewaySettingsForm } from "@/components/admin/gateway-settings-form";
import { Card } from "@/components/ui/card";
import { getGatewayConfigurations } from "@/server/services/admin-service";

export default async function GatewaySettingsPage() {
  const configs = await getGatewayConfigurations();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">Gateway settings</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Current gateway configuration</h1>
      </div>
      <GatewaySettingsForm
        configs={configs.map((config) => ({
          gateway: config.gateway,
          enabled: config.enabled,
          isDefault: config.isDefault,
          environment: config.environment,
          nonSensitiveSettings: (config.nonSensitiveSettings ?? {}) as {
            minAmount?: number;
            maxAmount?: number;
            defaultCurrency?: string;
            presetAmounts?: number[];
            blocker?: string;
          }
        }))}
      />

      <Card className="space-y-4">
        {configs.map((config) => (
          <div key={config.gateway} className="rounded-2xl border border-black/5 bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-ink">{config.gateway}</p>
            <p className="mt-2 text-sm text-zinc-600">
              Enabled: {String(config.enabled)} | Default: {String(config.isDefault)} | Environment:{" "}
              {config.environment}
            </p>
          </div>
        ))}
        {configs.length === 0 ? (
          <p className="text-sm leading-7 text-zinc-600">
            Seed the database to view stored gateway settings. Secrets remain environment-based and
            are not displayed back in the UI.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
