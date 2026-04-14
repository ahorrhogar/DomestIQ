import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useState } from 'react';
import { Sparkles, ArrowRight, Search, Star, Award, DollarSign } from 'lucide-react';
import type { AssistantPriority, AssistantResult } from '@/domain/catalog/types';
import { Link } from 'react-router-dom';
import { analyticsService, categoryService, productService } from '@/services';

const styles = productService.getFilterMetadata(productService.getAllProducts()).styles;
const priorities = [
  { value: 'price' as AssistantPriority, label: 'Mejor precio', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'quality' as AssistantPriority, label: 'Mejor calidad', icon: <Award className="w-4 h-4" /> },
  { value: 'design' as AssistantPriority, label: 'Mejor diseño', icon: <Star className="w-4 h-4" /> },
  { value: 'balanced' as AssistantPriority, label: 'Equilibrado', icon: <Sparkles className="w-4 h-4" /> },
];

const tagLabels: Record<string, { label: string; className: string }> = {
  'best-value': { label: '💎 Mejor calidad-precio', className: 'bg-accent/10 text-accent' },
  'cheapest': { label: '💰 Opción económica', className: 'bg-deal/10 text-deal' },
  'premium': { label: '⭐ Opción premium', className: 'bg-primary/10 text-primary' },
  'recommended': { label: '🏆 Recomendado', className: 'bg-accent/10 text-accent' },
};

const AssistantPage = () => {
  const categories = categoryService.getAllCategories();
  const [budget, setBudget] = useState(500);
  const [categoryId, setCategoryId] = useState('');
  const [style, setStyle] = useState('');
  const [priority, setPriority] = useState<AssistantPriority>('balanced');
  const [results, setResults] = useState<AssistantResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const nextResults = productService.getAssistantRecommendations({
      budget,
      categoryId: categoryId || undefined,
      style: style || undefined,
      priority,
    }, 10);

    analyticsService.track({
      name: 'assistant_search',
      timestamp: new Date().toISOString(),
      payload: {
        budget,
        categoryId: categoryId || 'all',
        priority,
        style: style || 'any',
        results: nextResults.length,
      },
    });

    setResults(nextResults);
    setSearched(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Asistente de Compras' }]} />

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Asistente de Compras</h1>
            <p className="text-muted-foreground">Cuéntanos qué necesitas y te recomendamos los mejores productos según tu presupuesto y preferencias.</p>
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Presupuesto máximo (€)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(+e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  min={10}
                  max={10000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Categoría</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50">
                  <option value="">Todas las categorías</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.productCount})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Estilo preferido</label>
                <div className="flex flex-wrap gap-2">
                  {styles.map(s => (
                    <button key={s} onClick={() => setStyle(style === s ? '' : s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${style === s ? 'border-accent bg-accent/10 text-accent shadow-sm' : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">¿Qué priorizas?</label>
                <div className="grid grid-cols-2 gap-2">
                  {priorities.map(p => (
                    <button key={p.value} onClick={() => setPriority(p.value)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${priority === p.value ? 'border-accent bg-accent/10 text-accent shadow-sm' : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground'}`}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSearch} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all shadow-glow">
                <Search className="w-4 h-4" /> Buscar recomendaciones
              </button>
            </div>
          </div>

          {/* Results */}
          {searched && (
            <div className="max-w-4xl mx-auto mb-16 animate-slide-up">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">
                {results.length > 0 ? `Top ${results.length} recomendaciones para ti` : 'No encontramos resultados'}
              </h3>

              {results.length === 0 && (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <p className="text-muted-foreground mb-2">No hay productos que encajen con tu presupuesto y filtros.</p>
                  <p className="text-sm text-muted-foreground">Prueba a aumentar el presupuesto o cambiar la categoría.</p>
                </div>
              )}

              <div className="space-y-4">
                {results.map((r, i) => (
                  <div key={r.product.id} className={`group flex flex-col md:flex-row gap-4 p-4 rounded-2xl border transition-all hover:shadow-card ${i === 0 ? 'border-accent bg-accent/5' : 'border-border bg-card hover:border-accent/30'}`}>
                    <div className="flex-shrink-0 w-24 h-24 bg-secondary/50 rounded-xl overflow-hidden">
                      <img src={r.product.images[0]} alt={r.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          {r.tag && tagLabels[r.tag] && (
                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold mb-1 ${tagLabels[r.tag].className}`}>
                              {tagLabels[r.tag].label}
                            </span>
                          )}
                          <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">{r.product.name}</h4>
                          <p className="text-xs text-muted-foreground">{r.product.brand}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-foreground">{r.product.minPrice.toFixed(2).replace('.', ',')} €</div>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-accent text-accent" />
                            <span className="text-xs font-medium">{r.product.rating}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{r.reason}</p>
                      <div className="mt-2">
                        <Link to={`/producto/${r.product.slug}`} className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
                          Ver producto <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AssistantPage;
