import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-5xl font-bold text-brand-900">404</h1>
      <p className="text-gray-600 mt-2 mb-6">Esa página no existe.</p>
      <Link to="/" className="text-brand-600 underline">
        Volver al inicio
      </Link>
    </div>
  );
}