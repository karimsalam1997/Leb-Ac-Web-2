import type { Metadata } from "next";
import { EssaysIndexClient, type EssayIndexItem } from "./essay-index-client";
import { SiteShell } from "@/components/site-shell";
import { essays } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getArticleImage } from "@/lib/visual-assets";

export const metadata: Metadata = buildPageMetadata({
  title: "Essays",
  description:
    "The full register. Long essays on Lebanese power, sectarianism, political economy, memory, and the institutions beneath the headlines.",
  path: "/essays",
  image: getArticleImage(essays[0]?.slug ?? "", 0),
});

export default async function EssaysPage({
  searchParams,
}: {
  searchParams?: Promise<{ topic?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : {};
  const topicParam = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const availableTopics = new Set(essays.flatMap((essay) => essay.tags));
  const initialTopic = topicParam && availableTopics.has(topicParam) ? topicParam : null;
  const essayItems: EssayIndexItem[] = essays.map((essay, index) => ({
    slug: essay.slug,
    title: essay.title,
    dek: essay.dek,
    byline: essay.byline,
    date: essay.date,
    readTime: essay.readTime,
    excerpt: essay.excerpt,
    tags: essay.tags,
    imageSrc: getArticleImage(essay.slug, 0),
    sourceIndex: index,
  }));

  return (
    <SiteShell activePath="/essays">
      <EssaysIndexClient essays={essayItems} initialTopic={initialTopic} />
    </SiteShell>
  );
}
