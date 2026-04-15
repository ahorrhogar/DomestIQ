import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingDown } from 'lucide-react';

const HERO_MASCOT_IMAGE = '/homara-mascot.png';

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-hero">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full border border-primary-foreground/10 animate-orbit opacity-30" />
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full border border-primary-foreground/5" />
      <div className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full bg-accent/40 animate-float" />
      <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '2s' }} />
    </div>

    <div className="container mx-auto px-4 py-8 md:py-14 lg:py-20 relative z-10">
      <div className="grid items-center gap-5 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,520px)] lg:gap-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm mb-4 md:mb-5 animate-fade-in">
            <TrendingDown className="w-4 h-4 text-accent" />
            Más de 15.000 productos comparados en tiempo real
          </div>

          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-4 md:mb-5 animate-slide-up">
            El mejor precio para
            <span className="block text-accent">tu hogar</span>
          </h2>

          <div className="relative mx-auto mb-4 w-full max-w-[240px] sm:max-w-[280px] lg:hidden animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <img
              src={HERO_MASCOT_IMAGE}
              alt="Mascota de Homara"
              className="mx-auto w-full max-h-[220px] sm:max-h-[250px] object-contain drop-shadow-[0_18px_24px_rgba(5,18,49,0.24)]"
              loading="eager"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/homara-logo.svg';
              }}
            />
          </div>

          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-5 md:mb-7 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Compara precios de muebles, electrodomésticos, decoración y más entre las mejores tiendas de España. Ahorra hasta un 40% en cada compra.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/categoria/muebles" className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-base hover:opacity-90 transition-all shadow-glow">
              Empezar a comparar
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/asistente" className="inline-flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 rounded-xl bg-primary-foreground/10 text-primary-foreground font-semibold text-base hover:bg-primary-foreground/20 transition-all border border-primary-foreground/20">
              <Sparkles className="w-4 h-4" />
              Asistente de Compras
            </Link>
          </div>

          <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-4 md:gap-6 text-primary-foreground/60 text-xs sm:text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <span className="flex items-center gap-1.5">✓ 100% gratuito</span>
            <span className="flex items-center gap-1.5">✓ Sin registro</span>
            <span className="flex items-center gap-1.5">✓ +200 tiendas</span>
            <span className="flex items-center gap-1.5">✓ Actualizado diariamente</span>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[520px] animate-fade-in lg:block" style={{ animationDelay: '0.15s' }}>
          <div className="absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-primary-foreground/20" />
          <div className="absolute -right-6 top-8 h-36 w-36 rounded-full border border-primary-foreground/15" />
          <img
            src={HERO_MASCOT_IMAGE}
            alt="Mascota de Homara"
            className="relative z-10 mx-auto w-full max-h-[520px] object-contain drop-shadow-[0_22px_28px_rgba(5,18,49,0.28)] lg:origin-bottom lg:scale-110"
            loading="eager"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/homara-logo.svg';
            }}
          />
        </div>
      </div>
    </div>
  </section>
);

export default Hero;