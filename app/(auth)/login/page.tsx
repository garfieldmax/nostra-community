"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const searchParams = useSearchParams();
  const hasHydratedParamsRef = useRef(false);

  useEffect(() => {
    if (hasHydratedParamsRef.current) {
      return;
    }

    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
    }

    const messageParam = searchParams.get("message");
    if (messageParam) {
      setMessage(messageParam);
    }

    hasHydratedParamsRef.current = true;
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please add a name so teammates know who you are.");
      setPending(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      "/dashboard"
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectTo,
        data: { display_name: trimmedName },
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Check your inbox for the sign-in link. Once you follow it, we’ll finish setting up your profile."
      );
    }

    setPending(false);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">
            Enter your email and the name you’d like teammates to see. We’ll create
            your account if it doesn’t exist yet.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ada Lovelace"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="you@example.com"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Sending..." : "Send magic link"}
          </button>
        </form>
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
