import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CategorySeoDocument } from "@/domain/catalog/category-seo";

interface CategorySeoBlockProps {
  document: CategorySeoDocument;
}

export default function CategorySeoBlock({ document }: CategorySeoBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="container mx-auto px-4 py-12 md:py-14" aria-label="Contenido editorial de categoria">
      <article className="rounded-2xl border border-border bg-card/40 p-5 md:p-8">
        <header className="mb-5">
          <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">{document.introHeading}</h2>
        </header>

        <div className="relative">
          <div className={expanded ? "space-y-5" : "max-h-[560px] overflow-hidden space-y-5"}>
            {document.introParagraphs.map((paragraph, index) => (
              <p key={`intro-${index}`} className="text-sm leading-7 text-muted-foreground md:text-base">
                {paragraph}
              </p>
            ))}

            {document.sections.map((section) => (
              <section key={section.heading} className="space-y-2">
                <h3 className="text-base font-semibold text-foreground md:text-lg">{section.heading}</h3>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.heading}-${paragraphIndex}`} className="text-sm leading-7 text-muted-foreground md:text-base">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <div className="space-y-2 border-t border-border pt-4">
              {document.closingParagraphs.map((paragraph, index) => (
                <p key={`closing-${index}`} className="text-sm leading-7 text-muted-foreground md:text-base">
                  {paragraph}
                </p>
              ))}
            </div>

            {document.relatedLinks.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="text-base font-semibold text-foreground md:text-lg">Navegacion relacionada</h3>
                <ul className="mt-3 flex flex-wrap gap-2.5">
                  {document.relatedLinks.map((entry) => (
                    <li key={`${entry.href}-${entry.label}`}>
                      <Link
                        to={entry.href}
                        className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent md:text-sm"
                      >
                        {entry.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!expanded && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/95 to-transparent" />
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? "Leer menos" : "Leer mas"}
        </button>
      </article>
    </section>
  );
}
