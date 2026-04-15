import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-10">
        <Breadcrumb items={[{ label: "Política de cookies" }]} />

        <article className="mx-auto mt-4 max-w-4xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">POLÍTICA DE COOKIES</h1>
          <p className="mt-1 text-sm text-muted-foreground">https://homara.es</p>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas una página web.
              Permiten que el sitio recuerde información sobre tu visita para facilitar la navegación, mejorar la experiencia
              de usuario y obtener estadísticas de uso.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">2. Tipos de cookies utilizadas</h2>
            <p>En Homara utilizamos las siguientes categorías de cookies:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-foreground">Cookies necesarias:</span> imprescindibles para el
                funcionamiento técnico del sitio web.
              </li>
              <li>
                <span className="font-medium text-foreground">Cookies de analítica:</span> nos permiten medir y analizar
                el uso de la web para mejorar funcionalidades y contenido.
              </li>
              <li>
                <span className="font-medium text-foreground">Cookies de marketing:</span> destinadas a futuras funciones de
                personalización y comunicación comercial.
              </li>
            </ul>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">3. Base jurídica del tratamiento</h2>
            <p>
              El uso de cookies necesarias se basa en el interés legítimo y en la necesidad técnica de prestar el servicio.
              El uso de cookies de analítica y marketing se basa en el consentimiento del usuario, de conformidad con el RGPD
              y la normativa española aplicable.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">4. Gestión y configuración de cookies</h2>
            <p>
              Al acceder por primera vez al sitio, puedes aceptar, rechazar o configurar el uso de cookies opcionales.
              Puedes modificar tu elección en cualquier momento desde el panel de configuración de cookies disponible en el sitio.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">5. Conservación de la preferencia</h2>
            <p>
              Homara almacena tu preferencia de consentimiento para respetar tu elección en visitas posteriores, salvo que
              borres los datos de navegación o cambies la configuración manualmente.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">6. Información adicional</h2>
            <p>
              Para más información sobre el tratamiento de datos personales, puedes consultar la Política de Privacidad y el
              Aviso Legal del sitio web.
            </p>
          </section>

          <section className="mt-8 space-y-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              El sitio web podrá utilizar herramientas de análisis como Google Analytics para mejorar la experiencia del usuario.
              Estas herramientas solo se activarán tras el consentimiento del usuario.
            </p>
            <p>
              El usuario puede configurar, aceptar o rechazar el uso de cookies en cualquier momento a través del panel de
              configuración disponible en el sitio web.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
