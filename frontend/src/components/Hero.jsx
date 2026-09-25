import { MapPin } from "lucide-react";
import { HERO_IMAGE } from "../config/images.js";
import HeroSearch from "./HeroSearch.jsx";

export default function Hero({ filters, onChange, onSearch }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900" aria-label="Buscá tu inmueble">
      <img src={HERO_IMAGE} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/45"
        aria-hidden
      />
      <div className="app-container relative z-10 flex flex-col items-center pb-20 pt-10 text-center md:pb-24 md:pt-14">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
          <MapPin size={14} className="text-accent-300" />
          Paso de los Libres, Corrientes
        </p>
        <h1 className="mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] font-extrabold leading-tight text-white [text-shadow:0_2px_10px_rgba(11,49,87,0.65)]">
          Encontrá tu próximo lugar
          <span className="block text-accent-400 [text-shadow:0_2px_12px_rgba(11,49,87,0.8)]">EN PASO DE LOS LIBRES</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/90 [text-shadow:0_1px_6px_rgba(11,49,87,0.6)] md:text-base">
          Alquilar, comprar o vender directo con el dueño. Sin intermediarios, sin comisiones.
        </p>
        <div className="mt-8 w-full max-w-[960px] text-left">
          <HeroSearch filters={filters} onChange={onChange} onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}