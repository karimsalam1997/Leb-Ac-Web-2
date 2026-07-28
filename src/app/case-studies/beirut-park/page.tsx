import type { Metadata } from "next";
import Link from "next/link";
import { EditorialImage } from "@/components/editorial-image";
import { SiteShell } from "@/components/site-shell";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Beirut Park Case Study",
  description:
    "An independent public-space case study for Beirut Central District, focused on shade, free sitting, local material, and places where people can stay.",
  path: "/case-studies/beirut-park",
  image: "/case-studies/beirut-park/masterplan.webp",
});

const rooms = [
  {
    title: "The Pigeon Tower",
    image: "/case-studies/beirut-park/pigeon-tower.webp",
    alt: "Speculative pigeon tower inside the Beirut Park proposal",
    text: "A Beirut rooftop habit is given a public address. The tower is a landmark, a meeting point, and a place to watch the evening release.",
    shape: "portrait",
  },
  {
    title: "The Pergola Walk",
    image: "/case-studies/beirut-park/pergola.webp",
    alt: "Speculative vine-covered pergola in Beirut Park",
    text: "Stone columns and vines turn a route into shade. A person can cross the park slowly, stop, sit, and still see where the path goes.",
    shape: "wide",
  },
  {
    title: "The Sundial",
    image: "/case-studies/beirut-park/sundial.webp",
    alt: "Speculative sundial plaza in Beirut Park",
    text: "The column gives the plan a visible centre. Time is read from stone and shadow, with no screen and no power supply.",
    shape: "wide",
  },
  {
    title: "The Gazebo",
    image: "/case-studies/beirut-park/gazebo.webp",
    alt: "Speculative lakeside gazebo in Beirut Park",
    text: "A view becomes a public room. The gazebo holds conversation, shade, and water without requiring a café bill.",
    shape: "wide",
  },
  {
    title: "The Tawleh Tables",
    image: "/case-studies/beirut-park/tawleh.webp",
    alt: "Speculative tawleh tables in Beirut Park",
    text: "Permanent game tables protect a very ordinary right: to meet someone, play, argue, and stay for as long as the afternoon allows.",
    shape: "wide",
  },
  {
    title: "The Adonis Grove",
    image: "/case-studies/beirut-park/adonis-grove.webp",
    alt: "Speculative Adonis grove in seasonal bloom",
    text: "Red spring flowers give the park a season of memory. The grove holds grief quietly, without a sectarian monument or an official speech.",
    shape: "portrait",
  },
] as const;

const problems = [
  {
    title: "Movement comes first",
    text: "Curves and long paths move visitors through the drawing. Beirut needs named places where people can stop and understand where they are.",
  },
  {
    title: "The systems are fragile",
    text: "Large water features and controlled finishes assume reliable maintenance. Beirut's public realm has to survive an August power cut and a missed municipal budget.",
  },
  {
    title: "The city is hard to find",
    text: "A polished plan can travel from Beirut to another waterfront with very little changed. Local stone, public habits, and familiar forms give the park an address.",
  },
];

export default function BeirutParkCaseStudy() {
  return (
    <SiteShell activePath="/case-studies/beirut-park">
      <article className="case2026">
        <header className="case2026-hero">
          <div className="case2026-hero-copy">
            <div className="case2026-kicker">Case Study 01 / Public space / 2026</div>
            <h1>Beirut Park</h1>
            <p className="case2026-deck">
              A speculative study for Beirut Central District, built around one
              blunt test: can a person sit in shade, meet someone, and stay
              without paying?
            </p>
            <p className="case2026-status">
              Independent portfolio project. Research direction, spatial
              argument, public programme, and visual brief by Karim Salam. No
              commission or construction is claimed.
            </p>
          </div>

          <div className="case2026-hero-visuals">
            <figure className="case2026-hero-plan">
              <EditorialImage
                src="/case-studies/beirut-park/masterplan.webp"
                alt="Top-down masterplan for the speculative Beirut Park study"
                className="case2026-plan-image"
                imageFit="cover"
                priority
                quality={95}
                sizes="(min-width: 1100px) 58vw, 100vw"
              />
              <figcaption>Working masterplan / speculative design study</figcaption>
            </figure>
            <figure className="case2026-hero-tower">
              <EditorialImage
                src="/case-studies/beirut-park/pigeon-tower.webp"
                alt="Speculative pigeon tower for Beirut Park"
                className="case2026-tower-image"
                imagePosition="center 42%"
                priority
                quality={92}
                sizes="(min-width: 1100px) 24vw, 48vw"
              />
              <figcaption>Pigeon Tower / visual study</figcaption>
            </figure>
          </div>
        </header>

        <nav className="case2026-nav" aria-label="Case study sections">
          <a href="#site">Site</a>
          <a href="#problem">Problem</a>
          <a href="#proposal">Proposal</a>
          <a href="#rooms">Public rooms</a>
          <a href="#method">Method</a>
        </nav>

        <dl className="case2026-meta">
          <div>
            <dt>Location</dt>
            <dd>Beirut Central District</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>2026</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>Research, concept, visual direction</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Independent speculative study</dd>
          </div>
        </dl>

        <section id="site" className="case2026-opening">
          <div className="case2026-section-label">01 / The site</div>
          <div className="case2026-opening-copy">
            <p className="case2026-dropcap">
              At six in the afternoon on the Beirut waterfront, the useful
              question is simple. Where can a grandmother sit? Where can a
              student read? Where can two old men set down a tawleh board and
              remain after the coffee is finished?
            </p>
            <p>
              The original park plan has a serious strength. From above, it is
              composed and calm, with long curves, water, and a clear green
              field beside Beirut Central District. A city starved of public
              space should not dismiss that promise.
            </p>
            <p>
              The weakness appears at ground level. Too much of the plan asks
              people to move through it, while too little tells them where they
              may stop. Beirut Park begins with staying.
            </p>
          </div>
        </section>

        <section id="problem" className="case2026-problem">
          <div className="case2026-section-heading">
            <div className="case2026-section-label">02 / Diagnosis</div>
            <h2>The plan is strongest from a distance.</h2>
            <p>
              The critique is about use, maintenance, and belonging in Beirut.
              It is not an argument against beauty.
            </p>
          </div>

          <div className="case2026-problem-list">
            {problems.map((problem, index) => (
              <article key={problem.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{problem.title}</h3>
                <p>{problem.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="proposal" className="case2026-proposal">
          <div className="case2026-section-heading">
            <div className="case2026-section-label">03 / The proposal</div>
            <h2>A sequence of public rooms.</h2>
            <p>
              The new plan uses clear sightlines, shade, local material, and
              named destinations. Every room gives a visitor a reason to stay.
            </p>
          </div>

          <figure className="case2026-main-sightline">
            <EditorialImage
              src="/case-studies/beirut-park/main-sightline.webp"
              alt="Main sightline through the speculative Beirut Park design"
              className="case2026-main-sightline-image"
              imagePosition="center 52%"
              quality={95}
              sizes="(min-width: 1200px) 1180px, 100vw"
            />
            <figcaption>
              Main sightline. The sundial gives the park a centre that can be
              understood from the ground.
            </figcaption>
          </figure>
        </section>

        <section id="rooms" className="case2026-rooms">
          <div className="case2026-section-heading case2026-section-heading-light">
            <div className="case2026-section-label">04 / Public rooms</div>
            <h2>Six places with six different jobs.</h2>
            <p>
              Beirut&apos;s public life is already full of ritual. The design gives
              those habits shade, stone, water, and an address.
            </p>
          </div>

          <div className="case2026-room-grid">
            {rooms.map((room, index) => (
              <figure key={room.title} data-shape={room.shape}>
                <EditorialImage
                  src={room.image}
                  alt={room.alt}
                  className="case2026-room-image"
                  imagePosition={room.shape === "portrait" ? "center 44%" : "center 50%"}
                  quality={92}
                  sizes="(min-width: 1100px) 48vw, 100vw"
                />
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{room.title}</h3>
                    <p>{room.text}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="case2026-materials">
          <div className="case2026-section-heading">
            <div className="case2026-section-label">05 / Shade and material</div>
            <h2>Built for Beirut&apos;s ordinary failures.</h2>
            <p>
              Ramleh sandstone, crushed limestone, vines, native and adapted
              planting, and dry paths reduce the park&apos;s dependence on pumps,
              polished surfaces, and constant repair.
            </p>
          </div>
          <div className="case2026-material-grid">
            <figure>
              <EditorialImage
                src="/case-studies/beirut-park/wisteria.webp"
                alt="Wisteria-covered pergola in the speculative Beirut Park study"
                className="case2026-material-image"
                quality={92}
                sizes="(min-width: 900px) 58vw, 100vw"
              />
              <figcaption>Wisteria pergola / shade before spectacle</figcaption>
            </figure>
            <figure>
              <EditorialImage
                src="/case-studies/beirut-park/pavilion-interior.webp"
                alt="Interior public room in the speculative Beirut Park study"
                className="case2026-material-image"
                quality={92}
                sizes="(min-width: 900px) 40vw, 100vw"
              />
              <figcaption>Pavilion interior / a public room open to the park</figcaption>
            </figure>
          </div>
        </section>

        <section id="method" className="case2026-method">
          <div className="case2026-section-label">06 / Method and authorship</div>
          <div className="case2026-method-grid">
            <h2>What the case actually shows.</h2>
            <div>
              <p>
                Karim Salam developed the research direction, editorial
                argument, public-space programme, and visual brief for this
                independent 2026 study. The work joins urban history, climate,
                public ritual, and design criticism in one readable file.
              </p>
              <p>
                AI-assisted tools helped produce and organise parts of the
                visual study and website. The images are speculative. They do
                not document an existing park, a client commission, or a built
                result.
              </p>
              <p>
                The value of the case is the chain of judgment: identify the
                problem, concede what works, set a public test, turn the test
                into rooms, then explain each choice in language a Beirut
                resident can argue with.
              </p>
            </div>
          </div>
        </section>

        <section className="case2026-closing">
          <div>
            <div className="case2026-kicker">Beirut / Public space / Research</div>
            <h2>The whole case comes down to a stone table in the shade.</h2>
          </div>
          <div>
            <Link href="/essays/the-park-that-remembers">Read the companion essay</Link>
            <Link href="/essays">Browse all essays</Link>
          </div>
        </section>
      </article>
    </SiteShell>
  );
}
