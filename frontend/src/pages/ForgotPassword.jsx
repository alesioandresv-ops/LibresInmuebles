import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.js";
import { ApiError } from "../api/client.js";
import { Alert } from "../components/Feedback.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

export default function ForgotPassword() {
  usePageTitle("Recuperar contraseña");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo procesar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Recuperar tu contraseña</h1>
      <p className="text-gray-600 mt-1 mb-6">
        Ingresá tu email y te enviamos un enlace para restablecerla (válido por 15 minutos).
      </p>

      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 mb-4">
          Si el email está registrado, te enviamos un enlace para restablecer tu contraseña.
          Revisá tu bandeja de entrada (y de spam).
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md"
            >
              {submitting ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        </>
      )}

      <p className="text-sm text-gray-500 mt-4">
        <Link to="/login" className="text-brand-600 underline">
          Volver a ingresar
        </Link>
      </p>
    </div>
  );
}