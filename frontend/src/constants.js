export const OPERATION_LABELS = {
  alquiler_permanente: "Alquiler permanente",
  alquiler_temporal: "Alquiler temporal",
  venta: "Venta",
};

export const OPERATION_OPTIONS = Object.entries(OPERATION_LABELS).map(([value, label]) => ({ value, label }));

export const TYPE_LABELS = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  salon_comercial: "Salón comercial",
};

export const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

export const STATUS_LABELS = {
  disponible: "Disponible",
  en_negociacion: "En negociación",
  finalizada: "Finalizada",
};

export const REPORT_REASONS = [
  { value: "spam", label: "Publicidad o spam" },
  { value: "intermediario_real", label: "Es un intermediario, no un dueño directo" },
  { value: "datos_falsos", label: "Datos falsos o engañosos" },
  { value: "duplicada", label: "Publicación duplicada" },
  { value: "otro", label: "Otro motivo" },
];

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const NEIGHBORHOODS = [
  "Centro",
  "Costanera",
  "Zapadores",
  "Chaquito",
  "Picaflor",
  "Santa Rosa",
  "San Cayetano",
  "Caá Guazú",
  "Ombucito",
  "El Palmar",
  "Las Carmelitas",
  "Héroes de Malvinas",
  "Facundo Quiroga",
  "René Favaloro",
  "Santa Bárbara",
  "Terminal",
  "Suboficiales Yapeyú",
  "Simeón Paiba",
  "Catamarca",
  "Lomas Valentinas",
  "Primavera",
  "Las Flores",
  "San Martín",
  "La Amelia",
  "La Florida",
  "Las Palmas",
  "Nueva Esperanza",
  "Barrio 508",
  "255 Viviendas",
  "99 Viviendas",
  "80 Viviendas",
  "60 Viviendas",
  "40 Viviendas",
  "30 Viviendas",
  "20 Viviendas",
  "17 de Agosto",
  "154 Viviendas",
  "132 Viviendas (Tablitas)",
];

export const NEIGHBORHOOD_SUBOPTIONS = {
  "Barrio 508": ["Barrio 508", "Sector 300"],
};

export const SERVICES = [
  { key: "has_water", label: "Agua corriente" },
  { key: "has_electricity", label: "Luz eléctrica" },
  { key: "has_sewage", label: "Cloaca" },
  { key: "has_gas", label: "Gas natural" },
  { key: "has_internet", label: "Internet" },
];

export function formatPrice(currency, value) {
  const prefix = currency === "USD" ? "US$" : "$";
  return `${prefix} ${Number(value).toLocaleString("es-AR")}`;
}

export function operationPeriod(operation) {
  if (operation === "alquiler_permanente") return " / mes";
  if (operation === "alquiler_temporal") return " / día";
  return "";
}

export const DEFAULT_FILTERS = {
  operation_type: "",
  property_type: "",
  neighborhood: "",
  currency: "",
  price_min: "",
  price_max: "",
  bedrooms: "",
  sort: "newest",
  services: [],
};