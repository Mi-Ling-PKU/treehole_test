import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircleHeart } from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "树洞",
  description: "一个匿名倾诉和回应的小站"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}"
          }}
        />
        <div className="min-h-screen">
          <header className="border-b border-ink/10 bg-paper/85 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-ink">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-moss text-white">
                  <MessageCircleHeart size={20} aria-hidden="true" />
                </span>
                树洞
              </Link>
              <HeaderNav />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
