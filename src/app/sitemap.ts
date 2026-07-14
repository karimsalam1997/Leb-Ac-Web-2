import type { MetadataRoute } from "next";
import { essays } from "@/lib/content";
import { absoluteUrl, toIsoDate } from "@/lib/seo";
import { getArticleImages } from "@/lib/visual-assets";

function dateFromContent(date: string) {
  const isoDate = toIsoDate(date);

  return isoDate ? new Date(isoDate) : new Date();
}

function latestEssayDate() {
  const timestamps = essays
    .map((essay) => Date.parse(essay.date))
    .filter((timestamp) => !Number.isNaN(timestamp));

  return timestamps.length ? new Date(Math.max(...timestamps)) : new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticLastModified = latestEssayDate();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: staticLastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/essays"),
      lastModified: staticLastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/topics"),
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/signal-desk"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/heritage-memory-place-strategy"),
      lastModified: staticLastModified,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: absoluteUrl("/submit"),
      lastModified: staticLastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: staticLastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  const essayRoutes: MetadataRoute.Sitemap = essays.map((essay) => ({
    url: absoluteUrl(`/essays/${essay.slug}`),
    lastModified: dateFromContent(essay.date),
    changeFrequency: "monthly",
    priority: 0.8,
    images: getArticleImages(essay.slug).map((image) => absoluteUrl(image.src)),
  }));

  return [...staticRoutes, ...essayRoutes];
}
