"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, LayoutGrid, Shield, Star } from "lucide-react";
import { hasUnreadMessages, isCurrentUserAdmin } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export function HeaderNav() {
  const pathname = usePathname();
  const [showAdmin, setShowAdmin] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      const [allowed, unread] = await Promise.all([
        isCurrentUserAdmin().catch(() => false),
        hasUnreadMessages().catch(() => false)
      ]);
      if (active) {
        setShowAdmin(allowed);
        setHasUnread(unread);
      }
    }

    refresh();
    window.addEventListener("treehole:messages-changed", refresh);
    const { data } = supabase.auth.onAuthStateChange(refresh);

    return () => {
      active = false;
      window.removeEventListener("treehole:messages-changed", refresh);
      data.subscription.unsubscribe();
    };
  }, []);

  const linkClass = (active: boolean) =>
    `relative inline-flex flex-1 basis-0 items-center justify-center gap-1 rounded-md px-3 py-2 text-center ${
      active ? "bg-moss font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
    }`;
  const iconLinkClass = (active: boolean) =>
    `relative inline-flex flex-1 basis-0 items-center justify-center gap-1 rounded-md px-3 py-2 text-center ${
      active ? "bg-moss font-semibold text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <nav className="flex w-full items-center justify-center gap-2 text-sm font-medium">
      <Link className={linkClass(pathname === "/" || pathname.startsWith("/post/"))} href="/">
        <LayoutGrid size={15} aria-hidden="true" />
        广场
      </Link>
      <Link className={iconLinkClass(pathname === "/favorites")} href="/favorites">
        <Star size={15} aria-hidden="true" />
        关注
      </Link>
      <Link className={iconLinkClass(pathname === "/messages")} href="/messages">
        <Bell size={15} aria-hidden="true" />
        消息
        {hasUnread ? (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#22272e]" aria-label="有新消息" />
        ) : null}
      </Link>
      {showAdmin ? (
        <Link className={iconLinkClass(pathname === "/admin")} href="/admin">
          <Shield size={15} aria-hidden="true" />
          审核
        </Link>
      ) : null}
    </nav>
  );
}
