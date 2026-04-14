import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryService, productService } from '@/services';

const TrendingCategories = () => {
  const categories = categoryService.getAllCategories();
  const products = productService.getAllProducts();
  const trending = categoryService.getTrendingCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => { checkScroll(); }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground">Tendencias actuales</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-full border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-full border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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
                    src={topProduct.images[0]}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
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
                        src={subProduct.images[0]}
                        alt={sub.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
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
    </section>
  );
};

export default TrendingCategories;
