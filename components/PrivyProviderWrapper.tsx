"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyAuthSync } from "./PrivyAuthSync";

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    throw new Error("Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable");
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#0f172a",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <PrivyAuthSync />
      {children}
    </PrivyProvider>
  );
}

