import type { Metadata } from "next";
import Link from "next/link";
import { EditorialImage } from "@/components/editorial-image";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SiteShell } from "@/components/site-shell";
import { essays } from "@/lib/content";
import { buildPageMetadata, siteDescription, siteName } from "@/lib/seo";
import { getSignalDeskResearchReport } from "@/lib/signal-desk";
import { getArticleImage, getArticleImages } from "@/lib/visual-assets";

export const metadata: Metadata = buildPageMetadata({
  title: `${siteName} | Essays and research from Beirut`,
  description: siteDescription,
  path: "/",
  image: "/essay-images/sourced/mourning-our-lady-harissa.jpg",
  absoluteTitle: true,
});

const divineFeminineEssay =
  essays.find((essay) => essay.slug === "the-land-that-mourns-in-one-language") ??
  essays[0];

const readingRail = essays
  .filter((essay) => essay.slug !== divineFeminineEssay.slug)
  .slice(0, 4);

function ArchiveCard({
  essay,
  index,
}: {
  essay: (typeof essays)[number];
  index: number;
}) {
  const image = getArticleImages(essay.slug)[0];

  return (
    <article className="front2026-archive-card">
      <Link
        href={`/essays/${essay.slug}`}
        className="front2026-archive-image-link"
        aria-label={`Read ${essay.title}`}
      >
        <EditorialImage
          src={getArticleImage(essay.slug, 0)}
          alt={image?.alt ?? essay.title}
          className="front2026-archive-image"
          imagePosition={image?.position}
          imageFit={image?.fit}
          sizes="(min-width: 1080px) 31vw, (min-width: 700px) 48vw, 100vw"
          quality={90}
        />
      </Link>
      <div className="front2026-archive-copy">
        <div className="front2026-card-topline">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{essay.tags[0] ?? "Essay"}</span>
        </div>
        <h3>
          <Link href={`/essays/${essay.slug}`}>{essay.title}</Link>
        </h3>
        <p>{essay.dek}</p>
        <div className="front2026-card-meta">
          {essay.date} / {essay.readTime}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const signalReport = getSignalDeskResearchReport();
  const divineImages = getArticleImages(divineFeminineEssay.slug);
  const leadImage = divineImages[3] ?? divineImages[0];

  return (
    <SiteShell activePath="/">
      <section className="front2026-edition" aria-label="Current edition">
        <span>Lebanese Academic / Beirut</span>
        <span>Essays, memory, and the structures beneath the day</span>
        <time dateTime="2026-07-28">28 July 2026</time>
      </section>

      <section className="front2026-lead" aria-labelledby="front-lead-title">
        <article className="front2026-lead-story">
          <Link
            href={`/essays/${divineFeminineEssay.slug}`}
            className="front2026-lead-image-link"
            aria-label={`Read ${divineFeminineEssay.title}`}
          >
            <EditorialImage
              src={leadImage?.src ?? getArticleImage(divineFeminineEssay.slug, 0)}
              alt={leadImage?.alt ?? divineFeminineEssay.title}
              className="front2026-lead-image"
              imagePosition={leadImage?.position}
              imageFit={leadImage?.fit}
              priority
              quality={95}
              sizes="(min-width: 960px) 58vw, 100vw"
            />
          </Link>

          <div className="front2026-lead-copy">
            <div className="front2026-kicker">
              The lead essay / Sacred memory
            </div>
            <h1 id="front-lead-title">
              <Link href={`/essays/${divineFeminineEssay.slug}`}>
                {divineFeminineEssay.title}
              </Link>
            </h1>
            <p>{divineFeminineEssay.dek}</p>
            <div className="front2026-lead-meta">
              <span>By {divineFeminineEssay.byline}</span>
              <span>{divineFeminineEssay.readTime}</span>
              <Link href={`/essays/${divineFeminineEssay.slug}`}>
                Read the essay
              </Link>
            </div>
          </div>
        </article>

        <aside className="front2026-rail" aria-label="More from Lebanese Academic">
          <div className="front2026-rail-heading">
            <span>Read these next</span>
            <Link href="/essays">The full shelf</Link>
          </div>

          <ol className="front2026-reading-list">
            {readingRail.map((essay, index) => (
              <li key={essay.slug}>
                <Link href={`/essays/${essay.slug}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{essay.title}</strong>
                  <small>{essay.readTime}</small>
                </Link>
              </li>
            ))}
          </ol>

          {signalReport ? (
            <article className="front2026-signal">
              <div className="front2026-signal-topline">
                <span>Signal Desk</span>
                <span>Today</span>
              </div>
              <h2>{signalReport.title}</h2>
              <p>{signalReport.dek}</p>
              <div className="front2026-signal-meta">
                <span>{signalReport.source_count} sources joined</span>
                <Link href="/signal-desk/report">Read today&apos;s record</Link>
              </div>
              <Link
                href="/signal-desk"
                className="front2026-signal-desk-link"
              >
                Open the live desk
              </Link>
            </article>
          ) : (
            <Link href="/signal-desk" className="front2026-signal-empty">
              <span>Signal Desk</span>
              <strong>Open the live Lebanon evidence desk</strong>
            </Link>
          )}
        </aside>
      </section>

      <section className="front2026-about" aria-labelledby="front-about-title">
        <div className="front2026-about-label">Why this publication exists</div>
        <div>
          <h2 id="front-about-title">
            In Lebanon, meaning can disappear before the smoke clears.
          </h2>
          <p>
            On Sakiet el-Janzeer, a cabinet speech, a generator bill, and an
            Israeli drone can enter the same Beirut afternoon as disconnected
            facts. Lebanese Academic is a non-sectarian publication built
            against that amnesia. It reads the past and the present through the
            structures that keep deciding Lebanese life: family, sect, class,
            property, war, and the state that appears most clearly through its
            absences.
          </p>
        </div>
        <Link href="/about">Read about the publication</Link>
      </section>

      <section className="front2026-archive" aria-labelledby="front-archive-title">
        <header className="front2026-section-header">
          <div>
            <span>All writing</span>
            <h2 id="front-archive-title">The essays</h2>
          </div>
          <p>
            From the 1932 census to the wires above Tariq el-Jdideh, each essay
            begins with something Lebanon has made ordinary and follows the
            power that made it so.
          </p>
          <span className="front2026-essay-count">{essays.length} essays</span>
        </header>

        <div className="front2026-archive-grid">
          {essays.map((essay, index) => (
            <ArchiveCard key={essay.slug} essay={essay} index={index} />
          ))}
        </div>
      </section>

      <section id="newsletter" className="home2026-newsletter">
        <div>
          <div className="home2026-kicker">Sunday dispatch</div>
          <h2>One email when there is something worth sending.</h2>
        </div>
        <p>New work, a short note from Beirut, and sources worth keeping.</p>
        <NewsletterSignup />
      </section>
    </SiteShell>
  );
}
