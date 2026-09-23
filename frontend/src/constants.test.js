import { describe, expect, it } from "vitest";
import {
  OPERATION_LABELS,
  OPERATION_OPTIONS,
  REPORT_REASONS,
  STATUS_LABELS,
  TYPE_LABELS,
  TYPE_OPTIONS,
  formatDateTime,
  formatPrice,
} from "./constants.js";

describe("formatPrice", () => {
  it("formatea pesos argentinos", () => {
    expect(formatPrice("ARS", 150000)).toContain("$");
    expect(formatPrice("ARS", 150000)).toContain("150.000");
  });
  it("formatea dólares", () => {
    expect(formatPrice("USD", 75000)).toContain("US$");
    expect(formatPrice("USD", 75000)).toContain("75.000");
  });
});

describe("formatDateTime", () => {
  it("no lanza y devuelve texto legible", () => {
    const out = formatDateTime("2026-09-23T14:30:00");
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(5);
  });
});

describe("catálogos", () => {
  it("cada opción de operación/tipo tiene su label", () => {
    for (const o of OPERATION_OPTIONS) {
      expect(OPERATION_LABELS[o.value]).toBe(o.label);
    }
    for (const o of TYPE_OPTIONS) {
      expect(TYPE_LABELS[o.value]).toBe(o.label);
    }
  });
  it("estados de publicación completos", () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(
      ["disponible", "en_negociacion", "finalizada"].sort()
    );
  });
  it("motivos de reporte con valores únicos", () => {
    const values = REPORT_REASONS.map((r) => r.value);
    expect(new Set(values).size).toBe(values.length);
    expect(values).toContain("intermediario_real");
  });
});