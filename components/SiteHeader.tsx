"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { HeaderUser } from "@/components/HeaderUser";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function updateCollapsed() {
      setCollapsed(window.scrollY > 16);
    }

    updateCollapsed();
    window.addEventListener("scroll", updateCollapsed, { passive: true });
    return () => window.removeEventListener("scroll", updateCollapsed);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur">
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
          collapsed ? "max-h-0 opacity-0" : "max-h-24 opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="-ml-2 rounded-md px-2 py-1 text-lg font-semibold text-ink hover:bg-mist">
            树洞
          </Link>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <HeaderUser />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-3xl items-center px-4 py-2 sm:px-6">
        <HeaderNav />
      </div>
    </header>
  );
}
