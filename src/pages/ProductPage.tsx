import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { ProductGrid } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo, useState, useEffect } from 'react';
import { Star, Tag, TrendingDown, Bell, ExternalLink, Truck, ShieldCheck, ChevronDown, ChevronUp, TrendingUp, Minus, ChevronLeft, ChevronRight, Share2, Link as LinkIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService, categoryService, offerService, productService } from '@/services';
import { computeDiscountPercent } from '@/domain/catalog/product-logic';
import type { Merchant } from '@/domain/catalog/types';
import { extractDomainFromAffiliateUrl, isAffiliateUrlAllowed } from '@/infrastructure/security/affiliateUrl';
import { toast } from 'sonner';
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from '@/lib/productImage';

const MerchantLogo = ({ merchant }: { merchant: Merchant }) => {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(merchant.logo) && !imageError;

  return (
    <div className="w-10 h-10 rounded-lg bg-secondary/80 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
      {showImage ? (
        <img
          src={merchant.logo}
          alt={merchant.name}
          className="w-7 h-7 object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-xs font-bold text-muted-foreground">{merchant.name.charAt(0)}</span>
      )}
    </div>
  );
};

const ProductPage = () => {
  const { slug } = useParams();
  const product = slug ? productService.getProductBySlug(slug) : undefined;
  const useRedirectApi = (import.meta.env.VITE_USE_REDIRECT_API || "false") === "true";
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const offers = useMemo(() => (product ? offerService.getOffersForProduct(product.id) : []), [product]);
  const priceHistory = useMemo(() => (product ? offerService.getPriceHistory(product.id) : []), [product]);
  const priceAnalysis = useMemo(() => (product ? offerService.getPriceAnalysis(product.id) : null), [product]);
  const category = product ? categoryService.getAllCategories().find(c => c.id === product.categoryId) : null;
  const subcategory = category?.subcategories.find(s => s.id === product?.subcategoryId);
  const relatedProducts = product ? productService.getRelatedProducts(product, 4) : [];

  const realDiscount = product ? computeDiscountPercent(product) : null;
  const priceStats = useMemo(() => {
    if (priceHistory.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const min = Math.min(...priceHistory.map((point) => point.price));
    const max = Math.max(...priceHistory.map((point) => point.price));
    const avg = priceHistory.reduce((sum, point) => sum + point.price, 0) / priceHistory.length;
    return { min, max, avg };
  }, [priceHistory]);

  useEffect(() => {
    if (!product) {
      return;
    }

    analyticsService.track({
      name: 'product_view',
      timestamp: new Date().toISOString(),
      payload: {
        productId: product.id,
        productSlug: product.slug,
      },
    });
  }, [product]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Link to="/" className="text-accent hover:underline">Volver al inicio</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbs = [
    { label: category?.name || '', href: `/categoria/${category?.slug}` },
    ...(subcategory ? [{ label: subcategory.name, href: `/categoria/${category?.slug}/${subcategory.slug}` }] : []),
    { label: product.name },
  ];

  const galleryImages = product.images.filter(Boolean);
  const hasMultipleImages = galleryImages.length > 1;
  const clampedImageIndex = Math.min(selectedImageIndex, Math.max(0, galleryImages.length - 1));
  const selectedImage = galleryImages[clampedImageIndex] || PRODUCT_IMAGE_FALLBACK;
  const visibleSpecs = showAllSpecs ? product.specs : product.specs.slice(0, 4);

  const goToPrevImage = () => {
    if (!hasMultipleImages) {
      return;
    }

    setSelectedImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToNextImage = () => {
    if (!hasMultipleImages) {
      return;
    }

    setSelectedImageIndex((current) => (current + 1) % galleryImages.length);
  };

  const copyProductLink = async () => {
    try {
      if (typeof window === 'undefined' || !window.location?.href) {
        throw new Error('missing_window_location');
      }

      await navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const isOfferDirectUrlSafe = (offerUrl: string, merchantUrl: string): boolean => {
    const merchantDomain = extractDomainFromAffiliateUrl(merchantUrl);
    return isAffiliateUrlAllowed(offerUrl, merchantDomain || undefined);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto overflow-x-hidden px-4">
          <Breadcrumb items={breadcrumbs} />

          {/* Product main */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="bg-secondary/30 rounded-2xl p-8 flex items-center justify-center aspect-square relative overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={`${product.name} - imagen ${clampedImageIndex + 1}`}
                    className="h-full w-full object-contain rounded-lg"
                    onError={(event) => applyProductImageFallback(event.currentTarget)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-secondary/60 text-sm text-muted-foreground">
                    No hay imagen disponible
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-4 h-9 w-9 rounded-full bg-background/90"
                      aria-label="Compartir producto"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => { void copyProductLink(); }}>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Copiar enlace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {hasMultipleImages ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/90"
                      onClick={goToPrevImage}
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-background/90"
                      onClick={goToNextImage}
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}

                {realDiscount && realDiscount > 0 && realDiscount <= 60 && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-deal text-deal-foreground text-sm font-bold">
                    <TrendingDown className="w-4 h-4" />-{realDiscount}%
                  </span>
                )}
                {!realDiscount && product.originalPrice && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-deal text-deal-foreground text-sm font-bold">
                    Oferta
                  </span>
                )}
              </div>

              {hasMultipleImages ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${index === clampedImageIndex ? 'border-accent shadow-sm' : 'border-border hover:border-accent/60'}`}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      <img
                        src={image || PRODUCT_IMAGE_FALLBACK}
                        alt={`${product.name} miniatura ${index + 1}`}
                        className="h-full w-full object-contain p-1"
                        onError={(event) => applyProductImageFallback(event.currentTarget)}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Info */}
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3 break-words">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount} opiniones)</span>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 rounded-xl bg-card border border-border">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">Mejor precio desde</span>
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-bold text-foreground">{product.minPrice.toFixed(2).replace('.', ',')} €</span>
                  {product.originalPrice && product.originalPrice > product.minPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">{product.originalPrice.toFixed(2).replace('.', ',')} €</span>
                      <span className="px-2 py-0.5 rounded-md bg-deal text-deal-foreground text-xs font-bold">
                        Ahorras {(product.originalPrice - product.minPrice).toFixed(2).replace('.', ',')} €
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> {offers.length} ofertas disponibles
                </p>

                {/* Price analysis label */}
                {priceAnalysis && (
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                    priceAnalysis.type === 'low' ? 'bg-deal/10 text-deal' :
                    priceAnalysis.type === 'high' ? 'bg-destructive/10 text-destructive' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {priceAnalysis.type === 'low' && <TrendingDown className="w-3 h-3" />}
                    {priceAnalysis.type === 'high' && <TrendingUp className="w-3 h-3" />}
                    {priceAnalysis.type === 'stable' && <Minus className="w-3 h-3" />}
                    {priceAnalysis.label}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

              {/* Specs */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Especificaciones</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {visibleSpecs.map((spec, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-secondary/50 text-sm min-w-0">
                      <span className="text-muted-foreground min-w-0 break-words">{spec.label}</span>
                      <span className="font-medium text-foreground min-w-0 break-words text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
                {product.specs.length > 4 && (
                  <button onClick={() => setShowAllSpecs(!showAllSpecs)} className="mt-2 text-sm text-accent hover:underline flex items-center gap-1">
                    {showAllSpecs ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Ver todas las especificaciones</>}
                  </button>
                )}
              </div>

              {/* Alert CTA */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-accent text-accent font-semibold hover:bg-accent/10 transition-colors">
                <Bell className="w-4 h-4" />
                Crear alerta de precio
              </button>
            </div>
          </div>

          {/* Offers comparison */}
          <section className="mb-12">
            <h3 className="font-display text-xl font-bold text-foreground mb-5 flex items-center gap-2">
              <Tag className="w-5 h-5 text-accent" /> Comparar ofertas ({offers.length} tiendas)
            </h3>
            <div className="space-y-3">
              {offers.map((offer, i) => {
                const directUrlSafe = isOfferDirectUrlSafe(offer.url, offer.merchant.url);
                const finalHref = useRedirectApi
                  ? `/api/redirect?offerId=${encodeURIComponent(offer.id)}`
                  : directUrlSafe
                    ? offer.url
                    : "#";

                return (
                <div key={offer.id} className={`group flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-xl border transition-all hover:shadow-card ${
                  i === 0 ? 'border-deal bg-deal/5 shadow-sm' : 'border-border bg-card hover:border-accent/30'
                } gap-4`}>
                  {/* Merchant info with logo */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <MerchantLogo merchant={offer.merchant} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">{offer.merchant.name}</h4>
                        {i === 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-deal text-deal-foreground text-[10px] font-bold uppercase tracking-wide">
                            Mejor precio
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          {offer.merchant.rating}
                        </span>
                        {offer.merchant.trusted && (
                          <span className="flex items-center gap-0.5 text-deal">
                            <ShieldCheck className="w-3 h-3" /> Verificada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping & stock info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    {offer.freeShipping && (
                      <span className="flex items-center gap-1 text-deal font-medium">
                        <Truck className="w-3.5 h-3.5" /> Envío gratis
                      </span>
                    )}
                    {offer.fastShipping && !offer.freeShipping && (
                      <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Envío rápido</span>
                    )}
                    {!offer.inStock && <span className="text-destructive font-medium">Sin stock</span>}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex w-full flex-wrap items-center justify-between gap-3 md:w-auto md:flex-nowrap md:justify-end md:gap-6">
                    <div className="text-left md:text-right min-w-0">
                      <div className={`text-xl font-bold ${i === 0 ? 'text-deal' : 'text-foreground'}`}>
                        {offer.price.toFixed(2).replace('.', ',')} €
                      </div>
                      {offer.shippingCost > 0 && (
                        <span className="text-xs text-muted-foreground">+ {offer.shippingCost.toFixed(2).replace('.', ',')} € envío</span>
                      )}
                      {offer.freeShipping && offer.shippingCost === 0 && (
                        <span className="text-xs text-deal font-medium">Envío incluido</span>
                      )}
                    </div>

                    <a
                      href={finalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => {
                        if (!useRedirectApi && !directUrlSafe) {
                          event.preventDefault();
                          toast.error('La oferta tiene un enlace invalido para esta tienda y fue bloqueada por seguridad');
                          return;
                        }

                        analyticsService.track({
                          name: 'offer_click',
                          timestamp: new Date().toISOString(),
                          payload: {
                            productId: product.id,
                            offerId: offer.id,
                            merchantId: offer.merchantId,
                          },
                        });

                        if (!useRedirectApi) {
                          void offerService.trackClick(product.id, offer.merchantId);
                        }
                      }}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        i === 0
                          ? 'bg-accent text-accent-foreground hover:opacity-90 shadow-glow'
                          : 'bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      Ver oferta <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                );
              })}
            </div>
          </section>

          {/* Price history */}
          <section className="mb-12">
            <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-accent" /> Historial de precios
            </h3>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(2)} €`, 'Precio']} labelFormatter={(l) => `Fecha: ${new Date(l).toLocaleDateString('es-ES')}`} />
                    <Line type="monotone" dataKey="price" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <div className="px-3 py-1.5 rounded-lg bg-deal/10 text-deal font-medium">
                  Mín: {priceStats.min.toFixed(2)} €
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground">
                  Máx: {priceStats.max.toFixed(2)} €
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground">
                  Media: {priceStats.avg.toFixed(2)} €
                </div>
                {priceAnalysis && (
                  <div className={`px-3 py-1.5 rounded-lg font-medium ${
                    priceAnalysis.type === 'low' ? 'bg-deal/10 text-deal' :
                    priceAnalysis.type === 'high' ? 'bg-destructive/10 text-destructive' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {priceAnalysis.label}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Long description */}
          <section className="mb-12 max-w-3xl">
            <h3 className="font-display text-xl font-bold text-foreground mb-3">Descripción</h3>
            <p className="text-muted-foreground leading-relaxed break-words">{product.longDescription}</p>
          </section>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <ProductGrid products={relatedProducts} title="Productos relacionados" subtitle="Otros productos que te pueden interesar" />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;
