import type { EditorialArticle } from "@/domain/editorial/types";

export interface EditorialSource {
  getArticles(): EditorialArticle[];
}
