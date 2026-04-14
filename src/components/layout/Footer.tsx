import { Link } from 'react-router-dom';
import { categoryService } from '@/services';

const Footer = () => {
  const categories = categoryService.getAllCategories();

  return (
    <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <h2 className="font-display text-xl font-bold mb-3">
            <span className="text-primary-foreground">Domest</span>
            <span className="text-accent">IQ</span>
          </h2>
          <p className="text-sm text-primary-foreground/70 leading-relaxed">
            El comparador de precios especializado en hogar para España. Ahorra tiempo y dinero en tus compras.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Categorías</h3>
          <ul className="space-y-1.5">
            {categories.slice(0, 6).map(c => (
              <li key={c.id}><Link to={`/categoria/${c.slug}`} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Más categorías</h3>
          <ul className="space-y-1.5">
            {categories.slice(6).map(c => (
              <li key={c.id}><Link to={`/categoria/${c.slug}`} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Información</h3>
          <ul className="space-y-1.5">
            <li><Link to="/acerca-de" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Acerca de DomestIQ</Link></li>
            <li><a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Cómo funciona</a></li>
            <li><a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Blog</a></li>
            <li><a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Contacto</a></li>
            <li><a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Prensa</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-3 text-primary-foreground/90">Legal</h3>
          <ul className="space-y-1.5">
            <li><a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Política de privacidad</a></li>
            <li><a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Aviso legal</a></li>
            <li><a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Cookies</a></li>
            <li><a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">Condiciones de uso</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
        <p>© {new Date().getFullYear()} DomestIQ. Todos los derechos reservados.</p>
        <p>Los precios y disponibilidad pueden variar. DomestIQ no vende productos directamente.</p>
      </div>
    </div>
    </footer>
  );
};

export default Footer;