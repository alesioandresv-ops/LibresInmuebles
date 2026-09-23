import { describe, expect, it } from "vitest";
import { whatsappDigits, whatsappUrl } from "./whatsapp.js";

describe("whatsappDigits", () => {
  it("conserva solo dígitos", () => {
    expect(whatsappDigits("+54 9 345 700-0000")).toBe("5493457000000");
  });
  it("tolera valores vacíos", () => {
    expect(whatsappDigits(undefined)).toBe("");
    expect(whatsappDigits("   ")).toBe("");
    expect(whatsappDigits(null)).toBe("");
  });
});

describe("whatsappUrl", () => {
  it("arma la URL con número E.164", () => {
    expect(whatsappUrl("+54 9 345 700-0000")).toBe("https://wa.me/5493457000000");
  });
  it("incluye el texto de mensaje url-encoded", () => {
    const url = whatsappUrl("5493457000000", "Hola Juan, ¿sigue disponible?");
    expect(url.startsWith("https://wa.me/5493457000000?text=")).toBe(true);
    expect(decodeURIComponent(url.replace(/\+/g, " "))).toContain("Hola Juan");
  });
  it("devuelve null sin número", () => {
    expect(whatsappUrl("", "texto")).toBeNull();
    expect(whatsappUrl(undefined, "texto")).toBeNull();
  });
  it("no agrega ?text vacío", () => {
    expect(whatsappUrl("5493457000000", "")).toBe("https://wa.me/5493457000000");
  });
});