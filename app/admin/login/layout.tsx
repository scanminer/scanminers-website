import type { ReactNode } from "react";

// This layout prevents the admin sidebar from showing on the login page
export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
