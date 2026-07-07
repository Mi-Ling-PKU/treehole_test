"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogOut, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function HeaderUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (!user) {
    return null;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-ink/70">
      <UserRound size={16} aria-hidden="true" />
      <span className="max-w-40 truncate">{user.email}</span>
      <button
        type="button"
        onClick={signOut}
        className="inline-flex items-center gap-1 rounded-md border border-ink/10 px-2 py-1.5 font-medium hover:bg-mist hover:text-ink"
      >
        <LogOut size={15} aria-hidden="true" />
        退出
      </button>
    </div>
  );
}
