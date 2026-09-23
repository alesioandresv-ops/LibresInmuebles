import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getModerationReports, updateReportStatus } from "../api/moderation.js";
import { updateStatus } from "../api/properties.js";
import { Alert, Spinner } from "../components/Feedback.jsx";
import { formatDateTime, REPORT_REASONS } from "../constants.js";
import usePageTitle from "../hooks/usePageTitle.js";

const REPORT_STATUS_LABELS = {
  pendiente: "Pendiente",
  revisado: "Revisado",
  rechazado: "Rechazado",
};

const REPORT_STATUS_STYLE = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  revisado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rechazado: "bg-gray-100 text-gray-600 border-gray-200",
};

const TABS = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "revisado", label: "Revisados" },
  { value: "rechazado", label: "Rechazados" },
];

export default function Moderation() {
  usePageTitle("Moderación");
  const [status, setStatus] = useState("pendiente");
  const [data, setData] = useState({ items: [], total: 0, page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getModerationReports({ status, page, limit: 20 });
        setData(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  async function handleStatus(reportId, next) {
    setBusyId(reportId);
    setError(null);
    try {
      const updated = await updateReportStatus(reportId, next);
      setData((d) => ({
        ...d,
        items: d.items.map((r) => (r.id === reportId ? updated : r)),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleFinalize(propertyId) {
    setBusyId(propertyId);
    setError(null);
    try {
      await updateStatus(propertyId, "finalizada");
      await load(data.page);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const reasonLabel = (value) => REPORT_REASONS.find((r) => r.value === value)?.label ?? value;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-900">Panel de moderación</h1>
      <p className="text-gray-600 mt-1 mb-6">
        Revisá los reportes de la comunidad sobre publicaciones sospechosas.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              status === t.value
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-brand-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {status ? `No hay reportes ${status}.` : "No hay reportes."} ¡Todo en orden!
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/properties/${r.property_id}`}
                        className="font-semibold text-brand-900 hover:underline truncate"
                      >
                        {r.property_title}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${REPORT_STATUS_STYLE[r.status]}`}
                      >
                        {REPORT_STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {r.property_neighborhood} · Dueño: {r.property_owner_name}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="font-medium text-gray-800">{reasonLabel(r.reason)}</span>
                      {r.details && <span className="text-gray-600"> — {r.details}</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Reportado por {r.reporter_name} ({r.reporter_email}) · {formatDateTime(r.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <Link
                      to={`/properties/${r.property_id}`}
                      className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:border-brand-500 text-gray-600"
                    >
                      Ver
                    </Link>
                    <button
                      disabled={busyId === r.id || r.status === "revisado"}
                      onClick={() => handleStatus(r.id, "revisado")}
                      className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-medium"
                    >
                      Marcar revisado
                    </button>
                    <button
                      disabled={busyId === r.id || r.status === "rechazado"}
                      onClick={() => handleStatus(r.id, "rechazado")}
                      className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-gray-700 text-xs font-medium"
                    >
                      Rechazar
                    </button>
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleFinalize(r.property_id)}
                      className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-medium"
                    >
                      Finalizar publicación
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                disabled={data.page <= 1}
                onClick={() => load(data.page - 1)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:border-brand-500"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {data.page} de {data.total_pages}
              </span>
              <button
                disabled={data.page >= data.total_pages}
                onClick={() => load(data.page + 1)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:border-brand-500"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      <p className="mt-8 text-xs text-gray-500">
        Tip: también podés ver detalles de cada {""}
        <Link to="/" className="text-brand-600 underline">
          publicación
        </Link>{" "}
        antes de decidir.
      </p>
    </div>
  );
}