"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";

import { clearAuthSession, syncAuthToken } from "@/actions/auth";

/**
 * Client component that syncs Privy auth state to a secure server session.
 */
export function PrivyAuthSync() {
  const { authenticated, getAccessToken } = usePrivy();
  const lastSyncedToken = useRef<string | null>(null);
  const clearedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function synchronizeToken() {
      if (!authenticated) {
        lastSyncedToken.current = null;
        if (!clearedRef.current) {
          clearedRef.current = true;
          try {
            await clearAuthSession();
          } catch (error) {
            console.error("[PrivyAuthSync] Failed to clear session", error);
          }
        }
        return;
      }

      clearedRef.current = false;

      try {
        const token = await getAccessToken();
        if (!token || cancelled) {
          return;
        }

        if (lastSyncedToken.current === token) {
          return;
        }

        const tokenPreview = `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
        console.log(`[PrivyAuthSync] Syncing access token ${tokenPreview}`);
        lastSyncedToken.current = token;
        const result = await syncAuthToken(token);
        if (!result.success) {
          console.warn("[PrivyAuthSync] Failed to sync token", result.error);
          lastSyncedToken.current = null;
        }
      } catch (error) {
        console.error("[PrivyAuthSync] Error syncing Privy session", error);
        lastSyncedToken.current = null;
      }
    }

    void synchronizeToken();

    return () => {
      cancelled = true;
    };
  }, [authenticated, getAccessToken]);

  return null;
}
