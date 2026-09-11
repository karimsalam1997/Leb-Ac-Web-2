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

const leadEssay =
  essays.find((essay) => essay.slug === "the-land-that-mourns-in-one-language") ?? essays[0];
const frontStories = essays.filter((essay) => essay.slug !== leadEssay.slug).slice(0, 5);
const issueStories = essays.filter((essay) => essay.slug !== leadEssay.slug).slice(0, 8);

function StoryCard({ essay, section }: { essay: (typeof essays)[number]; section?: string }) {
  return (
    <article className="lrbhome-story-card">
      {section ? <div className="lrbhome-label">{section}</div> : null}
      <h2><Link href={`/essays/${essay.slug}`}>{essay.title}</Link></h2>
      <div className="lrbhome-byline">{essay.byline}</div>
      <p>{essay.dek}</p>
      <div className="lrbhome-meta"><span>{essay.date}</span><span>{essay.readTime}</span></div>
    </article>
  );
}

function ArchiveCard({ essay, index }: { essay: (typeof essays)[number]; index: number }) {
  const image = getArticleImages(essay.slug)[0];
  const showImage = index === 0 || index === 4 || index === 9;
  return (
    <article className={`lrbhome-archive-card${showImage ? " has-image" : ""}`}>
      {showImage ? (
        <Link href={`/essays/${essay.slug}`} className="lrbhome-archive-image-link" aria-label={`Read ${essay.title}`}>
          <EditorialImage src={getArticleImage(essay.slug, 0)} alt={image?.alt ?? essay.title} className="lrbhome-archive-image" imagePosition={image?.position} imageFit={image?.fit} sizes="(min-width: 1050px) 32vw, (min-width: 700px) 50vw, 100vw" quality={88} />
        </Link>
      ) : null}
      <div className="lrbhome-label">{essay.tags[0] ?? "Essay"}</div>
      <h3><Link href={`/essays/${essay.slug}`}>{essay.title}</Link></h3>
      <div className="lrbhome-byline">{essay.byline}</div>
      <p>{essay.dek}</p>
      <div className="lrbhome-meta"><span>{essay.date}</span><span>{essay.readTime}</span></div>
    </article>
  );
}

export default function Home() {
  const signalReport = getSignalDeskResearchReport();
  const leadImages = getArticleImages(leadEssay.slug);
  const leadImage = leadImages[3] ?? leadImages[0];

  return (
    <SiteShell activePath="/">
      <section className="lrbhome-edition" aria-label="Current edition">
        <span>Lebanese Academic / Beirut</span>
        <span>Essays, analysis, maps and the record of the day</span>
        <time dateTime="2026-09-10">10 September 2026</time>
      </section>

      <section className="lrbhome-front" aria-label="Featured writing">
        <article className="lrbhome-lead">
          <div className="lrbhome-label">The lead essay</div>
          <h1><Link href={`/essays/${leadEssay.slug}`}>{leadEssay.title}</Link></h1>
          <div className="lrbhome-byline">{leadEssay.byline}</div>
          <p>{leadEssay.dek}</p>
          <Link href={`/essays/${leadEssay.slug}`} className="lrbhome-lead-image-link" aria-label={`Read ${leadEssay.title}`}>
            <EditorialImage src={leadImage?.src ?? getArticleImage(leadEssay.slug, 0)} alt={leadImage?.alt ?? leadEssay.title} className="lrbhome-lead-image" imagePosition={leadImage?.position} imageFit={leadImage?.fit} priority quality={94} sizes="(min-width: 1050px) 50vw, 100vw" />
          </Link>
        </article>

        <div className="lrbhome-front-stories">
          {frontStories.slice(0, 3).map((essay, index) => <StoryCard key={essay.slug} essay={essay} section={index === 2 ? "From the archive" : undefined} />)}
        </div>

        <aside className="lrbhome-issue" aria-label="Current edition contents">
          <div className="lrbhome-issue-heading"><span>Current edition</span><strong>Lebanon, 2026</strong></div>
          <ol>
            {issueStories.map((essay) => (
              <li key={essay.slug}><Link href={`/essays/${essay.slug}`}><strong>{essay.title}</strong><span>{essay.byline}</span></Link></li>
            ))}
          </ol>
          <Link href="/essays" className="lrbhome-issue-link">Browse all essays</Link>
        </aside>
      </section>

      <section className="lrbhome-signal" aria-labelledby="signal-title">
        <div className="lrbhome-signal-mark" aria-hidden="true">●</div>
        <div><div className="lrbhome-label">Lebanon Signals Desk</div><h2 id="signal-title">{signalReport?.title ?? "Lebanon, as it happens"}</h2></div>
        <p>{signalReport?.dek ?? "Live updates from across Lebanese and regional reporting, placed on the map and read in context."}</p>
        <div className="lrbhome-signal-actions">
          <Link href="/signal-desk" className="lrbhome-signal-primary">Open the live desk</Link>
          {signalReport ? <Link href="/signal-desk/report">Read today&apos;s analysis</Link> : null}
        </div>
      </section>

      <section className="lrbhome-secondary" aria-label="More featured essays">
        {frontStories.slice(3).map((essay) => <StoryCard key={essay.slug} essay={essay} />)}
      </section>

      <section className="lrbhome-archive" aria-labelledby="all-writing-title">
        <header className="lrbhome-section-heading">
          <div><span>All writing</span><h2 id="all-writing-title">Essays from Lebanese Academic</h2></div>
          <p>Political economy, memory, sovereignty and the ordinary structures through which Lebanon is made and unmade.</p>
          <Link href="/essays">The full archive</Link>
        </header>
        <div className="lrbhome-archive-grid">
          {essays.map((essay, index) => <ArchiveCard key={essay.slug} essay={essay} index={index} />)}
        </div>
      </section>

      <section id="newsletter" className="lrbhome-newsletter">
        <div><div className="lrbhome-label">The Sunday dispatch</div><h2>One letter from Beirut when there is something worth sending.</h2></div>
        <p>New essays, field notes, maps and sources worth keeping.</p>
        <NewsletterSignup />
      </section>
    </SiteShell>
  );
}
