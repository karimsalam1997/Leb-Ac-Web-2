const homeBase = "/home";
const downtownRepairHero = "/editorial/downtown-repair-hero.jpg";
const essayImageBase = "/essay-images";
const sourcedImageBase = `${essayImageBase}/sourced`;
const fractalSovereigntyBase = `${essayImageBase}/fractal-sovereignty`;
const beirutParkBase = "/editorial/beirut-park";

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
      src: `${sourcedImageBase}/downtown-bab-idris-restored-4k-v1.webp`,
      alt: "A reconstructed view of Bab Idris in central Beirut before the civil war",
      caption:
        "Bab Idris before the civil war, reconstructed from the project archive. The street belonged to daily Beirut before reconstruction turned the centre into a controlled image of itself.",
      position: "center 50%",
      aspectRatio: "3840 / 2160",
    },
    {
      src: `${sourcedImageBase}/city-roman-baths-ruins.jpg`,
      alt: "The Roman Baths in Downtown Beirut, visible below the rebuilt city",
      caption:
        "The Roman Baths sit below the rebuilt centre of Beirut. Their stonework predates the postwar plan and the property regime laid over it.",
      position: "center 55%",
      aspectRatio: "3872 / 2592",
    },
    {
      src: `${sourcedImageBase}/city-archaeology-khandaq.jpg`,
      alt: "An archaeological site in Khandaq al-Ghamiq in Beirut",
      caption:
        "Archaeological remains at Khandaq al-Ghamiq. In central Beirut, every new foundation enters a city that is already there.",
      position: "center 54%",
      aspectRatio: "960 / 720",
    },
    {
      src: `${sourcedImageBase}/city-port-blast-aftermath.jpg`,
      alt: "Damage at the Port of Beirut after the August 2020 explosion",
      caption:
        "The Port of Beirut after 4 August 2020. Repair depends on ownership, public authority, and who is left waiting long after the glass is cleared.",
      position: "center 48%",
      aspectRatio: "1280 / 960",
    },
  ],
  "the-cartel-in-the-costume-of-a-country": [
    {
      src: `${sourcedImageBase}/cartel-independence-day-2019.jpg`,
      alt: "Crowds filling Beirut streets during the 2019 Independence Day protests",
      caption:
        "Beirut on Independence Day in 2019. The uprising addressed the ruling system as a whole, across the lines its parties had spent decades policing.",
      position: "center 45%",
      aspectRatio: "6000 / 4000",
    },
    {
      src: `${sourcedImageBase}/cartel-grand-serail.jpg`,
      alt: "The Grand Serail, Lebanon's government palace in Beirut",
      caption:
        "The Grand Serail in Beirut gives formal authority a visible address. Much of Lebanon's governing work is settled elsewhere, through private bargains between public men.",
      position: "center 50%",
      aspectRatio: "1920 / 1080",
    },
    {
      src: `${sourcedImageBase}/sovereignty-parliament.jpg`,
      alt: "The Lebanese Parliament building in Downtown Beirut",
      caption:
        "Lebanon's Parliament in Nejmeh Square. Private bargains acquire the language of public law inside this chamber.",
      position: "center 50%",
      aspectRatio: "1280 / 960",
    },
  ],
  "the-mehtail-republic": [
    {
      src: `${sourcedImageBase}/mehtail-shatila-infrastructure.jpg`,
      alt: "A dense tangle of infrastructure wires in Shatila",
      caption:
        "Wires in Shatila record a second infrastructure laid over the first. Each cable is a workaround for a service the official system did not provide.",
      position: "center 48%",
      aspectRatio: "1280 / 960",
    },
    {
      src: `${sourcedImageBase}/mehtail-diaspora-map.png`,
      alt: "A world map showing the Lebanese diaspora",
      caption:
        "A map of the Lebanese diaspora. The routes also record what happens when skilled people leave institutions that consume their time and enter ones that can use it.",
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
        "A Beirut street under electrical wires. A public failure created a private electricity business, and that business learned how to live with the failure.",
      position: "center 52%",
      aspectRatio: "3840 / 2161",
    },
    {
      src: `${fractalSovereigntyBase}/generator-republic-household.jpg`,
      alt: "A Lebanese family gathered around an older relative in a dim apartment room",
      caption:
        "Inside a Lebanese home, the family absorbs work that public institutions have abandoned. Its strength protects people while the shared world outside keeps shrinking.",
      position: "center 48%",
      aspectRatio: "3840 / 2560",
    },
    {
      src: `${fractalSovereigntyBase}/generator-republic-2019-protest.jpg`,
      alt: "Crowds filling Beirut streets with Lebanese flags during the 2019 uprising",
      caption:
        "Beirut during the October 2019 uprising. For a few weeks, citizens addressed one another outside the client networks that usually divide public life.",
      position: "center 45%",
      aspectRatio: "6000 / 4000",
    },
  ],
  "the-census-that-cannot-be-taken": [
    {
      src: `${sourcedImageBase}/census-loc-religious-map.jpg`,
      alt: "A Library of Congress map showing the distribution of Lebanon's main religious groups",
      caption:
        "A Library of Congress map of Lebanon's religious communities. The state has lived with estimates and partial counts since the last official census in 1932.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "3317 / 4326",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/census-french-mandate-map.png`,
      alt: "A map of the French Mandate for Syria and Lebanon",
      caption:
        "The French Mandate map shows the borders inside which Lebanon's first census became a formula for political power.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "1920 / 1587",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/census-demographics.jpg`,
      alt: "A map showing religious group distribution in Lebanon",
      caption:
        "An estimate of Lebanon's religious distribution. Counting communities would reopen the allocation of offices fixed around an older balance.",
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
        "The United Nations Security Council chamber in New York. Lebanon can hold the seat and sign the resolution while lacking the power to enforce it at home.",
      position: "center 50%",
      aspectRatio: "3780 / 3024",
    },
    {
      src: `${sourcedImageBase}/sovereignty-unifil-blue-barrels.jpg`,
      alt: "UNIFIL blue barrels marking the Blue Line in southern Lebanon",
      caption:
        "UNIFIL barrels mark the Blue Line in southern Lebanon. The boundary is visible; the authority behind it remains divided.",
      position: "center 48%",
      aspectRatio: "1280 / 727",
    },
    {
      src: `${sourcedImageBase}/sovereignty-parliament.jpg`,
      alt: "The Lebanese Parliament building in Downtown Beirut",
      caption:
        "The Lebanese Parliament in Downtown Beirut. Declarations of sovereignty are plentiful here; institutions able to carry them into daily life are not.",
      position: "center 50%",
      aspectRatio: "1280 / 960",
    },
  ],
  "the-rubble-zone": [
    {
      src: `${sourcedImageBase}/rubble-marwahin.jpg`,
      alt: "Ruins in Marwahin in southern Lebanon",
      caption:
        "Marwahin after Israeli attacks in 2006. The language of a buffer zone ends here, in a village where people lived.",
      position: "center 52%",
      aspectRatio: "1280 / 960",
    },
    {
      src: `${sourcedImageBase}/rubble-bintjbeil.jpg`,
      alt: "Destruction in Bint Jbeil after the 2006 war",
      caption:
        "Bint Jbeil after Israeli bombardment in 2006. The destruction also strengthened Hezbollah's argument that southern Lebanon required an armed force outside the state.",
      position: "center 52%",
      aspectRatio: "800 / 533",
    },
    {
      src: `${sourcedImageBase}/rubble-blue-line.jpg`,
      alt: "A map of the Blue Line between Lebanon and Israel",
      caption:
        "The Blue Line on a map. It can record coordinates, while inherited fear and the memory of displacement remain outside the legend.",
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
        "A map of Lebanon's municipalities. These small jurisdictions decide access to services, local property questions, and who is recognised as belonging where.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "1364 / 1751",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/seventeen-admin-divisions.png`,
      alt: "A map of Lebanon's administrative divisions",
      caption:
        "Lebanon's official administrative divisions. Sectarian courts, village registration, and party territory cut another set of borders underneath them.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center",
      aspectRatio: "1920 / 2210",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/seventeen-2015-protest.jpg`,
      alt: "Protesters in Martyrs Square during the 2015 garbage crisis demonstrations",
      caption:
        "Martyrs Square during the 2015 garbage crisis. A basic municipal service became a public lesson in how responsibility is passed from one authority to another.",
      position: "center 42%",
      aspectRatio: "2978 / 4370",
    },
  ],
  "the-land-that-mourns-in-one-language": [
    {
      src: `${sourcedImageBase}/mourning-nahr-ibrahim.jpg`,
      alt: "The Nahr Ibrahim river in Lebanon",
      caption:
        "The Nahr Ibrahim can run red with winter sediment. For centuries, the river has also carried the story of Adonis, wounded and returning with the season.",
      position: "center 48%",
      aspectRatio: "960 / 1280",
    },
    {
      src: `${sourcedImageBase}/mourning-ahiram-detail.jpg`,
      alt: "Mourning figures carved on the Sarcophagus of Ahiram",
      caption:
        "Mourning figures carved on the Sarcophagus of Ahiram at Byblos. Grief had a public gesture here long before Lebanon's present communities had their names.",
      position: "center 50%",
      aspectRatio: "2166 / 1008",
    },
    {
      src: `${sourcedImageBase}/mourning-astarte-throne.jpg`,
      alt: "A Phoenician goddess identified with Astarte seated on a throne",
      caption:
        "A Phoenician goddess identified with Astarte. The figure predates today's religious borders and the national stories later built around her.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center 50%",
      aspectRatio: "1573 / 2178",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/mourning-our-lady-harissa.jpg`,
      alt: "The statue of Our Lady of Lebanon in Harissa",
      caption:
        "Our Lady of Lebanon above Harissa. The modern Marian monument joins pilgrimage, the protective mother, and the Levantine habit of placing sacred figures on high ground.",
      position: "center 48%",
      aspectRatio: "5184 / 3456",
    },
    {
      src: `${sourcedImageBase}/mourning-khawla-shrine.jpg`,
      alt: "The shrine of Sayyida Khawla in Baalbek",
      caption:
        "The shrine of Sayyida Khawla in Baalbek. Visitors meet sacred memory through mourning and the presence of a named woman.",
      position: "center 48%",
      aspectRatio: "740 / 416",
    },
  ],
  "the-goddess-who-won-t-stay-dead": [
    {
      src: `${sourcedImageBase}/mourning-our-lady-harissa.jpg`,
      alt: "The statue of Our Lady of Lebanon in Harissa",
      caption:
        "Our Lady of Lebanon looks over the coast from Harissa. The placement turns protection into something pilgrims can see from the road and the bay.",
      position: "center 48%",
      aspectRatio: "5184 / 3456",
    },
    {
      src: `${sourcedImageBase}/mourning-astarte-throne.jpg`,
      alt: "A Phoenician goddess identified with Astarte seated on a throne",
      caption:
        "A Phoenician goddess identified with Astarte. Later religions did not secretly preserve her identity, though familiar roles of protection and mourning returned in new forms.",
      imageClassName: "object-contain bg-[var(--paper)]",
      position: "center 50%",
      aspectRatio: "1573 / 2178",
      fit: "contain",
    },
    {
      src: `${sourcedImageBase}/mourning-ahiram-detail.jpg`,
      alt: "Mourning figures carved on the Sarcophagus of Ahiram",
      caption:
        "Mourning figures on the Sarcophagus of Ahiram at Byblos. Their gestures belong to a public language of grief older than modern Lebanese doctrine.",
      position: "center 50%",
      aspectRatio: "2166 / 1008",
    },
    {
      src: `${sourcedImageBase}/mourning-nahr-ibrahim.jpg`,
      alt: "The Nahr Ibrahim river in Lebanon",
      caption:
        "Red sediment explains the colour of the Nahr Ibrahim. The Adonis story explains the meanings people placed on the river's seasonal return.",
      position: "center 48%",
      aspectRatio: "960 / 1280",
    },
    {
      src: `${sourcedImageBase}/mourning-khawla-shrine.jpg`,
      alt: "The shrine of Sayyida Khawla in Baalbek",
      caption:
        "The shrine of Sayyida Khawla in Baalbek. Visitation places a feminine sacred presence beside the memory of suffering.",
      position: "center 48%",
      aspectRatio: "740 / 416",
    },
  ],
  "downtown-without-a-city": [
    {
      src: `${sourcedImageBase}/downtown-souk-ayass-1970.jpg`,
      alt: "Souk Ayass in Beirut in 1970",
      caption:
        "Souk Ayass in 1970. Its counters and repeated encounters gave memory an ordinary address in central Beirut.",
      position: "center 50%",
      aspectRatio: "1023 / 669",
    },
    {
      src: `${sourcedImageBase}/downtown-modern-souks.jpg`,
      alt: "The rebuilt Beirut Souks in Downtown Beirut",
      caption:
        "The rebuilt Beirut Souks preserve the name under tighter control of access and use. The earlier souk gathered people; the new one filters them.",
      position: "center 50%",
      aspectRatio: "1024 / 546",
    },
    {
      src: `${sourcedImageBase}/city-martyrs-square.jpg`,
      alt: "Martyrs Square in Downtown Beirut after postwar reconstruction",
      caption:
        "Martyrs' Square after postwar reconstruction. The centre was restored as an image before it returned as a place Beirut residents could use as their own.",
      position: "center 50%",
      aspectRatio: "1920 / 1280",
    },
  ],
  "the-park-that-remembers": [
    {
      src: `${beirutParkBase}/main-sightline.jpg`,
      alt: "The Beirut Park sundial sightline through the speculative planting plan",
      caption: "Speculative view. The Gnomon Plaza aligns the sundial with the gazebo and Pigeon Tower.",
      position: "center 48%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/gate-pavilion-sunset.jpg`,
      alt: "The Beirut Park gateway and pavilion at sunset",
      caption: "Speculative view. The main gate and pavilion give the park a clear public entrance.",
      position: "center 52%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/pathways.jpg`,
      alt: "Crushed limestone pathways winding through the Beirut Park planting",
      caption: "Speculative view. Crushed limestone paths keep the surface permeable and make room for slower walking.",
      position: "center 52%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/gazebo-lake.jpg`,
      alt: "The Ottoman gazebo beside the lake in the Beirut Park redesign",
      caption: "Speculative view. The gazebo makes a shaded room beside the water where no purchase is required.",
      position: "center 48%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/pigeon-tower-release.jpg`,
      alt: "The Pigeon Tower releasing birds at sunset",
      caption: "Speculative view. The Pigeon Tower gives a familiar Beirut rooftop practice a public address.",
      position: "center 44%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/colonnaded-vines.jpg`,
      alt: "Roman columns reused as a vine-covered pergola",
      caption: "Speculative view. Stone columns carry vines and shade along the main walk.",
      position: "center 50%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/adonis-grove.jpg`,
      alt: "The Adonis Grove in bloom",
      caption: "Speculative view. Red spring flowers give the Adonis Grove a visible season of mourning.",
      position: "center 48%",
      aspectRatio: "1.5",
    },
    {
      src: `${beirutParkBase}/backgammon-pigeons.jpg`,
      alt: "Stone backgammon tables and pigeons in the Beirut Park redesign",
      caption: "Speculative view. Permanent tawleh tables give play a place in the park's daily use.",
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
