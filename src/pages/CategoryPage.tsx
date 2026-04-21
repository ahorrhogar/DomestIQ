import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ProductCard from '@/components/product/ProductCard';
import CategorySeoBlock from '@/components/editorial/CategorySeoBlock';
import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, ArrowUpDown, Star } from 'lucide-react';
import { analyticsService, categoryService, offerService, productService } from '@/services';
import type { ProductSortBy } from '@/domain/catalog/types';
import { buildCategorySeoDocument } from '@/domain/catalog/category-seo';

const sortOptions: Array<{ value: ProductSortBy; label: string }> = [
  { value: 'popular', label: 'Más populares' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'discount', label: 'Mayor descuento' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'newest', label: 'Más recientes' },
];

function ensureMetaTag(selector: string, create: () => HTMLElement): HTMLElement {
  const existing = document.head.querySelector(selector);
  if (existing) {
    return existing as HTMLElement;
  }

  const created = create();
  document.head.appendChild(created);
  return created;
}

const CategoryPage = () => {
  const { slug, subSlug } = useParams();
  const categories = categoryService.getAllCategories();
  const category = categoryService.getCategoryBySlug(slug);
  const subcategory = category ? categoryService.getSubcategoryBySlug(category, subSlug) : undefined;
  const categoryId = category?.id;
  const categorySlug = category?.slug;
  const subcategoryId = subcategory?.id;
  const allProducts = productService.getAllProducts();
  const merchants = offerService.getMerchants();

  const [sortBy, setSortBy] = useState<ProductSortBy>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyBestSellers, setOnlyBestSellers] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);

  const categoryProducts = useMemo(
    () => productService.getProductsByCategory(category?.id),
    [category?.id],
  );
  const seoProducts = useMemo(
    () => productService.getProductsByCategory(category?.id, subcategory?.id),
    [category?.id, subcategory?.id],
  );
  const filterMetadata = useMemo(
    () => productService.getFilterMetadata(categoryProducts),
    [categoryProducts],
  );
  const priceCeiling = Math.max(filterMetadata.maxPrice || 0, 5000);

  useEffect(() => {
    setPriceRange((previous) => {
      const nextMax = previous[1] === 5000 ? priceCeiling : Math.min(previous[1], priceCeiling);
      const nextMin = Math.min(previous[0], nextMax);

      if (previous[0] === nextMin && previous[1] === nextMax) {
        return previous;
      }

      return [nextMin, nextMax];
    });
  }, [priceCeiling]);

  useEffect(() => {
    if (!categoryId || !categorySlug) {
      return;
    }

    analyticsService.track({
      name: 'category_view',
      timestamp: new Date().toISOString(),
      payload: {
        categoryId,
        categorySlug,
        subcategoryId,
      },
    });
  }, [categoryId, categorySlug, subcategoryId]);

  const brands = filterMetadata.brands;
  const materials = filterMetadata.materials;
  const colors = filterMetadata.colors;
  const stylesAvailable = filterMetadata.styles;

  const activeFilterCount = [
    selectedBrands.length > 0,
    selectedMaterials.length > 0,
    selectedColors.length > 0,
    selectedStyles.length > 0,
    selectedStores.length > 0,
    minRating > 0,
    onlyDiscounted,
    onlyBestSellers,
    onlyNew,
    priceRange[0] > 0 || priceRange[1] < priceCeiling,
  ].filter(Boolean).length;

  const filteredProducts = useMemo(() => {
    return productService.getFilteredProducts(
      {
        categoryId,
        subcategoryId,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        brands: selectedBrands,
        materials: selectedMaterials,
        colors: selectedColors,
        styles: selectedStyles,
        merchantIds: selectedStores,
        minRating: minRating || undefined,
        onlyDiscounted,
        onlyBestSellers,
        onlyNew,
      },
      sortBy,
    );
  }, [
    categoryId,
    subcategoryId,
    sortBy,
    priceRange,
    selectedBrands,
    selectedMaterials,
    selectedColors,
    selectedStyles,
    selectedStores,
    minRating,
    onlyDiscounted,
    onlyBestSellers,
    onlyNew,
  ]);

  const seoDocument = useMemo(() => {
    if (!category) {
      return null;
    }

    return buildCategorySeoDocument({
      category,
      subcategory,
      categories,
      products: seoProducts,
      allProducts,
    });
  }, [allProducts, categories, category, subcategory, seoProducts]);

  useEffect(() => {
    if (!seoDocument || !category) {
      return;
    }

    const previousTitle = document.title;

    const descriptionTag = ensureMetaTag('meta[name="description"]', () => {
      const node = document.createElement('meta');
      node.setAttribute('name', 'description');
      return node;
    }) as HTMLMetaElement;

    const ogTitleTag = ensureMetaTag('meta[property="og:title"]', () => {
      const node = document.createElement('meta');
      node.setAttribute('property', 'og:title');
      return node;
    }) as HTMLMetaElement;

    const ogDescriptionTag = ensureMetaTag('meta[property="og:description"]', () => {
      const node = document.createElement('meta');
      node.setAttribute('property', 'og:description');
      return node;
    }) as HTMLMetaElement;

    const canonicalTag = ensureMetaTag('link[rel="canonical"]', () => {
      const node = document.createElement('link');
      node.setAttribute('rel', 'canonical');
      return node;
    }) as HTMLLinkElement;

    const previousDescription = descriptionTag.getAttribute('content') || '';
    const previousOgTitle = ogTitleTag.getAttribute('content') || '';
    const previousOgDescription = ogDescriptionTag.getAttribute('content') || '';
    const previousCanonical = canonicalTag.getAttribute('href') || '';

    const canonicalUrl = `https://homara.es${seoDocument.canonicalPath}`;

    document.title = seoDocument.title;
    descriptionTag.setAttribute('content', seoDocument.metaDescription);
    ogTitleTag.setAttribute('content', seoDocument.title);
    ogDescriptionTag.setAttribute('content', seoDocument.metaDescription);
    canonicalTag.setAttribute('href', canonicalUrl);

    const scriptId = 'homara-category-schema';
    const previousScript = document.getElementById(scriptId);
    if (previousScript) {
      previousScript.remove();
    }

    const schemaNode = document.createElement('script');
    schemaNode.id = scriptId;
    schemaNode.type = 'application/ld+json';
    schemaNode.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seoDocument.h1,
      description: seoDocument.schemaDescription,
      url: canonicalUrl,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://homara.es/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: category.name,
            item: `https://homara.es/categoria/${category.slug}`,
          },
          ...(subcategory
            ? [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: subcategory.name,
                  item: canonicalUrl,
                },
              ]
            : []),
        ],
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: seoProducts.length,
        itemListElement: seoProducts.slice(0, 12).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: product.name,
          url: `https://homara.es/producto/${product.slug}`,
        })),
      },
    });
    document.head.appendChild(schemaNode);

    return () => {
      document.title = previousTitle;
      descriptionTag.setAttribute('content', previousDescription);
      ogTitleTag.setAttribute('content', previousOgTitle);
      ogDescriptionTag.setAttribute('content', previousOgDescription);
      canonicalTag.setAttribute('href', previousCanonical);
      schemaNode.remove();
    };
  }, [category, seoDocument, seoProducts, subcategory]);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSelectedStyles([]);
    setSelectedStores([]);
    setMinRating(0);
    setOnlyDiscounted(false);
    setOnlyBestSellers(false);
    setOnlyNew(false);
    setPriceRange([0, priceCeiling]);
  };

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Categoría no encontrada</h2>
          <Link to="/" className="text-accent hover:underline">Volver al inicio</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbs = [
    { label: category.name, href: subcategory ? `/categoria/${category.slug}` : undefined },
    ...(subcategory ? [{ label: subcategory.name }] : []),
  ];

  const FilterCheckbox = ({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: () => void; count?: number }) => (
    <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground transition-colors py-0.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-border accent-[hsl(var(--accent))]" />
      <span className={checked ? 'text-foreground font-medium' : 'text-muted-foreground'}>{label}</span>
      {count !== undefined && <span className="text-[10px] text-muted-foreground ml-auto">({count})</span>}
    </label>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4">
          <Breadcrumb items={breadcrumbs} />

          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {seoDocument?.h1 || (subcategory ? subcategory.name : category.name)}
            </h1>
            <p className="text-muted-foreground mt-1">{category.description}</p>
          </div>

          {/* Subcategories chips */}
          {!subcategory && category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category.subcategories.map(sub => (
                <Link
                  key={sub.id}
                  to={`/categoria/${category.slug}/${sub.slug}`}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors bg-card"
                >
                  {sub.name}
                  <span className="ml-1.5 text-xs text-muted-foreground">({sub.productCount})</span>
                </Link>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card hover:border-accent'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-sm text-accent hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpiar todo
                </button>
              )}
              <span className="text-sm text-muted-foreground">{filteredProducts.length} productos</span>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as ProductSortBy)}
                className="text-sm border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters sidebar */}
            {showFilters && (
              <aside className="w-64 flex-shrink-0 hidden lg:block animate-fade-in">
                <div className="sticky top-32 space-y-5 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
                  {/* Price */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Precio</h4>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="Min" value={priceRange[0] || ''} onChange={e => setPriceRange([+e.target.value, priceRange[1]])} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card" />
                      <span className="text-muted-foreground">—</span>
                      <input type="number" placeholder="Max" value={priceRange[1] >= priceCeiling ? '' : priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value || priceCeiling])} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card" />
                    </div>
                  </div>

                  {/* Quick filters */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Filtros rápidos</h4>
                    <div className="space-y-1">
                      <FilterCheckbox label="Solo ofertas" checked={onlyDiscounted} onChange={() => setOnlyDiscounted(!onlyDiscounted)} />
                      <FilterCheckbox label="Top ventas" checked={onlyBestSellers} onChange={() => setOnlyBestSellers(!onlyBestSellers)} />
                      <FilterCheckbox label="Novedades" checked={onlyNew} onChange={() => setOnlyNew(!onlyNew)} />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Valoración mínima</h4>
                    <div className="space-y-1">
                      {[4.5, 4.0, 3.5, 3.0].map(r => (
                        <label key={r} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                          <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(minRating === r ? 0 : r)} className="accent-[hsl(var(--accent))]" />
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                            <span className={minRating === r ? 'text-foreground font-medium' : 'text-muted-foreground'}>{r}+ estrellas</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Brand */}
                  {brands.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">Marca</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {brands.map(brand => (
                          <FilterCheckbox
                            key={brand}
                            label={brand}
                            checked={selectedBrands.includes(brand)}
                            onChange={() => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])}
                            count={categoryProducts.filter(p => p.brand === brand).length}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Material */}
                  {materials.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">Material</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {materials.map(mat => (
                          <FilterCheckbox
                            key={mat}
                            label={mat}
                            checked={selectedMaterials.includes(mat)}
                            onChange={() => setSelectedMaterials(prev => prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat])}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color */}
                  {colors.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">Color</h4>
                      <div className="space-y-1">
                        {colors.map(col => (
                          <FilterCheckbox
                            key={col}
                            label={col}
                            checked={selectedColors.includes(col)}
                            onChange={() => setSelectedColors(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style */}
                  {stylesAvailable.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">Estilo</h4>
                      <div className="space-y-1">
                        {stylesAvailable.map(st => (
                          <FilterCheckbox
                            key={st}
                            label={st}
                            checked={selectedStyles.includes(st)}
                            onChange={() => setSelectedStyles(prev => prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st])}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Store */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 text-foreground">Tienda</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {merchants.map(m => (
                        <FilterCheckbox
                          key={m.id}
                          label={m.name}
                          checked={selectedStores.includes(m.id)}
                          onChange={() => setSelectedStores(prev => prev.includes(m.id) ? prev.filter(s => s !== m.id) : [...prev, m.id])}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Product grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-2">No se encontraron productos</p>
                  <p className="text-sm text-muted-foreground">Prueba a ajustar los filtros</p>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="mt-4 text-sm text-accent hover:underline">Limpiar filtros</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          </div>
        </div>

        {seoDocument ? <CategorySeoBlock document={seoDocument} /> : null}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;