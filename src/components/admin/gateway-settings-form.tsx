"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";

type GatewayConfig = {
  gateway: "STRIPE" | "MONERIS";
  enabled: boolean;
  isDefault: boolean;
  environment: string;
  nonSensitiveSettings: {
    minAmount?: number;
    maxAmount?: number;
    defaultCurrency?: string;
    presetAmounts?: number[];
    blocker?: string;
  };
};

export function GatewaySettingsForm({ configs }: { configs: GatewayConfig[] }) {
  const stripe = configs.find((item) => item.gateway === "STRIPE");
  const moneris = configs.find((item) => item.gateway === "MONERIS");

  const initialPresetAmounts = useMemo(
    () => (stripe?.nonSensitiveSettings?.presetAmounts ?? [1000, 2500, 5000, 10000]).join(", "),
    [stripe]
  );

  const [state, setState] = useState({
    defaultGateway: stripe?.isDefault ? "STRIPE" : moneris?.isDefault ? "MONERIS" : "STRIPE",
    stripeEnabled: stripe?.enabled ?? true,
    monerisEnabled: moneris?.enabled ?? false,
    environment: (stripe?.environment ?? "test") as "test" | "live",
    minAmount: String(stripe?.nonSensitiveSettings?.minAmount ?? 100),
    maxAmount: String(stripe?.nonSensitiveSettings?.maxAmount ?? 200000),
    defaultCurrency: (stripe?.nonSensitiveSettings?.defaultCurrency ?? "CAD") as "CAD",
    presetAmounts: initialPresetAmounts
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    const response = await fetch("/api/admin/settings/gateways", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        defaultGateway: state.defaultGateway,
        stripeEnabled: state.stripeEnabled,
        monerisEnabled: state.monerisEnabled,
        environment: state.environment,
        minAmount: Number(state.minAmount),
        maxAmount: Number(state.maxAmount),
        defaultCurrency: state.defaultCurrency,
        presetAmounts: state.presetAmounts
          .split(",")
          .map((item) => Math.round(Number(item.trim()) * 100))
          .filter((value) => Number.isFinite(value) && value > 0)
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Unable to save gateway settings.");
      setLoading(false);
      return;
    }

    setStatus("Gateway settings saved.");
    setLoading(false);
  }

  return (
    <Card>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-700">
            <span className="mb-2 block font-medium text-ink">Default gateway</span>
            <select
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3"
              value={state.defaultGateway}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  defaultGateway: event.target.value as "STRIPE" | "MONERIS"
                }))
              }
            >
              <option value="STRIPE">Stripe</option>
              <option value="MONERIS">Moneris</option>
            </select>
          </label>
          <label className="rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-700">
            <span className="mb-2 block font-medium text-ink">Environment</span>
            <select
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-3"
              value={state.environment}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  environment: event.target.value as "test" | "live"
                }))
              }
            >
              <option value="test">Test mode</option>
              <option value="live">Live mode</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={state.stripeEnabled}
              onChange={(event) => setState((current) => ({ ...current, stripeEnabled: event.target.checked }))}
            />
            <span>
              <span className="block font-medium text-ink">Enable Stripe</span>
              <span>Primary credit-card gateway.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={state.monerisEnabled}
              onChange={(event) => setState((current) => ({ ...current, monerisEnabled: event.target.checked }))}
            />
            <span>
              <span className="block font-medium text-ink">Enable Moneris</span>
              <span>Currently uses adapter scaffolding until account configuration is confirmed.</span>
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="minAmount">
              Minimum amount (cents)
            </label>
            <Input
              id="minAmount"
              type="number"
              value={state.minAmount}
              onChange={(event) => setState((current) => ({ ...current, minAmount: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="maxAmount">
              Maximum amount (cents)
            </label>
            <Input
              id="maxAmount"
              type="number"
              value={state.maxAmount}
              onChange={(event) => setState((current) => ({ ...current, maxAmount: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="defaultCurrency">
              Default currency
            </label>
            <Input id="defaultCurrency" value={state.defaultCurrency} readOnly />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="presetAmounts">
            Preset amounts in dollars, comma separated
          </label>
          <Input
            id="presetAmounts"
            value={state.presetAmounts}
            onChange={(event) => setState((current) => ({ ...current, presetAmounts: event.target.value }))}
          />
        </div>

        {moneris?.nonSensitiveSettings?.blocker ? (
          <p className="text-sm font-medium text-amber-700">{moneris.nonSensitiveSettings.blocker}</p>
        ) : null}
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {status ? <p className="text-sm font-medium text-brand-dark">{status}</p> : null}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save gateway settings"}
        </Button>
      </form>
    </Card>
  );
}
