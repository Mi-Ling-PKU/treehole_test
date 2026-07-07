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
    <div className="flex min-w-0 items-center gap-2 text-sm text-ink/70 dark:text-white/80">
      <UserRound className="hidden shrink-0 sm:block" size={16} aria-hidden="true" />
      <span className="max-w-[6.5rem] truncate sm:max-w-40">{user.email}</span>
      <button
        type="button"
        onClick={signOut}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-ink/10 px-2 py-1.5 font-medium hover:bg-mist hover:text-ink dark:border-white/15 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <LogOut size={15} aria-hidden="true" />
        退出
      </button>
    </div>
  );
}
