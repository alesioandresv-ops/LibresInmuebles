import { useEffect, useState } from "react";
import { ArrowRight, Building2, Home, LandPlot, Store } from "lucide-react";
import { searchProperties } from "../api/properties.js";
import { CATEGORY_IMAGES } from "../config/images.js";
import { TYPE_LABELS } from "../constants.js";

const CATEGORIES = [
  { type: "casa", icon: Home },
  { type: "departamento", icon: Building2 },
  { type: "terreno", icon: LandPlot },
  { type: "salon_comercial", icon: Store },
];

export default function CategoryGrid({ onSelectType }) {
  const [counts, setCounts] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all(
      CATEGORIES.map(({ type }) =>
        searchProperties({ property_type: type, limit: 1 })
          .then((res) => ({ type, total: res.total }))
          .catch(() => ({ type, total: 0 }))
      )
    ).then((results) => {
      if (!active) return;
      const next = {};
      results.forEach(({ type, total }) => {
        next[type] = total;
      });
      setCounts(next);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section aria-label="Categorías de inmuebles" className="app-container py-12 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Explorá por categoría</h2>
          <p className="mt-2 text-sm text-slate-500">Alquileres y ventas en toda la ciudad, separados por tipo.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4">
        {CATEGORIES.map(({ type, icon: Icon }) => {
          const count = counts[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectType(type)}
              className="group relative overflow-hidden rounded-xl text-left shadow-card transition hover:shadow-card-hover focus-visible:outline-2"
            >
              <img
                src={CATEGORY_IMAGES[type]}
                alt={TYPE_LABELS[type]}
                className="h-40 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-48"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
              <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-xl bg-white/95 p-3 shadow-sm backdrop-blur">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  <Icon size={20} strokeWidth={2.1} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-brand-900">{TYPE_LABELS[type]}</span>
                  <span className="block text-xs text-slate-500">
                    {loaded ? `${count} ${count === 1 ? "publicación" : "publicaciones"}` : "Cargando…"}
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  strokeWidth={2.2}
                  className="ml-auto shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5"
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}