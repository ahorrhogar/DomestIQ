import type { Category, Product, TrendingCategory } from "@/domain/catalog/types";

export function getTrendingCategories(categories: Category[], products: Product[]): TrendingCategory[] {
  return categories
    .map((category) => {
      const categoryProducts = products.filter((product) => product.categoryId === category.id);
      const totalReviews = categoryProducts.reduce((sum, product) => sum + product.reviewCount, 0);
      const topProduct = [...categoryProducts].sort((a, b) => b.reviewCount - a.reviewCount)[0];

      return topProduct
        ? {
            category,
            totalReviews,
            topProduct,
          }
        : null;
    })
    .filter((entry): entry is TrendingCategory => Boolean(entry))
    .sort((a, b) => b.totalReviews - a.totalReviews);
}
