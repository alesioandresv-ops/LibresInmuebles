import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const createProperty = vi.fn();
const uploadImage = vi.fn();
const navigate = vi.fn();

vi.mock("../api/properties.js", () => ({
  createProperty: (...a) => createProperty(...a),
  uploadImage: (...a) => uploadImage(...a),
}));

vi.mock("../hooks/usePageTitle.js", () => ({ default: () => {} }));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

import Publish from "./Publish.jsx";

function makeFile(name, type = "image/jpeg", size = 1024) {
  return new File([new Uint8Array(size)], name, { type });
}

function fillWizard() {
  // Paso 0
  fireEvent.click(screen.getByText("Venta"));
  fireEvent.click(screen.getByText("Casa"));
  fireEvent.click(screen.getByText("Continuar →"));

  // Paso 1
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Casa linda" } });
  fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Una casa muy linda en el centro" } });
  fireEvent.change(screen.getByLabelText("Barrio o zona"), { target: { value: "Centro" } });
  fireEvent.change(screen.getByLabelText("Dirección"), { target: { value: "Calle 1" } });
  fireEvent.change(screen.getByLabelText("Precio"), { target: { value: "1000" } });
  fireEvent.click(screen.getByText("Continuar →"));
  // ahora estamos en el paso de Fotos
}

function goToReview() {
  fireEvent.click(screen.getByText("Continuar →")); // Fotos -> Servicios
  fireEvent.click(screen.getByText("Continuar →")); // Servicios -> Revisión
}

beforeEach(() => {
  createProperty.mockReset();
  uploadImage.mockReset();
  navigate.mockReset();
  globalThis.URL.createObjectURL = vi.fn(() => "blob:mock");
  globalThis.URL.revokeObjectURL = vi.fn();
});

describe("Publish", () => {
  it("deja agregar fotos en su propio paso y las sube al publicar", async () => {
    createProperty.mockResolvedValue({ id: 99 });
    uploadImage.mockResolvedValue({ id: 1 });

    render(<Publish />);
    fillWizard();

    const file = makeFile("foto.jpg");
    fireEvent.change(screen.getByLabelText(/Fotos/), { target: { files: [file] } });
    expect(screen.getByText(/1 agregada/)).toBeInTheDocument();

    goToReview();
    fireEvent.click(screen.getByText("Publicar gratis"));

    await waitFor(() => expect(createProperty).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(uploadImage).toHaveBeenCalledWith(99, file));
    expect(navigate).toHaveBeenCalledWith("/properties/99");
  });

  it("permite quitar una foto antes de publicar", () => {
    render(<Publish />);
    fillWizard();

    fireEvent.change(screen.getByLabelText(/Fotos/), { target: { files: [makeFile("foto.jpg")] } });
    expect(screen.getByText(/1 agregada/)).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Quitar foto"));
    expect(screen.getByText(/0 agregadas/)).toBeInTheDocument();
  });

  it("NO borra la publicación si falla la subida de una foto", async () => {
    createProperty.mockResolvedValue({ id: 77 });
    uploadImage.mockRejectedValue(new Error("boom"));

    render(<Publish />);
    fillWizard();
    fireEvent.change(screen.getByLabelText(/Fotos/), { target: { files: [makeFile("foto.jpg")] } });
    goToReview();
    fireEvent.click(screen.getByText("Publicar gratis"));

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    const [path, opts] = navigate.mock.calls[0];
    expect(path).toBe("/mis-publicaciones/77/editar");
    expect(opts.state.photoWarning).toMatch(/se creó correctamente/i);
  });

  it("rechaza archivos que no son JPG/PNG/WebP", () => {
    render(<Publish />);
    fillWizard();

    fireEvent.change(screen.getByLabelText(/Fotos/), {
      target: { files: [makeFile("doc.pdf", "application/pdf")] },
    });
    expect(screen.getByText(/Se omitieron 1 archivo/)).toBeInTheDocument();
    expect(screen.getByText(/0 agregadas/)).toBeInTheDocument();
  });
});
