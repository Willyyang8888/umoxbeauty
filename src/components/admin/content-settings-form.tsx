"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";

type ContentSettingsFormProps = {
  initialValues: {
    siteName: string;
    legalCompanyName: string;
    supportLabel: "Support" | "Contribution" | "Project Funding" | "Donation";
    homepageTitle: string;
    homepageSubtitle: string;
    projectPurpose: string;
    fundUsageDescription: string;
    supportEmail: string;
    registeredAddress: string;
    businessNumber: string;
    contactPhone: string;
  };
};

export function ContentSettingsForm({ initialValues }: ContentSettingsFormProps) {
  const [state, setState] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    const response = await fetch("/api/admin/settings/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(state)
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Unable to save content settings.");
      setLoading(false);
      return;
    }

    setStatus("Content settings saved.");
    setLoading(false);
  }

  return (
    <Card>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="siteName">
              Site name
            </label>
            <Input
              id="siteName"
              value={state.siteName}
              onChange={(event) => setState((current) => ({ ...current, siteName: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="legalCompanyName">
              Legal company name
            </label>
            <Input
              id="legalCompanyName"
              value={state.legalCompanyName}
              onChange={(event) =>
                setState((current) => ({ ...current, legalCompanyName: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="supportLabel">
              Support label
            </label>
            <select
              id="supportLabel"
              className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm"
              value={state.supportLabel}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  supportLabel: event.target.value as ContentSettingsFormProps["initialValues"]["supportLabel"]
                }))
              }
            >
              <option value="Support">Support</option>
              <option value="Contribution">Contribution</option>
              <option value="Project Funding">Project Funding</option>
              <option value="Donation">Donation</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="homepageTitle">
            Homepage title
          </label>
          <Input
            id="homepageTitle"
            value={state.homepageTitle}
            onChange={(event) => setState((current) => ({ ...current, homepageTitle: event.target.value }))}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="homepageSubtitle">
            Homepage subtitle
          </label>
          <Textarea
            id="homepageSubtitle"
            value={state.homepageSubtitle}
            onChange={(event) => setState((current) => ({ ...current, homepageSubtitle: event.target.value }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="projectPurpose">
              Project purpose
            </label>
            <Textarea
              id="projectPurpose"
              value={state.projectPurpose}
              onChange={(event) => setState((current) => ({ ...current, projectPurpose: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="fundUsageDescription">
              Fund usage description
            </label>
            <Textarea
              id="fundUsageDescription"
              value={state.fundUsageDescription}
              onChange={(event) =>
                setState((current) => ({ ...current, fundUsageDescription: event.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="supportEmail">
              Support email
            </label>
            <Input
              id="supportEmail"
              type="email"
              value={state.supportEmail}
              onChange={(event) => setState((current) => ({ ...current, supportEmail: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="contactPhone">
              Contact phone
            </label>
            <Input
              id="contactPhone"
              value={state.contactPhone}
              onChange={(event) => setState((current) => ({ ...current, contactPhone: event.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="businessNumber">
              Business number
            </label>
            <Input
              id="businessNumber"
              value={state.businessNumber}
              onChange={(event) => setState((current) => ({ ...current, businessNumber: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="registeredAddress">
              Registered address
            </label>
            <Input
              id="registeredAddress"
              value={state.registeredAddress}
              onChange={(event) => setState((current) => ({ ...current, registeredAddress: event.target.value }))}
            />
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {status ? <p className="text-sm font-medium text-brand-dark">{status}</p> : null}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save content settings"}
        </Button>
      </form>
    </Card>
  );
}
