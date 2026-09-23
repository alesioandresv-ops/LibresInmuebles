import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiError } from "../api/client.js";
import { Alert } from "../components/Feedback.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

export default function Login() {
  usePageTitle("Ingresar");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const notice = location.state?.notice ?? null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Ingresá a tu cuenta</h1>
      <p className="text-gray-600 mt-1 mb-6">
        ¿No tenés cuenta?{" "}
        <Link to="/registro" className="text-brand-600 underline">
          Registrate gratis
        </Link>
      </p>

      {notice && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
          {notice}
        </div>
      )}

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="mt-1 text-right">
            <Link to="/recuperar-clave" className="text-sm text-brand-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md"
        >
          {submitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}