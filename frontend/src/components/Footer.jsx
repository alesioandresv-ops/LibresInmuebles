import { Home, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.9 2h3.7l-8.1 9.3L24 22h-7.5l-5.9-7.7L3.8 22H.1l8.7-9.9L0 2h7.7l5.3 7 5.9-7Z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", icon: InstagramIcon },
  { label: "Facebook", icon: FacebookIcon },
  { label: "X (Twitter)", icon: XIcon },
];

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100">
      <div className="app-container grid gap-10 py-12 md:grid-cols-3 md:py-16">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
              <Home size={20} strokeWidth={2.2} />
            </span>
            <span className="text-lg font-bold text-white">
              Libre<span className="text-accent-400">Inmuebles</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">
            Publicá y buscá inmuebles en Paso de los Libres conectando dueños directos con interesados, sin
            intermediarios ni comisiones.
          </p>
        </div>

        <nav aria-label="Enlaces del sitio" className="md:justify-self-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Secciones</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link to="/" className="transition hover:text-white">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/publicar" className="transition hover:text-white">
                Publicar inmueble
              </Link>
            </li>
            <li>
              <Link to="/legal" className="transition hover:text-white">
                Modelos de contratos
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:justify-self-end">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Paso de los Libres, Corrientes</h3>
          <p className="mt-4 flex items-center gap-2 text-sm text-brand-200">
            <MapPin size={16} className="text-accent-400" />
            Paso de los Libres, Corrientes, Argentina
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-brand-200">
            <Mail size={16} className="text-accent-400" />
            contacto@libreinmuebles.com
          </p>
          <div className="mt-5 flex items-center gap-3">
            {SOCIALS.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-brand-100 transition hover:bg-brand-600 hover:text-white"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="app-container flex flex-col items-center justify-between gap-3 py-5 text-xs text-brand-300 sm:flex-row">
          <p>© {new Date().getFullYear()} LibreInmuebles — Dueño Directo</p>
          <nav className="flex items-center gap-5">
            <a href="#" className="transition hover:text-white">
              Términos y condiciones
            </a>
            <a href="#" className="transition hover:text-white">
              Política de privacidad
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}