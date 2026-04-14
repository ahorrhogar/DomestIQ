import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { analyticsService, productService } from "@/services";
import type { ProductSortBy } from "@/domain/catalog/types";

const sortOptions: Array<{ value: ProductSortBy; label: string }> = [
  { value: "popular", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "discount", label: "Mayor descuento" },
  { value: "rating", label: "Mejor valorados" },
  { value: "newest", label: "Mas recientes" },
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<ProductSortBy>("popular");

  const query = useMemo(() => (searchParams.get("q") || "").trim(), [searchParams]);

  useEffect(() => {
    setSortBy("popular");
  }, [query]);

  useEffect(() => {
    if (!query) {
      return;
    }

    analyticsService.track({
      name: "page_view",
      timestamp: new Date().toISOString(),
      payload: {
        page: "search",
        query,
      },
    });
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ["search-products", query, sortBy],
    queryFn: () => productService.searchProducts(query, { limit: 72, sortBy }),
    enabled: query.length > 0,
  });

  const results = searchQuery.data || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Search className="w-4 h-4" />
            <span>Buscador de productos</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
            {query ? `Resultados para "${query}"` : "Busca productos"}
          </h1>
        </div>

        {!query && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-foreground font-medium">Escribe algo en la barra de busqueda para empezar.</p>
            <p className="text-muted-foreground text-sm mt-1">Puedes buscar por producto, marca, categoria o tienda.</p>
          </div>
        )}

        {query && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground">
                {searchQuery.isLoading ? "Buscando..." : `${results.length} productos encontrados`}
              </span>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as ProductSortBy)}
                  className="text-sm border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {searchQuery.isLoading && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Buscando productos...</p>
              </div>
            )}

            {searchQuery.isError && (
              <div className="text-center py-16">
                <p className="text-foreground font-medium">No se pudo completar la busqueda.</p>
                <p className="text-muted-foreground text-sm mt-1">Intenta de nuevo en unos segundos.</p>
              </div>
            )}

            {!searchQuery.isLoading && !searchQuery.isError && results.length === 0 && (
              <div className="text-center py-16">
                <p className="text-foreground font-medium">No encontramos resultados para "{query}".</p>
                <p className="text-muted-foreground text-sm mt-1">Prueba con otra palabra o una marca distinta.</p>
              </div>
            )}

            {!searchQuery.isLoading && !searchQuery.isError && results.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
