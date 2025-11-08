"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { logout } from "@/actions/auth";

type UserMenuProps = {
  user: {
    email?: string | null;
    displayName?: string | null;
  };
  memberId: string | null;
};

export function UserMenu({ user, memberId }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout: privyLogout } = usePrivy();
  const label = user.displayName ?? user.email ?? "Unknown";
  const initial = label?.slice(0, 1).toUpperCase() ?? "?";

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      // First logout from Privy client-side
      await privyLogout();
      // Then clear server-side cookies and redirect
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 transition-opacity hover:opacity-80"
        aria-label="User menu"
      >
        <span className="hidden text-sm text-slate-600 sm:block">{label}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
          {initial}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.displayName}
            </p>
            {user.email && (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            )}
          </div>
          <div className="py-1">
            {memberId && (
              <Link
                href={`/members/${encodeURIComponent(memberId)}`}
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                Edit Profile
              </Link>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

