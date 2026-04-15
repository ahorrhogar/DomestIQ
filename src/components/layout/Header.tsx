import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Heart, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { categoryService } from '@/services';

const Header = () => {
  const categories = categoryService.getAllCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [mobileActiveCategoryId, setMobileActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const megaRef = useRef<HTMLDivElement>(null);

  // Close mega menu on route change
  useEffect(() => {
    setMegaMenuOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close mega menu on outside click
  useEffect(() => {
    if (!megaMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [megaMenuOpen]);

  useEffect(() => {
    if (location.pathname !== '/buscar') {
      return;
    }

    const nextQuery = (new URLSearchParams(location.search).get('q') || '').trim();
    setSearchQuery((previous) => (previous === nextQuery ? previous : nextQuery));
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      navigate('/buscar');
      return;
    }

    navigate(`/buscar?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];
  const mobileActiveCategory = categories.find((category) => category.id === mobileActiveCategoryId);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary">
        <div className="container mx-auto flex items-center justify-between py-1.5 px-4 text-primary-foreground text-xs">
          <span>🇪🇸 Especialistas en hogar — Compara y ahorra en miles de productos</span>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/asistente" className="hover:underline flex items-center gap-1"><Sparkles className="w-3 h-3" /> Asistente de Compras</Link>
            <span>|</span>
            <a href="#" className="hover:underline">Mis Favoritos</a>
            <span>|</span>
            <a href="#" className="hover:underline">Alertas de Precio</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Hamburger mega menu trigger */}
          <button
            onClick={() => {
              setMegaMenuOpen((previous) => {
                const nextOpen = !previous;
                if (nextOpen) {
                  setActiveCategoryId(categories[0]?.id || null);
                  setMobileActiveCategoryId(null);
                }
                return nextOpen;
              });
            }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Menú de categorías"
          >
            {megaMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex-shrink-0">
            <img
              src="/homara-logo.svg"
              alt="Homara"
              className="h-8 w-auto md:h-11"
              loading="eager"
              decoding="async"
            />
          </Link>

          <div className="flex-1 min-w-0 md:hidden">
            <form className="relative" onSubmit={handleSearchSubmit}>
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </form>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <form className="relative" onSubmit={handleSearchSubmit}>
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar productos, marcas, categorias o tiendas..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 ml-1 md:ml-auto">
            <Link to="/asistente" className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              <Sparkles className="w-4 h-4" />
              Asistente
            </Link>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Category nav bar - centered */}
      <div className="hidden md:block border-t border-border">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-0.5 py-1 overflow-x-auto scrollbar-hide">
            {categories.slice(0, 10).map(cat => (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className={`px-3 py-2 text-[13px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                  location.pathname.includes(cat.slug)
                    ? 'text-accent bg-accent/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mega menu dropdown */}
      {megaMenuOpen && (
        <div ref={megaRef} className="absolute left-0 right-0 top-full bg-card border-b border-border shadow-xl z-50 animate-fade-in">
          <div className="container mx-auto px-4 py-0">
            <div className="hidden md:flex min-h-[340px]">
              {/* Left: category list */}
              <div className="w-56 border-r border-border py-4 pr-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveCategoryId(cat.id)}
                    onClick={() => { setMegaMenuOpen(false); }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategoryId === cat.id ? 'bg-accent/10 text-accent font-semibold' : 'text-foreground/80 hover:bg-secondary'
                    }`}
                  >
                    <Link to={`/categoria/${cat.slug}`} className="flex-1" onClick={() => setMegaMenuOpen(false)}>
                      {cat.name}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>

              {/* Right: subcategories of active category */}
              <div className="flex-1 py-4 pl-6">
                {activeCategory && (
                  <>
                    <Link
                      to={`/categoria/${activeCategory.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="font-display font-bold text-foreground text-base mb-4 block hover:text-accent transition-colors"
                    >
                      {activeCategory.name}
                    </Link>
                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1.5">
                      {(activeCategory.subcategories || []).map(sub => (
                        <Link
                          key={sub.id}
                          to={`/categoria/${activeCategory.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="text-sm text-foreground/70 hover:text-accent transition-colors py-1"
                        >
                          {sub.name}
                          {sub.productCount > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">({sub.productCount})</span>
                          )}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Link
                        to={`/categoria/${activeCategory.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="text-sm font-semibold text-accent hover:underline"
                      >
                        Ver todo en {activeCategory.name} →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="md:hidden py-4">
              {!mobileActiveCategory && (
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setMobileActiveCategoryId(category.id)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-left text-foreground/90 hover:bg-secondary transition-colors"
                    >
                      <span>{category.name}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {mobileActiveCategory && (
                <div>
                  <button
                    onClick={() => setMobileActiveCategoryId(null)}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver a categorías
                  </button>

                  <Link
                    to={`/categoria/${mobileActiveCategory.slug}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className="font-display font-bold text-foreground text-base mb-3 block hover:text-accent transition-colors"
                  >
                    {mobileActiveCategory.name}
                  </Link>

                  <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                    {(mobileActiveCategory.subcategories || []).map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        to={`/categoria/${mobileActiveCategory.slug}/${subcategory.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-secondary hover:text-accent transition-colors"
                      >
                        <span>{subcategory.name}</span>
                        {subcategory.productCount > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">({subcategory.productCount})</span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Link
                      to={`/categoria/${mobileActiveCategory.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      Ver todo en {mobileActiveCategory.name} →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <Link key={cat.id} to={`/categoria/${cat.slug}`} onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm rounded-lg bg-secondary hover:bg-accent/10 hover:text-accent transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
            <Link to="/asistente" onClick={() => setMenuOpen(false)} className="mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground font-medium text-sm">
              <Sparkles className="w-4 h-4" /> Asistente de Compras
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
