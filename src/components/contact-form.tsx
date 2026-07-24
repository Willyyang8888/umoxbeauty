"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";

export function ContactForm() {
  const [state, setState] = useState({
    name: "",
    email: "",
    message: "",
    honeypot: ""
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(state)
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Unable to submit form.");
      return;
    }

    setStatus("Your message has been submitted.");
    setState({
      name: "",
      email: "",
      message: "",
      honeypot: ""
    });
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="contactName">
            Name
          </label>
          <Input
            id="contactName"
            value={state.name}
            onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="contactEmail">
            Email
          </label>
          <Input
            id="contactEmail"
            type="email"
            value={state.email}
            onChange={(event) => setState((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <Input
            id="website"
            value={state.honeypot}
            onChange={(event) => setState((current) => ({ ...current, honeypot: event.target.value }))}
            tabIndex={-1}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="contactMessage">
            Message
          </label>
          <Textarea
            id="contactMessage"
            value={state.message}
            onChange={(event) => setState((current) => ({ ...current, message: event.target.value }))}
            required
          />
        </div>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {status ? <p className="text-sm font-medium text-brand-dark">{status}</p> : null}
        <Button type="submit">Send message</Button>
      </form>
    </Card>
  );
}
