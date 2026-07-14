import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { buildPageMetadata, siteName, siteTagline } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "Lebanese Academic is an independent publication on Lebanon — structural writing on power, sect, memory, and the architecture of a state kept deliberately weak.",
  path: "/about",
  image: "/brand/la-primary-lockup.png",
});

export default function AboutPage() {
  return (
    <SiteShell activePath="/about">
      <section className="paper-frame pt-6">
        <div className="about-hero editorial-rule">
          <div>
            <div className="editorial-kicker">About</div>
            <h1 className="display-title about-title">
              {siteTagline}
            </h1>
            <p className="about-lede">
              {siteName} is an independent publication on Lebanon. We publish
              long, structural essays on power, sect, memory, and the
              architecture of a state that has been kept deliberately weak.
              We do not publish news. We publish the writing that explains
              the news.
            </p>
            <p className="arabic about-lede-arabic">
              {`الأكاديمي اللبناني`} منشور مستقلّ عن لبنان. نَنشُر مقالات طويلة وبنيوية في السلطة والطائفة والذاكرة، وفي معمار دولةٍ أُبقِيَت ضعيفةً عن قصد. لا نَنشُر الأخبار — نَنشُر ما يجعل الأخبار مفهومة.
            </p>
          </div>
          <div className="about-mark">
            <Image
              src="/brand/la-editors-mark.png"
              alt=""
              width={140}
              height={140}
              priority
            />
          </div>
        </div>
      </section>

      <section className="paper-frame about-manifesto">
        <div className="about-manifesto-grid">
          <div>
            <div className="editorial-kicker">What &ldquo;Academic&rdquo; Means Here</div>
            <h2 className="editorial-title about-section-title">
              Not the dry kind.
            </h2>
          </div>
          <div className="about-prose">
            <p>
              The word <em>academic</em> in our name does not mean the
              footnoted neutrality of the journal article. It means
              <em> structural</em>. We are interested in the load-bearing
              walls, not the wallpaper. In the system, not the scandal. In
              the incentive that produces the headline, not the headline
              itself.
            </p>
            <p>
              The bias of most writing on Lebanon is to mistake the surface
              for the country — to treat each new crisis as an unrelated
              episode rather than as the predictable output of a machine
              that has been running since 1943. We treat it as a machine.
              We describe how the machine works. We name the parts.
            </p>
            <p>
              We are non-partisan in the sense that we do not write
              ammunition for any sect or party. We are not neutral in any
              other sense. We have a clear position: Lebanon&rsquo;s
              dysfunction is not the result of bad luck or a wounded
              culture. It is the result of a small number of structural
              choices, made by identifiable people, in service of an
              arrangement that benefits identifiable interests. Naming
              those choices is the first small act of repair.
            </p>
          </div>
        </div>
      </section>

      <section className="paper-frame about-manifesto">
        <div className="about-manifesto-grid">
          <div>
            <div className="editorial-kicker">Who This Is For</div>
            <h2 className="editorial-title about-section-title">
              The intellectually serious Lebanese reader.
            </h2>
          </div>
          <div className="about-prose">
            <p>
              In Beirut, in the South, in the mountain, in Paris, in
              Montreal, in Dubai, in Lagos — the reader who is tired of
              having their country explained to them in the grammar of
              crisis. Who wants the structural map. Who can hold complexity
              without retreating to a sectarian corner.
            </p>
            <p>
              You will not find takes here. You will find the slow work of
              naming what is actually going on, in the longest form an
              essay can defend.
            </p>
          </div>
        </div>
      </section>

      <section className="paper-frame about-manifesto">
        <div className="about-manifesto-grid">
          <div>
            <div className="editorial-kicker">What We Publish</div>
            <h2 className="editorial-title about-section-title">
              One form, a widening register.
            </h2>
          </div>
          <div className="about-prose">
            <p>
              <strong>Essays</strong> — long pieces (1,500&ndash;4,000
              words) that take a single load-bearing question and follow
              it to the floor. Most live in political economy, sect, and
              memory; some live in geography, language, and ritual. We
              publish across these because they are the same subject
              looked at from different angles.
            </p>
          </div>
        </div>
      </section>

      <section className="paper-frame about-anchor-strip">
        <div className="about-anchor-inner">
          <div>
            <div className="editorial-kicker">Founded</div>
            <p>
              Lebanese Academic was founded in 2025, in the long shadow of
              1975. The year is in our masthead because every Lebanese
              political question still routes through the war that
              didn&rsquo;t end so much as change clothes.
            </p>
          </div>
          <div>
            <div className="editorial-kicker">Editor</div>
            <p>
              Karim Salam (@lebaneseacademic on Instagram). The site is
              currently single-edited. We are opening to outside writers
              over 2026.
            </p>
            <Link href="/submit" className="read-link mt-3">
              Send us writing <span className="link-arrow">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
