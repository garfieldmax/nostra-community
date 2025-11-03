import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/dashboard";
  const redirectUrl = new URL(next, url.origin);
  const errorDescription = url.searchParams.get("error_description");

  if (errorDescription) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", errorDescription);
    return NextResponse.redirect(loginUrl);
  }

  const code = url.searchParams.get("code");

  if (!code) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "Missing authentication code.");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", error.message ?? "Unable to sign in.");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(redirectUrl);
}
