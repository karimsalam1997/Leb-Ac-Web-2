import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleRunningHeader } from "@/components/article-running-header";
import { EditorialImage } from "@/components/editorial-image";
import { SiteShell } from "@/components/site-shell";
import {
  type Citation,
  type EssaySection,
  essays,
  getCanonicalEssaySlug,
  getEssay,
  getRelatedEssays,
} from "@/lib/content";
import {
  buildEssayJsonLd,
  buildEssayMetadata,
  serializeJsonLd,
} from "@/lib/seo";
import {
  type ArticleImageAsset,
  getArticleImage,
  getArticleImages,
} from "@/lib/visual-assets";

type ReadingItem = {
  paragraph: string;
  heading?: string;
};

export function generateStaticParams() {
  return essays.map((essay) => ({ slug: essay.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const canonicalSlug = getCanonicalEssaySlug(slug);
    const essay = canonicalSlug ? getEssay(canonicalSlug) : undefined;

    if (!essay) {
      return { title: "Essay Not Found / Lebanese Academic" };
    }

    return buildEssayMetadata({
      essay,
      path: `/essays/${essay.slug}`,
      image: getArticleImage(essay.slug, 0),
    });
  });
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const canonicalSlug = getCanonicalEssaySlug(slug);

  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(`/essays/${canonicalSlug}`);
  }

  const essay = canonicalSlug ? getEssay(canonicalSlug) : undefined;

  if (!essay) {
    notFound();
  }

  const related = getRelatedEssays(essay);
  const paragraphs = essay.sections.flatMap((section) => section.paragraphs);
  const leadParagraphs = paragraphs.slice(0, 3);
  const bodySections = getBodySections(essay.sections, leadParagraphs.length);
  const articleImages = getOrderedArticleImages(essay.slug);
  const leadImage = articleImages[0] ?? {
    src: getArticleImage(essay.slug, 0),
    alt: `${essay.title} lead image`,
  };
  const supportingImages = articleImages.slice(1);
  const readingBeats = getReadingBeats(bodySections, supportingImages.length);
  const articleJsonLd = buildEssayJsonLd({
    essay,
    path: `/essays/${essay.slug}`,
    images: articleImages.map((image) => image.src),
  });

  return (
    <SiteShell activePath="/essays">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <div className="reading-progress" aria-hidden="true"><span /></div>
      <ArticleRunningHeader
        issue="Issue 01"
        category={getArticleKicker(essay.category)}
        surname={essay.byline.split(" ").pop() ?? essay.byline}
      />

      <article className="paper-frame article-page article-immersive-page pt-5">
        <header className="article-immersive-header">
          <div className="article-kicker">{getArticleKicker(essay.category)}</div>
          <h1 className="article-display-title">{essay.title}</h1>
          {essay.dek ? <p className="article-standfirst">{essay.dek}</p> : null}
          <div className="article-byline-block">
            <span className="article-byline-name">{essay.byline}</span>
            <span className="article-byline-dateline">
              {essay.dateline ? `${essay.dateline} · ` : ""}{essay.date} · {essay.readTime}
            </span>
          </div>
        </header>

        <ArticleFigure asset={leadImage} variant="hero" index={0} />

        <div className="article-reading-column">
          {essay.arabicDisplayLine ? (
            <div className="article-display-arabic arabic" dir="rtl">
              {essay.arabicDisplayLine}
            </div>
          ) : null}

          <div className="body-copy article-lede-copy">
            {leadParagraphs.map((paragraph, index) => (
              <p key={`${essay.slug}-lead-${index}`}>{paragraph}</p>
            ))}
          </div>

          <div className="article-section-mark-center" aria-hidden="true">
            <Image
              src="/brand/la-witness-glyph.png"
              alt=""
              width={36}
              height={40}
              style={{ width: "36px", height: "40px" }}
            />
          </div>

          {(essay.bodyPullQuote ?? essay.pullQuote) ? (
            <aside className="article-body-pullquote" role="note">
              <p>{essay.bodyPullQuote ?? essay.pullQuote}</p>
            </aside>
          ) : null}

          <div className="article-immersive-flow">
            {readingBeats.map((beat, beatIndex) => {
              const figure = supportingImages[beatIndex];
              const mentionsHobsbawm = beat.some((item) =>
                item.paragraph.toLowerCase().includes("hobsbawm"),
              );

              return (
                <div key={`${essay.slug}-beat-${beatIndex}`} className="article-reading-beat">
                  <section className="article-body-section">
                    <div className="body-copy body-copy-continuation">
                      {beat.map((item, itemIndex) => (
                        <div key={`${essay.slug}-beat-${beatIndex}-${itemIndex}`}>
                          {item.heading ? (
                            <h2 className="article-section-heading">
                              <span className="article-section-heading-numeral">
                                {toRoman(beatIndex + 1)}.
                              </span>
                              {item.heading}
                            </h2>
                          ) : null}
                          <p>{item.paragraph}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {mentionsHobsbawm ? <HobsbawmInterlude /> : null}
                  {figure ? (
                    <ArticleFigure
                      asset={figure}
                      variant={getFigureVariant(figure, beatIndex)}
                      index={beatIndex + 1}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="article-section-mark article-section-mark-end" aria-hidden="true">
            <Image
              src="/brand/la-witness-glyph.png"
              alt=""
              width={48}
              height={52}
              style={{ width: "48px", height: "52px" }}
            />
          </div>

          <QuietNotes notes={essay.notes} />
        </div>
      </article>

      <RelatedEssays essays={related.slice(0, 3)} />
    </SiteShell>
  );
}

function ArticleFigure({
  asset,
  variant,
  index,
}: {
  asset: ArticleImageAsset;
  variant: "hero" | "breakout" | "standard" | "portrait" | "document";
  index: number;
}) {
  return (
    <figure className="article-immersive-figure" data-variant={variant}>
      <EditorialImage
        src={asset.src}
        alt={asset.alt}
        imagePosition={asset.position}
        imageFit={asset.fit}
        imageClassName={asset.imageClassName}
        aspectRatio={asset.aspectRatio ?? (variant === "portrait" ? "3 / 4" : "3 / 2")}
        className="article-immersive-image"
        preload={variant === "hero"}
        quality={variant === "hero" ? 88 : 84}
        sizes={variant === "hero" || variant === "breakout" ? "(min-width: 1180px) 1120px, 100vw" : "(min-width: 1180px) 760px, 100vw"}
      />
      {asset.caption ? (
        <figcaption>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{asset.caption}</p>
        </figcaption>
      ) : null}
    </figure>
  );
}

function HobsbawmInterlude() {
  return (
    <aside className="article-reading-interlude" aria-label="Reading reference">
      <span>Reading reference / 1983</span>
      <strong>Eric Hobsbawm and Terence Ranger</strong>
      <em>The Invention of Tradition</em>
      <p>A tradition can be newly made and still become socially real. The question is what people are being taught to remember together.</p>
    </aside>
  );
}

function RelatedEssays({ essays: relatedEssays }: { essays: typeof essays }) {
  return (
    <section className="paper-frame article-related-section" aria-labelledby="related-essays-title">
      <header>
        <div className="editorial-kicker">Continue reading</div>
        <h2 id="related-essays-title">Related essays</h2>
      </header>
      <div className="article-related-grid">
        {relatedEssays.map((essay) => (
          <article key={essay.slug}>
            <Link href={`/essays/${essay.slug}`}>
              <EditorialImage
                src={getArticleImage(essay.slug, 0)}
                alt={essay.title}
                className="article-related-image"
                aspectRatio="4 / 3"
                sizes="(min-width: 900px) 30vw, 100vw"
              />
            </Link>
            <div className="dense-meta">{essay.date} · {essay.readTime}</div>
            <h3><Link href={`/essays/${essay.slug}`}>{essay.title}</Link></h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function getArticleKicker(category: string) {
  return category === "Featured Essay" ? "Essay" : category;
}

function toRoman(n: number) {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"],
    [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"],
    [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let remaining = n;
  for (const [value, letter] of map) {
    while (remaining >= value) {
      result += letter;
      remaining -= value;
    }
  }
  return result;
}

function getOrderedArticleImages(slug: string) {
  const images = getArticleImages(slug);

  if (slug !== "the-park-that-remembers") {
    return images;
  }

  const parkOrder = [
    "main-sightline", "pavilion-entrance", "pathways", "adonis-study",
    "sundial-pavilion", "gazebo-lake", "pigeon-tower", "pigeon-tower-release",
    "adonis-grove", "colonnaded-vines", "sundial-plaza", "ottoman-kiosk",
    "backgammon-pigeons",
  ];

  return [...images].sort((a, b) => {
    const aIndex = parkOrder.findIndex((name) => a.src.includes(name));
    const bIndex = parkOrder.findIndex((name) => b.src.includes(name));
    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });
}

function getFigureVariant(asset: ArticleImageAsset, index: number) {
  if (asset.fit === "contain") return "document" as const;
  if (isPortraitRatio(asset.aspectRatio)) return "portrait" as const;
  if (index % 3 === 0) return "breakout" as const;
  return "standard" as const;
}

function isPortraitRatio(aspectRatio?: string) {
  if (!aspectRatio) return false;
  const parts = aspectRatio.split("/").map((part) => Number.parseFloat(part.trim()));
  return parts.length === 2 && parts.every(Number.isFinite) && parts[0] < parts[1];
}

function getReadingBeats(sections: EssaySection[], imageCount: number) {
  const items = sections.flatMap<ReadingItem>((section) =>
    section.paragraphs.map((paragraph, index) => ({
      paragraph,
      heading: index === 0 ? section.heading : undefined,
    })),
  );

  if (!items.length) return [];

  const beatCount = Math.min(items.length, Math.max(1, imageCount + 1));
  const baseSize = Math.floor(items.length / beatCount);
  const remainder = items.length % beatCount;
  const beats: ReadingItem[][] = [];
  let cursor = 0;

  for (let index = 0; index < beatCount; index += 1) {
    const size = baseSize + (index < remainder ? 1 : 0);
    beats.push(items.slice(cursor, cursor + size));
    cursor += size;
  }

  return beats;
}

function QuietNotes({ notes }: { notes: Citation[] }) {
  if (!notes.length) return null;

  return (
    <details className="article-source-notes">
      <summary>Notes and sources</summary>
      <ol className="notes-list">
        {notes.map((note) => (
          <li key={note.id}>
            <span className="dense-meta text-[var(--accent)]">{note.id}</span>
            <p>{renderNoteText(note.text)}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}

function getBodySections(sections: EssaySection[], paragraphsToSkip: number) {
  let remainingToSkip = paragraphsToSkip;

  return sections.reduce<EssaySection[]>((visibleSections, section) => {
    if (remainingToSkip >= section.paragraphs.length) {
      remainingToSkip -= section.paragraphs.length;
      return visibleSections;
    }

    const paragraphs = section.paragraphs.slice(remainingToSkip);
    remainingToSkip = 0;

    if (paragraphs.length) {
      visibleSections.push({ heading: section.heading, paragraphs });
    }

    return visibleSections;
  }, []);
}

function renderNoteText(text: string) {
  return text.split(/(https?:\/\/\S+)/g).map((part, index) => {
    if (!part.startsWith("http")) return part;

    return (
      <a key={`${part}-${index}`} href={part} className="underline underline-offset-4">
        {part}
      </a>
    );
  });
}
