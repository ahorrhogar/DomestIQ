import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { Shield, TrendingDown, Store, Users, Award, Search, BarChart3, Heart, Zap } from 'lucide-react';

const AboutPage = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <div className="container mx-auto px-4">
        <Breadcrumb items={[{ label: 'Acerca de Homara' }]} />

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Homara — tu comparador de precios de hogar
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Somos el comparador de precios especializado en productos para el hogar más completo de España.
            Nuestra misión es ayudarte a encontrar el mejor precio para tu hogar, comparando ofertas de más de 200 tiendas online.
          </p>
        </div>

        {/* What we do */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">¿Qué hacemos?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <Search className="w-7 h-7" />, title: 'Comparamos precios', desc: 'Analizamos y comparamos precios de muebles, electrodomésticos, decoración, cocina, jardín y más entre las principales tiendas de España.' },
              { icon: <BarChart3 className="w-7 h-7" />, title: 'Historial de precios', desc: 'Te mostramos la evolución del precio de cada producto para que sepas cuándo es el mejor momento para comprar.' },
              { icon: <Heart className="w-7 h-7" />, title: 'Alertas de precio', desc: 'Configura alertas y te avisamos cuando el producto que buscas alcance el precio que tú elijas.' },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">{item.icon}</div>
                <h3 className="font-display font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Numbers */}
        <section className="mb-16 bg-gradient-hero rounded-2xl p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-primary-foreground mb-8">Homara en números</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '+15.000', label: 'Productos comparados' },
              { num: '+200', label: 'Tiendas analizadas' },
              { num: '+50.000', label: 'Usuarios mensuales' },
              { num: '40%', label: 'Ahorro medio' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-accent mb-1">{s.num}</div>
                <div className="text-sm text-primary-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Nuestros valores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: <Shield className="w-6 h-6" />, title: 'Transparencia', desc: 'Mostramos precios reales y actualizados sin ningún coste oculto.' },
              { icon: <Award className="w-6 h-6" />, title: 'Independencia', desc: 'No favorecemos a ninguna tienda. El orden se basa en precio y relevancia.' },
              { icon: <Users className="w-6 h-6" />, title: 'Usuarios primero', desc: 'Cada decisión de producto se toma pensando en la experiencia del usuario.' },
              { icon: <Zap className="w-6 h-6" />, title: 'Innovación', desc: 'Mejoramos constantemente con nuevas herramientas como nuestro Asistente de Compras.' },
            ].map((v, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <div className="text-accent mb-3">{v.icon}</div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How we work */}
        <section className="mb-16 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">¿Cómo funcionamos?</h2>
          <div className="prose prose-sm text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">Homara</strong> es un comparador de precios independiente. No vendemos productos directamente.
              Nuestro servicio consiste en recopilar, organizar y comparar ofertas de las principales tiendas online de España para que tú puedas
              encontrar el mejor precio sin esfuerzo.
            </p>
            <p>
              Cuando encuentras una oferta que te interesa, te redirigimos a la tienda oficial donde puedes completar tu compra.
              Recibimos una pequeña comisión de algunas tiendas asociadas, lo que nos permite mantener el servicio 100% gratuito para ti.
            </p>
            <p>
              Actualizamos los precios diariamente y mantenemos un historial de precios de hasta 12 meses para cada producto,
              para que puedas tomar decisiones de compra informadas.
            </p>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default AboutPage;