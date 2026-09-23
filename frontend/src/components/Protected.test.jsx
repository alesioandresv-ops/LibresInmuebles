import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PublicOnly, RequireAuth, RequireOwner, RequireStaff } from "./Protected.jsx";

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../context/AuthContext.jsx";

function withRouter(initialEntry, element) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<div>PAGINA_INICIO</div>} />
        <Route path="/login" element={<div>PAGINA_LOGIN</div>} />
        <Route path="/publicar" element={<div>PAGINA_PUBLICAR</div>} />
        <Route path="/moderacion" element={<div>PAGINA_MODERAR</div>} />
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>
  );
}

const auth = {
  isAuthenticated: true,
  isOwner: true,
  isStaff: false,
  loading: false,
};

beforeEach(() => {
  useAuth.mockReturnValue({ ...auth });
});

describe("RequireAuth", () => {
  it("mientras carga no renderiza nada", () => {
    useAuth.mockReturnValue({ ...auth, loading: true });
    const { container } = withRouter("/privada", <RequireAuth>privado</RequireAuth>);
    expect(container).toBeEmptyDOMElement();
  });

  it("con sesión muestra el contenido", () => {
    withRouter("/privada", <RequireAuth>contenido_privado</RequireAuth>);
    expect(screen.getByText("contenido_privado")).toBeInTheDocument();
  });

  it("sin sesión redirige al login", async () => {
    useAuth.mockReturnValue({ ...auth, isAuthenticated: false });
    withRouter("/privada", <RequireAuth>contenido_privado</RequireAuth>);
    expect(await screen.findByText("PAGINA_LOGIN")).toBeInTheDocument();
    expect(screen.queryByText("contenido_privado")).not.toBeInTheDocument();
  });
});

describe("PublicOnly", () => {
  it("redirige a / si ya hay sesión", async () => {
    withRouter("/entrar", <PublicOnly>form_login</PublicOnly>);
    expect(await screen.findByText("PAGINA_INICIO")).toBeInTheDocument();
    expect(screen.queryByText("form_login")).not.toBeInTheDocument();
  });

  it("muestra el formulario a visitantes", () => {
    useAuth.mockReturnValue({ ...auth, isAuthenticated: false });
    withRouter("/entrar", <PublicOnly>form_login</PublicOnly>);
    expect(screen.getByText("form_login")).toBeInTheDocument();
  });
});

describe("RequireOwner", () => {
  it("bloquea a buscadores", async () => {
    useAuth.mockReturnValue({ ...auth, isOwner: false });
    withRouter("/crear", <RequireOwner>solo_dueño</RequireOwner>);
    expect(await screen.findByText("PAGINA_INICIO")).toBeInTheDocument();
  });

  it("deja pasar al dueño", () => {
    withRouter("/crear", <RequireOwner>solo_dueño</RequireOwner>);
    expect(screen.getByText("solo_dueño")).toBeInTheDocument();
  });
});

describe("RequireStaff", () => {
  it("bloquea a quien no es staff", async () => {
    useAuth.mockReturnValue({ ...auth, isStaff: false });
    withRouter("/panel", <RequireStaff>panel_moderar</RequireStaff>);
    expect(await screen.findByText("PAGINA_INICIO")).toBeInTheDocument();
  });

  it("deja pasar al staff", () => {
    useAuth.mockReturnValue({ ...auth, isStaff: true });
    withRouter("/panel", <RequireStaff>panel_moderar</RequireStaff>);
    expect(screen.getByText("panel_moderar")).toBeInTheDocument();
  });
});