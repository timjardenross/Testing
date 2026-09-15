import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { it, expect, vi, afterEach } from "vitest";
import { Assessment } from "../../src/components/Assessment";
import { Live } from "../../src/components/Live";
import { emptyData, emptyCentre } from "../../src/domain/model";
import { input } from "../fixtures";
import { complete } from "../../src/domain/records";
afterEach(cleanup);
it("override workflow blocks missing rationale and submits human decision separately", async () => {
  const save = vi.fn(),
    finish = vi.fn().mockResolvedValue(undefined);
  render(
    <Assessment
      initial={input()}
      data={emptyData()}
      eventId="test"
      onSave={save}
      onComplete={finish}
      onExport={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "5. Decision & review" }));
  fireEvent.change(screen.getByLabelText("Recorded human posture"), {
    target: { value: "T2" },
  });
  fireEvent.change(screen.getByLabelText("Decision-maker"), {
    target: { value: "Delegate" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Complete assessment" }));
  expect(finish).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toContain("Override rationale");
  fireEvent.change(screen.getByLabelText("Override rationale (required)"), {
    target: { value: "Precautionary preparation" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Complete assessment" }));
  expect(finish).toHaveBeenCalledWith(
    expect.anything(),
    "T2",
    "Delegate",
    "Precautionary preparation",
  );
});
it("centre selection aggregates and save retains selection", () => {
  const d = emptyData(),
    c = { ...emptyCentre(), name: "DEMO Centre", people: 120 };
  d.centres.push(c);
  const save = vi.fn().mockResolvedValue(undefined);
  render(
    <Assessment
      initial={input()}
      data={d}
      eventId="test"
      onSave={save}
      onComplete={vi.fn()}
      onExport={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "2. Exposure" }));
  fireEvent.click(screen.getByLabelText(/DEMO Centre/));
  expect(screen.getByText("1 centres · 120 people")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
  expect(save.mock.calls[0][0].centres).toEqual([c.id]);
});
it("live actions use recommendation without retyping and recovery exposes checks", () => {
  const d = emptyData();
  complete(d, "one", input(), "T0", "Delegate", "");
  render(
    <Live event={d.events[0]} data={d} mutate={vi.fn()} reassess={vi.fn()} />,
  );
  fireEvent.click(screen.getAllByRole("button", { name: "Add to actions" })[0]);
  expect(
    (screen.getByLabelText("Action") as HTMLTextAreaElement).value,
  ).toContain("Maintain seasonal");
  fireEvent.click(screen.getByRole("button", { name: "Recovery & review" }));
  expect(screen.getByText("People welfare and ability to work")).toBeTruthy();
});
