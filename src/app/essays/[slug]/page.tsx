import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Fragment } from "react";
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
  const numberedSections = numberBodySections(
    getBodySections(essay.sections, leadParagraphs.length),
  );
  const articleImages = getArticleImages(essay.slug);
  const leadImage = articleImages[0];
  const supportingImages = articleImages.slice(1);
  const imageInsertions = placeSupportingImages(
    numberedSections,
    supportingImages,
  );
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

      <article className="article2026">
        <header className="article2026-header">
          <div className="article2026-breadcrumb">
            <Link href="/essays">Essays</Link>
            <span>/</span>
            <span>{essay.tags[0] ?? "Lebanon"}</span>
          </div>
          <h1>{essay.title}</h1>
          <p className="article2026-standfirst">{essay.dek}</p>
          <div className="article2026-byline">
            <span>By {essay.byline}</span>
            <span>{essay.dateline ?? "Beirut"}</span>
            <time>{essay.date}</time>
            <span>{essay.readTime}</span>
          </div>
          {essay.arabicDisplayLine ? (
            <p className="article2026-arabic arabic" dir="rtl">
              {essay.arabicDisplayLine}
            </p>
          ) : null}
        </header>

        <figure className="article2026-hero-figure">
          <EditorialImage
            src={leadImage?.src ?? getArticleImage(essay.slug, 0)}
            alt={leadImage?.alt ?? essay.title}
            className="article2026-hero-image"
            imagePosition={leadImage?.position}
            imageFit={leadImage?.fit}
            priority
            quality={95}
            sizes="(min-width: 1200px) 1180px, 100vw"
          />
          {leadImage?.caption ? <figcaption>{leadImage.caption}</figcaption> : null}
        </figure>

        <div className="article2026-layout">
          <aside className="article2026-sidebar">
            <div className="article2026-sidebar-block">
              <span>In this essay</span>
              <ol>
                {numberedSections
                  .filter((section) => section.heading)
                  .map((section, index) => (
                    <li key={section.heading}>
                      <a href={`#section-${index + 1}`}>
                        <small>{section.headingNumeral}</small>
                        <span>{section.heading}</span>
                      </a>
                    </li>
                  ))}
              </ol>
            </div>

            <div className="article2026-sidebar-block article2026-sidebar-note">
              <span>Filed under</span>
              <p>{essay.tags.join(" / ")}</p>
            </div>
          </aside>

          <div className="article2026-body">
            <div className="article2026-lede">
              {leadParagraphs.map((paragraph, index) => (
                <p key={`${essay.slug}-lead-${index}`}>{paragraph}</p>
              ))}
            </div>

            {(essay.bodyPullQuote ?? essay.pullQuote) ? (
              <blockquote>{essay.bodyPullQuote ?? essay.pullQuote}</blockquote>
            ) : null}

            {numberedSections.map((section, sectionIndex) => {
              const numberedHeadingIndex = numberedSections
                .slice(0, sectionIndex + 1)
                .filter((item) => item.heading).length;

              return (
                <section
                  key={`${essay.slug}-section-${sectionIndex}`}
                  id={section.heading ? `section-${numberedHeadingIndex}` : undefined}
                  className="article2026-section"
                >
                  {section.heading ? (
                    <h2>
                      <span>{section.headingNumeral}</span>
                      {section.heading}
                    </h2>
                  ) : null}

                  {section.paragraphs.map((paragraph, paragraphIndex) => {
                    const imagesAfterParagraph =
                      imageInsertions.get(`${sectionIndex}:${paragraphIndex}`) ??
                      [];

                    return (
                      <Fragment
                        key={`${essay.slug}-${sectionIndex}-${paragraphIndex}`}
                      >
                        <p>{paragraph}</p>
                        {imagesAfterParagraph.map((image) => (
                          <ArticleImage key={image.src} asset={image} />
                        ))}
                      </Fragment>
                    );
                  })}
                </section>
              );
            })}
          </div>
        </div>

        {essay.notes.length ? (
          <div className="article2026-notes-panel">
            <QuietNotes notes={essay.notes} />
          </div>
        ) : null}
      </article>

      <section className="article2026-related" aria-labelledby="related-essays-title">
        <header>
          <span>Continue reading</span>
          <h2 id="related-essays-title">Related essays</h2>
        </header>
        <div>
          {related.slice(0, 3).map((relatedEssay) => (
            <article key={relatedEssay.slug}>
              <Link href={`/essays/${relatedEssay.slug}`}>
                <EditorialImage
                  src={getArticleImage(relatedEssay.slug, 0)}
                  alt={relatedEssay.title}
                  className="article2026-related-image"
                  sizes="(min-width: 920px) 31vw, 100vw"
                />
                <span>{relatedEssay.tags[0] ?? "Essay"}</span>
                <h3>{relatedEssay.title}</h3>
                <small>{relatedEssay.readTime}</small>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function ArticleImage({ asset }: { asset: ArticleImageAsset }) {
  return (
    <figure className="article2026-inline-figure">
      <EditorialImage
        src={asset.src}
        alt={asset.alt}
        className="article2026-inline-image"
        imageClassName={asset.imageClassName}
        imagePosition={asset.position}
        imageFit={asset.fit}
        aspectRatio={asset.aspectRatio}
        quality={92}
        sizes="(min-width: 900px) 960px, 100vw"
      />
      {asset.caption ? <figcaption>{asset.caption}</figcaption> : null}
    </figure>
  );
}

type NumberedEssaySection = EssaySection & {
  headingNumeral?: string;
};

function numberBodySections(sections: EssaySection[]): NumberedEssaySection[] {
  let headingNumber = 0;

  return sections.map((section) => {
    if (!section.heading) {
      return section;
    }

    headingNumber += 1;

    return {
      ...section,
      headingNumeral: toRoman(headingNumber),
    };
  });
}

function toRoman(n: number) {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let value = n;
  let result = "";

  for (const [unit, numeral] of map) {
    while (value >= unit) {
      result += numeral;
      value -= unit;
    }
  }

  return result;
}

function QuietNotes({ notes }: { notes: Citation[] }) {
  if (!notes.length) {
    return null;
  }

  return (
    <details className="article2026-notes">
      <summary>Notes and sources</summary>
      <ol>
        {notes.map((note) => (
          <li key={note.id}>
            <span>{note.id}</span>
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

function placeSupportingImages(
  sections: NumberedEssaySection[],
  images: ArticleImageAsset[],
) {
  const paragraphLocations = sections.flatMap((section, sectionIndex) =>
    section.paragraphs.map((_, paragraphIndex) => ({
      sectionIndex,
      paragraphIndex,
    })),
  );
  const insertions = new Map<string, ArticleImageAsset[]>();

  if (!paragraphLocations.length) {
    return insertions;
  }

  images.forEach((image, imageIndex) => {
    const proportionalIndex = Math.min(
      paragraphLocations.length - 1,
      Math.max(
        0,
        Math.round(
          ((imageIndex + 1) * paragraphLocations.length) /
            (images.length + 1),
        ) - 1,
      ),
    );
    const location = paragraphLocations[proportionalIndex];
    const key = `${location.sectionIndex}:${location.paragraphIndex}`;
    const existing = insertions.get(key) ?? [];
    insertions.set(key, [...existing, image]);
  });

  return insertions;
}

function renderNoteText(text: string) {
  return text.split(/(https?:\/\/\S+)/g).map((part, index) => {
    if (!part.startsWith("http")) {
      return part;
    }

    return (
      <a
        key={`${part}-${index}`}
        href={part}
        target="_blank"
        rel="noreferrer"
      >
        {getReadableSourceLabel(part)}
      </a>
    );
  });
}

function getReadableSourceLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || "Source link";
  } catch {
    return "Source link";
  }
}
