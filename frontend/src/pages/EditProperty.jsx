import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteImage,
  getProperty,
  setPrimaryImage,
  updateProperty,
  uploadImage,
} from "../api/properties.js";
import { Alert, Spinner } from "../components/Feedback.jsx";
import { assetUrl } from "../api/client.js";
import { NEIGHBORHOODS, OPERATION_OPTIONS, SERVICES, TYPE_OPTIONS } from "../constants.js";
import usePageTitle from "../hooks/usePageTitle.js";

const MAX_PHOTO_MB = 8;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const emptyForm = {
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

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  usePageTitle("Editar publicación");

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyImage, setBusyImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const item = await getProperty(id);
        if (!active) return;
        setForm({
          operation_type: item.operation_type,
          property_type: item.property_type,
          title: item.title,
          description: item.description,
          price: String(item.price),
          currency: item.currency,
          monthly_fees: item.monthly_fees ?? "",
          bedrooms: item.bedrooms ?? 0,
          bathrooms: item.bathrooms ?? 0,
          surface_m2: item.surface_m2 ?? "",
          neighborhood: item.neighborhood,
          address: item.address,
          latitude: item.latitude ?? "",
          longitude: item.longitude ?? "",
          has_water: item.has_water,
          has_electricity: item.has_electricity,
          has_sewage: item.has_sewage,
          has_gas: item.has_gas,
          has_internet: item.has_internet,
          contact_whatsapp: item.contact?.whatsapp ?? "",
          allow_whatsapp: item.contact?.allow_whatsapp ?? false,
        });
        setImages(item.images);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const set = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

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
      contact_whatsapp: form.contact_whatsapp.trim() || null,
      allow_whatsapp: form.allow_whatsapp,
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateProperty(id, toPayload());
      navigate(`/properties/${id}`);
    } catch (err) {
      setError(err.message ?? "No se pudo guardar la publicación.");
      setSaving(false);
    }
  }

  function isValidPhoto(file) {
    return ALLOWED_PHOTO_TYPES.includes(file.type) && file.size <= MAX_PHOTO_MB * 1024 * 1024;
  }

  async function handleAddPhotos(e) {
    const files = Array.from(e.target.files ?? []);
    const invalid = files.filter((f) => !isValidPhoto(f));
    const valid = files.filter(isValidPhoto);
    if (invalid.length > 0) {
      setError(`Se omitieron ${invalid.length} archivos: solo JPG, PNG o WebP de hasta ${MAX_PHOTO_MB} MB.`);
    } else {
      setError(null);
    }
    if (valid.length === 0) return;
    for (const file of valid) {
      try {
        const img = await uploadImage(id, file);
        setImages((prev) => [...prev, img]);
      } catch (err) {
        setError(err.message ?? "No se pudo subir la foto.");
        break;
      }
    }
  }

  async function handlePrimary(imageId) {
    setBusyImage(imageId);
    setError(null);
    try {
      const updated = await setPrimaryImage(id, imageId);
      setImages((prev) =>
        prev.map((i) => ({ ...i, is_primary: i.id === imageId ? updated.is_primary : false }))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyImage(null);
    }
  }

  async function handleDeleteImage(imageId) {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    setBusyImage(imageId);
    setError(null);
    try {
      await deleteImage(id, imageId);
      setImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyImage(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-900">Editar publicación</h1>
      <p className="text-gray-600 mt-1 mb-6">Actualizá los datos de tu inmueble y su galería de fotos.</p>

      {error && (
        <div className="mb-4">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Galería de fotos</h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group border border-gray-200 rounded-md overflow-hidden">
                <img src={assetUrl(img.url)} alt="" className="h-32 w-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={busyImage === img.id}
                    onClick={() => handlePrimary(img.id)}
                    title="Marcar como principal"
                    className="px-2 py-1 rounded-md bg-white/90 text-xs font-medium hover:bg-white disabled:opacity-40"
                  >
                    {img.is_primary ? "★ Principal" : "Hacer principal"}
                  </button>
                  <button
                    type="button"
                    disabled={busyImage === img.id}
                    onClick={() => handleDeleteImage(img.id)}
                    title="Eliminar foto"
                    className="px-2 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-40"
                  >
                    ✕
                  </button>
                </div>
                {img.is_primary && (
                  <span className="absolute top-1 left-1 bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Esta publicación no tiene fotos todavía.</p>
        )}

        <label className="block mt-4 text-sm text-gray-600">
          Agregar fotos (JPG, PNG o WebP, máx. 8 MB c/u)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleAddPhotos}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:text-brand-700 file:px-4 file:py-2 file:font-medium hover:file:bg-brand-100"
          />
        </label>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Operación</label>
            <select className={inputCls} value={form.operation_type} onChange={set("operation_type")}>
              <option value="">Seleccioná…</option>
              {OPERATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tipo de inmueble</label>
            <select className={inputCls} value={form.property_type} onChange={set("property_type")}>
              <option value="">Seleccioná…</option>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
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
            <label className={labelCls}>Latitud (opcional)</label>
            <input className={inputCls} type="number" step="any" value={form.latitude} onChange={set("latitude")} />
          </div>
          <div>
            <label className={labelCls}>Longitud (opcional)</label>
            <input className={inputCls} type="number" step="any" value={form.longitude} onChange={set("longitude")} />
          </div>
        </div>

        <div>
          <span className={labelCls}>Servicios</span>
          <div className="grid sm:grid-cols-3 gap-3">
            {SERVICES.map((s) => (
              <label key={s.key} className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:border-brand-500">
                <input type="checkbox" checked={form[s.key]} onChange={set(s.key)} className="w-4 h-4 text-brand-600" />
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
            Mostrar botón de WhatsApp
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/properties/${id}`)}
            disabled={saving}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-40 hover:border-brand-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-md bg-brand-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-brand-700"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}