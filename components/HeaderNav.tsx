"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Shield, Star } from "lucide-react";
import { isCurrentUserAdmin } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeaderNav() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      const allowed = await isCurrentUserAdmin().catch(() => false);
      if (active) {
        setShowAdmin(allowed);
      }
    }

    refresh();
    const { data } = supabase.auth.onAuthStateChange(refresh);

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="flex flex-wrap items-center justify-end gap-1 text-sm font-medium text-ink/70">
      <Link className="rounded-md px-3 py-2 hover:bg-mist hover:text-ink" href="/">
        广场
      </Link>
      <Link className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mist hover:text-ink" href="/favorites">
        <Star size={15} aria-hidden="true" />
        关注
      </Link>
      <Link className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mist hover:text-ink" href="/messages">
        <Bell size={15} aria-hidden="true" />
        消息
      </Link>
      {showAdmin ? (
        <Link className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-mist hover:text-ink" href="/admin">
          <Shield size={15} aria-hidden="true" />
          审核
        </Link>
      ) : null}
      <ThemeToggle />
    </nav>
  );
}
