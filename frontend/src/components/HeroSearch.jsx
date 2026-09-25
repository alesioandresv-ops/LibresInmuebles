import { useState } from "react";
import { ChevronDown, Eraser, Search, SlidersHorizontal } from "lucide-react";
import { DEFAULT_FILTERS, OPERATION_OPTIONS, TYPE_OPTIONS } from "../constants.js";
import FilterBar from "./FilterBar.jsx";
import NeighborhoodPicker from "./NeighborhoodPicker.jsx";

const clearCls =
  "w-full bg-transparent rounded-md px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none border border-transparent hover:border-brand-100 focus:border-brand-300 focus:bg-white";

function Field({ label, children, className = "" }) {
  return (
    <div className={`flex flex-col justify-center px-4 py-2 sm:py-1 ${className}`}>
      <span className="px-2 text-[0.68rem] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function HeroSearch({ filters, onChange, onSearch }) {
  const [advanced, setAdvanced] = useState(false);

  function update(patch) {
    onChange({ ...filters, ...patch });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      className="overflow-hidden rounded-[14px] bg-white shadow-card"
    >
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-[1fr_1fr_1fr_1.35fr_auto] lg:divide-x lg:divide-slate-100">
        <Field label="Operación">
          <select
            value={filters.operation_type}
            onChange={(e) => update({ operation_type: e.target.value })}
            className={clearCls}
          >
            <option value="">Todas</option>
            {OPERATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tipo de inmueble">
          <select
            value={filters.property_type}
            onChange={(e) => update({ property_type: e.target.value })}
            className={clearCls}
          >
            <option value="">Todos</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Barrio o zona">
          <NeighborhoodPicker
            value={filters.neighborhood}
            onChange={(v) => update({ neighborhood: v })}
            allowEmpty
            emptyLabel="Todos"
            className={clearCls}
          />
        </Field>

        <Field label="Precio">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              placeholder="Desde"
              value={filters.price_min}
              onChange={(e) => update({ price_min: e.target.value })}
              className={clearCls}
            />
            <span className="text-slate-300">—</span>
            <input
              type="number"
              min="0"
              placeholder="Hasta"
              value={filters.price_max}
              onChange={(e) => update({ price_max: e.target.value })}
              className={clearCls}
            />
          </div>
        </Field>

        <div className="flex items-stretch sm:col-span-2 lg:col-span-1 lg:py-0">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 lg:rounded-none lg:rounded-[14px] lg:py-0"
          >
            <Search size={18} strokeWidth={2.2} />
            Buscar
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setAdvanced((a) => !a)}
          aria-expanded={advanced}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          <SlidersHorizontal size={16} strokeWidth={2} />
          Filtros avanzados
          <ChevronDown
            size={16}
            strokeWidth={2}
            className={`transition-transform duration-200 ${advanced ? "rotate-180" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_FILTERS })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-brand-700"
        >
          <Eraser size={14} strokeWidth={2} />
          Limpiar
        </button>
      </div>

      {advanced && (
        <div className="border-t border-slate-100 px-3 pb-3 pt-2">
          <FilterBar filters={filters} onChange={onChange} embedded />
        </div>
      )}
    </form>
  );
}