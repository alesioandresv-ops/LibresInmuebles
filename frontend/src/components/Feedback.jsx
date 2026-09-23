export function Spinner({ label = "Cargando…" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
      <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function Alert({ kind = "error", children, onClose }) {
  const styles = {
    error: "bg-red-50 border-red-300 text-red-800",
    success: "bg-green-50 border-green-300 text-green-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
  };
  return (
    <div className={`border rounded-md px-4 py-3 text-sm relative ${styles[kind]}`} role="alert">
      <div className="pr-6">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}