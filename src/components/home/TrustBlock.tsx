import { Shield, Clock, Store, TrendingDown, Award, Users } from 'lucide-react';

const badges = [
  { icon: <Store className="w-5 h-5" />, label: '+200 tiendas', desc: 'verificadas' },
  { icon: <TrendingDown className="w-5 h-5" />, label: 'Ahorra hasta 40%', desc: 'en cada compra' },
  { icon: <Clock className="w-5 h-5" />, label: 'Actualizado', desc: 'cada 24h' },
  { icon: <Shield className="w-5 h-5" />, label: '100% seguro', desc: 'y gratuito' },
  { icon: <Users className="w-5 h-5" />, label: '+50.000', desc: 'usuarios' },
  { icon: <Award className="w-5 h-5" />, label: 'Independiente', desc: 'y objetivo' },
];

const TrustBlock = () => (
  <section className="py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {badges.map((b, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-card">
            <div className="text-accent mb-2">{b.icon}</div>
            <span className="font-bold text-sm text-foreground">{b.label}</span>
            <span className="text-xs text-muted-foreground">{b.desc}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBlock;
