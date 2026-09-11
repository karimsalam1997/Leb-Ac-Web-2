"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/essays", label: "Essays" },
  { href: "/case-studies/beirut-park", label: "Case Study" },
  { href: "/signal-desk", label: "Signal Desk" },
  { href: "/notebook", label: "Notebook" },
  { href: "/about", label: "About" },
];

function pathIsActive(activePath: string, href: string) {
  if (href === "/") {
    return activePath === "/";
  }

  return activePath.startsWith(href);
}

export function SiteShell({
  children,
  activePath,
}: {
  children: ReactNode;
  activePath: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isDarkPage = activePath.startsWith("/signal-desk");

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      menuButton?.focus();
    };
  }, [isMenuOpen]);

  return (
    <div className="la2026-shell" data-theme={isDarkPage ? "dark" : "light"}>
      <a className="la2026-skip-link" href="#site-content">
        Skip to content
      </a>

      <header className="la2026-header">
        <div className="la2026-utility-bar">
          <span>Independent research and writing</span>
          <span>Beirut / 2026</span>
          <span className="arabic" dir="rtl">
            بيروت
          </span>
        </div>

        <div className="la2026-masthead">
          <Link href="/" className="la2026-brand" aria-label="Lebanese Academic home">
            <Image
              src="/brand/la-editors-mark.png"
              alt=""
              width={64}
              height={64}
              priority
              className="la2026-brand-mark"
            />
            <span className="la2026-brand-copy">
              <strong>Lebanese Academic</strong>
              <small className="arabic" dir="rtl">
                الأكاديمي اللبناني
              </small>
            </span>
          </Link>

          <div className="la2026-masthead-note">
            <span>Lebanon in working detail.</span>
            <small>Essays, notes, and case studies written from Beirut.</small>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="la2026-menu-button"
            aria-label="Open navigation"
            aria-expanded={isMenuOpen}
            aria-controls="la2026-mobile-menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={1.65} aria-hidden="true" />
          </button>
        </div>

        <div className="la2026-nav-row">
          <nav className="la2026-nav" aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = pathIsActive(activePath, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/submit" className="la2026-submit-link">
            Send a letter
          </Link>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="la2026-mobile-layer">
          <button
            type="button"
            className="la2026-mobile-scrim"
            aria-label="Close navigation"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside
            id="la2026-mobile-menu"
            className="la2026-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="la2026-mobile-menu-top">
              <span>Lebanese Academic</span>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
            <nav className="la2026-mobile-nav" aria-label="Mobile navigation">
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={pathIsActive(activePath, item.href)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/submit" onClick={() => setIsMenuOpen(false)}>
                Send a letter
              </Link>
            </nav>
            <p>
              Writing from Beirut about the institutions, streets, and private
              systems that decide how Lebanon works.
            </p>
          </aside>
        </div>
      ) : null}

      <main id="site-content" className="la2026-main">
        {children}
      </main>

      <footer className="la2026-footer">
        <div className="la2026-footer-lead">
          <Image
            src="/brand/la-editors-mark.png"
            alt="Lebanese Academic mark"
            width={54}
            height={54}
          />
          <div>
            <strong>Lebanese Academic</strong>
            <p>Independent essays, research notes, and case studies by Karim Salam.</p>
          </div>
        </div>

        <nav className="la2026-footer-links" aria-label="Footer navigation">
          <Link href="/essays">Essays</Link>
          <Link href="/case-studies/beirut-park">Beirut Park case study</Link>
          <Link href="/signal-desk">Signal Desk</Link>
          <Link href="/notebook">Notebook</Link>
          <Link href="/about">About</Link>
          <Link href="/submit">Contact</Link>
        </nav>

        <div className="la2026-footer-contact">
          <a href="mailto:editors@lebaneseacademic.com">
            editors@lebaneseacademic.com
          </a>
          <a
            href="https://instagram.com/lebaneseacademic"
            target="_blank"
            rel="noopener noreferrer"
          >
            @lebaneseacademic
          </a>
          <span>© 2026 Karim Salam</span>
        </div>
      </footer>
    </div>
  );
}
