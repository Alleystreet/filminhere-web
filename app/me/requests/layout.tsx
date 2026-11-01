"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// This controls display only. Server routes and database policies enforce access.
export default function RequestsLayout({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // INITIAL_SESSION supplies the initial identity; the same subscription also
    // handles sign-out in another tab and account changes without navigation.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIdentity(session?.user.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (identity === undefined) return <p role="status">Checking sign-in…</p>;
  if (identity === null) {
    return <p>Please <Link href="/auth/login">log in</Link> to view your requests.</p>;
  }

  // Remount pages on account changes so request data and unsent input cannot
  // carry over from the previous user's component state.
  return <Fragment key={identity}>{children}</Fragment>;
}
