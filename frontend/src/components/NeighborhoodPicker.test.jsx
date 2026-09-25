import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NeighborhoodPicker from "./NeighborhoodPicker.jsx";
import { NEIGHBORHOODS } from "../constants.js";

const baseCls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

function Harness(props) {
  const [value, setValue] = useState("");
  return (
    <NeighborhoodPicker
      value={value}
      onChange={setValue}
      allowEmpty
      emptyLabel="Todos"
      className={baseCls}
      {...props}
    />
  );
}

describe("NeighborhoodPicker", () => {
  it("muestra la lista completa de barrios con la opción vacía", () => {
    render(<Harness />);
    const barrio = screen.getByLabelText("Barrio o zona");
    expect(barrio).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(NEIGHBORHOODS.length + 1);
  });

  it("al elegir Barrio 508 aparece el select de subopciones", () => {
    render(<Harness />);
    const first = screen.getByLabelText("Barrio o zona");
    expect(screen.queryByLabelText("Subbarrio")).not.toBeInTheDocument();

    fireEvent.change(first, { target: { value: "Barrio 508" } });
    const sub = screen.getByLabelText("Subbarrio");
    expect(sub).toBeInTheDocument();
    expect(sub.value).toBe("Barrio 508");
  });

  it("al elegir Sector 300 notifica el valor final", () => {
    const onChange = vi.fn();
    render(
      <NeighborhoodPicker value="Barrio 508" onChange={onChange} allowEmpty emptyLabel="Todos" className={baseCls} />
    );
    fireEvent.change(screen.getByLabelText("Subbarrio"), { target: { value: "Sector 300" } });
    expect(onChange).toHaveBeenCalledWith("Sector 300");
  });

  it("con un barrio común no muestra subopciones", () => {
    render(<Harness value="Centro" />);
    expect(screen.queryByLabelText("Subbarrio")).not.toBeInTheDocument();
  });
});