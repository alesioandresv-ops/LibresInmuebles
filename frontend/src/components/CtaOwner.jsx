import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./CtaOwner.css";

export default function CtaOwner() {
  return (
    <section aria-label="Publicá tu inmueble" className="app-container px-4 py-12 sm:px-6 md:py-16">
      <div className="cta-libre relative overflow-hidden rounded-2xl px-6 py-10 shadow-card md:px-12 md:py-12">
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="cta-libre__content">
            <h2 className="text-2xl font-bold text-white md:text-3xl">¿Tenés un inmueble para publicar?</h2>
            <p className="mt-2 max-w-xl text-sm text-brand-100 md:text-base">
              Publicá gratis, tratá directo con los interesados y sin pagar comisiones.
            </p>
          </div>
          <Link
            to="/publicar"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50 hover:shadow-md"
          >
            Publicar mi inmueble
            <ArrowRight size={18} strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </section>
  );
}