"use client";

import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { HeaderUser } from "@/components/HeaderUser";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <>
      <header className="border-b border-ink/10 bg-paper text-ink dark:border-white/10 dark:bg-[#22272e] dark:text-white">
        <div className="mx-auto flex max-w-3xl flex-nowrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <Link href="/" className="-ml-2 shrink-0 rounded-md px-2 py-1 text-lg font-semibold text-ink hover:bg-mist dark:text-white dark:hover:bg-white/10">
            树洞
          </Link>
          <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-2">
            <HeaderUser />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="sticky top-0 z-40 border-b border-ink/10 bg-paper text-ink dark:border-white/10 dark:bg-[#22272e] dark:text-white">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-2 sm:px-6">
          <HeaderNav />
        </div>
      </div>
    </>
  );
}
