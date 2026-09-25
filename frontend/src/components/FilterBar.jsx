import { DEFAULT_FILTERS, OPERATION_OPTIONS, SERVICES, TYPE_OPTIONS } from "../constants.js";
import NeighborhoodPicker from "./NeighborhoodPicker.jsx";

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1";

export default function FilterBar({ filters, onChange, embedded = false }) {
  function update(patch) {
    onChange({ ...filters, ...patch });
  }

  function toggleService(key) {
    const services = filters.services.includes(key)
      ? filters.services.filter((s) => s !== key)
      : [...filters.services, key];
    update({ services });
  }

  const Tag = embedded ? "div" : "form";
  return (
    <Tag
      {...(!embedded && { onSubmit: (e) => e.preventDefault() })}
      className={
        embedded
          ? "grid gap-4 rounded-xl bg-white p-4 md:grid-cols-2 xl:grid-cols-4"
          : "bg-white rounded-xl border border-gray-200 shadow-sm p-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      }
    >
      <div className="md:col-span-2 xl:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Operación</label>
            <select
              value={filters.operation_type}
              onChange={(e) => update({ operation_type: e.target.value })}
              className={inputCls}
            >
              <option value="">Todas</option>
              {OPERATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tipo de inmueble</label>
            <select
              value={filters.property_type}
              onChange={(e) => update({ property_type: e.target.value })}
              className={inputCls}
            >
              <option value="">Todos</option>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Barrio</label>
        <NeighborhoodPicker
          value={filters.neighborhood}
          onChange={(v) => update({ neighborhood: v })}
          allowEmpty
          emptyLabel="Todos"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Ordenar por</label>
        <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })} className={inputCls}>
          <option value="newest">Más recientes</option>
          <option value="price_asc">Menor precio</option>
          <option value="price_desc">Mayor precio</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Moneda</label>
        <select
          value={filters.currency}
          onChange={(e) => update({ currency: e.target.value })}
          className={inputCls}
        >
          <option value="">Todas</option>
          <option value="ARS">Pesos (ARS)</option>
          <option value="USD">Dólares (USD)</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Precio mínimo</label>
        <input
          type="number"
          min="0"
          placeholder="0"
          value={filters.price_min}
          onChange={(e) => update({ price_min: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Precio máximo</label>
        <input
          type="number"
          min="0"
          placeholder="Sin tope"
          value={filters.price_max}
          onChange={(e) => update({ price_max: e.target.value })}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Dormitorios</label>
        <select value={filters.bedrooms} onChange={(e) => update({ bedrooms: e.target.value })} className={inputCls}>
          <option value="">Cualquiera</option>
          <option value="1">1 o más</option>
          <option value="2">2 o más</option>
          <option value="3">3 o más</option>
          <option value="4">4 o más</option>
        </select>
      </div>

      <div className="md:col-span-2 xl:col-span-3">
        <span className={labelCls}>Servicios</span>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleService(s.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                filters.services.includes(s.key)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-brand-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 xl:col-span-4 flex justify-end">
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_FILTERS })}
          className="text-sm text-gray-500 hover:text-brand-700 underline"
        >
          Limpiar filtros
        </button>
      </div>
    </Tag>
  );
}