import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-10">
        <Breadcrumb items={[{ label: 'Politica de privacidad' }]} />

        <article className="mx-auto mt-4 max-w-4xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">POLITICA DE PRIVACIDAD</h1>
          <p className="mt-1 text-sm text-muted-foreground">https://homara.es</p>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">I. Politica de privacidad y proteccion de datos</h2>
            <p>
              En cumplimiento de la normativa vigente, Homara se compromete a adoptar las medidas tecnicas y organizativas
              necesarias para garantizar un nivel de seguridad adecuado al riesgo de los datos personales tratados.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Leyes que incorpora esta politica de privacidad</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Reglamento (UE) 2016/679 (RGPD).</li>
              <li>Ley Organica 3/2018, de Proteccion de Datos Personales y garantia de los derechos digitales (LOPD-GDD).</li>
              <li>Real Decreto 1720/2007, de desarrollo de la LOPD.</li>
              <li>Ley 34/2002, de Servicios de la Sociedad de la Informacion y de Comercio Electronico (LSSI-CE).</li>
            </ul>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Identidad del responsable del tratamiento</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-foreground">Responsable:</span> Lucas Alvarez (titular de Homara)
              </li>
              <li>
                <span className="font-medium text-foreground">NIF:</span> 20562014Z
              </li>
              <li>
                <span className="font-medium text-foreground">Direccion:</span> Paseo De La Marina 27, Castelldefels, Barcelona
              </li>
              <li>
                <span className="font-medium text-foreground">Telefono:</span> 644956232
              </li>
              <li>
                <span className="font-medium text-foreground">Email:</span> lucasalvarezblancob@gmail.com
              </li>
            </ul>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Registro y principios aplicables</h2>
            <p>
              Los datos personales recabados por Homara a traves de formularios se incorporan a un registro de actividades de
              tratamiento para facilitar la gestion de consultas, solicitudes y la relacion con el usuario.
            </p>
            <p>
              Se aplican los principios de licitud, lealtad y transparencia; limitacion de la finalidad; minimizacion de datos;
              exactitud; limitacion del plazo de conservacion; integridad y confidencialidad; y responsabilidad proactiva.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Categorias de datos y base legal</h2>
            <p>
              Homara trata principalmente datos identificativos y de contacto. La base juridica principal del tratamiento es el
              consentimiento del usuario, que puede retirarse en cualquier momento.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Finalidades del tratamiento</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Atender consultas, solicitudes y comunicaciones del usuario.</li>
              <li>Gestionar la relacion derivada del uso de formularios o canales de contacto.</li>
              <li>Mejorar la calidad, funcionamiento y navegacion del sitio web.</li>
              <li>Realizar analisis estadistico y operativo del uso del sitio web.</li>
            </ul>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Plazo de conservacion</h2>
            <p>
              Los datos personales se conservaran durante el tiempo minimo necesario para cumplir la finalidad para la que fueron
              recabados y, en todo caso, por un plazo orientativo maximo de 18 meses, salvo obligacion legal distinta o ejercicio
              de derechos por parte del interesado.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Destinatarios y menores de edad</h2>
            <p>
              Con caracter general, no se comunican datos personales a terceros, salvo obligacion legal o cuando sea necesario para
              prestar servicios vinculados al funcionamiento del sitio web. En caso de transferencias internacionales, se informara
              de forma previa y transparente.
            </p>
            <p>
              Solo los mayores de 14 anos pueden consentir validamente el tratamiento de sus datos personales. Para menores de 14
              anos, sera necesario el consentimiento de padres o tutores.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Seguridad y confidencialidad</h2>
            <p>
              Homara aplica medidas de seguridad orientadas a evitar la alteracion, perdida, tratamiento o acceso no autorizado a
              los datos personales. Asimismo, se utiliza cifrado SSL en las comunicaciones con el sitio web.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Derechos de las personas usuarias</h2>
            <p>
              Puedes ejercer tus derechos de acceso, rectificacion, supresion, limitacion del tratamiento, portabilidad, oposicion
              y a no ser objeto de decisiones automatizadas mediante comunicacion escrita con referencia RGPD a la direccion o correo
              del responsable.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Direccion postal: Paseo De La Marina 27, Castelldefels, Barcelona.</li>
              <li>Email: lucasalvarezblancob@gmail.com</li>
            </ul>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">Enlaces externos y reclamaciones</h2>
            <p>
              Este sitio puede incluir enlaces a paginas de terceros. Homara no es responsable de las politicas de privacidad ni de
              las practicas de tratamiento de datos de dichos sitios.
            </p>
            <p>
              Si consideras que existe una infraccion en materia de proteccion de datos, puedes presentar una reclamacion ante la
              Agencia Espanola de Proteccion de Datos (AEPD):
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-accent hover:underline"
              >
                https://www.aepd.es
              </a>
              .
            </p>
          </section>

          <section className="mt-8 space-y-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">II. Aceptacion y cambios de esta politica</h2>
            <p>
              El uso de Homara implica la aceptacion de esta Politica de Privacidad. Esta politica puede actualizarse por cambios
              legales, jurisprudenciales o de criterio de la autoridad de control. Se recomienda su revision periodica.
            </p>
            <p>Ultima actualizacion: 19/04/2026.</p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
