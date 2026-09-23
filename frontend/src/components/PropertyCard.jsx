import { Link } from "react-router-dom";
import { assetUrl } from "../api/client.js";
import { formatPrice, OPERATION_LABELS, STATUS_LABELS, TYPE_LABELS } from "../constants.js";

export default function PropertyCard({ property: p }) {
  const primaryImage = assetUrl(p.primary_image_url);
  return (
    <Link
      to={`/properties/${p.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
    >
      {primaryImage ? (
        <img src={primaryImage} alt={p.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="h-44 w-full bg-gray-200 grid place-items-center text-gray-400 text-sm">Sin foto</div>
      )}
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-bold text-lg text-brand-900">{formatPrice(p.currency, p.price)}</span>
          <div className="flex items-center gap-1.5">
            {p.status && p.status !== "disponible" && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                  p.status === "finalizada"
                    ? "bg-red-50 text-red-700"
                    : p.status === "en_negociacion"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {STATUS_LABELS[p.status] ?? p.status}
              </span>
            )}
            <span className="text-xs bg-brand-50 text-brand-900 px-2 py-0.5 rounded-full whitespace-nowrap">
              {OPERATION_LABELS[p.operation_type]}
            </span>
          </div>
        </div>
        <p className="font-medium text-gray-800 truncate mt-1">{p.title}</p>
        <p className="text-sm text-gray-500">
          {TYPE_LABELS[p.property_type]} · {p.neighborhood}
        </p>
        {(p.bedrooms > 0 || p.surface_m2) && (
          <p className="text-xs text-gray-400 mt-1">
            {p.bedrooms > 0 && `${p.bedrooms} dorm. · `}
            {p.surface_m2 && `${p.surface_m2} m²`}
          </p>
        )}
      </div>
    </Link>
  );
}