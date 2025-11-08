"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { syncAuthToken } from "@/actions/auth";

function LoginForm() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const { login } = useLogin();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasHydratedParamsRef = useRef(false);
  const redirectingRef = useRef(false);

  useEffect(() => {
    // Only redirect once when authenticated
    if (authenticated && ready && !redirectingRef.current) {
      redirectingRef.current = true;
      
      // Sync auth token to server-side cookie before redirecting
      getAccessToken()
        .then(async (token) => {
          if (token) {
            const result = await syncAuthToken(token);
            if (!result.success) {
              console.error("[LoginForm] Failed to sync auth token");
              setError("Authentication sync failed. Please try again.");
              redirectingRef.current = false;
              return;
            }
          }
          
          // Navigate after successful token sync
          const redirect = searchParams.get("redirect");
          router.push(redirect || "/");
        })
        .catch((err) => {
          console.error("[LoginForm] Error during auth sync:", err);
          setError("Authentication failed. Please try again.");
          redirectingRef.current = false;
        });
    }
  }, [authenticated, ready, getAccessToken, router, searchParams]);

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

  async function handleEmailLogin() {
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if redirecting
  if (authenticated && redirectingRef.current) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Signing you in...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">
            Sign in with your email or wallet to continue.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleEmailLogin}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 disabled:opacity-60"
          >
            Sign in
          </button>
        </div>
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
