import type { Metadata } from "next";
import Link from "next/link";
import { EditorialImage } from "@/components/editorial-image";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SiteShell } from "@/components/site-shell";
import { essays, type Essay } from "@/lib/content";
import { buildPageMetadata, siteDescription, siteName } from "@/lib/seo";
import { getSignalDeskData } from "@/lib/signal-desk";
import { getArticleImage, getArticleImages } from "@/lib/visual-assets";
import homepage from "./home.module.css";

const firstEssay = essays[0];

function findEssay(slug: string, fallback = firstEssay) {
  return essays.find((essay) => essay.slug === slug) ?? fallback;
}

const parkEssay = findEssay("the-park-that-remembers");
const cartelEssay = findEssay("the-cartel-in-the-costume-of-a-country");
const mourningEssay = findEssay("the-land-that-mourns-in-one-language");
const cityEssay = findEssay("the-city-that-could-not-repair-itself");

const heroStories = [parkEssay, cartelEssay, mourningEssay, cityEssay];
const libraryEssays = [
  parkEssay,
  ...essays.filter((essay) => essay.slug !== parkEssay.slug),
];

export const metadata: Metadata = buildPageMetadata({
  title: `${siteName} — Essays from Beirut`,
  description: siteDescription,
  path: "/",
  image: getArticleImage(parkEssay.slug, 0),
  absoluteTitle: true,
});

function formatSignalDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No recent desk run";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function storyImage(essay: Essay) {
  const asset = getArticleImages(essay.slug)[0];

  return {
    src: asset?.src ?? getArticleImage(essay.slug, 0),
    alt: asset?.alt ?? essay.title,
    position: asset?.position ?? "center",
  };
}

function StoryMeta({ essay }: { essay: Essay }) {
  return (
    <div className={homepage.storyMeta}>
      <span>{essay.byline}</span>
      <span>{essay.date}</span>
      <span>{essay.readTime}</span>
    </div>
  );
}

function HeroLead({ essay }: { essay: Essay }) {
  const image = storyImage(essay);

  return (
    <article className={homepage.heroLead}>
      <Link href={`/essays/${essay.slug}`} className={homepage.heroLeadImageLink}>
        <EditorialImage
          src={image.src}
          alt={image.alt}
          imagePosition={image.position}
          className={homepage.heroLeadImage}
          aspectRatio="3 / 2"
          preload
          quality={88}
          sizes="(min-width: 1100px) 62vw, calc(100vw - 32px)"
        />
      </Link>
      <div className={homepage.heroLeadCopy}>
        <div className={homepage.heroIndex}>01 / Hero essay</div>
        <div>
          <div className={homepage.kicker}>Architecture · Memory · Public Life</div>
          <h1><Link href={`/essays/${essay.slug}`}>{essay.title}</Link></h1>
          <p>{essay.dek}</p>
          <StoryMeta essay={essay} />
        </div>
      </div>
    </article>
  );
}

function HeroSecondary({ essay }: { essay: Essay }) {
  const image = storyImage(essay);

  return (
    <article className={homepage.heroSecondary}>
      <Link href={`/essays/${essay.slug}`} className={homepage.heroSecondaryImageLink}>
        <EditorialImage
          src={image.src}
          alt={image.alt}
          imagePosition={image.position}
          className={homepage.heroSecondaryImage}
          aspectRatio="16 / 9"
          quality={84}
          sizes="(min-width: 1100px) 36vw, calc(100vw - 32px)"
        />
      </Link>
      <div className={homepage.kicker}>{essay.tags[0] ?? essay.category}</div>
      <h2><Link href={`/essays/${essay.slug}`}>{essay.title}</Link></h2>
      <p>{essay.dek}</p>
      <StoryMeta essay={essay} />
    </article>
  );
}

function HeroBrief({ essay, number }: { essay: Essay; number: string }) {
  const image = storyImage(essay);

  return (
    <article className={homepage.heroBrief}>
      <Link href={`/essays/${essay.slug}`} className={homepage.heroBriefImageLink}>
        <EditorialImage
          src={image.src}
          alt={image.alt}
          imagePosition={image.position}
          className={homepage.heroBriefImage}
          aspectRatio="4 / 3"
          quality={82}
          sizes="(min-width: 1100px) 18vw, (min-width: 650px) 46vw, calc(100vw - 32px)"
        />
      </Link>
      <div className={homepage.heroBriefNumber}>{number}</div>
      <div className={homepage.kicker}>{essay.tags[0] ?? essay.category}</div>
      <h3><Link href={`/essays/${essay.slug}`}>{essay.title}</Link></h3>
      <div className={homepage.heroBriefTime}>{essay.readTime}</div>
    </article>
  );
}

function LibraryItem({ essay, index }: { essay: Essay; index: number }) {
  const image = storyImage(essay);
  const isFeatured = index === 0;

  return (
    <article className={homepage.libraryItem} data-featured={isFeatured}>
      <Link href={`/essays/${essay.slug}`} className={homepage.libraryImageLink}>
        <EditorialImage
          src={image.src}
          alt={image.alt}
          imagePosition={image.position}
          className={homepage.libraryImage}
          aspectRatio={isFeatured ? "16 / 9" : "4 / 3"}
          quality={80}
          sizes={isFeatured ? "(min-width: 1100px) 60vw, 100vw" : "(min-width: 1100px) 31vw, (min-width: 680px) 48vw, 100vw"}
        />
      </Link>
      <div className={homepage.libraryTopline}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{essay.tags.slice(0, 2).join(" · ") || essay.category}</span>
      </div>
      <h3><Link href={`/essays/${essay.slug}`}>{essay.title}</Link></h3>
      <p>{essay.dek}</p>
      <StoryMeta essay={essay} />
    </article>
  );
}

export default function Home() {
  const { api } = getSignalDeskData();
  const signalUpdated = formatSignalDate(api.meta.generated_at);
  const signalCondition = api.meta.source_condition;

  return (
    <SiteShell activePath="/">
      <section className={`${homepage.frame} ${homepage.heroEdition}`} aria-label="Featured essays">
        <div className={homepage.heroEditionHeader}>
          <span>Lebanese Academic / Current reading</span>
          <span className="arabic" lang="ar" dir="rtl">قراءات مختارة</span>
          <span>{heroStories.length} essays</span>
        </div>
        <div className={homepage.heroGrid}>
          <HeroLead essay={heroStories[0]} />
          <div className={homepage.heroRail}>
            <HeroSecondary essay={heroStories[1]} />
            <div className={homepage.heroBriefGrid}>
              <HeroBrief essay={heroStories[2]} number="03" />
              <HeroBrief essay={heroStories[3]} number="04" />
            </div>
          </div>
        </div>
      </section>

      <section className={`${homepage.frame} ${homepage.librarySection}`} aria-labelledby="essay-library-title">
        <header className={homepage.libraryHeader}>
          <div>
            <div className={homepage.sectionEyebrow}>All essays / The library</div>
            <h2 id="essay-library-title">Read the whole collection.</h2>
          </div>
          <div className={homepage.libraryHeaderSide}>
            <span className="arabic" lang="ar" dir="rtl">مكتبة المقالات</span>
            <p>{essays.length} long essays, kept together without pretending each one is a flagship.</p>
            <Link href="/essays">Open the full register <span aria-hidden="true">→</span></Link>
          </div>
        </header>
        <div className={homepage.libraryGrid}>
          {libraryEssays.map((essay, index) => (
            <LibraryItem key={essay.slug} essay={essay} index={index} />
          ))}
        </div>
      </section>

      <section className={`${homepage.frame} ${homepage.signalSection}`} aria-labelledby="signal-desk-title">
        <div className={homepage.signalIdentity}>
          <span className={homepage.signalPulse} aria-hidden="true" />
          <div>
            <div className={homepage.signalLabel}>Signal Desk / Research prototype</div>
            <div className={`arabic ${homepage.signalArabic}`} lang="ar" dir="rtl">غرفة الإشارات</div>
          </div>
        </div>
        <div className={homepage.signalCopy}>
          <h2 id="signal-desk-title">An evidence log for claims, locations, and sources.</h2>
          <p>{signalCondition?.summary ?? `${api.meta.source_count} sources in the latest desk record.`}</p>
        </div>
        <div className={homepage.signalMeta}>
          <span>Last desk run</span>
          <strong>{signalUpdated}</strong>
          <span>{api.meta.cluster_count} clusters, {api.meta.located_cluster_count} mapped</span>
          <Link href="/signal-desk">Inspect the desk <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className={`${homepage.frame} ${homepage.aboutSection}`} aria-labelledby="about-home-title">
        <div className={homepage.aboutIntro}>
          <div className={homepage.sectionEyebrow}>About the publication</div>
          <h2 id="about-home-title">A Beirut publication for arguments that need room.</h2>
          <p className="arabic" lang="ar" dir="rtl">منشور بيروتي للأفكار التي تحتاج إلى مساحة ووقت وذاكرة.</p>
        </div>
        <div className={homepage.aboutGrid}>
          <div>
            <span>01 / Essays</span>
            <h3>Long-form, by design.</h3>
            <p>Political economy, war, urban life, heritage, and public memory, written at the length the argument requires.</p>
          </div>
          <div>
            <span>02 / Method</span>
            <h3>Sources stay visible.</h3>
            <p>Documents, images, maps, field notes, and citations remain part of the reading experience instead of disappearing behind authority.</p>
          </div>
          <div>
            <span>03 / Place</span>
            <h3>Published from Beirut.</h3>
            <p>The work begins with particular streets, rooms, buildings, archives, and people. It does not flatten Lebanon into a single metaphor.</p>
          </div>
        </div>
        <Link href="/about" className={homepage.aboutAction}>Read about the publication <span aria-hidden="true">→</span></Link>
      </section>

      <section id="newsletter" className={`${homepage.frame} ${homepage.newsletter}`} aria-labelledby="newsletter-title">
        <div className={homepage.newsletterCopy}>
          <div className={homepage.kicker}>Dispatches</div>
          <h2 id="newsletter-title">New work, when it is ready.</h2>
          <p>Essays, reading notes, and site projects sent from Beirut.</p>
          <p className="arabic" lang="ar" dir="rtl">مقالات وملاحظات ومشاريع من بيروت، حين تصبح جاهزة.</p>
        </div>
        <NewsletterSignup />
      </section>
    </SiteShell>
  );
}
