import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-10">
        <Breadcrumb items={[{ label: 'Aviso legal y condiciones de uso' }]} />

        <article className="mx-auto mt-4 max-w-4xl rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">AVISO LEGAL Y CONDICIONES GENERALES DE USO</h1>
          <p className="mt-1 text-sm text-muted-foreground">https://homara.es</p>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">I. Informacion general</h2>
            <p>
              En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Informacion y del Comercio Electronico
              (LSSI-CE), se informa de los siguientes datos identificativos del titular del sitio web Homara.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-foreground">Titular:</span> Lucas Alvarez
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

          <section id="condiciones-generales-de-uso" className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">II. Terminos y condiciones generales de uso</h2>
            <p>
              El objeto de estas condiciones es regular el acceso, navegacion y uso del sitio web, asi como las responsabilidades
              derivadas de la utilizacion de sus contenidos y servicios.
            </p>
            <p>
              El acceso a Homara es, con caracter general, libre y gratuito para los usuarios, sin perjuicio del coste de conexion
              a internet que aplique su proveedor.
            </p>
            <p>
              La navegacion por este sitio atribuye la condicion de usuario e implica la aceptacion plena de estas condiciones.
              Homara podra modificar en cualquier momento, y sin aviso previo, la presentacion, configuracion y contenido del sitio.
            </p>
            <p>
              El usuario se compromete a hacer un uso adecuado de la informacion y servicios, conforme a la ley, la buena fe, el
              orden publico y el respeto de derechos de terceros.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">III. Acceso y navegacion: exclusion de garantias y responsabilidad</h2>
            <p>
              Homara no garantiza la disponibilidad continua del sitio web ni la ausencia de errores. Se realizaran todos los
              esfuerzos razonables para asegurar su correcto funcionamiento.
            </p>
            <p>
              Homara no sera responsable de danos derivados del uso del sitio web, incluyendo, sin limitacion, interrupciones,
              fallos tecnicos, introduccion de virus o incidencias en telecomunicaciones ajenas a su control.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">IV. Politica de enlaces</h2>
            <p>
              Este sitio puede ofrecer enlaces a paginas de terceros para facilitar el acceso a informacion externa. Homara no
              comercializa ni controla directamente esos contenidos y no asume responsabilidad por su disponibilidad, legalidad,
              veracidad o calidad.
            </p>
            <p>
              Queda prohibida la reproduccion total o parcial de contenidos del sitio sin autorizacion expresa del titular,
              incluyendo su uso comercial.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">V. Propiedad intelectual e industrial</h2>
            <p>
              Homara y/o su titular son propietarios o licenciatarios de todos los derechos de propiedad intelectual e industrial
              sobre los contenidos del sitio web (textos, imagenes, diseno, codigo, marcas y otros elementos).
            </p>
            <p>
              Se permite la visualizacion y copia para uso exclusivamente personal y privado. Cualquier reproduccion, distribucion,
              comunicacion publica o transformacion con fines comerciales requerira autorizacion previa y por escrito.
            </p>
          </section>

          <section className="mt-8 space-y-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
            <h2 className="font-display text-lg font-semibold text-foreground">VI. Acciones legales, legislacion aplicable y jurisdiccion</h2>
            <p>
              Homara se reserva el derecho de ejercitar las acciones civiles o penales que procedan ante cualquier uso indebido del
              sitio web o incumplimiento de estas condiciones.
            </p>
            <p>
              La relacion entre el usuario y Homara se regira por la normativa espanola vigente. Cualquier controversia se sometera
              a los juzgados y tribunales que correspondan conforme a derecho.
            </p>
            <p>Ultima actualizacion: 19/04/2026.</p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
