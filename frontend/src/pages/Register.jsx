import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiError } from "../api/client.js";
import { Alert } from "../components/Feedback.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

const EMAIL_RE =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const MIN_PASSWORD = 8;

const initialState = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  whatsapp: "",
  role: "buscador",
  declaration_titular: false,
};

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500";
const invalidInputCls =
  "w-full rounded-md border border-red-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400";

export default function Register() {
  usePageTitle("Crear cuenta");
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const validation = useMemo(() => {
    const email = form.email.trim();
    return {
      emailValid: EMAIL_RE.test(email),
      emailObvious: email.includes("@"),
      passwordValid: form.password.length >= MIN_PASSWORD,
    };
  }, [form.email, form.password]);

  const acceptedDeclaration = form.declaration_titular;
  const canSubmit =
    acceptedDeclaration &&
    validation.emailValid &&
    validation.passwordValid &&
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        ...form,
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
      });
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar el registro.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Creá tu cuenta</h1>
      <p className="text-gray-600 mt-1 mb-6">LibreInmuebles conecta dueños directos con interesados, sin intermediarios.</p>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input required maxLength={100} value={form.first_name} onChange={set("first_name")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input required maxLength={100} value={form.last_name} onChange={set("last_name")} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            className={form.email && !validation.emailValid ? invalidInputCls : inputCls}
          />
          {form.email && !validation.emailValid && (
            <p className="mt-1 text-xs text-red-600">
              {validation.emailObvious
                ? "Email inválido. El dominio debe tener punto (ej. nombre@dominio.com)."
                : "Ingresá un email válido, por ejemplo nombre@dominio.com."}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña (mínimo {MIN_PASSWORD} caracteres)
          </label>
          <input
            type="password"
            required
            minLength={MIN_PASSWORD}
            value={form.password}
            onChange={set("password")}
            className={form.password && !validation.passwordValid ? invalidInputCls : inputCls}
          />
          {form.password && !validation.passwordValid && (
            <p className="mt-1 text-xs text-red-600">La contraseña debe tener al menos {MIN_PASSWORD} caracteres.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
            <input value={form.phone} onChange={set("phone")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
            <input value={form.whatsapp} onChange={set("whatsapp")} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quiero…</label>
          <select value={form.role} onChange={set("role")} className={inputCls}>
            <option value="buscador">Buscar un inmueble (alquilar o comprar)</option>
            <option value="propietario">Publicar mi inmueble como dueño directo</option>
          </select>
        </div>

        <div>
          <label
            className={`flex items-start gap-3 text-sm rounded-md border p-3 cursor-pointer transition ${
              acceptedDeclaration ? "border-brand-200 bg-brand-50" : "border-gray-200 hover:border-brand-300"
            }`}
          >
            <input
              type="checkbox"
              required
              checked={form.declaration_titular}
              onChange={(e) => setForm((f) => ({ ...f, declaration_titular: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-brand-600"
            />
            <span>
              Declaro bajo juramento que soy <strong>titular o poseedor directo</strong> de los inmuebles que publique
              en la plataforma y que <strong>no</strong> soy intermediario ni agencia inmobiliaria.
            </span>
          </label>
          {!acceptedDeclaration && (
            <p className="mt-1 text-xs text-amber-700">
              Aceptá la declaración para habilitar el botón «Crear cuenta».
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md"
        >
          {submitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
        <p className="text-xs text-gray-400 text-center">
          El botón se habilita cuando la declaración esté aceptada y todos los datos sean válidos.
        </p>
      </form>
    </div>
  );
}