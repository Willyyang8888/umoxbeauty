"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin"
    });

    if (result?.error) {
      setError("Invalid admin credentials.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <Card className="mx-auto max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="email">
            Admin email
          </label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
