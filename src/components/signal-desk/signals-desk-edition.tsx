"use client";

import { useEffect, useRef, useState } from "react";

/** Preserve the shared desk's map logic while fitting it into the publication. */
export function SignalsDeskEdition({ edition }: { edition: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const [height, setHeight] = useState(1500);
  const src = edition === "2026-09-07"
    ? "/signals-desk/archive/2026-09-07/index.html"
    : `/signals-desk/index.html${edition ? `?edition=${encodeURIComponent(edition)}` : ""}`;

  useEffect(() => () => cleanup.current?.(), []);

  function fitEdition() {
    cleanup.current?.();
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    const main = doc?.querySelector("main");
    if (!frame || !doc || !main) return;
    const resize = () => setHeight(Math.ceil(main.getBoundingClientRect().height + 4));
    const observer = new ResizeObserver(resize);
    observer.observe(main);
    resize();
    const scrollToSection = (id: string) => {
      const section = doc.getElementById(id);
      if (section) window.scrollTo({
        top: window.scrollY + frame.getBoundingClientRect().top + section.getBoundingClientRect().top - 20,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    };
    const followSection = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      event.preventDefault();
      requestAnimationFrame(() => scrollToSection(link.hash.slice(1)));
    };
    doc.addEventListener("click", followSection);
    // Archive links return through the website so its masthead remains present.
    if (window.location.hash === "#analysis") {
      requestAnimationFrame(() => scrollToSection("analysis"));
    }
    cleanup.current = () => {
      observer.disconnect();
      doc.removeEventListener("click", followSection);
    };
  }

  return <iframe key={src} ref={frameRef} src={src}
    title="Lebanon Signals Desk, saved September 2026 edition by Karim Salam"
    onLoad={fitEdition} allowFullScreen
    style={{ display: "block", width: "100%", height, border: 0, background: "#f9f4e9" }}
  />;
}
