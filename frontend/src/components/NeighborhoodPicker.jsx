import { NEIGHBORHOODS, NEIGHBORHOOD_SUBOPTIONS } from "../constants.js";

function findParent(value) {
  if (!value) return null;
  const entry = Object.entries(NEIGHBORHOOD_SUBOPTIONS).find(([parent, options]) => value === parent || options.includes(value));
  return entry ? entry[0] : null;
}

export default function NeighborhoodPicker({ value, onChange, allowEmpty = false, emptyLabel = "Todos", className }) {
  const parent = findParent(value);

  return (
    <div className="flex w-full items-stretch gap-1.5">
      <select
        value={parent ?? value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} min-w-0 flex-1`}
        aria-label="Barrio o zona"
      >
        {allowEmpty ? <option value="">{emptyLabel}</option> : null}
        {NEIGHBORHOODS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      {parent && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${className} min-w-0 flex-1`}
          aria-label="Subbarrio"
        >
          {allowEmpty ? <option value="">{emptyLabel}</option> : null}
          {NEIGHBORHOOD_SUBOPTIONS[parent].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}