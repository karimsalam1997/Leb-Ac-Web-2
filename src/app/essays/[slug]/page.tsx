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
  const articleImages = getArticleImages(essay.slug);
  const leadImageAsset = articleImages[0];
  const articleImage = leadImageAsset?.src ?? getArticleImage(essay.slug, 0);
  const supportingImages = articleImages.slice(1);
  const articleJsonLd = buildEssayJsonLd({
    essay,
    path: `/essays/${essay.slug}`,
    images: articleImages.map((image) => image.src),
  });

  return (
    <SiteShell activePath="/essays">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(articleJsonLd),
        }}
      />
      <div className="reading-progress" aria-hidden="true">
        <span />
      </div>
      <ArticleRunningHeader
        issue="Issue 01"
        category={getArticleKicker(essay.category)}
        surname={essay.byline.split(" ").pop() ?? essay.byline}
      />
      <article className="paper-frame article-page pt-5">
        <div className="article-reference-grid editorial-rule">
          {/* LEFT COLUMN — marginalia: pulled-quote note, citation list,
              and (when available) a small archival document figure. */}
          <ArticleMarginalia
            essay={essay}
            citations={essay.notes}
            marginaliaFigure={supportingImages[supportingImages.length - 1]}
          />

          {/* CENTER COLUMN — reading: kicker, title, standfirst, byline,
              display Arabic line, body. */}
          <div className="min-w-0">
            {/* The on-page kicker is always the generic form ("ESSAY").
                Editorial taxonomy ("Featured Essay") lives in the index
                plate and the running header — printing it above the title
                too made the header feel repetitive. */}
            <div className="article-kicker">{getArticleKicker(essay.category)}</div>
            <h1 className="article-display-title">{essay.title}</h1>

            {essay.dek ? (
              <p className="article-standfirst">{essay.dek}</p>
            ) : null}

            <div className="article-byline-block">
              <span className="article-byline-name">{essay.byline}</span>
              <span className="article-byline-dateline">
                {essay.dateline ? `${essay.dateline} · ` : ""}
                {essay.date}
              </span>
            </div>

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
                className="object-contain"
                style={{ width: "36px", height: "40px" }}
              />
            </div>

            <section className="article-continuation-section">
              <div className="article-continuation">
                {(essay.bodyPullQuote ?? essay.pullQuote) ? (
                  <aside className="article-body-pullquote" role="note">
                    <p>{essay.bodyPullQuote ?? essay.pullQuote}</p>
                  </aside>
                ) : null}
                {bodySections.map((section, sectionIndex) => (
                  <section
                    key={`${essay.slug}-section-${sectionIndex}`}
                    className="article-body-section"
                  >
                    {section.heading ? (
                      <h2 className="article-section-heading">
                        <span className="article-section-heading-numeral">
                          {toRoman(sectionIndex + 1)}.
                        </span>
                        {section.heading}
                      </h2>
                    ) : null}
                    <div className="body-copy body-copy-continuation">
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={`${essay.slug}-body-${sectionIndex}-${paragraphIndex}`}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
                <div className="article-section-mark article-section-mark-end">
                  <Image
                    src="/brand/la-witness-glyph.png"
                    alt=""
                    width={48}
                    height={52}
                    aria-hidden="true"
                    className="object-contain"
                    style={{ width: "48px", height: "52px" }}
                  />
                </div>
              </div>
            </section>

            <QuietNotes notes={essay.notes} />
          </div>

          {/* RIGHT COLUMN — figures: photographs and documents that live
              alongside the body, in the figure column on wide desktops. */}
          <ArticleFigureColumn
            essay={essay}
            leadAsset={leadImageAsset}
            leadImageSrc={articleImage}
            supportingImages={supportingImages}
          />
        </div>
      </article>

      <section className="paper-frame pt-7">
        <div className="related-reference-row">
          <div className="editorial-kicker text-[var(--foreground)]">Related Essays</div>
          {related.slice(0, 3).map((relatedEssay) => (
              <article key={relatedEssay.slug} className="grid grid-cols-[92px_1fr] gap-4">
                <Link href={`/essays/${relatedEssay.slug}`}>
                <EditorialImage
                  src={getArticleImage(relatedEssay.slug, 0)}
                  alt={relatedEssay.title}
                  className="aspect-square border border-[color:var(--paper-border)]"
                  sizes="92px"
                />
                </Link>
                <div>
                  <h3 className="editorial-title text-[1.25rem] leading-tight">
                    <Link href={`/essays/${relatedEssay.slug}`}>{relatedEssay.title}</Link>
                  </h3>
                  <div className="dense-meta mt-2">
                    {relatedEssay.date}
                    <br />
                    {relatedEssay.readTime}
                  </div>
                </div>
              </article>
            ))}
          <div>
            <p className="text-[1rem] leading-6 text-[var(--ink-soft)]">
              If this essay clarified something — or got something wrong —
              write to us. The strongest exchanges can become the next essay.
            </p>
            <Link href="/submit" className="mt-4 inline-flex border border-[color:var(--accent)] px-5 py-3 text-[var(--accent)]">
              Write to us <span className="link-arrow ml-3">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

/**
 * Normalise the editorial category for the on-page kicker.
 * The data layer uses "Featured Essay" for the lead piece so the index can
 * surface it; on the article page itself the kicker reads simply "ESSAY"
 * (matching the reference). Other categories pass through untouched.
 */
function getArticleKicker(category: string): string {
  if (category === "Featured Essay") {
    return "Essay";
  }
  return category;
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
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

function ArticleMarginalia({
  essay,
  citations,
  marginaliaFigure,
}: {
  essay: { slug: string; marginaliaNote?: string; marginaliaNoteAttribution?: string };
  citations: Citation[];
  marginaliaFigure?: ArticleImageAsset;
}) {
  if (!citations.length && !essay.marginaliaNote && !marginaliaFigure) {
    return null;
  }

  return (
    <aside
      className="article-marginalia"
      aria-label="Marginalia and citations"
    >
      <div className="article-marginalia-kicker">Marginalia</div>

      {essay.marginaliaNote ? (
        <div className="article-marginalia-note">
          {essay.marginaliaNote}
          {essay.marginaliaNoteAttribution ? (
            <span className="article-marginalia-note-attribution">
              — {essay.marginaliaNoteAttribution}
            </span>
          ) : null}
        </div>
      ) : null}

      {citations.length ? (
        <ol className="article-marginalia-citations">
          {citations.slice(0, 6).map((note, index) => (
            <li key={note.id} className="article-marginalia-citation">
              <span className="article-marginalia-citation-number">
                {index + 1}
              </span>
              <span>{note.text}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {marginaliaFigure ? (
        <figure className="article-marginalia-figure">
          <Image
            src={marginaliaFigure.src}
            alt={marginaliaFigure.alt}
            width={400}
            height={520}
            style={{ width: "100%", height: "auto" }}
          />
          {marginaliaFigure.caption ? (
            <figcaption>{marginaliaFigure.caption}</figcaption>
          ) : null}
        </figure>
      ) : null}
    </aside>
  );
}

function ArticleFigureColumn({
  essay,
  leadAsset,
  leadImageSrc,
  supportingImages,
}: {
  essay: { slug: string; title: string };
  leadAsset?: ArticleImageAsset;
  leadImageSrc: string;
  supportingImages: ArticleImageAsset[];
}) {
  // Lead figure + up to 3 supporting images live in the figure column.
  // Marginal citations now sit after the essay, so no image is reserved for
  // the former left rail.
  const figures: { src: string; alt: string; caption?: string }[] = [
    {
      src: leadImageSrc,
      alt: leadAsset?.alt ?? `${essay.title} lead image`,
      caption: leadAsset?.caption,
    },
    ...supportingImages.slice(0, 3).map((asset) => ({
      src: asset.src,
      alt: asset.alt,
      caption: asset.caption,
    })),
  ];

  if (!figures.length) return null;

  return (
    <aside
      className="article-figure-column"
      aria-label="Article figures"
    >
      {figures.map((figure, index) => (
        <figure key={`${essay.slug}-figure-${index}`} className="article-figure">
          <Image
            src={figure.src}
            alt={figure.alt}
            width={520}
            height={680}
            sizes="(min-width: 1180px) 16rem, 100vw"
            style={{ width: "100%", height: "auto" }}
          />
          {figure.caption ? (
            <figcaption>{figure.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </aside>
  );
}

function QuietNotes({ notes }: { notes: Citation[] }) {
  if (!notes.length) {
    return null;
  }

  return (
    <details className="article-source-notes">
      <summary>Notes and Sources</summary>
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
      visibleSections.push({
        heading: section.heading,
        paragraphs,
      });
    }

    return visibleSections;
  }, []);
}


function renderNoteText(text: string) {
  return text.split(/(https?:\/\/\S+)/g).map((part, index) => {
    if (!part.startsWith("http")) {
      return part;
    }

    return (
      <a key={`${part}-${index}`} href={part} className="underline underline-offset-4">
        {part}
      </a>
    );
  });
}
