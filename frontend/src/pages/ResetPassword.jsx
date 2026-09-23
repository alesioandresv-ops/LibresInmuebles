import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth.js";
import { ApiError } from "../api/client.js";
import { Alert } from "../components/Feedback.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

export default function ResetPassword() {
  usePageTitle("Restablecer contraseña");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { replace: true, state: { notice: "Contraseña actualizada. Ingresá con tu nueva clave." } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo restablecer la contraseña.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Nueva contraseña</h1>
      <p className="text-gray-600 mt-1 mb-6">Definí una contraseña nueva para tu cuenta.</p>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña nueva</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repetí la contraseña</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md"
        >
          {submitting ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        <Link to="/login" className="text-brand-600 underline">
          Volver a ingresar
        </Link>
      </p>
    </div>
  );
}