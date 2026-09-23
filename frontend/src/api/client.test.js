import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, assetUrl, getToken, setToken } from "./client.js";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(status, body, contentType = "application/json") {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": contentType },
  });
}

function jsonFetchMock(status, body, contentType) {
  return vi.fn(async () => jsonResponse(status, body, contentType));
}

describe("assetUrl", () => {
  it("devuelve null si no hay path", () => {
    expect(assetUrl(null)).toBeNull();
    expect(assetUrl("")).toBeNull();
    expect(assetUrl(undefined)).toBeNull();
  });
  it("deja intactas las URLs absolutas", () => {
    expect(assetUrl("https://cdn.example.com/foto.jpg")).toBe("https://cdn.example.com/foto.jpg");
  });
  it("prefixea rutas relativas del backend", () => {
    expect(assetUrl("/uploads/1/a.png")).toBe("/uploads/1/a.png");
  });
});

describe("apiFetch", () => {
  it("serializa body como JSON", async () => {
    global.fetch = vi.fn(async (url, options) => jsonResponse(201, { id: 7 }));
    const res = await apiFetch("/properties", { method: "POST", body: { title: "X" } });
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({ title: "X" });
    expect(res).toEqual({ id: 7 });
  });

  it("deja FormData intacto", async () => {
    global.fetch = vi.fn(async () => jsonResponse(201, { url: "/uploads/1/a.png" }));
    const form = new FormData();
    form.append("file", new Blob(["x"]));
    await apiFetch("/properties/1/images", { method: "POST", body: form });
    const [, options] = global.fetch.mock.calls[0];
    expect(options.body).toBe(form);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("devuelve null en 204", async () => {
    global.fetch = vi.fn(async () => new Response(null, { status: 204 }));
    expect(await apiFetch("/properties/1", { method: "DELETE" })).toBeNull();
  });

  it("arma ApiError con detail de string", async () => {
    global.fetch = jsonFetchMock(400, { detail: "Mal pedido" });
    const err = await apiFetch("/properties").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Mal pedido");
    expect(err.status).toBe(400);
  });

  it("arma mensaje desde detail con lista de validación", async () => {
    global.fetch = jsonFetchMock(422, {
      detail: [{ loc: ["body", "price"], msg: "must be ≥ 0" }],
    });
    const err = await apiFetch("/properties", { method: "POST", body: {} }).catch((e) => e);
    expect(err.message).toBe("price: must be ≥ 0");
  });

  it("usa el status como mensaje si no hay detail", async () => {
    global.fetch = jsonFetchMock(500, {}, "text/plain");
    const err = await apiFetch("/properties").catch((e) => e);
    expect(err.message).toBe("Error 500");
  });

  it("en 401 limpia el token y emite auth:unauthorized", async () => {
    setToken("token-viejo");
    global.fetch = jsonFetchMock(401, { detail: "No autenticado." });
    const dispatched = [];
    const listener = () => dispatched.push(true);
    window.addEventListener("auth:unauthorized", listener);
    try {
      await apiFetch("/auth/me");
    } catch (e) {
      expect(e.status).toBe(401);
    }
    expect(getToken()).toBeNull();
    expect(dispatched.length).toBe(1);
    window.removeEventListener("auth:unauthorized", listener);
  });

  it("no toca la sesión en errores que no son 401", async () => {
    setToken("token-ok");
    global.fetch = jsonFetchMock(403, { detail: "Prohibido" });
    await apiFetch("/moderation/reports").catch(() => {});
    expect(getToken()).toBe("token-ok");
  });
});