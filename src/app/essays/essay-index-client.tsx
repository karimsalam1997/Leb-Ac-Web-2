"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EditorialImage } from "@/components/editorial-image";

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

export function EssaysIndexClient({
  essays,
  initialTopic = null,
}: {
  essays: EssayIndexItem[];
  initialTopic?: string | null;
}) {
  const [activeTopic, setActiveTopic] = useState<string | null>(initialTopic);
  const [sortMode, setSortMode] = useState<SortMode>("editor");
  const topics = useMemo(() => getTopicsByFrequency(essays), [essays]);
  const topicNames = useMemo(() => new Set(topics.map(({ topic }) => topic)), [topics]);
  const visibleTopics = useMemo(
    () => topics.filter(({ topic, count }) => count > 1 || topic === activeTopic),
    [activeTopic, topics],
  );

  const filteredEssays = useMemo(() => {
    const matchesTopic = activeTopic
      ? essays.filter((essay) => essay.tags.includes(activeTopic))
      : essays;

    return sortEssays(matchesTopic, sortMode);
  }, [activeTopic, essays, sortMode]);

  const featuredEssay = filteredEssays[0];
  const gridEssays = filteredEssays.slice(1);

  useEffect(() => {
    function syncTopicFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const topic = params.get("topic");
      setActiveTopic(topic && topicNames.has(topic) ? topic : null);
    }

    window.addEventListener("popstate", syncTopicFromUrl);
    return () => window.removeEventListener("popstate", syncTopicFromUrl);
  }, [topicNames]);

  function chooseTopic(topic: string | null) {
    setActiveTopic(topic);
    updateTopicUrl(topic);
  }

  return (
    <>
      <section className="essays2026-hero">
        <div className="essays2026-hero-label">Writing / المقالات</div>
        <div>
          <h1>Essays</h1>
          <p>
            Long pieces on Lebanon, written from Beirut and built from named
            places, documents, institutions, and people.
          </p>
        </div>
        <div className="essays2026-count">
          <strong>{filteredEssays.length}</strong>
          <span>{activeTopic ? `filed under ${activeTopic}` : "published essays"}</span>
        </div>
      </section>

      <section className="essays2026-controls" aria-label="Essay controls">
        <div className="essays2026-topics" aria-label="Filter essays by topic">
          <button
            type="button"
            data-active={!activeTopic}
            aria-pressed={!activeTopic}
            onClick={() => chooseTopic(null)}
          >
            All
            <span>{essays.length}</span>
          </button>
          {visibleTopics.map(({ topic, count }) => (
            <button
              key={topic}
              type="button"
              data-active={activeTopic === topic}
              aria-pressed={activeTopic === topic}
              onClick={() => chooseTopic(activeTopic === topic ? null : topic)}
            >
              {topic}
              <span>{count}</span>
            </button>
          ))}
        </div>

        <label className="essays2026-sort">
          <span>Order</span>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
          >
            <option value="editor">Editor&apos;s order</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="readTime">Shortest first</option>
          </select>
        </label>
      </section>

      {featuredEssay ? (
        <section className="essays2026-feature" aria-labelledby="featured-essay-title">
          <Link href={`/essays/${featuredEssay.slug}`} className="essays2026-feature-image-link">
            <EditorialImage
              src={featuredEssay.imageSrc}
              alt={featuredEssay.title}
              className="essays2026-feature-image"
              priority
              quality={95}
              sizes="(min-width: 980px) 58vw, 100vw"
            />
          </Link>
          <div className="essays2026-feature-copy">
            <div className="essays2026-kicker">Featured / {featuredEssay.tags[0]}</div>
            <h2 id="featured-essay-title">
              <Link href={`/essays/${featuredEssay.slug}`}>
                {featuredEssay.title}
              </Link>
            </h2>
            <p>{featuredEssay.dek}</p>
            <div className="essays2026-meta">
              By {featuredEssay.byline} / {featuredEssay.date} / {featuredEssay.readTime}
            </div>
            <Link href={`/essays/${featuredEssay.slug}`} className="essays2026-read-link">
              Read the essay
            </Link>
          </div>
        </section>
      ) : (
        <section className="essays2026-empty">
          <h2>No essays in this file yet.</h2>
          <button type="button" onClick={() => chooseTopic(null)}>
            Show all essays
          </button>
        </section>
      )}

      {gridEssays.length ? (
        <section className="essays2026-grid" aria-label="Essay list">
          {gridEssays.map((essay) => (
            <article key={essay.slug} className="essays2026-card">
              <Link href={`/essays/${essay.slug}`} className="essays2026-card-image-link">
                <EditorialImage
                  src={essay.imageSrc}
                  alt={essay.title}
                  className="essays2026-card-image"
                  quality={90}
                  sizes="(min-width: 1080px) 31vw, (min-width: 700px) 48vw, 100vw"
                />
              </Link>
              <div className="essays2026-card-copy">
                <div className="essays2026-kicker">
                  {essay.tags.slice(0, 2).join(" / ")}
                </div>
                <h2>
                  <Link href={`/essays/${essay.slug}`}>{essay.title}</Link>
                </h2>
                <p>{essay.dek}</p>
                <div className="essays2026-meta">
                  {essay.date} / {essay.readTime}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </>
  );
}

function updateTopicUrl(topic: string | null) {
  const url = new URL(window.location.href);

  if (topic) {
    url.searchParams.set("topic", topic);
  } else {
    url.searchParams.delete("topic");
  }

  window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function getTopicsByFrequency(essays: EssayIndexItem[]) {
  const counts = new Map<string, number>();

  essays.forEach((essay) => {
    essay.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}

function sortEssays(essays: EssayIndexItem[], sortMode: SortMode) {
  return [...essays].sort((a, b) => {
    if (sortMode === "oldest") {
      return getDateValue(a.date) - getDateValue(b.date) || a.sourceIndex - b.sourceIndex;
    }

    if (sortMode === "newest") {
      return getDateValue(b.date) - getDateValue(a.date) || a.sourceIndex - b.sourceIndex;
    }

    if (sortMode === "readTime") {
      return getReadMinutes(a.readTime) - getReadMinutes(b.readTime) || a.sourceIndex - b.sourceIndex;
    }

    return a.sourceIndex - b.sourceIndex;
  });
}

function getDateValue(date: string) {
  const value = Date.parse(date);
  return Number.isNaN(value) ? 0 : value;
}

function getReadMinutes(readTime: string) {
  const value = Number.parseInt(readTime, 10);
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}
