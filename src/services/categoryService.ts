import { getTrendingCategories } from "@/domain/catalog/category-logic";
import type { Category, Subcategory, TrendingCategory } from "@/domain/catalog/types";
import { mockCatalogSource } from "@/data/sources/mockCatalogSource";

export interface CategoryService {
  getAllCategories(): Category[];
  getCategoryBySlug(slug?: string): Category | undefined;
  getSubcategoryBySlug(category: Category, subSlug?: string): Subcategory | undefined;
  getTrendingCategories(): TrendingCategory[];
}

class MockCategoryService implements CategoryService {
  getAllCategories(): Category[] {
    return mockCatalogSource.getCategories();
  }

  getCategoryBySlug(slug?: string): Category | undefined {
    if (!slug) {
      return undefined;
    }

    return this.getAllCategories().find((category) => category.slug === slug);
  }

  getSubcategoryBySlug(category: Category, subSlug?: string): Subcategory | undefined {
    if (!subSlug) {
      return undefined;
    }

    return category.subcategories.find((subcategory) => subcategory.slug === subSlug);
  }

  getTrendingCategories(): TrendingCategory[] {
    return getTrendingCategories(mockCatalogSource.getCategories(), mockCatalogSource.getProducts());
  }
}

export const categoryService: CategoryService = new MockCategoryService();
