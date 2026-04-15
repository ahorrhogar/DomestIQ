import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import TrendingCategories from '@/components/home/TrendingCategories';
import PromoBanner from '@/components/home/PromoBanner';
import { ProductGrid } from '@/components/product/ProductCard';
import ProductDestinationLink from '@/components/product/ProductDestinationLink';
import TrustBlock from '@/components/home/TrustBlock';
import SEOContent from '@/components/home/SEOContent';
import { analyticsService, categoryService, productService } from '@/services';
import { computeDiscountPercent } from '@/domain/catalog/product-logic';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, Flame, Star, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from '@/lib/productImage';

const LAST_RANDOM_CATEGORY_KEY = 'home:last-random-category-slug';

function normalizeCategoryLookup(value: string): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const Index = () => {
  const categories = categoryService.getAllCategories();
  const [homeCollections, setHomeCollections] = useState(() => ({
    topProducts: productService.getTopProducts(6),
    deals: productService.getDealProducts(4),
    topRated: productService.getTopRatedProducts(4),
    bestSellers: productService.getBestSellers(4),
    favoriteProducts: productService.getFavoriteProducts(4),
    featuredProducts: productService.getFeaturedProducts(4),
  }));

  const refreshHomeCollections = useCallback(() => {
    setHomeCollections({
      topProducts: productService.getTopProducts(6),
      deals: productService.getDealProducts(4),
      topRated: productService.getTopRatedProducts(4),
      bestSellers: productService.getBestSellers(4),
      favoriteProducts: productService.getFavoriteProducts(4),
      featuredProducts: productService.getFeaturedProducts(4),
    });
  }, []);

  const { topProducts, deals, topRated, bestSellers, favoriteProducts, featuredProducts } = homeCollections;

  const kitchenCategoryHref = useMemo(() => {
    const match = categories.find((category) => {
      const normalized = `${category.name} ${category.slug}`.toLowerCase();
      return normalized.includes('electro') && normalized.includes('cocina');
    });

    if (match) {
      return `/categoria/${match.slug}`;
    }

    const electro = categories.find((category) => {
      const normalized = `${category.name} ${category.slug}`.toLowerCase();
      return normalized.includes('electro');
    });

    return electro ? `/categoria/${electro.slug}` : '/categoria/cocina';
  }, [categories]);

  const gardenExteriorHref = useMemo(() => {
    const preferredSlugs = ['jardin-y-exterior', 'jardin-exterior'];

    for (const preferredSlug of preferredSlugs) {
      const exact = categories.find(
        (category) => normalizeCategoryLookup(category.slug) === preferredSlug,
      );

      if (exact) {
        return `/categoria/${exact.slug}`;
      }
    }

    const match = categories.find((category) => {
      const normalized = normalizeCategoryLookup(`${category.name} ${category.slug}`);
      return normalized.includes('jardin') && normalized.includes('exterior');
    });

    if (match) {
      return `/categoria/${match.slug}`;
    }

    const bySubcategory = categories.find((category) => {
      const categoryNormalized = normalizeCategoryLookup(`${category.name} ${category.slug}`);
      if (!categoryNormalized.includes('jardin')) {
        return false;
      }

      return (category.subcategories || []).some((subcategory) =>
        normalizeCategoryLookup(`${subcategory.name} ${subcategory.slug}`).includes('exterior'),
      );
    });

    if (bySubcategory) {
      return `/categoria/${bySubcategory.slug}`;
    }

    const garden = categories.find((category) => {
      const normalized = normalizeCategoryLookup(`${category.name} ${category.slug}`);
      return normalized.includes('jardin');
    });

    return garden ? `/categoria/${garden.slug}` : '/categoria/jardin-y-exterior';
  }, [categories]);

  const getRandomCategoryHref = useCallback(() => {
    const pool = categories.filter((category) => category.productCount > 0 && Boolean(category.slug));
    if (!pool.length) {
      return '/categoria/muebles';
    }

    const lastSlug = typeof window !== 'undefined'
      ? window.sessionStorage.getItem(LAST_RANDOM_CATEGORY_KEY)
      : null;

    const candidates = pool.length > 1 && lastSlug
      ? pool.filter((category) => category.slug !== lastSlug)
      : pool;

    const safeCandidates = candidates.length ? candidates : pool;
    const randomCategory = safeCandidates[Math.floor(Math.random() * safeCandidates.length)];

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(LAST_RANDOM_CATEGORY_KEY, randomCategory.slug);
    }

    return `/categoria/${randomCategory.slug}`;
  }, [categories]);

  useEffect(() => {
    analyticsService.track({
      name: 'page_view',
      timestamp: new Date().toISOString(),
      payload: { page: 'home' },
    });
  }, []);

  useEffect(() => {
    refreshHomeCollections();

    const intervalId = window.setInterval(() => {
      refreshHomeCollections();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [refreshHomeCollections]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />

        {/* Tendencias actuales - scrollable like Idealo */}
        <TrendingCategories />

        {/* Trending Products - immediately visible */}
        {topProducts.length > 0 ? (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-end justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">Top productos</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {topProducts.map((p) => {
                  const realDiscount = computeDiscountPercent(p);
                  const previewImage = p.images.find((image) => Boolean(image)) || PRODUCT_IMAGE_FALLBACK;
                  return (
                    <ProductDestinationLink
                      key={p.id}
                      product={p}
                      className="group bg-card rounded-xl border border-border p-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {realDiscount ? (
                        <span className="inline-block mb-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-deal text-deal-foreground">
                          -{realDiscount}%
                        </span>
                      ) : null}
                      <div className="aspect-square rounded-lg overflow-hidden bg-secondary/50 mb-2">
                        <img
                          src={previewImage}
                          alt={p.name}
                          className="w-full h-full object-contain p-2"
                          loading="lazy"
                          onError={(event) => applyProductImageFallback(event.currentTarget)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                      <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight mt-0.5">{p.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span className="text-xs font-medium">{p.rating}</span>
                        <span className="text-[10px] text-muted-foreground">({p.reviewCount})</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">desde </span>
                        <span className="text-sm font-bold text-foreground">{p.minPrice.toFixed(2).replace('.', ',')} €</span>
                      </div>
                      {p.originalPrice && p.originalPrice > p.minPrice ? (
                        <p className="text-xs text-muted-foreground line-through mt-0.5">
                          {p.originalPrice.toFixed(2).replace('.', ',')} €
                        </p>
                      ) : null}
                    </ProductDestinationLink>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* Promo banners row */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-4">
              <PromoBanner
                title="Las mejores gangas, a un clic"
                subtitle="Muebles, decoración, electrodomésticos y mucho más con los mayores descuentos."
                cta="¡Que no se te escapen!"
                href="/categoria/muebles"
                resolveHref={getRandomCategoryHref}
                image="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=400&fit=crop"
                layout="full"
              />
              <PromoBanner
                title="Renueva tu cocina"
                subtitle="Encuentra los mejores precios en electrodomésticos y utensilios de cocina."
                cta="Explorar cocina"
                href={kitchenCategoryHref}
                image="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                layout="full"
              />
            </div>
          </div>
        </section>

        {/* Supergangas - biggest discounts */}
        {deals.length > 0 && (
          <div id="supergangas" className="scroll-mt-28">
            <ProductGrid products={deals} title="🔥 Supergangas" subtitle="Los mayores descuentos del momento" showAll="/categoria/muebles" />
          </div>
        )}

        <TrustBlock />

        {/* Top Rated */}
        {topRated.length > 0 ? (
          <ProductGrid
            products={topRated}
            title="⭐ Mejor valorados"
            subtitle="Los productos con mejores opiniones de nuestros usuarios"
            showAll="/categoria/muebles"
          />
        ) : null}

        {/* Lifestyle promo banner - full width */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <PromoBanner
              title="Tu jardín, tu refugio"
              subtitle="Barbacoas, muebles de exterior y todo lo que necesitas para disfrutar al aire libre."
              cta="Explorar jardín"
              href={gardenExteriorHref}
              image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop"
              layout="full"
            />
          </div>
        </section>

        {/* How it works - compact */}
        <section className="py-12 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground text-center mb-8">¿Cómo funciona Homara?</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: <Zap className="w-6 h-6" />, title: 'Busca tu producto', desc: 'Explora miles de productos organizados por categoría.' },
                { icon: <Star className="w-6 h-6" />, title: 'Compara precios', desc: 'Ve todas las ofertas de diferentes tiendas de un vistazo.' },
                { icon: <Flame className="w-6 h-6" />, title: 'Compra al mejor precio', desc: 'Elige la mejor oferta y compra en la tienda oficial.' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
                    {s.icon}
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {bestSellers.length > 0 ? (
          <ProductGrid products={bestSellers} title="🏆 Los más vendidos" subtitle="Productos con mayor traccion de usuarios" showAll="/categoria/muebles" />
        ) : null}

        {favoriteProducts.length > 0 ? (
          <ProductGrid
            products={favoriteProducts}
            title="❤️ Favoritos de usuarios"
            subtitle="Los productos mas guardados y recomendados"
            showAll="/categoria/muebles"
          />
        ) : null}

        {/* Assistant CTA */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl bg-gradient-hero p-8 md:p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 right-20 w-32 h-32 rounded-full border border-primary-foreground/10 animate-orbit" />
              </div>
              <div className="relative z-10">
                <Sparkles className="w-9 h-9 text-accent mx-auto mb-3" />
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                  ¿No sabes qué elegir?
                </h2>
                <p className="text-primary-foreground/80 max-w-lg mx-auto mb-5">
                  Nuestro asistente inteligente te recomienda los mejores productos según tu presupuesto, estilo y necesidades.
                </p>
                <Link to="/asistente" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all shadow-glow">
                  Probar el Asistente <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} title="💎 Productos destacados" subtitle="Seleccionados por el equipo editorial" />
        ) : null}
        <SEOContent />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
