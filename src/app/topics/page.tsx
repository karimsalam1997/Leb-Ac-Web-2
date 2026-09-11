import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { essays } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getArticleImage } from "@/lib/visual-assets";

export const metadata: Metadata = buildPageMetadata({
  title: "Topics",
  description:
    "A map of Lebanese Academic themes: political economy, sectarianism, memory, sovereignty, diaspora, and state failure.",
  path: "/topics",
  image: getArticleImage(essays[0]?.slug ?? "", 0),
});

const topicRooms = [
  {
    title: "Political Economy",
    summary: "The banking collapse, private survival, public theft, and the daily intelligence of a country forced to improvise around its own institutions.",
    primaryTopic: "Political Economy",
    tags: ["Political Economy", "Banking Crisis", "Welfare", "Patronage"],
  },
  {
    title: "Sectarian Power",
    summary: "The census, Taif, za'im rule, confessional arithmetic, and the frozen bargains that still decide who gets to count.",
    primaryTopic: "Sectarianism",
    tags: [
      "Sectarianism",
      "Za'im System",
      "National Pact",
      "Taif Agreement",
      "Constitutional Reform",
      "Constitutional History",
      "Gerrymandering",
      "Demographics",
    ],
  },
  {
    title: "State Failure",
    summary: "The ministries, municipalities, courts, and reform rituals that appear most loudly when the state cannot actually act.",
    primaryTopic: "State Failure",
    tags: ["State Failure", "State", "Administrative Reform", "Reform", "Municipalities"],
  },
  {
    title: "Memory And The City",
    summary: "Beirut, civil war residue, heritage, public rooms, lost streets, and the stubborn question of what a place remembers after capital has passed through it.",
    primaryTopic: "Memory",
    tags: ["Memory", "History", "Culture", "City", "Civil War"],
  },
  {
    title: "War And Sovereignty",
    summary: "The border, Israeli force, Hezbollah, occupation, deterrence claims, and the difference between sovereignty as paperwork and sovereignty as lived power.",
    primaryTopic: "Sovereignty",
    tags: ["Sovereignty", "War", "Military Strategy", "Hezbollah", "Israel", "Iran", "Geopolitics", "Occupation"],
  },
  {
    title: "Diaspora And Patrons",
    summary: "The Lebanese abroad, Gulf money, external patrons, regional status, and the talent that works almost everywhere except inside its own state.",
    primaryTopic: "Diaspora",
    tags: ["Diaspora", "Gulf Relations", "Saudi Arabia", "External Patrons", "Power"],
  },
];

export default function TopicsPage() {
  return (
    <SiteShell activePath="/topics">
      <section className="paper-frame topics-page pt-5">
        <div className="topics-page-hero editorial-rule">
          <div>
            <div className="article-kicker">Topics</div>
            <h1 className="display-title text-[4.85rem] leading-none">By Topic</h1>
            <p className="mt-3 max-w-2xl text-[1.25rem] leading-7 text-[var(--ink-soft)]">
              The same country, entered through six public rooms: power,
              memory, sect, war, exile, and the state that keeps appearing by
              failing.
            </p>
          </div>
          <div className="topics-page-count">
            <span>{topicRooms.length}</span>
            <strong>editorial rooms</strong>
          </div>
        </div>

        <div className="topics-page-grid">
          {topicRooms.map((room, index) => {
            const matchingEssays = essays.filter((essay) =>
              essay.tags.some((tag) => room.tags.includes(tag)),
            );

            return (
              <section key={room.title} className="topic-cluster">
                <div className="topic-cluster-head">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{room.title}</h2>
                  <strong>{matchingEssays.length}</strong>
                </div>
                <p className="topic-cluster-summary">{room.summary}</p>
                <div className="topic-cluster-tags" aria-label={`${room.title} tags`}>
                  {room.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="topic-cluster-essays">
                  {matchingEssays.slice(0, 5).map((essay) => (
                    <Link key={essay.slug} href={`/essays/${essay.slug}`}>
                      <span>{essay.title}</span>
                      <small>{essay.readTime}</small>
                    </Link>
                  ))}
                </div>
                <Link
                  href={{ pathname: "/essays", query: { topic: room.primaryTopic } }}
                  className="read-link mt-4 !text-[1rem]"
                >
                  Open filtered register <span className="link-arrow">-&gt;</span>
                </Link>
              </section>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
