import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "missing",
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    },
  };

  try {
    console.log("[API Test] Testing Supabase connection");
    const supabase = await supabaseServer();
    diagnostics.clientCreated = true;

    // Test 1: Simple query to profiles table
    console.log("[API Test] Testing profiles query");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (profilesError) {
      diagnostics.profilesQuery = {
        success: false,
        error: {
          code: profilesError.code,
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint,
        },
      };
    } else {
      diagnostics.profilesQuery = {
        success: true,
        count: profiles?.length ?? 0,
      };
    }

    // Test 2: Auth check
    console.log("[API Test] Testing auth");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      diagnostics.authCheck = {
        success: false,
        error: {
          status: authError.status,
          message: authError.message,
        },
      };
    } else {
      diagnostics.authCheck = {
        success: true,
        hasUser: !!user,
        userId: user?.id,
      };
    }

    diagnostics.overallStatus = "success";
    diagnostics.message = "Supabase connection test completed";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError =
      errorMessage.includes("ENOTFOUND") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("getaddrinfo") ||
      errorMessage.includes("timeout");

    diagnostics.overallStatus = "error";
    const errorDiagnostics: Record<string, unknown> = {
      message: errorMessage,
      isNetworkError,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    };

    if (isNetworkError) {
      errorDiagnostics.networkDiagnosis =
        "This appears to be a DNS/network connectivity issue. Check your network connection and DNS settings. IPv6 issues may cause this.";
    }

    diagnostics.error = errorDiagnostics;

    console.error("[API Test] Connection test failed:", diagnostics.error);
  }

  return NextResponse.json(diagnostics, { status: diagnostics.overallStatus === "error" ? 500 : 200 });
}
