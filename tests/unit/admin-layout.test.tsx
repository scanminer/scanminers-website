import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mockSession = {
  expires: "2099-01-01T00:00:00.000Z",
  user: {
    name: "Admin Tester",
    email: "admin@example.com",
    isAdmin: true,
  },
};

vi.mock("@/components/admin/admin-layout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-shell">{children}</div>,
}));

vi.mock("@/components/admin/admin-session-provider", () => ({
  AdminSessionProvider: ({ session, children }: { session: unknown; children: React.ReactNode }) => (
    <div data-testid="session-provider" data-session={session ? "present" : "missing"}>
      {children}
    </div>
  ),
}));

const getAdminSession = vi.fn(async () => mockSession);

vi.mock("@/lib/admin-session", () => ({
  getAdminSession,
}));

describe("/admin layout", () => {
  it("renders children when a valid session is available", async () => {
    const Layout = (await import("../../app/admin/layout")).default;
    const element = await Layout({ children: <p>Secret body</p> });
    const html = renderToStaticMarkup(<>{element}</>);

    expect(getAdminSession).toHaveBeenCalledTimes(1);
    expect(html).toContain("data-testid=\"session-provider\"");
    expect(html).toContain("data-session=\"present\"");
    expect(html).toContain("Secret body");
  });
});
