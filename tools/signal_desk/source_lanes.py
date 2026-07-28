from __future__ import annotations

from collections import defaultdict

from tools.signal_desk.models import GeoTaggedCluster, GroundNeed, ScoredItem, SourceLane, SourceLaneItem


LANES = [
    {
        "id": "pipeline-sample",
        "label": "Pipeline sample",
        "question": "Which items are local samples rather than live reporting?",
        "role": "Use this lane only to confirm the pipeline still renders when live sources are unavailable.",
        "needles": ["signal desk fallback", "fallback sample"],
    },
    {
        "id": "israeli-establishment",
        "label": "Israeli establishment",
        "question": "What is the official or security-facing Israeli story?",
        "role": "Use this lane to see the case Israel is making to its own public and to foreign audiences.",
        "needles": [
            "times of israel",
            "jerusalem post",
            "ynet",
            "israel hayom",
            "i24",
            "israel national",
            "n12",
            "kan",
            "idf:",
            "israeli military says",
            "israeli army says",
            "avichayadraee",
        ],
    },
    {
        "id": "israeli-dissent",
        "label": "Israeli dissent",
        "question": "Where does Israeli reporting cut against the state line?",
        "role": "Haaretz and similar sources are useful because they can report from inside Israel while puncturing official certainty.",
        "needles": ["haaretz", "+972", "972"],
    },
    {
        "id": "lebanese-local",
        "label": "Lebanese local record",
        "question": "What are Lebanese outlets actually naming on the ground?",
        "role": "This is the first place to check towns, ministries, municipalities, hospitals, and local political reactions.",
        "needles": [
            "l'orient",
            "naharnet",
            "lebanon24",
            "national news agency lebanon",
            "lbci",
            "bint jbeil news",
            "bintjbeilnews",
        ],
    },
    {
        "id": "resistance-apparatus",
        "label": "Resistance apparatus",
        "question": "What is Hezbollah or resistance media claiming?",
        "role": "Treat this as a primary claim stream. It is valuable, but it needs opposing-source checks before becoming fact.",
        "needles": [
            "palestineresist",
            "hezbollah media scraper",
            "hezbollah war media",
            "al mayadeen",
            "al-manar",
            "almanar",
        ],
    },
    {
        "id": "palestinian-record",
        "label": "Palestinian record",
        "question": "What are Palestinian official and local outlets recording?",
        "role": "Use this lane to separate Palestinian field and institutional records from both Israeli and regional summaries.",
        "needles": ["wafa", "palestine chronicle", "ma'an", "maannews", "maan"],
    },
    {
        "id": "gulf-official",
        "label": "Gulf official line",
        "question": "How are Gulf states publicly positioning the event?",
        "role": "This lane catches official diplomatic language from Riyadh, Doha, Abu Dhabi, and Muscat before it gets flattened into regional consensus.",
        "needles": ["saudi press agency", "qatar news agency", "emirates news agency", "oman news agency", "spa", "qna", "wam"],
    },
    {
        "id": "iranian-state",
        "label": "Iranian state line",
        "question": "What is Tehran's official or state-adjacent story?",
        "role": "Treat this as an Iranian primary narrative stream. It is essential for motive and messaging, but not a stand-alone fact check.",
        "needles": ["press tv", "tehran times", "irna", "al-alam"],
    },
    {
        "id": "video-analysis",
        "label": "Video analysis",
        "question": "Who is explaining the battlefield rather than only reporting headlines?",
        "role": "YouTube and long-form video are where tactical claims often become arguments about the whole war.",
        "needles": ["youtube", "electronic intifada", "jad ghosn"],
    },
    {
        "id": "wires-regional",
        "label": "Wires and regionals",
        "question": "What has crossed into the wider diplomatic and regional record?",
        "role": "Reuters, Al Jazeera, Al-Monitor, Asharq, and Middle East Eye help show when a local event has become regional.",
        "needles": [
            "reuters",
            "al jazeera",
            "alaraby",
            "al araby",
            "al arabiya",
            "alarabiya",
            "al-monitor",
            "asharq",
            "middle east eye",
            "meed",
            "merip",
        ],
    },
    {
        "id": "framework-desk",
        "label": "Framework desk",
        "question": "What longer argument should shape the reading?",
        "role": "This lane keeps analysis from being mistaken for live confirmation while still shaping the brief.",
        "needles": ["crisis group", "carnegie", "academic", "framework", "electronic intifada battlefield", "jad ghosn analytical"],
    },
]


def lane_for(item: ScoredItem) -> str:
    text = f"{item.source_id} {item.source_type} {item.title}".lower()
    for lane in LANES:
        if any(needle in text for needle in lane["needles"]):
            return lane["id"]
    return "wires-regional"


def build_source_lanes(items: list[ScoredItem]) -> list[SourceLane]:
    grouped: dict[str, list[ScoredItem]] = defaultdict(list)
    for item in items:
        grouped[lane_for(item)].append(item)

    lanes: list[SourceLane] = []
    for lane in LANES:
        lane_items = sorted(grouped.get(lane["id"], []), key=lambda item: item.published_at, reverse=True)
        card_items = [
            SourceLaneItem(
                title=item.title,
                source=item.source_id,
                source_type=item.source_type,
                url=item.url,
                published_at=item.published_at,
                signal_tags=list(item.signal_tags),
                bias=item.source_bias,
            )
            for item in lane_items[:4]
        ]
        lanes.append(
            SourceLane(
                id=lane["id"],
                label=lane["label"],
                question=lane["question"],
                role=lane["role"],
                item_count=len(lane_items),
                sources=sorted({item.source_id for item in lane_items}),
                items=card_items,
            )
        )
    return lanes


def build_ground_needs(clusters: list[GeoTaggedCluster]) -> list[GroundNeed]:
    danger = [
        cluster
        for cluster in clusters
        if cluster.severity in {"critical", "high"}
        or any(tag in cluster.signal_tags for tag in ["casualty", "displacement", "strike-claim"])
    ]
    single_source = [
        cluster
        for cluster in clusters
        if cluster.confirmation_status in {"single-source", "unconfirmed"} or cluster.confidence == "low"
    ]
    rhetoric = [cluster for cluster in clusters if "rhetoric-shift" in cluster.signal_tags or "political-maneuver" in cluster.signal_tags]

    def cluster_names(items: list[GeoTaggedCluster]) -> str:
        places = [
            cluster.primary_location.name
            for cluster in items
            if cluster.primary_location and cluster.primary_location.name != "Location unclear"
        ]
        if not places:
            return "No precise place surfaced in the current run."
        return ", ".join(sorted(set(places))[:4])

    return [
        GroundNeed(
            id="move",
            label="Before moving",
            answer=f"Check the named places first: {cluster_names(danger)}.",
            check="Use this as a prompt to verify roads, municipal notices, family calls, and official warnings. It is not an emergency instruction.",
            related_clusters=[cluster.id for cluster in danger[:3]],
        ),
        GroundNeed(
            id="trust",
            label="Before trusting a claim",
            answer=f"{len(single_source)} visible dossiers are still single-source or unconfirmed.",
            check="Look for the same place or incident in a Lebanese local source, an Israeli source, and a wire or regional source before treating it as settled.",
            related_clusters=[cluster.id for cluster in single_source[:3]],
        ),
        GroundNeed(
            id="publish",
            label="Before publishing",
            answer=f"The strongest public narrative pressure is around {cluster_names(rhetoric)}.",
            check="Separate what happened, who is saying it happened, and what each camp wants the reader to believe happened.",
            related_clusters=[cluster.id for cluster in rhetoric[:3]],
        ),
    ]
