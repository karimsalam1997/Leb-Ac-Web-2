import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobileHeader } from "@/components/mobile-header";
import shell from "./site-shell.module.css";

const navItems = [
  { href: "/essays", label: "Essays", arabic: "المقالات" },
  { href: "/signal-desk", label: "Signal Desk", arabic: "غرفة الإشارات" },
  { href: "/about", label: "About", arabic: "عنّا" },
];

function isActivePath(activePath: string, href: string) {
  return activePath === href || activePath.startsWith(`${href}/`);
}

export function SiteShell({
  children,
  activePath,
}: {
  children: ReactNode;
  activePath: string;
}) {
  return (
    <div className={shell.pageShell}>
      <a className={shell.skipLink} href="#site-content">
        Skip to content
      </a>

      <div className={shell.pressTopline}>
        <div className={shell.pressToplineInner}>
          <span>Essays · Research · Public memory</span>
          <span className="arabic" lang="ar" dir="rtl">مقالات · بحث · ذاكرة عامة</span>
          <span className={shell.pressLocation}>Published from Beirut</span>
        </div>
      </div>

      <header className={shell.desktopHeader}>
        <div className={shell.desktopHeaderInner}>
          <Link href="/" className={shell.brand} aria-label="Lebanese Academic home">
            <Image
              src="/brand/la-editors-mark.png"
              alt=""
              width={68}
              height={68}
              className={shell.brandMark}
            />
            <span className={shell.brandNames}>
              <span className={shell.brandEnglish}>
                <span>Lebanese</span>
                <span>Academic</span>
              </span>
              <span className={`arabic ${shell.brandArabic}`} lang="ar" dir="rtl">
                <span>الأكاديمي</span>
                <span>اللبناني</span>
              </span>
            </span>
          </Link>

          <nav className={shell.desktopNav} aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = isActivePath(activePath, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  <small className="arabic" lang="ar" dir="rtl">{item.arabic}</small>
                </Link>
              );
            })}
          </nav>

          <Link href="/#newsletter" className={shell.subscribeAction}>
            Subscribe
          </Link>
        </div>
      </header>

      <MobileHeader activePath={activePath} />

      <main id="site-content" className={shell.main}>
        {children}
      </main>

      <footer className={shell.footer}>
        <div className={shell.footerInner}>
          <div className={shell.footerIdentity}>
            <strong>Lebanese Academic</strong>
            <span>Long essays, research, and public memory.</span>
            <span className="arabic" lang="ar" dir="rtl">مقالات طويلة وبحث وذاكرة عامة.</span>
          </div>

          <nav className={shell.footerLinks} aria-label="Footer navigation">
            <Link href="/essays">Essays</Link>
            <Link href="/signal-desk">Signal Desk</Link>
            <Link href="/about">About</Link>
            <Link href="/submit">Submit</Link>
          </nav>

          <div className={shell.footerContact}>
            <a
              href="https://instagram.com/lebaneseacademic"
              target="_blank"
              rel="noopener noreferrer"
            >
              @lebaneseacademic
            </a>
            <a href="mailto:editors@lebaneseacademic.com">
              editors@lebaneseacademic.com
            </a>
          </div>

          <div className={shell.footerCredit}>
            © 2026 Lebanese Academic
            <br />
            Published from Beirut.
          </div>
        </div>
      </footer>
    </div>
  );
}
