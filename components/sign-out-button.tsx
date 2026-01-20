"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-blue-600 hover:text-blue-800"
    >
      Sign Out
    </button>
  );
}
