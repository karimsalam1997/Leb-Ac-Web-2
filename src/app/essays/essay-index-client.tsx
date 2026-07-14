"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EditorialImage } from "@/components/editorial-image";

const PAGE_SIZE = 12;

type SortMode = "editor" | "newest" | "oldest" | "readTime";

export type EssayIndexItem = {
  slug: string;
  title: string;
  dek: string;
  byline: string;
  date: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  imageSrc: string;
  sourceIndex: number;
};

// Roman numerals for the left-margin entry marks. Capped at LX for now —
// will widen when the register exceeds 60 essays.
const ROMAN: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V",
  6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X",
  11: "XI", 12: "XII", 13: "XIII", 14: "XIV", 15: "XV",
  16: "XVI", 17: "XVII", 18: "XVIII", 19: "XIX", 20: "XX",
  21: "XXI", 22: "XXII", 23: "XXIII", 24: "XXIV", 25: "XXV",
  26: "XXVI", 27: "XXVII", 28: "XXVIII", 29: "XXIX", 30: "XXX",
};

function toRoman(n: number): string {
  if (ROMAN[n]) return ROMAN[n];
  // Generic conversion for n > 30, used until we cross sixty essays.
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

export function EssaysIndexClient({
  essays,
  initialTopic = null,
}: {
  essays: EssayIndexItem[];
  initialTopic?: string | null;
}) {
  const [activeTopic, setActiveTopic] = useState<string | null>(initialTopic);
  const [sortMode, setSortMode] = useState<SortMode>("editor");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const topics = useMemo(() => getTopicsByFrequency(essays), [essays]);
  const filteredEssays = useMemo(
    () =>
      activeTopic
        ? essays.filter((essay) => essay.tags.includes(activeTopic))
        : essays,
    [activeTopic, essays],
  );

  // Featured essay = first by editor's order (whichever the editor placed first),
  // not newest by date. This is the move that turns a feed into a register.
  const featuredEssay = useMemo(
    () =>
      filteredEssays.find((essay) => essay.slug === "the-park-that-remembers") ??
      [...filteredEssays].sort(compareEditorOrder)[0],
    [filteredEssays],
  );

  const sortedEssays = useMemo(() => {
    const withoutFeatured = featuredEssay
      ? filteredEssays.filter((essay) => essay.slug !== featuredEssay.slug)
      : filteredEssays;

    return sortEssays(withoutFeatured, sortMode);
  }, [featuredEssay, filteredEssays, sortMode]);

  const visibleEssays = sortedEssays.slice(0, visibleCount);
  const remainingCount = Math.max(sortedEssays.length - visibleEssays.length, 0);
  const isShowingEverything = remainingCount === 0;

  function handleTopicClick(topic: string) {
    setActiveTopic((currentTopic) => (currentTopic === topic ? null : topic));
    setVisibleCount(PAGE_SIZE);
  }

  function handleSortChange(nextSortMode: SortMode) {
    setSortMode(nextSortMode);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <>
      <section className="paper-frame pt-5">
        <header className="essays-index-header">
          <div>
            <h1 className="display-title essays-index-title">The Register</h1>
            <p className="essays-index-deck">
              Every essay we&apos;ve published, ordered by the editor — for
              return rather than for scrolling. Filter by topic, sort by
              length, find the piece you half-remember.
            </p>
          </div>
          <div className="essays-index-meta-block">
            <div className="essays-index-count">{essays.length} essays</div>
            <div className="essays-index-count-arabic arabic">
              {essays.length} مقالًا
            </div>
            <div className="essays-index-issue">Issue 01 · ongoing</div>
          </div>
        </header>
      </section>

      <section className="paper-frame essays-filter-frame">
        <div className="essays-filter-bar" aria-label="Essay filters">
          <div className="essay-topic-list" aria-label="Filter by topic">
            {topics.map(({ topic, count }) => {
              const isActive = activeTopic === topic;

              return (
                <button
                  key={topic}
                  type="button"
                  data-active={isActive}
                  aria-pressed={isActive}
                  onClick={() => handleTopicClick(topic)}
                >
                  <span>{topic}</span>
                  <span className="essay-topic-count">{count}</span>
                </button>
              );
            })}
          </div>

          <label className="essay-sort-select">
            <span className="sr-only">Sort essays</span>
            <select
              value={sortMode}
              onChange={(event) => handleSortChange(event.target.value as SortMode)}
            >
              <option value="editor">Editor&apos;s order</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="readTime">By length</option>
            </select>
          </label>
        </div>
      </section>

      {featuredEssay ? (
        <section className="paper-frame">
          <article className="featured-essay-plate">
            <Link
              href={`/essays/${featuredEssay.slug}`}
              className="featured-essay-plate-image-link"
              aria-label={`Read ${featuredEssay.title}`}
            >
              <EditorialImage
                src={featuredEssay.imageSrc}
                alt={featuredEssay.title}
                className="featured-essay-plate-image"
                aspectRatio="3 / 4"
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Link>
            <div className="featured-essay-plate-copy">
              <div className="editorial-kicker">Featured Essay</div>
              <h2 className="display-title featured-essay-plate-title">
                <Link href={`/essays/${featuredEssay.slug}`}>
                  {featuredEssay.title}
                </Link>
              </h2>
              <p className="featured-essay-plate-dek">{featuredEssay.dek}</p>
              <div className="featured-essay-plate-meta">
                <span>{featuredEssay.byline}</span>
                <span className="featured-essay-plate-sep">·</span>
                <span>{featuredEssay.date}</span>
                <span className="featured-essay-plate-sep">·</span>
                <span>{featuredEssay.readTime}</span>
              </div>
              <Link
                href={`/essays/${featuredEssay.slug}`}
                className="read-link featured-essay-plate-cta"
              >
                Read essay <span className="link-arrow">-&gt;</span>
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      <section className="paper-frame pb-10">
        <div className="essay-register" aria-live="polite">
          {visibleEssays.map((essay, index) => {
            const entryNumber = index + 1;
            // Rhythmic break every fifth entry — feels designed, not paginated.
            const showSectionBreak = entryNumber > 1 && entryNumber % 5 === 1;

            return (
              <div key={essay.slug}>
                {showSectionBreak ? (
                  <div className="essay-register-break" aria-hidden="true">
                    <span>⁂</span>
                  </div>
                ) : null}
                <article className="essay-register-entry">
                  <div className="essay-register-numeral" aria-hidden="true">
                    {toRoman(entryNumber)}
                  </div>
                  <div className="essay-register-body">
                    <div className="essay-register-kicker">
                      {essay.tags.length
                        ? essay.tags.join(" · ")
                        : "Uncategorized"}
                    </div>
                    <h3 className="essay-register-title">
                      <Link href={`/essays/${essay.slug}`}>{essay.title}</Link>
                    </h3>
                    <p className="essay-register-excerpt">{essay.excerpt}</p>
                    <div className="essay-register-meta">
                      <span className="essay-register-byline">{essay.byline}</span>
                      <span className="essay-register-sep">·</span>
                      <time
                        className="essay-register-date"
                        dateTime={toDateTime(essay.date)}
                      >
                        {essay.date}
                      </time>
                      <span className="essay-register-sep">·</span>
                      <span className="essay-register-readtime">
                        {essay.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {remainingCount > 0 ? (
          <button
            type="button"
            className="essay-see-more"
            onClick={() => setVisibleCount((currentCount) => currentCount + PAGE_SIZE)}
          >
            See more ({remainingCount} remaining){" "}
            <span aria-hidden="true">-&gt;</span>
          </button>
        ) : (
          <div className="essay-register-end" aria-hidden="true">
            <span className="essay-register-end-mark">⁂</span>
            <span className="essay-register-end-label">
              End of Issue 01 · {essays.length} essays
            </span>
          </div>
        )}

        {/* Diagnostic hook for browsers: lets us style the "everything visible"
            state differently if we need to later. */}
        <span hidden={!isShowingEverything} aria-hidden="true" />
      </section>
    </>
  );
}

function getTopicsByFrequency(essays: EssayIndexItem[]) {
  const topicCounts = new Map<string, number>();

  essays.forEach((essay) => {
    essay.tags.forEach((tag) => {
      topicCounts.set(tag, (topicCounts.get(tag) ?? 0) + 1);
    });
  });

  return [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .filter(({ count }) => count >= 2)
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))
    .slice(0, 8);
}

function sortEssays(essays: EssayIndexItem[], sortMode: SortMode) {
  return [...essays].sort((a, b) => {
    if (sortMode === "editor") {
      return compareEditorOrder(a, b);
    }

    if (sortMode === "oldest") {
      return compareOldest(a, b);
    }

    if (sortMode === "readTime") {
      return (
        getReadMinutes(a.readTime) - getReadMinutes(b.readTime) ||
        compareNewest(a, b)
      );
    }

    return compareNewest(a, b);
  });
}

// Editor's order = the order the editor placed the essays in content.ts.
// This is the canonical sequence of the register.
function compareEditorOrder(a: EssayIndexItem, b: EssayIndexItem) {
  return a.sourceIndex - b.sourceIndex;
}

function compareNewest(a: EssayIndexItem, b: EssayIndexItem) {
  return getDateValue(b.date) - getDateValue(a.date) || a.sourceIndex - b.sourceIndex;
}

function compareOldest(a: EssayIndexItem, b: EssayIndexItem) {
  return getDateValue(a.date) - getDateValue(b.date) || a.sourceIndex - b.sourceIndex;
}

function getDateValue(date: string) {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getReadMinutes(readTime: string) {
  const minutes = Number.parseInt(readTime, 10);
  return Number.isNaN(minutes) ? Number.MAX_SAFE_INTEGER : minutes;
}

function toDateTime(date: string) {
  const timestamp = Date.parse(date);

  if (Number.isNaN(timestamp)) {
    return date;
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}
