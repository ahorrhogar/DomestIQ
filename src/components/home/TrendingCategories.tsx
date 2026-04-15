import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryService, productService } from '@/services';
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from '@/lib/productImage';

const TrendingCategories = () => {
  const categories = categoryService.getAllCategories();
  const products = productService.getAllProducts();
  const trending = categoryService.getTrendingCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const onResize = () => checkScroll();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [trending.length, categories.length, products.length]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-5">
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground">Tendencias actuales</h2>
        </div>
        <div className="relative">
          {canScrollLeft ? (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-1 top-[42px] z-10 h-12 w-12 -translate-y-1/2 rounded-r-md bg-muted/90 text-foreground shadow-md transition-colors hover:bg-muted"
              aria-label="Deslizar a la izquierda"
            >
              <ChevronLeft className="mx-auto h-5 w-5" />
            </button>
          ) : null}

          {canScrollRight ? (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-1 top-[42px] z-10 h-12 w-12 -translate-y-1/2 rounded-l-md bg-muted/90 text-foreground shadow-md transition-colors hover:bg-muted"
              aria-label="Deslizar a la derecha"
            >
              <ChevronRight className="mx-auto h-5 w-5" />
            </button>
          ) : null}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
          >
            {trending.map(({ category, topProduct }) => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="flex-shrink-0 flex flex-col items-center group"
                style={{ width: '120px' }}
              >
                <div className="w-[100px] h-[100px] rounded-full bg-secondary/80 overflow-hidden mb-2.5 group-hover:ring-2 group-hover:ring-accent/50 transition-all duration-300">
                  {topProduct ? (
                    <img
                      src={topProduct.images.find((image) => Boolean(image)) || PRODUCT_IMAGE_FALLBACK}
                      alt={category.name}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                      onError={(event) => applyProductImageFallback(event.currentTarget)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                      {category.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight group-hover:text-accent transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
            {/* Also show popular subcategories */}
            {categories.flatMap(cat =>
              (cat.subcategories || [])
                .filter(sub => sub.productCount > 0)
                .map(sub => {
                  const subProduct = products.find(p => p.subcategoryId === sub.id);
                  if (!subProduct) return null;
                  return (
                    <Link
                      key={sub.id}
                      to={`/categoria/${cat.slug}/${sub.slug}`}
                      className="flex-shrink-0 flex flex-col items-center group"
                      style={{ width: '120px' }}
                    >
                      <div className="w-[100px] h-[100px] rounded-full bg-secondary/80 overflow-hidden mb-2.5 group-hover:ring-2 group-hover:ring-accent/50 transition-all duration-300">
                        <img
                          src={subProduct.images.find((image) => Boolean(image)) || PRODUCT_IMAGE_FALLBACK}
                          alt={sub.name}
                          className="w-full h-full object-contain p-2"
                          loading="lazy"
                          onError={(event) => applyProductImageFallback(event.currentTarget)}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground text-center leading-tight group-hover:text-accent transition-colors">
                        {sub.name}
                      </span>
                    </Link>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingCategories;
