import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
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
              "try{var t=localStorage.getItem('theme');var a=localStorage.getItem('accent')||'green';var c=localStorage.getItem('customAccent')||'#5d7461';var b=localStorage.getItem('backgroundImage');document.documentElement.classList.toggle('dark',t!=='light');document.documentElement.dataset.accent=a;if(a==='custom'&&/^#[0-9a-f]{6}$/i.test(c)){document.documentElement.style.setProperty('--color-moss',parseInt(c.slice(1,3),16)+' '+parseInt(c.slice(3,5),16)+' '+parseInt(c.slice(5,7),16))}if(b&&b.indexOf('data:image/')===0){document.documentElement.style.setProperty('--background-image','url(\"'+b+'\") center / cover fixed')}}catch(e){}"
          }}
        />
        <div className="min-h-screen">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
