// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SplitBar } from "./SplitBar";

afterEach(cleanup);

/** Declarations map the bar's one job: exact shares, one favoured outcome. */
describe("SplitBar", () => {
  it("sizes each segment at the exact percentage", () => {
    const { container } = render(<SplitBar home={55.3} draw={20.2} away={24.5} />);

    const basis = (name: string) =>
      container.querySelector(`.split-bar__segment--${name}`)?.getAttribute("style") ?? "";
    expect(basis("home")).toContain("55.3%");
    expect(basis("draw")).toContain("20.2%");
    expect(basis("away")).toContain("24.5%");
  });

  it("emphasises only the most likely outcome", () => {
    const { container } = render(<SplitBar home={40} draw={35} away={25} />);

    const favoured = container.querySelector(".split-bar__value.is-favoured");
    expect(favoured?.classList.contains("split-bar__value--home")).toBe(true);
    expect(container.querySelectorAll(".split-bar__value.is-favoured").length).toBe(1);
  });

  it("omits zero-width segments but still reports them", () => {
    const { container } = render(<SplitBar home={0} draw={100} away={0} />);

    expect(container.querySelectorAll(".split-bar__segment").length).toBe(1);
    const label = container.querySelector('[role="img"]')?.getAttribute("aria-label");
    expect(label).toBe("Home win 0.0 percent, draw 100.0 percent, away win 0.0 percent");
  });

  it("speaks all three percentages in the accessible label", () => {
    const { container } = render(<SplitBar home={46.5} draw={26} away={27.5} />);

    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
      "Home win 46.5 percent, draw 26.0 percent, away win 27.5 percent",
    );
  });
});
