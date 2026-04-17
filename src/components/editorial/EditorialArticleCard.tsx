import { CalendarDays, ArrowUpRight, Clock3, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { EditorialArticle } from "@/domain/editorial/types";
import { cn } from "@/lib/utils";

interface EditorialArticleCardProps {
  article: EditorialArticle;
  compact?: boolean;
}

const toneClassByCoverTone: Record<EditorialArticle["coverTone"], string> = {
  warm: "from-amber-300/35 via-orange-300/15 to-rose-300/20",
  fresh: "from-emerald-300/35 via-cyan-300/10 to-teal-300/20",
  calm: "from-sky-300/35 via-blue-300/10 to-indigo-300/20",
  contrast: "from-zinc-400/30 via-slate-300/15 to-lime-300/15",
};

function formatArticleDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatBudget(value: number | undefined): string {
  if (typeof value !== "number") {
    return "Presupuesto variable";
  }

  return `Presupuesto medio ${value.toLocaleString("es-ES")} EUR`;
}

const EditorialArticleCard = ({ article, compact = false }: EditorialArticleCardProps) => {
  return (
    <article
      className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={cn("relative overflow-hidden", compact ? "h-36" : "h-48")}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", toneClassByCoverTone[article.coverTone])} aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.34),transparent_45%)]" aria-hidden="true" />

        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.coverImageAlt || article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-background/85 text-foreground">
            {article.categoryName}
          </Badge>
          <Badge variant="outline" className="bg-background/70 text-foreground">
            {article.intent}
          </Badge>
        </div>
      </div>

      <div className="flex h-full flex-col p-4 md:p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-foreground md:text-xl">{article.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {article.readMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatArticleDate(article.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {formatBudget(article.averageBudget)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            to={article.path}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Leer guia
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <Link
            to={`/categoria/${article.categorySlug}`}
            className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            Ver productos de {article.categoryName}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default EditorialArticleCard;
