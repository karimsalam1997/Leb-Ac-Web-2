const homeBase = "/home";
const downtownRepairHero = "/editorial/downtown-repair-hero.jpg";
const essayImageBase = "/essay-images";
const sourcedImageBase = `${essayImageBase}/sourced`;
const fractalSovereigntyBase = `${essayImageBase}/fractal-sovereignty`;
const beirutParkBase = "/editorial/beirut-park-originals";

export type ArticleImageAsset = {
  src: string;
  alt: string;
  caption?: string;
  imageClassName?: string;
  position?: string;
  aspectRatio?: string;
  fit?: "cover" | "contain";
};

export const homeAssets = {
  logoMark: `${homeBase}/logo-mark@3x.png`,
  hero: {
    src: `${homeBase}/hero-beirut-coast.jpg`,
    position: "center 56%",
  },
  poster: `${homeBase}/poster-collapse.png`,
  pattern: `${homeBase}/pattern-left@3x.png`,
  stamps: `${homeBase}/stamps-strip@3x.png`,
  departments: {
    essays: {
      src: `${homeBase}/essay-ruins.jpg`,
      position: "center 54%",
    },
    letters: {
      src: `${homeBase}/letters-manuscript.jpg`,
      position: "center 55%",
    },
    notebook: {
      src: `${homeBase}/notebook-ruins.jpg`,
      position: "center 50%",
    },
    archive: {
      src: `${homeBase}/archive-river.jpg`,
      position: "center 58%",
    },
  },
  edition: [
    {
      src: `${homeBase}/hero-beirut-coast.jpg`,
      position: "center 56%",
    },
    {
      src: `${homeBase}/essay-ruins.jpg`,
      position: "center 54%",
    },
    {
      src: `${homeBase}/letters-manuscript.jpg`,
      position: "center 55%",
    },
    {
      src: `${homeBase}/notebook-ruins.jpg`,
      position: "center 50%",
    },
    {
      src: `${homeBase}/archive-river.jpg`,
      position: "center 58%",
    },
    {
      src: `${homeBase}/ledger-coast.jpg`,
      position: "center 54%",
    },
  ],
};

export const generatedArticleImages = homeAssets.edition.map((asset) => asset.src);

const articleImageSets: Record<string, ArticleImageAsset[]> = {
  "the-city-that-could-not-repair-itself": [
    {
      src: `${sourcedImageBase}/city-roman-baths-ruins.jpg`,
      alt: "The Roman Baths in Downtown Beirut, visible below the rebuilt city",
      caption:
        "The Roman Baths make the essay's argument physical: under the polished postwar center is an older Beirut that was not invented by developers, politicians, or any one sect. The interesting thing is how calm the stones look while the modern city keeps trying to sprint past them.",
      position: "center 55%",
      aspectRatio: "3872 / 2592",
    },
    {
      src: `${sourcedImageBase}/city-archaeology-khandaq.jpg`,
      alt: "An archaeological site in Khandaq al-Ghamiq in Beirut",
      caption:
        "This is the city under the city before it becomes a slogan. Archaeology slows everything down: every wall asks what Beirut was before the latest master plan decided what Beirut should become.",
      position: "center 54%",
      aspectRatio: "960 / 720",
    },
    {
      src: `${sourcedImageBase}/city-port-blast-aftermath.jpg`,
      alt: "Damage at the Port of Beirut after the August 2020 explosion",
      caption:
        "The blast image belongs here because repair is not only about stone. A living city knows who is hurt, who owns what, who can fix it, and who is left waiting. Downtown's problem is that too much of that social wiring was removed.",
      position: "center 48%",
      aspectRatio: "1280 / 960",
    },
  ],
  "the-cartel-in-the-costume-of-a-country": [
    {
      src: `${sourcedImageBase}/cartel-independence-day-2019.jpg`,
      alt: "Crowds filling Beirut streets during the 2019 Independence Day protests",
      caption:
        "This crowd is the cartel's nightmare: citizens briefly speaking as citizens, not as clients of sects or patrons. That is why the 2019 uprising mattered; it named the whole machine instead of one villain.",
      position: "center 45%",
      aspectRatio: "6000 / 4000",
    },
    {
      src: `${sourcedImageBase}/cartel-grand-serail.jpg`,
      alt: "The Grand Serail, Lebanon's government palace in Beirut",
      caption:
        "The Grand Serail gives the state a body: flags, stone, ceremony, authority. The essay is interested in the gap between that official costume and the private deals that decide what the costume can actually do.",
      position: "center 50%",
      aspectRatio: "1920 / 1080",
    },
    {
      src: `${sourcedImageBase}/sovereignty-parliament.jpg`,
      alt: "The Lebanese Parliament building in Downtown Beirut",
      caption:
        "Parliament is where the republic is supposed to become public law. In Lebanon it often becomes the place where private bargains are translated into official language.",
      position: "center 50%",
      aspectRatio: "1280 / 960",
    },
  ],
  "the-mehtail-republic": [
    {
      src: `${sourcedImageBase}/mehtail-shatila-infrastructure.jpg`,
      alt: "A dense tangle of infrastructure wires in Shatila",
      caption:
        "This tangle says more than a clean institutional diagram could. When the official system cannot carry daily life, people build another system over it, cable by cable, favor by favor, workaround by workaround.",
      position: "center 48%",
      aspectRatio: "1280 / 960",
    },
    {
      src: `${sourcedImageBase}/mehtail-diaspora-map.png`,
      alt: "A world map showing the Lebanese diaspora",
      caption:
        "The diaspora map is the hopeful half of the essay. The same Lebanese talent that gets wasted navigating broken systems at home often becomes astonishingly productive once it plugs into institutions that actually work.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "960 / 498",
      fit: "contain",
    },
  ],
  "the-generator-republic": [
    {
      src: `${fractalSovereigntyBase}/generator-republic-street.jpg`,
      alt: "A Beirut street locked in traffic under dense electrical wires",
      caption:
        "The essay begins with a generator because the generator teaches the whole system: a public failure becomes a private kingdom, then that kingdom learns to defend the failure that made it necessary.",
      position: "center 52%",
      aspectRatio: "3840 / 2161",
    },
    {
      src: `${fractalSovereigntyBase}/generator-republic-household.jpg`,
      alt: "A Lebanese family gathered around an older relative in a dim apartment room",
      caption:
        "The household is the strongest institution left. That is part of Lebanon's brilliance, and part of its trap: families can mobilize with astonishing loyalty while the public world outside them keeps shrinking.",
      position: "center 48%",
      aspectRatio: "3840 / 2560",
    },
    {
      src: `${fractalSovereigntyBase}/generator-republic-2019-protest.jpg`,
      alt: "Crowds filling Beirut streets with Lebanese flags during the 2019 uprising",
      caption:
        "October 2019 mattered because it briefly interrupted the pattern. Citizens appeared as citizens, not as clients of separate little sovereignties, which is exactly why the machine worked so hard to pull them back apart.",
      position: "center 45%",
      aspectRatio: "6000 / 4000",
    },
  ],
  "the-census-that-cannot-be-taken": [
    {
      src: `${sourcedImageBase}/census-loc-religious-map.jpg`,
      alt: "A Library of Congress map showing the distribution of Lebanon's main religious groups",
      caption:
        "A map like this looks technical, but in Lebanon it is political dynamite. The cool, unsettling thing is that the country has endless partial knowledge about itself, while the one public count that could reorganize power remains forbidden.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "3317 / 4326",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/census-french-mandate-map.png`,
      alt: "A map of the French Mandate for Syria and Lebanon",
      caption:
        "The Mandate map is not just background. It shows how modern Lebanon began as a political design, not a natural fact, and why the first census became part of the architecture of power.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "1920 / 1587",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/census-demographics.jpg`,
      alt: "A map showing religious group distribution in Lebanon",
      caption:
        "This is why numbers become dangerous. Once communities appear as proportions, geography, and weight, every office and every guarantee starts to look negotiable.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "960 / 1239",
      fit: "contain",
    },
  ],
  "sovereignty-theatre": [
    {
      src: `${sourcedImageBase}/sovereignty-un-security-council.jpg`,
      alt: "The United Nations Security Council chamber in New York",
      caption:
        "The empty Security Council chamber is almost too perfect: sovereignty as room, microphone, chair, ritual. Lebanon often has the seat and the signature before it has the authority to make the signature real.",
      position: "center 50%",
      aspectRatio: "3780 / 3024",
    },
    {
      src: `${sourcedImageBase}/sovereignty-unifil-blue-barrels.jpg`,
      alt: "UNIFIL blue barrels marking the Blue Line in southern Lebanon",
      caption:
        "The blue barrels are the theatre prop made concrete. They mark a line everyone can photograph, while the real question remains whether any state has enough power to make the line politically meaningful.",
      position: "center 48%",
      aspectRatio: "1280 / 727",
    },
    {
      src: `${sourcedImageBase}/sovereignty-parliament.jpg`,
      alt: "The Lebanese Parliament building in Downtown Beirut",
      caption:
        "This building is supposed to turn argument into law. The essay's point is that Lebanon has many declarations of sovereignty and too few institutions able to force declarations downward into daily life.",
      position: "center 50%",
      aspectRatio: "1280 / 960",
    },
  ],
  "the-rubble-zone": [
    {
      src: `${sourcedImageBase}/rubble-marwahin.jpg`,
      alt: "Ruins in Marwahin in southern Lebanon",
      caption:
        "This is what 'buffer zone' means after the military language is stripped away: a village turned into evidence. Israel can call it depth, Hezbollah can call it proof, but for the people from there it was home.",
      position: "center 52%",
      aspectRatio: "1280 / 960",
    },
    {
      src: `${sourcedImageBase}/rubble-bintjbeil.jpg`,
      alt: "Destruction in Bint Jbeil after the 2006 war",
      caption:
        "Bint Jbeil matters because the experiment already ran. Destruction can break buildings, but it can also harden the story an armed movement tells about why it is necessary.",
      position: "center 52%",
      aspectRatio: "800 / 533",
    },
    {
      src: `${sourcedImageBase}/rubble-blue-line.jpg`,
      alt: "A map of the Blue Line between Lebanon and Israel",
      caption:
        "The map is useful because it shows the seductive simplicity of lines. The essay is about everything the map cannot show: humiliation, inheritance, return, fear, and memory.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "1299 / 898",
      fit: "contain",
    },
  ],
  "the-seventeen-countries": [
    {
      src: `${sourcedImageBase}/seventeen-municipalities.png`,
      alt: "A map of Lebanon's municipalities",
      caption:
        "This map makes tiny Lebanon look administratively enormous. The strange thing is not the number of municipalities alone; it is how each little unit can become a checkpoint for identity, property, services, and local power.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "1364 / 1751",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/seventeen-admin-divisions.png`,
      alt: "A map of Lebanon's administrative divisions",
      caption:
        "The official divisions look orderly from above, but the essay is about the maps underneath them: sectarian courts, village registration, party zones, family networks, and municipal vetoes.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "1920 / 2210",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/seventeen-2015-protest.jpg`,
      alt: "Protesters in Martyrs Square during the 2015 garbage crisis demonstrations",
      caption:
        "The garbage crisis made fragmentation smell. Waste should be boring statecraft; in Lebanon it became a lesson in how every shared problem gets pushed across someone else's boundary.",
      position: "center 42%",
      aspectRatio: "2978 / 4370",
    },
  ],
  "the-land-that-mourns-in-one-language": [
    {
      src: `${sourcedImageBase}/mourning-nahr-ibrahim.jpg`,
      alt: "The Nahr Ibrahim river in Lebanon",
      caption:
        "The Nahr Ibrahim is the right opening image because it lets science and myth stand together. The river can run red because of soil, and still carry the old Adonis story about wounded life returning through the landscape.",
      position: "center 48%",
      aspectRatio: "960 / 1280",
    },
    {
      src: `${sourcedImageBase}/mourning-ahiram-detail.jpg`,
      alt: "Mourning figures carved on the Sarcophagus of Ahiram",
      caption:
        "The mourning women on Ahiram's sarcophagus are extraordinary because grief is already stylized into a public language. Long before modern sects, the land had gestures for death, honor, and memory.",
      position: "center 50%",
      aspectRatio: "2166 / 1008",
    },
    {
      src: `${sourcedImageBase}/mourning-astarte-throne.jpg`,
      alt: "A Phoenician goddess identified with Astarte seated on a throne",
      caption:
        "Astarte belongs here not as a nationalist trophy, but as a reminder that the sacred feminine in this landscape is older than today's religious borders. The figure is small, but the continuity she points to is huge.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center 50%",
      aspectRatio: "1573 / 2178",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/mourning-our-lady-harissa.jpg`,
      alt: "The statue of Our Lady of Lebanon in Harissa",
      caption:
        "Our Lady of Lebanon is a modern Marian monument, but it also shows how older Levantine habits of high places, protective mothers, pilgrimage, and landscape keep finding new religious forms.",
      position: "center 48%",
      aspectRatio: "5184 / 3456",
    },
    {
      src: `${sourcedImageBase}/mourning-khawla-shrine.jpg`,
      alt: "The shrine of Sayyida Khawla in Baalbek",
      caption:
        "Sayyida Khawla's shrine in Baalbek keeps the same grammar in another translation: sacred memory, feminine presence, visitation, mourning, and a place where history is felt through devotion.",
      position: "center 48%",
      aspectRatio: "740 / 416",
    },
  ],
  "the-goddess-who-won-t-stay-dead": [
    {
      src: `${sourcedImageBase}/mourning-our-lady-harissa.jpg`,
      alt: "The statue of Our Lady of Lebanon in Harissa",
      caption:
        "Harissa is the right public face for the essay because it shows how the sacred feminine becomes geography in Lebanon: a woman on a mountain, watching the coast, turning protection into landscape.",
      position: "center 48%",
      aspectRatio: "5184 / 3456",
    },
    {
      src: `${sourcedImageBase}/mourning-astarte-throne.jpg`,
      alt: "A Phoenician goddess identified with Astarte seated on a throne",
      caption:
        "Astarte is not being smuggled into later religions as a secret identity. The point is subtler: the land keeps asking for a figure who protects, mourns, intercedes, and refuses to let grief disappear.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center 50%",
      aspectRatio: "1573 / 2178",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/mourning-ahiram-detail.jpg`,
      alt: "Mourning figures carved on the Sarcophagus of Ahiram",
      caption:
        "The mourning figures on Ahiram's sarcophagus make the argument older than doctrine. Before Lebanon's modern communities had their current names, grief already had a public grammar.",
      position: "center 50%",
      aspectRatio: "2166 / 1008",
    },
    {
      src: `${sourcedImageBase}/mourning-nahr-ibrahim.jpg`,
      alt: "The Nahr Ibrahim river in Lebanon",
      caption:
        "The Adonis river lets myth and matter speak at once. Red sediment can explain the color, while the old story explains why people learned to read the land as wounded and returning.",
      position: "center 48%",
      aspectRatio: "960 / 1280",
    },
    {
      src: `${sourcedImageBase}/mourning-khawla-shrine.jpg`,
      alt: "The shrine of Sayyida Khawla in Baalbek",
      caption:
        "Sayyida Khawla's shrine belongs to another religious language, but the spatial grammar is familiar: visitation, feminine sacred presence, memory, mourning, and the refusal to leave suffering unattended.",
      position: "center 48%",
      aspectRatio: "740 / 416",
    },
  ],
  "downtown-without-a-city": [
    {
      src: `${sourcedImageBase}/downtown-souk-ayass-1970.jpg`,
      alt: "Souk Ayass in Beirut in 1970",
      caption:
        "Souk Ayass shows what the essay means by a city, not just architecture: counters, repetition, habits, people knowing where to go. A souk is a memory machine because it remembers through use.",
      position: "center 50%",
      aspectRatio: "1023 / 669",
    },
    {
      src: `${sourcedImageBase}/downtown-modern-souks.jpg`,
      alt: "The rebuilt Beirut Souks in Downtown Beirut",
      caption:
        "The modern Beirut Souks are clean and legible, but that is the question. When a souk becomes too controlled, it can preserve the name while changing the verb: the old souk gathered; the new one filters.",
      position: "center 50%",
      aspectRatio: "1024 / 546",
    },
    {
      src: `${sourcedImageBase}/city-martyrs-square.jpg`,
      alt: "Martyrs Square in Downtown Beirut after postwar reconstruction",
      caption:
        "Martyrs' Square is the symbolic room of the capital, but symbolism is not enough. The essay asks whether a center can be visually restored and still fail to become a place citizens feel they own.",
      position: "center 50%",
      aspectRatio: "1920 / 1280",
    },
  ],
  "the-park-that-remembers": [
    {
      src: `${beirutParkBase}/main-sightline.webp`,
      alt: "The Beirut Park sundial sightline through the redesigned landscape",
      caption: "Gnomon Plaza aligns the sundial, Ottoman Gazebo, and Pigeon Tower on one public axis.",
      position: "center 48%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/pavilion-entrance.webp`,
      alt: "The Beirut Park entrance pavilion and stone fountain",
      caption: "The entrance pavilion turns arrival into a civic threshold, with water offered in public.",
      position: "center 48%",
      aspectRatio: "1194 / 1600",
    },
    {
      src: `${beirutParkBase}/pathways.webp`,
      alt: "Crushed limestone pathways winding through the Beirut Park planting",
      caption: "Crushed limestone paths slow the body down, drain naturally, and can be repaired with ordinary tools.",
      position: "center 52%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/gazebo-lake.webp`,
      alt: "The Ottoman gazebo beside the lake in the Beirut Park redesign",
      caption: "The Ottoman Gazebo frames water, gathering, and the public right to stay without buying anything.",
      position: "center 48%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/pigeon-tower.webp`,
      alt: "The Beirut Park Pigeon Tower among mature trees",
      caption: "The Pigeon Tower gives a working Beirut rooftop culture a place in the centre of the city.",
      position: "center 46%",
      aspectRatio: "1194 / 1600",
    },
    {
      src: `${beirutParkBase}/pigeon-tower-release.webp`,
      alt: "The Pigeon Tower releasing birds at sunset",
      caption: "A daily release makes the monument move: control and freedom, ownership and sky.",
      position: "center 44%",
      aspectRatio: "1792 / 2400",
    },
    {
      src: `${beirutParkBase}/colonnaded-vines.webp`,
      alt: "Roman columns reused as a vine-covered pergola",
      caption: "Dormant columns become a vine-covered walk. Heritage is put back to work as shade.",
      position: "center 50%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/adonis-grove.webp`,
      alt: "The Adonis Grove in bloom",
      caption: "The Adonis Grove turns mourning into a seasonal event: red anemones return each spring.",
      position: "center 52%",
      aspectRatio: "1792 / 2400",
    },
    {
      src: `${beirutParkBase}/adonis-study.webp`,
      alt: "A hand-drawn study for the Adonis figure in the Beirut Park project",
      caption: "The park moved between argument, hand drawing, and landscape before it became an image.",
      position: "center 45%",
      aspectRatio: "3 / 4",
      fit: "contain",
    },
    {
      src: `${beirutParkBase}/sundial-pavilion.webp`,
      alt: "The sundial column aligned with the park pavilion",
      caption: "A recovered column becomes a public clock, measuring the day without electricity.",
      position: "center 48%",
      aspectRatio: "1792 / 2400",
    },
    {
      src: `${beirutParkBase}/sundial-plaza.webp`,
      alt: "The sundial plaza and the park's main path",
      caption: "The plaza asks visitors to stop and watch the shadow move across Beirut time.",
      position: "center 52%",
      aspectRatio: "2528 / 1696",
    },
    {
      src: `${beirutParkBase}/ottoman-kiosk.webp`,
      alt: "An archival Ottoman kiosk used as a design reference for Beirut Park",
      caption: "An archival kiosk anchors the park's Ottoman language in a real civic tradition rather than decorative nostalgia.",
      position: "center 50%",
      aspectRatio: "2112 / 2016",
    },
    {
      src: `${beirutParkBase}/backgammon-pigeons.webp`,
      alt: "Stone backgammon tables and pigeons in the Beirut Park redesign",
      caption: "Permanent tawleh tables make argument, play, and long afternoons part of the civic architecture.",
      position: "center 52%",
      aspectRatio: "1.5",
    },
  ],
};

articleImageSets["why-lebanese-people-learn-to-work-around-the-state"] =
  articleImageSets["the-mehtail-republic"];
articleImageSets["how-a-generator-owner-showed-why-lebanon-has-no-state"] =
  articleImageSets["the-mehtail-republic"];

const generatedImageBySlug: Record<string, string> = {
  "the-city-that-could-not-repair-itself": downtownRepairHero,
  "the-generator-republic": `${fractalSovereigntyBase}/generator-republic-street.jpg`,
  "the-cartel-in-the-costume-of-a-country": homeAssets.hero.src,
  "cartel-in-the-costume-of-a-country": homeAssets.hero.src,
  "the-mehtail-republic": homeAssets.departments.essays.src,
  "how-a-generator-owner-showed-why-lebanon-has-no-state":
    homeAssets.departments.essays.src,
  "the-census-that-cannot-be-taken": homeAssets.departments.letters.src,
  "sovereignty-theatre": homeAssets.departments.archive.src,
  "the-brilliant-nodes": homeAssets.departments.notebook.src,
  "what-taif-actually-said": homeAssets.departments.essays.src,
  "the-rubble-zone": homeAssets.edition[5].src,
  "the-service-state": homeAssets.departments.letters.src,
  "the-franchisor-has-left-the-building": homeAssets.departments.archive.src,
  "the-franchisor-has-left": homeAssets.departments.archive.src,
  "the-transaction": homeAssets.departments.letters.src,
  "the-seventeen-countries": homeAssets.departments.archive.src,
  "the-cartel-board-meeting": homeAssets.departments.notebook.src,
  "the-dog-river-keeps-the-minutes": homeAssets.departments.notebook.src,
  "the-dog-river-remembers": homeAssets.departments.notebook.src,
  "the-fracture-was-the-blueprint": homeAssets.edition[5].src,
  "stones-that-outlived-their-gods": homeAssets.departments.essays.src,
  "the-goddess-who-won-t-stay-dead": `${sourcedImageBase}/mourning-our-lady-harissa.jpg`,
  "the-goddess-who-wont-stay-dead": `${sourcedImageBase}/mourning-our-lady-harissa.jpg`,
  "the-land-that-mourns-in-one-language": homeAssets.departments.archive.src,
  "same-grief-for-three-thousand-years": homeAssets.departments.archive.src,
  "the-looted-coast": homeAssets.edition[5].src,
  "memorycide-on-the-coast": homeAssets.edition[5].src,
  "downtown-without-a-city": homeAssets.departments.archive.src,
  "cousins-across-a-river-that-shouldnt-exist": homeAssets.departments.notebook.src,
  "every-letter-on-this-screen": homeAssets.departments.letters.src,
  "the-seventeen-countries-wearing-a-trenchcoat": homeAssets.departments.archive.src,
  "the-architecture-of-consolation": homeAssets.departments.essays.src,
  "the-park-that-remembers": articleImageSets["the-park-that-remembers"][0].src,
};

export function getArticleImage(slug: string, index = 0) {
  const imageSet = articleImageSets[slug];

  return (
    imageSet?.[index % imageSet.length]?.src ??
    generatedImageBySlug[slug] ??
    generatedArticleImages[index % generatedArticleImages.length]
  );
}

export function getArticleImages(slug: string) {
  return articleImageSets[slug] ?? [
    {
      src: getArticleImage(slug, 0),
      alt: slug,
    },
  ];
}

const generatedLetterImages: Record<string, string> = {
  "letter-to-the-south": homeAssets.departments.archive.src,
  "letter-to-beirut": homeAssets.hero.src,
  "letter-to-karl": homeAssets.departments.letters.src,
  "letter-to-the-young-lebanese-abroad": homeAssets.edition[5].src,
  "letter-to-the-nahr-ibrahim": homeAssets.departments.archive.src,
  "letter-from-beirut-about-normality": homeAssets.departments.letters.src,
  "letter-to-a-friend-about-staying": homeAssets.hero.src,
  "letter-from-the-shoreline": homeAssets.hero.src,
  "letter-on-small-authorities": homeAssets.departments.archive.src,
};

export function getLetterImage(slug: string, index = 0) {
  const fallback = [
    homeAssets.departments.letters.src,
    homeAssets.hero.src,
    homeAssets.departments.archive.src,
    homeAssets.departments.notebook.src,
  ];

  return generatedLetterImages[slug] ?? fallback[index % fallback.length];
}

const generatedNotebookImages: Record<string, string> = {
  "the-generator": homeAssets.departments.essays.src,
  "a-bench-is-a-political-object": homeAssets.departments.notebook.src,
  "the-building-as-republic": homeAssets.edition[5].src,
  "the-horns-at-faqra": homeAssets.departments.essays.src,
  "ahirams-keyboard": homeAssets.departments.letters.src,
  "beirut-april": homeAssets.hero.src,
  "paper-grain-and-power": homeAssets.departments.letters.src,
  "raouche-1975": homeAssets.hero.src,
  "on-discipline": homeAssets.departments.letters.src,
  "the-city-at-dusk": homeAssets.hero.src,
};

export function getNotebookImage(slug: string, index = 0) {
  const fallback = [
    homeAssets.departments.notebook.src,
    homeAssets.departments.letters.src,
    homeAssets.edition[5].src,
    homeAssets.departments.essays.src,
  ];

  return generatedNotebookImages[slug] ?? fallback[index % fallback.length];
}

export const visualAssets = {
  coast: homeAssets.hero.src,
  coastWide: homeAssets.hero.src,
  skyline: homeAssets.edition[5].src,
  apartment: homeAssets.departments.essays.src,
  map: homeAssets.departments.notebook.src,
  letterpress: homeAssets.departments.letters.src,
  manuscript: homeAssets.departments.letters.src,
  notebookSpread: homeAssets.departments.notebook.src,
  archSketch: homeAssets.departments.notebook.src,
  documentStack: homeAssets.departments.letters.src,
  archive: homeAssets.departments.archive.src,
  port: homeAssets.hero.src,
};

export const arabicCopy = {
  homeQuote: "لم يكن هذا الانهيار صدفة، بل من تصميم وتخطيط ومصلحة.",
  homeSubquote: "لم يكن حتمياً. لقد بُنِي.",
  essaysTitle: "مقالات",
  essaysSubtitle: "مقالات طويلة، تأملات، وأفكار عن لبنان، الذاكرة، السلطة، والهوية.",
  articleLeft: "حين يُصمَّم الانهيار، لا يعود مفاجأة، بل نهاية مُعلنة.",
  articleRight: "نحن لا نعيش أزمة، نحن نعيش نتيجة.",
};
