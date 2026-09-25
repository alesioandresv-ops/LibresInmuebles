import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { searchProperties } from "../api/properties.js";
import { Alert, Spinner } from "../components/Feedback.jsx";
import BenefitsBar from "../components/BenefitsBar.jsx";
import CategoryGrid from "../components/CategoryGrid.jsx";
import CtaOwner from "../components/CtaOwner.jsx";
import Hero from "../components/Hero.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import { DEFAULT_FILTERS } from "../constants.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function Home() {
  usePageTitle("Inmuebles en Paso de los Libres");
  const location = useLocation();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20, total_pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const initial = useRef(true);
  const resultsRef = useRef(null);

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

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

  useEffect(() => {
    if (location.state?.scrollTo === "busqueda") {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.state]);

  function handleFilterChange(next) {
    setFilters(next);
    initial.current = false;
    setPage(1);
  }

  function scrollToResults() {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSelectType(propertyType) {
    handleFilterChange({ ...DEFAULT_FILTERS, property_type: propertyType });
    setTimeout(scrollToResults, 0);
  }

  return (
    <div>
      <Hero filters={filters} onChange={handleFilterChange} onSearch={scrollToResults} />
      <BenefitsBar />

      <section ref={resultsRef} id="busqueda" aria-label="Resultados" className="app-container scroll-mt-24 py-12 md:py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">
              {isFiltered ? "Resultados" : "Propiedades destacadas"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isFiltered
                ? `${data.total} ${data.total === 1 ? "publicación encontrada" : "publicaciones encontradas"} con tus filtros.`
                : "Las publicaciones más recientes de dueños directos."}
            </p>
          </div>
          <button
            onClick={() => {
              if (isFiltered) handleFilterChange({ ...DEFAULT_FILTERS });
              scrollToResults();
            }}
            className="text-sm font-semibold text-brand-700 transition hover:text-brand-900"
          >
            {isFiltered ? "Limpiar filtros y ver todas →" : "Ver todas las propiedades →"}
          </button>
        </div>

        {error && (
          <div className="mt-4 space-y-3">
            <Alert kind="error">{error}</Alert>
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="px-4 py-2 rounded-md border border-brand-600 text-brand-700 hover:bg-brand-50 text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16">
            <Spinner />
          </div>
        ) : data.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No hay publicaciones con esos filtros.</p>
            <Link to="/publicar" className="mt-1 inline-block text-brand-600 underline">
              Publicá la tuya gratis
            </Link>
            .
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
              {data.items.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                disabled={data.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-700 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
              >
                ← Anterior
              </button>
              <span className="text-sm text-slate-500">
                Página {data.page} de {data.total_pages || 1}
              </span>
              <button
                disabled={data.page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-700 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </section>

      <CategoryGrid onSelectType={handleSelectType} />
      <CtaOwner />

      <section aria-label="Qué encontrar en LibreInmuebles" className="app-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-brand-900 md:text-3xl">
            Departamentos, casas y terrenos en Paso de los Libres
          </h2>
          <p className="mt-4 text-center leading-relaxed text-slate-600">
            En LibreInmuebles encontrás alquileres permanentes y temporales y también ventas de propiedades
            publicadas por sus propios dueños, sin inmobiliarias de por medio. Buscá departamentos en alquiler,
            casas en venta, terrenos y locales comerciales en los barrios de Paso de los Libres: Centro,
            Costanera, Barrio 508, Ombucito, Santa Rosa y más. Publicá tu inmueble gratis y contactate
            directamente con el propietario o el interesado, sin comisiones.
          </p>
        </div>
      </section>
    </div>
  );
}