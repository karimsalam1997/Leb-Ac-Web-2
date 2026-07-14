import type { Metadata } from "next";
import Image from "next/image";
import { SiteShell } from "@/components/site-shell";
import { SubmitForm } from "@/components/submit-form";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Submit",
  description:
    "Submit a piece to Lebanese Academic. We read everything. We publish the writing that decodes power and preserves memory.",
  path: "/submit",
  image: "/brand/la-primary-lockup.png",
});

const guidelines = [
  {
    numeral: "I",
    title: "Write structurally, not topically.",
    text: "Tell us what the load-bearing wall is, not just what's in the news. The piece should change how we see the thing it's about.",
  },
  {
    numeral: "II",
    title: "Write from where you stand.",
    text: "A neighborhood, a profession, a memory, a fact you can verify. We trust located writing more than panoramic writing.",
  },
  {
    numeral: "III",
    title: "No manifestos. No partisan ammunition.",
    text: "We publish across sect and party. If your piece would make a partisan reader cheer rather than think, it's not for us.",
  },
  {
    numeral: "IV",
    title: "Protect people. Verify what you claim.",
    text: "Change names where dignity requires. Source what is sourceable. We will ask.",
  },
  {
    numeral: "V",
    title: "Send what an editor can read.",
    text: "Short pieces: up to 800 words. Essays: 1,500–4,000 words. One file, one piece, your own words, not previously published.",
  },
];

export default function SubmitPage() {
  return (
    <SiteShell activePath="/submit">
      <section className="paper-frame pt-5">
        <div className="submit-layout editorial-rule">
          <aside className="submit-guidance">
            <div className="submit-intro">
              <h1 className="display-title text-[4.25rem] leading-none text-[var(--accent)]">
                Send Us Writing
              </h1>
              <p className="mt-4 text-[1.35rem] leading-7">
                An essay, a dispatch, a fragment that won&apos;t leave you alone. We
                read everything. We publish what decodes power or preserves
                memory — and what we couldn&apos;t write ourselves.
              </p>
              <p className="arabic mt-4 text-right text-[1.6rem] leading-[1.4] text-[var(--accent)]">
                رسالةً، مقالًا، أو فكرةً لا تتركك. نقرأ كلّ ما يصلنا، ونَنشُر ما يُفكّك السلطة أو يَصون الذاكرة.
              </p>
            </div>

            <div className="submit-guidelines-block mt-8 border-t border-[color:var(--line)] pt-7">
              <div className="editorial-kicker mb-6">Before You Write</div>
              <div className="space-y-5">
                {guidelines.map((item) => (
                  <div key={item.title} className="submit-guideline">
                    <span className="submit-guideline-numeral" aria-hidden="true">
                      {item.numeral}
                    </span>
                    <div>
                      <h2>{item.title}</h2>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="submit-meta-block mt-8 border-t border-[color:var(--line)] pt-7">
              <div className="editorial-kicker mb-3">What Happens Next</div>
              <p className="text-[1rem] leading-6 text-[var(--ink-soft)]">
                One editor reads every submission. We reply within two weeks,
                even when we pass. If we want the piece, we&apos;ll send line edits
                and ask one or two structural questions before publication.
                Writers we publish are paid for commissioned essays.
              </p>
              <p className="arabic mt-3 text-right text-[1rem] leading-7 text-[var(--ink-soft)]">
                نُجيب على كلّ ما يصلنا خلال أسبوعين. الكاتبات والكتّاب يُدفع لهم على المقالات. الرسائلُ بلا أجر.
              </p>
            </div>

            <blockquote className="submit-quote">
              <div className="text-[4.5rem] leading-none text-[var(--accent)]">“</div>
              <p>
                Most writing on Lebanon repeats the news. We are looking for
                the writing that does the opposite — that makes the news
                make sense.
              </p>
            </blockquote>
          </aside>

          <div>
            <div className="submit-form-heading">
              <div className="editorial-kicker">Submissions</div>
              <h2 className="editorial-title">Send Us a Piece</h2>
              <p>
                Fill this in. The form takes about three minutes. Read the
                guidelines on the left first if you haven&apos;t.
              </p>
            </div>
            <SubmitForm />
            <div className="submit-reassurance">
              <div className="submit-reassurance-glyph" aria-hidden="true">
                ⁂
              </div>
              <div>
                <p className="font-medium">Write it the way you&apos;d tell it.</p>
                <p>
                  We edit for structure and clarity, not for voice. The piece
                  should still sound like you when we&apos;re done.
                </p>
              </div>
              <Image
                src="/brand/la-editors-mark.png"
                alt=""
                width={52}
                height={52}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
