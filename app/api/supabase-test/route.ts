import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/auth/privy";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "missing",
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      hasPrivyAppId: !!process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      hasPrivySecret: !!process.env.PRIVY_APP_SECRET,
    },
  };

  try {
    console.log("[API Test] Testing Supabase connection");
    const supabase = await supabaseServer();
    diagnostics.clientCreated = true;

    // Test 1: Simple query to members table
    console.log("[API Test] Testing members query");
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("id")
      .limit(1);

    if (membersError) {
      diagnostics.membersQuery = {
        success: false,
        error: {
          code: membersError.code,
          message: membersError.message,
          details: membersError.details,
          hint: membersError.hint,
        },
      };
    } else {
      diagnostics.membersQuery = {
        success: true,
        count: members?.length ?? 0,
      };
    }

    // Test 2: Privy auth check
    console.log("[API Test] Testing Privy auth");
    const sessionUser = await getSessionUser();

    diagnostics.authCheck = {
      success: true,
      hasUser: !!sessionUser,
      userId: sessionUser?.id,
    };

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
