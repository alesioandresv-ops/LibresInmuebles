import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { assetUrl } from "../api/client.js";
import { createInquiry, createReport } from "../api/comms.js";
import { getProperty } from "../api/properties.js";
import { Alert, Spinner } from "../components/Feedback.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { whatsappUrl } from "../lib/whatsapp.js";
import {
  formatDateTime,
  formatPrice,
  OPERATION_LABELS,
  REPORT_REASONS,
  SERVICES,
  STATUS_LABELS,
  TYPE_LABELS,
} from "../constants.js";
import usePageTitle from "../hooks/usePageTitle.js";

function mapEmbedUrl(lat, lng) {
  const d = 0.003;
  const bbox = [lng - d, lat - d, lng + d, lat + d].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryDone, setInquiryDone] = useState(false);
  const [inquiryError, setInquiryError] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState(null);

  usePageTitle(property?.title ?? "Propiedad");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProperty(id)
      .then((data) => {
        if (!cancelled) setProperty(data);
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
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Alert kind="info">
          {error ?? "Propiedad no encontrada."} —{" "}
          <Link to="/" className="underline">
            volver al inicio
          </Link>
        </Alert>
      </div>
    );
  }

  const images = (property.images ?? []).map((img) => ({ ...img, url: assetUrl(img.url) }));
  const activeImage = images[activeIndex]?.url ?? null;
  const activeServices = SERVICES.filter((s) => property[s.key]);
  const contact = property.contact;
  const whatsappHref = whatsappUrl(
    contact?.whatsapp,
    `Hola ${property.owner.first_name}, me interesa tu ${TYPE_LABELS[property.property_type] ?? property.property_type} en ${property.neighborhood} (${OPERATION_LABELS[property.operation_type] ?? property.operation_type}, ${formatPrice(property.currency, property.price)}). ¿Sigue disponible?`
  );
  const hasCoords = property.latitude != null && property.longitude != null;
  const isOwnerOfThis = isAuthenticated && property.owner_id === user?.id;

  async function handleSendInquiry(e) {
    e.preventDefault();
    setSendingInquiry(true);
    setInquiryError(null);
    try {
      await createInquiry({ property_id: property.id, message: inquiryText });
      setInquiryDone(true);
    } catch (err) {
      setInquiryError(err.message ?? "No se pudo enviar la consulta.");
    } finally {
      setSendingInquiry(false);
    }
  }

  async function handleSendReport(e) {
    e.preventDefault();
    if (!reportReason) return;
    setSendingReport(true);
    setReportError(null);
    try {
      await createReport({
        property_id: property.id,
        reason: reportReason,
        details: reportDetails.trim() || null,
      });
      setReportDone(true);
    } catch (err) {
      setReportError(err.message ?? "No se pudo enviar el reporte.");
    } finally {
      setSendingReport(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-brand-600 hover:underline">
        ← Volver al listado
      </Link>

      <div className="flex flex-wrap items-center gap-3 mt-4 mb-2">
        <h1 className="text-3xl font-bold text-brand-900">{property.title}</h1>
        <span className="text-xs bg-brand-50 text-brand-900 px-2.5 py-1 rounded-full font-medium">
          {STATUS_LABELS[property.status]}
        </span>
      </div>
      <p className="text-gray-500 mb-6">
        {property.neighborhood} · {property.address} · Publicado por {property.owner.first_name}{" "}
        {property.owner.last_name}
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Galería */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {activeImage ? (
              <img src={activeImage} alt={property.title} className="w-full h-80 sm:h-96 object-cover" />
            ) : (
              <div className="h-80 sm:h-96 bg-gray-200 grid place-items-center text-gray-400">
                Sin fotos todavía
              </div>
            )}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveIndex(i)}
                    className={`shrink-0 rounded-md overflow-hidden border-2 ${
                      i === activeIndex ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={`Foto ${i + 1}`} className="h-16 w-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Atributos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full">{OPERATION_LABELS[property.operation_type]}</span>
              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full">{TYPE_LABELS[property.property_type]}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border rounded-lg p-3">
                <p className="text-lg font-bold text-brand-900">{property.bedrooms ?? 0}</p>
                <p className="text-xs text-gray-500">Dormitorios</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-lg font-bold text-brand-900">{property.bathrooms ?? 0}</p>
                <p className="text-xs text-gray-500">Baños</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-lg font-bold text-brand-900">{property.surface_m2 ? property.surface_m2 : "—"}</p>
                <p className="text-xs text-gray-500">m² totales</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-lg font-bold text-brand-900">
                  {property.monthly_fees ? formatPrice(property.currency, property.monthly_fees) : "—"}
                </p>
                <p className="text-xs text-gray-500">Expensas</p>
              </div>
            </div>

            <p className="text-gray-700 whitespace-pre-line mt-6">{property.description}</p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Servicios</p>
              {activeServices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeServices.map((s) => (
                    <span key={s.key} className="text-xs bg-brand-50 text-brand-900 px-2.5 py-1 rounded-full border border-brand-100">
                      {s.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin servicios informados.</p>
              )}
            </div>
          </div>

          {/* Mapa */}
          {hasCoords && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 pt-4">
                <p className="text-sm font-semibold text-gray-700">Ubicación aproximada</p>
              </div>
              <iframe
                title="Mapa de la ubicación"
                className="w-full h-72 mt-3 border-0"
                loading="lazy"
                src={mapEmbedUrl(Number(property.latitude), Number(property.longitude))}
              />
            </div>
          )}
        </div>

        {/* Panel de contacto */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-20 space-y-4">
            <div>
              <p className="text-3xl font-bold text-brand-900">{formatPrice(property.currency, property.price)}</p>
              <p className="text-sm text-gray-500 mt-1">{OPERATION_LABELS[property.operation_type]}</p>
            </div>

            {isOwnerOfThis ? (
              <p className="text-sm text-center bg-brand-50 text-brand-900 border border-brand-100 rounded-md py-2.5">
                Es tu publicación · <Link to="/mensajes" className="underline">ver consultas</Link>
              </p>
            ) : !isAuthenticated ? (
              <>
                <p className="text-sm text-gray-600">
                  Ingresá con tu cuenta para ver los datos de contacto del dueño directo.
                </p>
                <Link
                  to="/login"
                  state={{ from: `/properties/${property.id}` }}
                  className="block text-center w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-md"
                >
                  Ingresar para contactar
                </Link>
                <Link
                  to="/registro"
                  state={{ from: `/properties/${property.id}` }}
                  className="block text-center w-full border border-brand-600 text-brand-700 hover:bg-brand-50 font-medium py-2.5 px-4 rounded-md"
                >
                  Crear cuenta gratis
                </Link>
              </>
            ) : (
              <>
                <div className="text-sm space-y-1 text-gray-700 border-t pt-4">
                  <p className="font-semibold text-gray-900">Contacto directo con el dueño</p>
                  <p>{property.owner.first_name} {property.owner.last_name}</p>
                  <p>{contact?.email}</p>
                  {contact?.phone && <p>Tel: {contact.phone}</p>}
                  {!contact && <p className="text-gray-500">Sin datos de contacto adicionales.</p>}
                </div>

                <a
                  href={`mailto:${contact?.email}`}
                  className="block text-center w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-md"
                >
                  Enviar consulta por email
                </a>

                {contact?.allow_whatsapp && whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-md"
                  >
                    Escribir por WhatsApp
                  </a>
                )}

                <div className="border-t pt-4">
                  {inquiryDone ? (
                    <div className="rounded-xl border border-brand-200 p-5 text-sm text-brand-900">
                      Consulta enviada. El dueño la va a recibir en{" "}
                      <Link to="/mensajes" className="underline">Mis mensajes</Link>.
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setShowInquiry((s) => !s)}
                        className="w-full flex items-center justify-between font-medium text-brand-700 hover:text-brand-900"
                      >
                        <span>Preguntar al dueño</span>
                        <span className="text-xs">{showInquiry ? "▲" : "▼"}</span>
                      </button>
                      {showInquiry && (
                        <form onSubmit={handleSendInquiry} className="mt-3 space-y-2">
                          <textarea
                            rows={3}
                            required
                            minLength={3}
                            value={inquiryText}
                            onChange={(e) => setInquiryText(e.target.value)}
                            placeholder="Hola, me interesa esta publicación. ¿Sigue disponible?"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          {inquiryError && <Alert kind="error">{inquiryError}</Alert>}
                          <button
                            type="submit"
                            disabled={sendingInquiry}
                            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2 rounded-md"
                          >
                            {sendingInquiry ? "Enviando…" : "Enviar consulta"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center border-t pt-4">
                  <button
                    onClick={() => {
                      setShowReport(true);
                      setReportError(null);
                    }}
                    className="text-xs text-gray-400 hover:text-red-600 underline"
                  >
                    Reportar publicación
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setShowReport(false)}>
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Reportar publicación</h2>
              <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-gray-700 text-lg" aria-label="Cerrar">
                ✕
              </button>
            </div>

            {reportDone ? (
              <p className="text-sm text-brand-900 bg-brand-50 border border-brand-100 rounded-md p-4">
                Gracias por tu reporte. El equipo de la comunidad lo va a revisar.
              </p>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Seleccioná un motivo…</option>
                    {REPORT_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detalle (opcional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Contanos qué detectaste…"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {reportError && <Alert kind="error">{reportError}</Alert>}
                <button
                  type="submit"
                  disabled={!reportReason || sendingReport}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 rounded-md"
                >
                  {sendingReport ? "Enviando…" : "Enviar reporte"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}