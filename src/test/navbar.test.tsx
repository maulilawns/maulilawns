import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { SiteProvider } from "@/data/store";
import { Navbar } from "@/components/site/navbar";
vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => "/",
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
afterEach(cleanup);
describe("Public navbar runtime", () => {
  it("mounts without hook errors and supports opening and dismissing the menu", () => {
    render(
      <SiteProvider>
        <Navbar />
      </SiteProvider>,
    );
    const open = screen.getByRole("button", { name: "Open menu" });
    expect(open.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(open);
    expect(open.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByLabelText("Mobile menu")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(open.getAttribute("aria-expanded")).toBe("false");
  });
});
