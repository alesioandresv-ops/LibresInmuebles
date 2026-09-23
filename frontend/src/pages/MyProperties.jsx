import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteProperty, getMine, updateStatus } from "../api/properties.js";
import { Alert, Spinner } from "../components/Feedback.jsx";
import { assetUrl } from "../api/client.js";
import {
  formatDateTime,
  formatPrice,
  OPERATION_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "../constants.js";
import usePageTitle from "../hooks/usePageTitle.js";

const STATUS_OPTIONS = ["disponible", "en_negociacion", "finalizada"];

const STATUS_BADGE = {
  disponible: "bg-emerald-50 text-emerald-700 border-emerald-200",
  en_negociacion: "bg-amber-50 text-amber-700 border-amber-200",
  finalizada: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function MyProperties() {
  usePageTitle("Mis publicaciones");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getMine());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatus(id, status) {
    setBusyId(id);
    setError(null);
    try {
      const updated = await updateStatus(id, status);
      setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar definitivamente "${item.title}"? Esta acción no se puede deshacer.`)) return;
    setBusyId(item.id);
    setError(null);
    try {
      await deleteProperty(item.id);
      setItems((prev) => prev.filter((p) => p.id !== item.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const thumb = (p) => {
    const img = p.images.find((i) => i.is_primary) ?? p.images[0];
    return img ? assetUrl(img.url) : null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Mis publicaciones</h1>
          <p className="text-gray-600 mt-1">Gestioná tus inmuebles publicados en LibreInmuebles.</p>
        </div>
        <Link
          to="/publicar"
          className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        >
          + Publicar nuevo
        </Link>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-600 mb-4">Todavía no publicaste ningún inmueble.</p>
          <Link to="/publicar" className="text-brand-700 font-medium underline">
            Publicar mi primer inmueble
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 flex-wrap sm:flex-nowrap">
              <Link to={`/properties/${p.id}`} className="shrink-0">
                {thumb(p) ? (
                  <img
                    src={thumb(p)}
                    alt={p.title}
                    className="h-24 w-32 object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <div className="h-24 w-32 rounded-md bg-gray-100 grid place-items-center text-gray-400 text-xs">
                    Sin foto
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/properties/${p.id}`} className="font-semibold text-brand-900 hover:underline truncate">
                    {p.title}
                  </Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {OPERATION_LABELS[p.operation_type]} · {TYPE_LABELS[p.property_type]} · {p.neighborhood}
                </p>
                <p className="text-sm font-medium text-brand-900 mt-1">
                  {formatPrice(p.currency, p.price)}
                  {p.surface_m2 ? ` · ${p.surface_m2} m²` : ""}
                </p>
                <p className="text-xs text-gray-400 mt-1">Publicada: {formatDateTime(p.created_at)}</p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Link to={`/properties/${p.id}`} className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:border-brand-500 text-gray-600">
                    Ver
                  </Link>
                  <Link to={`/mis-publicaciones/${p.id}/editar`} className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium">
                    Editar
                  </Link>
                  <select
                    value={p.status}
                    disabled={busyId === p.id}
                    onChange={(e) => handleStatus(p.id, e.target.value)}
                    className="px-2 py-1.5 rounded-md border border-gray-300 text-xs disabled:opacity-40"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={busyId === p.id}
                    className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium disabled:opacity-40"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}