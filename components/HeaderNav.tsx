"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isCurrentUserAdmin } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeaderNav() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function refreshAdminState() {
      const isAdmin = await isCurrentUserAdmin().catch(() => false);
      if (active) {
        setShowAdmin(isAdmin);
      }
    }

    refreshAdminState();

    const { data } = supabase.auth.onAuthStateChange(() => {
      refreshAdminState();
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="flex items-center gap-2 text-sm font-medium text-ink/70">
      <Link className="rounded-md px-3 py-2 hover:bg-mist hover:text-ink" href="/">
        首页
      </Link>
      <Link className="rounded-md px-3 py-2 hover:bg-mist hover:text-ink" href="/favorites">
        收藏
      </Link>
      {showAdmin ? (
        <Link className="rounded-md px-3 py-2 hover:bg-mist hover:text-ink" href="/admin">
          管理
        </Link>
      ) : null}
      <ThemeToggle />
    </nav>
  );
}
