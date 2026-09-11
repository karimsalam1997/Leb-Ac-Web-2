import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { notebookEntries } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { getNotebookImage } from "@/lib/visual-assets";

export const metadata: Metadata = buildPageMetadata({
  title: "Notebook",
  description:
    "Fragments, observations, images, readings, and notes from Lebanese Academic.",
  path: "/notebook",
  image: getNotebookImage(notebookEntries[0]?.slug ?? "", 0),
});

export default function NotebookPage() {
  return (
    <SiteShell activePath="/notebook">
      <section className="paper-frame pt-5">
        <div className="notebook-hero editorial-rule">
          <div>
            <h1 className="display-title text-[3.9rem] leading-none text-[var(--accent)]">
              The Notebook
            </h1>
            <p className="mt-3 max-w-md text-[1.25rem] leading-7">
              Fragments, observations, and lines from readings — the pieces
              that haven&apos;t yet become an essay. Some won&apos;t.
            </p>
            <div className="dense-meta mt-4">
              {notebookEntries.length} entries / growing
            </div>
          </div>
          <div className="h-24 border-l border-[color:var(--line-strong)]" />
          <div className="text-right">
            <h2 className="arabic text-[3.6rem] leading-none text-[var(--accent)]">
              الدفتر
            </h2>
            <p className="arabic mt-3 text-[1.25rem] leading-7">
              شذرات وملاحظات وصور وسطور من قراءات — قِطعٌ لم تصِر بعدُ مقالًا. وبعضُها لن يصير.
            </p>
          </div>
        </div>
      </section>

      <section className="paper-frame pb-10">
        <div className="notebook-board">
          {notebookEntries.map((entry, index) => {
            const noteNumber = index + 1;
            const noteClasses = ["notebook-note"];

            if (noteNumber % 5 === 0) {
              noteClasses.push("note-tall");
            }

            if (noteNumber % 7 === 0) {
              noteClasses.push("note-wide");
            }

            return (
              <article
                key={entry.slug}
                id={entry.slug}
                className={noteClasses.join(" ")}
              >
                <div className="p-5">
                  <div className="dense-meta">{entry.date}</div>
                  <h2 className="editorial-title mt-2 text-[1.72rem] leading-tight">
                    {entry.title}
                  </h2>
                  <p className="mt-3 text-[1.08rem] leading-6 text-[var(--ink-soft)]">
                    {entry.excerpt}
                  </p>
                  <div className="notebook-entry-body">
                    {entry.body.map((paragraph, paragraphIndex) => (
                      <p key={`${entry.slug}-body-${paragraphIndex}`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <Link href={`/notebook/${entry.slug}`} className="read-link mt-4 !text-[1rem]">
                    Open page <span className="link-arrow">-&gt;</span>
                  </Link>
                </div>
              </article>
            );
          })}
          <aside className="notebook-crosslink">
            <div className="editorial-title text-[1.3rem]">Explore more in Essays and Letters.</div>
            <p className="mt-2 text-[0.98rem] leading-5 text-[var(--ink-soft)]">
              Ideas take many forms: some argue, some confess, some correspond.
            </p>
            <div className="mt-4 flex gap-8">
              <Link href="/essays" className="read-link !text-[1rem]">
                Browse Essays <span className="link-arrow">-&gt;</span>
              </Link>
              <Link href="/letters" className="read-link !text-[1rem]">
                Read Letters <span className="link-arrow">-&gt;</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
