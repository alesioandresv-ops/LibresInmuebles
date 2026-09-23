import { useEffect, useState } from "react";
import { Alert, Spinner } from "../components/Feedback.jsx";
import { getLegalTemplates, templateDownloadUrl } from "../api/legal.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function Legal() {
  usePageTitle("Modelos de contratos");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getLegalTemplates()
      .then((res) => {
        if (!cancelled) setTemplates(res.templates);
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
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-900">Herramientas legales</h1>
      <p className="text-gray-600 mt-1 mb-6">
        Plantillas modelo para acuerdos entre particulares, alineadas con la normativa vigente.
      </p>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-sm">
        <strong>Importante:</strong> estos documentos son <strong>orientativos</strong> y no
        constituyen asesoramiento jurídico. Verificá la normativa vigente al momento de usarlos y,
        en alquileres permanentes, completá la inscripción del contrato conforme la Ley 27.551 y las
        reglas locales de Paso de los Libres.
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          {templates.map((t) => (
            <div
              key={t.slug}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">{t.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{t.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={templateDownloadUrl(t.slug)}
                  download
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
                >
                  Descargar (.doc)
                </a>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-2">
            Los documentos se descargan en formato .doc (compatible con Word y LibreOffice) y se
            abren también en el navegador para imprimir en PDF.
          </p>
        </div>
      )}
    </div>
  );
}