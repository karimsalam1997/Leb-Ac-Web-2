"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import shell from "./site-shell.module.css";

const drawerItems = [
  { href: "/essays", label: "Essays", arabic: "المقالات" },
  { href: "/signal-desk", label: "Signal Desk", arabic: "غرفة الإشارات" },
  { href: "/topics", label: "Topics", arabic: "المحاور" },
  { href: "/about", label: "About", arabic: "عنّا" },
  { href: "/submit", label: "Submit", arabic: "أرسل نصّاً" },
];

function isActivePath(activePath: string, href: string) {
  return activePath === href || activePath.startsWith(`${href}/`);
}

export function MobileHeader({ activePath }: { activePath: string }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  function closeDrawer() {
    shouldRestoreFocusRef.current = true;
    setIsDrawerOpen(false);
  }

  useEffect(() => {
    if (!isDrawerOpen && shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      menuButtonRef.current?.focus();
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        shouldRestoreFocusRef.current = true;
        setIsDrawerOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (!activeElement || !focusable.includes(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen]);

  return (
    <header className={shell.mobileHeader} aria-label="Mobile site header">
      <div className={shell.mobileHeaderInner} inert={isDrawerOpen}>
        <Link href="/" className={shell.mobileBrand} aria-label="Lebanese Academic home">
          <Image
            src="/brand/la-editors-mark.png"
            alt=""
            width={48}
            height={48}
            className={shell.mobileBrandMark}
          />
          <span className={shell.mobileBrandNames}>
            <strong>
              <span>Lebanese</span>
              <span>Academic</span>
            </strong>
            <small className="arabic" lang="ar" dir="rtl">الأكاديمي اللبناني</small>
          </span>
        </Link>

        <div className={shell.mobileActions}>
          <Link href="/#newsletter" className={shell.mobileSubscribe}>
            Subscribe
          </Link>
          <button
            ref={menuButtonRef}
            className={shell.mobileMenuButton}
            type="button"
            aria-label="Open menu"
            aria-controls="mobile-menu-drawer"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu size={22} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isDrawerOpen ? (
        <div className={shell.drawerLayer}>
          <button
            className={shell.drawerScrim}
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeDrawer}
          />
          <div
            ref={drawerRef}
            id="mobile-menu-drawer"
            className={shell.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            tabIndex={-1}
          >
            <div className={shell.drawerTop}>
              <div>
                <div id="mobile-menu-title" className={shell.drawerTitle}>
                  Lebanese Academic
                </div>
                <div className={`arabic ${shell.drawerArabicTitle}`} lang="ar" dir="rtl">
                  الأكاديمي اللبناني
                </div>
              </div>
              <button
                className={shell.drawerClose}
                type="button"
                aria-label="Close menu"
                onClick={closeDrawer}
              >
                <X size={22} strokeWidth={1.7} aria-hidden="true" />
              </button>
            </div>

            <p className={shell.drawerStatement}>
              Writing from underneath Lebanon’s headlines, where power becomes ordinary life.
            </p>

            <nav className={shell.drawerNav} aria-label="Mobile menu navigation">
              {drawerItems.map((item) => {
                const isActive = isActivePath(activePath, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-active={isActive}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <span>{item.label}</span>
                    <span className="arabic" lang="ar" dir="rtl">{item.arabic}</span>
                  </Link>
                );
              })}
            </nav>

            <div className={shell.drawerFooter}>
              <span>Beirut · Levant · Diaspora</span>
              <a href="mailto:editors@lebaneseacademic.com">
                editors@lebaneseacademic.com
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
