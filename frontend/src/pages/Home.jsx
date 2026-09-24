import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { searchProperties } from "../api/properties.js";
import { Alert, Spinner } from "../components/Feedback.jsx";
import FilterBar from "../components/FilterBar.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import { DEFAULT_FILTERS } from "../constants.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function Home() {
  usePageTitle("Inmuebles en Paso de los Libres");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20, total_pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const initial = useRef(true);

  const buildParams = useCallback(() => {
    const params = {
      limit: data.limit,
      page,
      sort: filters.sort,
    };
    if (filters.operation_type) params.operation_type = filters.operation_type;
    if (filters.property_type) params.property_type = filters.property_type;
    if (filters.neighborhood) params.neighborhood = filters.neighborhood;
    if (filters.currency) params.currency = filters.currency;
    if (filters.price_min) params.price_min = filters.price_min;
    if (filters.price_max) params.price_max = filters.price_max;
    if (filters.bedrooms) params.bedrooms = filters.bedrooms;
    filters.services.forEach((s) => {
      params[s] = "true";
    });
    return params;
  }, [filters, page, data.limit]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchProperties(buildParams())
      .then((res) => {
        if (cancelled) return;
        setData(res);
        if (res.page > res.total_pages && res.total_pages > 0) setPage(res.total_pages);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildParams, retryKey]);

  function handleFilterChange(next) {
    setFilters(next);
    initial.current = false;
    setPage(1);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brand-900">Inmuebles en Paso de los Libres</h1>
        <p className="text-gray-600 mt-1">
          Dueño Directo: sin intermediarios ni comisiones. {data.total} publicaciones activas.
        </p>
      </div>

      <FilterBar filters={filters} onChange={handleFilterChange} />

      {error && (
        <div className="mt-6 space-y-3">
          <Alert kind="error">{error}</Alert>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-4 py-2 rounded-md border border-brand-600 text-brand-700 hover:bg-brand-50 text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : data.items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No hay publicaciones con esos filtros.{" "}
            <Link to="/publicar" className="text-brand-600 underline">
              Publicá la tuya gratis
            </Link>
            .
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                disabled={data.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:border-brand-500"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {data.page} de {data.total_pages || 1}
              </span>
              <button
                disabled={data.page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:border-brand-500"
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}