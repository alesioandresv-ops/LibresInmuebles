import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty, deleteProperty, uploadImage } from "../api/properties.js";
import { Alert } from "../components/Feedback.jsx";
import { NEIGHBORHOODS, OPERATION_OPTIONS, SERVICES, TYPE_OPTIONS } from "../constants.js";
import usePageTitle from "../hooks/usePageTitle.js";

const STEPS = ["Operación y tipo", "Datos del inmueble", "Servicios y contacto", "Fotos y revisión"];

const MAX_PHOTO_MB = 8;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTOS = 6;

const initialForm = {
  operation_type: "",
  property_type: "",
  title: "",
  description: "",
  price: "",
  currency: "ARS",
  monthly_fees: "",
  bedrooms: 0,
  bathrooms: 0,
  surface_m2: "",
  neighborhood: "",
  address: "",
  latitude: "",
  longitude: "",
  has_water: false,
  has_electricity: false,
  has_sewage: false,
  has_gas: false,
  has_internet: false,
  contact_whatsapp: "",
  allow_whatsapp: false,
};

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function Publish() {
  usePageTitle("Publicar un inmueble");
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  function canContinue() {
    if (step === 0) return form.operation_type && form.property_type;
    if (step === 1)
      return (
        form.title.trim().length >= 3 &&
        form.description.trim().length >= 10 &&
        form.price !== "" &&
        Number(form.price) >= 0 &&
        form.neighborhood &&
        form.address.trim().length >= 1
      );
    if (step === 2) return true;
    return true;
  }

  function toPayload() {
    const num = (v) => (v === "" || v === null ? null : Number(v));
    return {
      operation_type: form.operation_type,
      property_type: form.property_type,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      currency: form.currency,
      monthly_fees: num(form.monthly_fees),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      surface_m2: num(form.surface_m2),
      neighborhood: form.neighborhood,
      address: form.address.trim(),
      latitude: num(form.latitude),
      longitude: num(form.longitude),
      has_water: form.has_water,
      has_electricity: form.has_electricity,
      has_sewage: form.has_sewage,
      has_gas: form.has_gas,
      has_internet: form.has_internet,
      contact_whatsapp: form.contact_whatsapp || null,
      allow_whatsapp: form.allow_whatsapp,
    };
  }

  function isValidPhoto(file) {
    return ALLOWED_PHOTO_TYPES.includes(file.type) && file.size <= MAX_PHOTO_MB * 1024 * 1024;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (photos.some((f) => !isValidPhoto(f))) {
      setError(`Solo se admiten JPG, PNG o WebP de hasta ${MAX_PHOTO_MB} MB por foto.`);
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    let createdId = null;
    try {
      const created = await createProperty(toPayload());
      createdId = created.id;
      for (const photo of photos) {
        await uploadImage(created.id, photo);
      }
      navigate(`/properties/${created.id}`);
    } catch (err) {
      setError(err.message ?? "No se pudo publicar.");
      if (createdId) {
        try {
          await deleteProperty(createdId);
        } catch {
          // el borrado es best-effort; el error original tiene prioridad
        }
      }
      setSubmitting(false);
    }
  }

  function togglePhoto(e) {
    const files = Array.from(e.target.files ?? []);
    const invalid = files.filter((f) => !isValidPhoto(f));
    const valid = files.filter(isValidPhoto);
    if (invalid.length > 0) {
      setError(`Se omitieron ${invalid.length} archivos: solo JPG, PNG o WebP de hasta ${MAX_PHOTO_MB} MB.`);
    } else {
      setError(null);
    }
    setPhotos((prev) => [...prev, ...valid].slice(0, MAX_PHOTOS));
  }

  const previews = useMemo(() => photos.map((p) => URL.createObjectURL(p)), [photos]);

  useEffect(() => {
    const urls = previews;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const optionCard = (selected) =>
    `border-2 rounded-lg p-4 text-left cursor-pointer transition ${
      selected ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-brand-500"
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-900">Publicar un inmueble</h1>
      <p className="text-gray-600 mt-1 mb-6">
        Declarado Dueño Directo: sin intermediarios ni comisiones inmobiliarias.
      </p>

      {/* Indicador de pasos */}
      <ol className="flex gap-2 mb-6">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex-1 text-center text-xs py-2 rounded-md border ${
              i === step
                ? "border-brand-600 bg-brand-600 text-white font-semibold"
                : i < step
                  ? "border-brand-200 bg-brand-50 text-brand-900"
                  : "border-gray-200 text-gray-500"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {step === 0 && (
          <>
            <div>
              <span className={labelCls}>¿Qué operación ofrecés?</span>
              <div className="grid sm:grid-cols-3 gap-3">
                {OPERATION_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, operation_type: o.value }))}
                    className={optionCard(form.operation_type === o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className={labelCls}>¿Qué tipo de inmueble es?</span>
              <div className="grid sm:grid-cols-4 gap-3">
                {TYPE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, property_type: o.value }))}
                    className={optionCard(form.property_type === o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Título</label>
              <input className={inputCls} value={form.title} onChange={set("title")} maxLength={200} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descripción</label>
              <textarea className={inputCls} rows={4} value={form.description} onChange={set("description")} />
            </div>
            <div>
              <label className={labelCls}>Barrio</label>
              <select className={inputCls} value={form.neighborhood} onChange={set("neighborhood")}>
                <option value="">Seleccioná un barrio…</option>
                {NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Dirección</label>
              <input className={inputCls} value={form.address} onChange={set("address")} />
            </div>
            <div>
              <label className={labelCls}>Precio</label>
              <input className={inputCls} type="number" min="0" step="0.01" value={form.price} onChange={set("price")} />
            </div>
            <div>
              <label className={labelCls}>Moneda</label>
              <select className={inputCls} value={form.currency} onChange={set("currency")}>
                <option value="ARS">Pesos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Expensas (opcional)</label>
              <input className={inputCls} type="number" min="0" step="0.01" value={form.monthly_fees} onChange={set("monthly_fees")} />
            </div>
            <div>
              <label className={labelCls}>Superficie m² (opcional)</label>
              <input className={inputCls} type="number" min="0" step="0.01" value={form.surface_m2} onChange={set("surface_m2")} />
            </div>
            <div>
              <label className={labelCls}>Dormitorios</label>
              <input className={inputCls} type="number" min="0" value={form.bedrooms} onChange={set("bedrooms")} />
            </div>
            <div>
              <label className={labelCls}>Baños</label>
              <input className={inputCls} type="number" min="0" value={form.bathrooms} onChange={set("bathrooms")} />
            </div>
            <div>
              <label className={labelCls}>Latitud (opcional, para el mapa)</label>
              <input className={inputCls} type="number" step="any" value={form.latitude} onChange={set("latitude")} />
            </div>
            <div>
              <label className={labelCls}>Longitud (opcional)</label>
              <input className={inputCls} type="number" step="any" value={form.longitude} onChange={set("longitude")} />
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div>
              <span className={labelCls}>¿Qué servicios tiene?</span>
              <div className="grid sm:grid-cols-3 gap-3">
                {SERVICES.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:border-brand-500">
                    <input
                      type="checkbox"
                      checked={form[s.key]}
                      onChange={set(s.key)}
                      className="w-4 h-4 text-brand-600"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>WhatsApp de contacto (opcional)</label>
                <input className={inputCls} placeholder="5493457000000" value={form.contact_whatsapp} onChange={set("contact_whatsapp")} />
              </div>
              <label className="flex items-center gap-2 self-end border rounded-md px-3 py-2 cursor-pointer hover:border-brand-500">
                <input type="checkbox" checked={form.allow_whatsapp} onChange={set("allow_whatsapp")} className="w-4 h-4 text-brand-600" />
                Mostrar botón de WhatsApp a los visitantes
              </label>
            </div>
            <p className="text-xs text-gray-500">
              El teléfono y WhatsApp solo se muestran a usuarios registrados que visitan tu publicación.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className={labelCls}>Fotos (JPG, PNG o WebP, máx. 8 MB c/u)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={togglePhoto}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:text-brand-700 file:px-4 file:py-2 file:font-medium hover:file:bg-brand-100"
              />
              {photos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {photos.map((p, i) => (
                    <img
                      key={`${p.name}-${p.size}`}
                      src={previews[i]}
                      alt={p.name}
                      className="h-20 w-full object-cover rounded-md border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border rounded-md p-4 bg-gray-50 text-sm space-y-1">
              <p className="font-semibold text-gray-700">Revisá antes de publicar:</p>
              <p>
                {OPERATION_OPTIONS.find((o) => o.value === form.operation_type)?.label} ·{" "}
                {TYPE_OPTIONS.find((o) => o.value === form.property_type)?.label} · {form.neighborhood}
              </p>
              <p>
                {form.currency === "USD" ? "US$" : "$"} {Number(form.price || 0).toLocaleString("es-AR")} ·{" "}
                {form.bedrooms} dorm. · {form.bathrooms} baños
                {form.surface_m2 ? ` · ${form.surface_m2} m²` : ""}
              </p>
              <p className="text-gray-500">{form.title}</p>
            </div>
          </>
        )}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:border-brand-500"
          >
            ← Atrás
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue()}
              className="px-5 py-2 rounded-md bg-brand-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-brand-700"
            >
              Continuar →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-md bg-brand-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-brand-700"
            >
              {submitting ? "Publicando…" : "Publicar gratis"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}