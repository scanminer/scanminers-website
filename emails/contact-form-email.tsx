import * as React from "react";

export type ContactFormEmailProps = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

export default function ContactFormEmail({ name, email, company, message }: ContactFormEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>New Demo Request</title>
      </head>
      <body style={{ fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif", background: "#ffffff", color: "#111", padding: 24 }}>
        <h1 style={{ fontSize: 20, margin: 0, marginBottom: 16 }}>New Demo Request</h1>
        <table cellPadding={8} cellSpacing={0} style={{ borderCollapse: "collapse", width: "100%", maxWidth: 640 }}>
          <tbody>
            <tr>
              <td style={{ width: 160, fontWeight: 600, verticalAlign: "top", background: "#f5f5f5" }}>Name</td>
              <td>{name}</td>
            </tr>
            <tr>
              <td style={{ width: 160, fontWeight: 600, verticalAlign: "top", background: "#f5f5f5" }}>Email</td>
              <td>{email}</td>
            </tr>
            {company ? (
              <tr>
                <td style={{ width: 160, fontWeight: 600, verticalAlign: "top", background: "#f5f5f5" }}>Company</td>
                <td>{company}</td>
              </tr>
            ) : null}
            <tr>
              <td style={{ width: 160, fontWeight: 600, verticalAlign: "top", background: "#f5f5f5" }}>Message</td>
              <td>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{message}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 24, fontSize: 12, color: "#555" }}>This email was sent automatically from the Scanminers website contact form.</p>
      </body>
    </html>
  );
}
