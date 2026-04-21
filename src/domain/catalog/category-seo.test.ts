import { describe, expect, it } from "vitest";
import type { Category, Product, Subcategory } from "@/domain/catalog/types";
import { buildCategorySeoDocument } from "@/domain/catalog/category-seo";

function buildMockSubcategory(id: string, name: string, slug: string): Subcategory {
  return {
    id,
    categoryId: "cat-1",
    name,
    slug,
    productCount: 0,
  };
}

function buildMockProduct(index: number, subcategoryId: string): Product {
  return {
    id: `prod-${index}`,
    name: `Producto destacado ${index}`,
    slug: `producto-destacado-${index}`,
    categoryId: "cat-1",
    subcategoryId,
    brand: index % 2 === 0 ? "Marca Uno" : "Marca Dos",
    description: "Descripcion breve del producto para pruebas de SEO.",
    longDescription: "Descripcion extensa del producto para pruebas de SEO.",
    images: ["https://example.com/image.jpg"],
    minPrice: 40 + index * 10,
    maxPrice: 60 + index * 10,
    rating: 4.2,
    reviewCount: 30 + index,
    offerCount: 3,
    specs: [],
    tags: ["hogar", "comparativa"],
    material: index % 2 === 0 ? "Acero" : "Madera",
    color: index % 2 === 0 ? "Negro" : "Blanco",
    style: index % 2 === 0 ? "Moderno" : "Nordico",
  };
}

function countWords(value: string): number {
  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean).length;
}

describe("buildCategorySeoDocument", () => {
  const subcategories = [
    buildMockSubcategory("sub-1", "Sofas", "sofas"),
    buildMockSubcategory("sub-2", "Mesas", "mesas"),
    buildMockSubcategory("sub-3", "Estanterias", "estanterias"),
  ];

  const category: Category = {
    id: "cat-1",
    name: "Muebles",
    slug: "muebles",
    icon: "Sofa",
    description: "Categoria de mobiliario",
    productCount: 10,
    subcategories,
  };

  const secondaryCategory: Category = {
    id: "cat-2",
    name: "Jardin y Exterior",
    slug: "jardin-y-exterior",
    icon: "TreePine",
    description: "Exterior",
    productCount: 4,
    subcategories: [],
  };

  const allProducts = Array.from({ length: 10 }, (_, index) => buildMockProduct(index + 1, subcategories[index % 3].id));

  it("builds a rich SEO document for parent category", () => {
    const document = buildCategorySeoDocument({
      category,
      categories: [category, secondaryCategory],
      products: allProducts,
      allProducts,
    });

    const fullText = [
      ...document.introParagraphs,
      ...document.sections.flatMap((section) => section.paragraphs),
      ...document.closingParagraphs,
    ].join(" ");

    expect(document.title).toContain("Muebles");
    expect(document.metaDescription.length).toBeGreaterThan(110);
    expect(document.sections.length).toBeGreaterThanOrEqual(5);
    expect(document.relatedLinks.length).toBeGreaterThan(0);
    expect(document.canonicalPath).toBe("/categoria/muebles");
    expect(countWords(fullText)).toBeGreaterThan(350);
  });

  it("builds a differentiated SEO document for subcategory", () => {
    const subcategory = subcategories[0];
    const subProducts = allProducts.filter((product) => product.subcategoryId === subcategory.id);

    const document = buildCategorySeoDocument({
      category,
      subcategory,
      categories: [category, secondaryCategory],
      products: subProducts,
      allProducts,
    });

    const fullText = [
      ...document.introParagraphs,
      ...document.sections.flatMap((section) => section.paragraphs),
      ...document.closingParagraphs,
    ].join(" ");

    expect(document.h1).toContain(subcategory.name);
    expect(document.canonicalPath).toBe(`/categoria/${category.slug}/${subcategory.slug}`);
    expect(document.relatedLinks.some((link) => link.href === `/categoria/${category.slug}`)).toBe(true);
    expect(countWords(fullText)).toBeGreaterThan(250);
  });
});
