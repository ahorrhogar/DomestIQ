import { Link } from 'react-router-dom';
import { Product } from '@/domain/catalog/types';
import { computeDiscountPercent } from '@/domain/catalog/product-logic';
import { Star, ArrowRight, Tag, TrendingDown, Sparkles } from 'lucide-react';
import ProductDestinationLink from '@/components/product/ProductDestinationLink';

const ProductCard = ({ product }: { product: Product }) => {
  const realDiscount = computeDiscountPercent(product);
  const showDiscount = realDiscount && realDiscount > 0 && realDiscount <= 60;

  return (
    <ProductDestinationLink
      product={product}
      className="group bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary/50 overflow-hidden">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {showDiscount && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-deal text-deal-foreground text-xs font-bold">
              <TrendingDown className="w-3 h-3" />-{realDiscount}%
            </span>
          )}
          {!showDiscount && product.originalPrice && product.originalPrice > product.minPrice && (
            <span className="px-2 py-0.5 rounded-md bg-deal text-deal-foreground text-xs font-bold">
              Oferta
            </span>
          )}
          {product.bestSeller && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-bold">
              <Sparkles className="w-3 h-3" />Top Ventas
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-bold">Nuevo</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
        <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2 mb-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-xs font-medium text-foreground">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs text-muted-foreground">desde</span>
            <span className="text-lg font-bold text-foreground">{product.minPrice.toFixed(2).replace('.', ',')} €</span>
          </div>
          {product.originalPrice && product.originalPrice > product.minPrice && (
            <span className="text-xs text-muted-foreground line-through">{product.originalPrice.toFixed(2).replace('.', ',')} €</span>
          )}

          {/* Offer count */}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Tag className="w-3 h-3" /> {product.offerCount} ofertas disponibles
          </p>
        </div>
      </div>
    </ProductDestinationLink>
  );
};

export const ProductGrid = ({ products, title, subtitle, showAll }: { products: Product[]; title: string; subtitle?: string; showAll?: string }) => (
  <section className="py-12">
    <div className="container mx-auto px-4">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {showAll && (
          <Link to={showAll} className="hidden md:flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  </section>
);

export default ProductCard;
