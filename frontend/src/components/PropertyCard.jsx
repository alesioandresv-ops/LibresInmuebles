import { useState } from "react";
import { Bath, BedDouble, Heart, MapPin, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { assetUrl } from "../api/client.js";
import { formatPrice, OPERATION_LABELS, operationPeriod, STATUS_LABELS, TYPE_LABELS } from "../constants.js";

export default function PropertyCard({ property: p }) {
  const [fav, setFav] = useState(false);
  const primaryImage = assetUrl(p.primary_image_url);
  const period = operationPeriod(p.operation_type);
  const unavailable = p.status && p.status !== "disponible";

  return (
    <div className="group relative">
      <Link
        to={`/properties/${p.id}`}
        className="block overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={p.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100 text-brand-300">
              <Heart size={42} strokeWidth={1.5} />
            </div>
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />

          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            <span className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur">
              {OPERATION_LABELS[p.operation_type]}
            </span>
            {unavailable && (
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-medium text-white shadow-sm ${
                  p.status === "finalizada" ? "bg-red-500/90" : p.status === "en_negociacion" ? "bg-amber-500/90" : "bg-slate-600/90"
                }`}
              >
                {STATUS_LABELS[p.status]}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold tracking-tight text-brand-900">
              {formatPrice(p.currency, p.price)}
            </span>
            {period && <span className="text-sm font-semibold text-brand-600">{period}</span>}
          </div>
          <p className="mt-1 truncate text-[0.95rem] font-semibold text-slate-800">{p.title}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{TYPE_LABELS[p.property_type]}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={13} strokeWidth={2} className="text-brand-600" />
            {p.neighborhood}
          </p>
          <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
            {p.bedrooms > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble size={15} strokeWidth={2} className="text-slate-400" />
                {p.bedrooms} dorm.
              </span>
            )}
            {p.bathrooms > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Bath size={15} strokeWidth={2} className="text-slate-400" />
                {p.bathrooms} {p.bathrooms === 1 ? "baño" : "baños"}
              </span>
            )}
            {p.surface_m2 > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Ruler size={15} strokeWidth={2} className="text-slate-400" />
                {p.surface_m2} m²
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={() => setFav((f) => !f)}
        aria-pressed={fav}
        aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full shadow-sm backdrop-blur transition ${
          fav ? "bg-white text-red-500 scale-110" : "bg-white/90 text-slate-500 hover:text-red-500 hover:scale-110"
        }`}
      >
        <Heart size={18} strokeWidth={2.4} fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}