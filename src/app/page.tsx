import type { Metadata } from "next";
import Link from "next/link";
import { EditorialImage } from "@/components/editorial-image";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SiteShell } from "@/components/site-shell";
import { essays, type Essay } from "@/lib/content";
import { buildPageMetadata, siteDescription, siteName } from "@/lib/seo";
import { getSignalDeskData } from "@/lib/signal-desk";
import homepage from "./home.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: `${siteName} — The country, not the crisis.`,
  description: siteDescription,
  path: "/",
  image: "/homepage/roman-baths-beirut.jpg",
  absoluteTitle: true,
});

const heroEssay = essays[0];
const parkEssay =
  essays.find((essay) => essay.slug === "the-park-that-remembers") ??
  essays.at(-1) ??
  heroEssay;
const cartelEssay =
  essays.find((essay) => essay.slug === "the-cartel-in-the-costume-of-a-country") ??
  heroEssay;
const mourningEssay =
  essays.find((essay) => essay.slug === "the-land-that-mourns-in-one-language") ??
  heroEssay;

const recentStories = [
  {
    essay: cartelEssay,
    src: "/homepage/martyrs-square-2019.webp",
    alt: "Crowds filling Martyrs' Square in Beirut on Lebanese Independence Day in 2019",
    position: "center 44%",
    mediaNote: "Martyrs’ Square · 22 November 2019 · Nadim Kobeissi",
    sourceHref: "https://commons.wikimedia.org/wiki/File:Lebanon_IdependenceDay_2019.jpg",
  },
  {
    essay: parkEssay,
    src: "/homepage/park-gazebo-lake.webp",
    alt: "The restored Ottoman gazebo beside a lake in the Beirut Park proposal",
    position: "62% center",
    mediaNote: "Design visualization · Beirut Park · Video Edits archive",
    sourceHref: undefined,
  },
  {
    essay: mourningEssay,
    src: "/homepage/ahiram-sarcophagus-1936.webp",
    alt: "The sarcophagus of King Ahiram of Byblos photographed in 1936",
    position: "center 54%",
    mediaNote: "Ahiram sarcophagus · Matson Collection, 1936",
    sourceHref: "https://commons.wikimedia.org/wiki/File:Byblos-_Jebeil._Byblos._Sarcophagus_of_Ahiram,_King_of_Byblos_LOC_matpc.03491.jpg",
  },
];

const pathways = [
  {
    label: "Power",
    arabic: "السُّلطة",
    topic: "Power",
    description: "Who governs Lebanon, who profits from its weakness, and how private power becomes public fact.",
  },
  {
    label: "Memory",
    arabic: "الذاكرة",
    topic: "Memory",
    description: "The places, rituals, languages, and inherited arguments through which the country remembers itself.",
  },
  {
    label: "War",
    arabic: "الحرب",
    topic: "War",
    description: "The military systems that reach into Lebanese land, politics, grief, and ordinary life.",
  },
];

function formatSignalDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Desk record pending";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function StoryCard({
  essay,
  src,
  alt,
  position,
  mediaNote,
  sourceHref,
  emphasis = "secondary",
}: {
  essay: Essay;
  src: string;
  alt: string;
  position: string;
  mediaNote: string;
  sourceHref?: string;
  emphasis?: "primary" | "secondary";
}) {
  return (
    <article
      className={homepage.storyCard}
      data-emphasis={emphasis}
      data-story={essay.slug}
    >
      <div className={homepage.storyMedia}>
        <Link
          href={`/essays/${essay.slug}`}
          className={homepage.storyImageLink}
          aria-label={`Read ${essay.title}`}
        >
          <EditorialImage
            src={src}
            alt={alt}
            className={homepage.storyImage}
            imagePosition={position}
            quality={82}
            sizes={
              emphasis === "primary"
                ? "(min-width: 1100px) 54vw, (min-width: 768px) 52vw, calc(100vw - 32px)"
                : "(min-width: 1100px) 18vw, (min-width: 768px) 42vw, (min-width: 360px) 34vw, calc(100vw - 24px)"
            }
          />
        </Link>
        {sourceHref ? (
          <a
            className={homepage.mediaNote}
            href={sourceHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${mediaNote}, open image source`}
          >
            {mediaNote}
          </a>
        ) : (
          <span className={homepage.mediaNote}>{mediaNote}</span>
        )}
      </div>
      <div className={homepage.storyCopy}>
        <div className={homepage.mediaNoteMobile}>{mediaNote}</div>
        <div className={homepage.kicker}>{essay.tags[0] ?? essay.category}</div>
        <h3>
          <Link href={`/essays/${essay.slug}`}>{essay.title}</Link>
        </h3>
        <p>{essay.dek}</p>
        <div className={homepage.storyMeta}>
          <span>{essay.byline}</span>
          <span>{essay.date}</span>
          <span>{essay.readTime}</span>
        </div>
      </div>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  arabic,
  title,
  href,
  action,
  id,
}: {
  eyebrow: string;
  arabic: string;
  title: string;
  href?: string;
  action?: string;
  id: string;
}) {
  return (
    <div className={homepage.sectionHeading}>
      <div className={homepage.sectionTitleBlock}>
        <div className={homepage.sectionEyebrow}>{eyebrow}</div>
        <h2 id={id}>{title}</h2>
      </div>
      <div className={homepage.sectionSide}>
        <span className={`arabic ${homepage.sectionArabic}`} lang="ar" dir="rtl">
          {arabic}
        </span>
        {href && action ? (
          <Link href={href} className={homepage.sectionAction}>
            {action} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  const { api } = getSignalDeskData();
  const signalUpdated = formatSignalDate(api.meta.generated_at);
  const signalCondition = api.meta.source_condition;

  return (
    <SiteShell activePath="/">
      <section className={`${homepage.frame} ${homepage.hero}`}>
        <div className={homepage.heroVisual}>
          <Link
            href={`/essays/${heroEssay.slug}`}
            className={homepage.heroImageLink}
            aria-label={`Read ${heroEssay.title}`}
          >
            <EditorialImage
              src="/homepage/roman-baths-beirut.webp"
              alt="The Roman Baths below the rebuilt centre of Downtown Beirut"
              className={homepage.heroImage}
              imagePosition="center 54%"
              preload
              quality={84}
              sizes="(min-width: 1100px) 60vw, (min-width: 768px) calc(100vw - 40px), calc(100vw - 32px)"
            />
          </Link>
          <div className={homepage.heroCaption}>
            <span>Roman Baths · Downtown Beirut</span>
            <a
              href="https://commons.wikimedia.org/wiki/File:BeirutRomanBaths.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Niels Elgaard Larsen · CC BY-SA 3.0
            </a>
          </div>
        </div>

        <article className={homepage.heroCopy}>
          <div className={homepage.kicker}>Featured Essay</div>
          <h1>
            <Link href={`/essays/${heroEssay.slug}`}>{heroEssay.title}</Link>
          </h1>
          <p className={homepage.heroDeck}>{heroEssay.dek}</p>
          <div className={homepage.heroMeta}>
            <span>{heroEssay.byline}</span>
            <span>{heroEssay.date}</span>
            <span>{heroEssay.readTime}</span>
          </div>
        </article>
      </section>

      <section className={`${homepage.frame} ${homepage.section}`} aria-labelledby="recent-essays-title">
        <SectionHeading
          id="recent-essays-title"
          eyebrow="Recent Essays"
          arabic="أحدث المقالات"
          title="Three ways into the country."
          href="/essays"
          action="All essays"
        />
        <div className={homepage.recentGrid}>
          {recentStories.map((story, index) => (
            <StoryCard
              key={story.essay.slug}
              essay={story.essay}
              src={story.src}
              alt={story.alt}
              position={story.position}
              mediaNote={story.mediaNote}
              sourceHref={story.sourceHref}
              emphasis={index === 0 ? "primary" : "secondary"}
            />
          ))}
        </div>
      </section>

      <section className={`${homepage.frame} ${homepage.signalSection}`} aria-labelledby="signal-desk-title">
        <div className={homepage.signalIdentity}>
          <span className={homepage.signalPulse} aria-hidden="true" />
          <div>
            <div className={homepage.signalLabel}>Signal Desk / Live record</div>
            <div className={`arabic ${homepage.signalArabic}`} lang="ar" dir="rtl">غرفة الإشارات</div>
          </div>
        </div>
        <div className={homepage.signalCopy}>
          <h2 id="signal-desk-title">A working record of what moved, who said it, and what remains unclear.</h2>
          <p>
            {signalCondition?.summary ?? `${api.meta.source_count} sources in the latest desk record.`}
          </p>
        </div>
        <div className={homepage.signalMeta}>
          <span>Last desk run</span>
          <strong>{signalUpdated}</strong>
          <span>
            {api.meta.cluster_count} clusters, {api.meta.located_cluster_count} mapped
          </span>
          <Link href="/signal-desk">
            Enter Signal Desk <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className={`${homepage.frame} ${homepage.section}`} aria-labelledby="editorial-pathways-title">
        <SectionHeading
          id="editorial-pathways-title"
          eyebrow="Editorial Pathways"
          arabic="مسارات القراءة"
          title="Power. Memory. War."
        />
        <div className={homepage.pathwayGrid}>
          {pathways.map((pathway) => (
            <Link
              key={pathway.topic}
              href={{ pathname: "/essays", query: { topic: pathway.topic } }}
              className={homepage.pathway}
              data-pathway={pathway.topic.toLowerCase()}
            >
              <span className={homepage.pathwayNumber} aria-hidden="true">
                0{pathways.indexOf(pathway) + 1}
              </span>
              <span className={homepage.pathwayTitle}>
                <strong>{pathway.label}</strong>
              </span>
              <span className={`arabic ${homepage.pathwayArabic}`} lang="ar" dir="rtl">
                {pathway.arabic}
              </span>
              <span className={homepage.pathwayDescription}>{pathway.description}</span>
              <span className={homepage.pathwayArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${homepage.frame} ${homepage.statement}`} aria-label="About Lebanese Academic">
        <div className={homepage.statementLabel}>Lebanese Academic</div>
        <div className={homepage.statementCopy}>
          <p>
            An independent publication written from underneath Lebanon’s headlines, where power becomes ordinary life and memory becomes political evidence.
          </p>
          <p className="arabic" lang="ar" dir="rtl">
            منشور مستقل يقرأ لبنان من تحت العناوين، حيث تتحوّل السلطة إلى حياة يومية، وتصبح الذاكرة دليلاً سياسياً.
          </p>
          <Link href="/about">
            About the publication <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section id="newsletter" className={`${homepage.frame} ${homepage.newsletter}`} aria-labelledby="newsletter-title">
        <div className={homepage.newsletterCopy}>
          <div className={homepage.kicker}>Weekly Dispatch</div>
          <h2 id="newsletter-title">One essay. One argument worth carrying.</h2>
          <p>Sent from Beirut when there is something worth sending.</p>
          <p className="arabic" lang="ar" dir="rtl">رسالة من بيروت، حين يكون هناك ما يستحق أن يُرسل.</p>
        </div>
        <NewsletterSignup />
      </section>
    </SiteShell>
  );
}
