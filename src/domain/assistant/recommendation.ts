import type {
  AssistantQuery,
  AssistantResult,
  AssistantTag,
  Product,
} from "@/domain/catalog/types";

interface ScoredRecommendation {
  score: number;
  reason: string;
  tag?: AssistantTag;
}

function scoreProduct(product: Product, query: AssistantQuery): ScoredRecommendation {
  if (product.minPrice > query.budget) {
    return { score: -1, reason: "Fuera de presupuesto" };
  }

  let score = 0;
  const reasons: string[] = [];

  const budgetMargin = 1 - product.minPrice / query.budget;
  score += budgetMargin * 30;

  if (budgetMargin > 0.3) {
    reasons.push(`${Math.round(budgetMargin * 100)}% por debajo del presupuesto`);
  }

  switch (query.priority) {
    case "price": {
      score += budgetMargin * 40;
      if (product.discountPercent && product.discountPercent > 10) {
        score += product.discountPercent * 0.5;
        reasons.push(`${product.discountPercent}% de descuento`);
      }
      break;
    }
    case "quality": {
      score += product.rating * 8;
      if (product.rating >= 4.5) {
        reasons.push(`Valoracion excelente: ${product.rating}/5`);
      } else if (product.rating >= 4.0) {
        reasons.push(`Buena valoracion: ${product.rating}/5`);
      }

      score += Math.min(product.reviewCount / 500, 10);
      if (product.reviewCount > 500) {
        reasons.push(`${product.reviewCount.toLocaleString()} opiniones`);
      }
      break;
    }
    case "design": {
      score += product.rating * 5;
      if (query.style && product.style?.toLowerCase() === query.style.toLowerCase()) {
        score += 25;
        reasons.push(`Estilo ${query.style} que buscas`);
      }
      break;
    }
    case "balanced":
    default: {
      score += product.rating * 4;
      score += budgetMargin * 15;
      if (product.discountPercent) {
        score += product.discountPercent * 0.3;
      }
      if (product.rating >= 4.3) {
        reasons.push(`Buena valoracion: ${product.rating}/5`);
      }
      if (budgetMargin > 0.2) {
        reasons.push("Buen ajuste al presupuesto");
      }
      break;
    }
  }

  if (query.style && product.style?.toLowerCase() === query.style.toLowerCase() && query.priority !== "design") {
    score += 15;
    reasons.push(`Estilo ${query.style}`);
  }

  score += Math.min(product.reviewCount / 500, 8);
  if (product.bestSeller) {
    score += 8;
    reasons.push("Top ventas");
  }

  if (product.discountPercent && product.discountPercent > 15 && query.priority !== "price") {
    reasons.push(`${product.discountPercent}% dto.`);
  }

  let tag: AssistantTag | undefined;
  if (query.priority === "price" && product.minPrice <= query.budget * 0.4) {
    tag = "cheapest";
  } else if (product.rating >= 4.6 && product.minPrice > query.budget * 0.65) {
    tag = "premium";
  } else if (product.rating >= 4.3 && product.minPrice <= query.budget * 0.6) {
    tag = "best-value";
  }

  const reason = reasons.length > 0 ? `${reasons.slice(0, 3).join(". ")}.` : "Producto dentro del presupuesto.";
  return { score, reason, tag };
}

export function buildAssistantRecommendations(
  products: Product[],
  query: AssistantQuery,
  limit = 10,
): AssistantResult[] {
  const pool = query.categoryId
    ? products.filter((product) => product.categoryId === query.categoryId)
    : [...products];

  const ranked = pool
    .map((product) => {
      const scored = scoreProduct(product, query);
      return {
        product,
        offers: [],
        score: scored.score,
        reason: scored.reason,
        tag: scored.tag,
      };
    })
    .filter((candidate) => candidate.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (ranked.length > 0 && !ranked[0].tag) {
    ranked[0].tag = "recommended";
  }

  return ranked;
}
