import type { ProjectEmail } from "@/lib/project-store";

interface ProjectEmailsListProps {
  emails: ProjectEmail[];
}

export function ProjectEmailsList({ emails }: ProjectEmailsListProps) {
  if (emails.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold text-lg mb-4">Email Communications</h3>
        <p className="text-sm text-muted-foreground">
          No email communications yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="font-semibold text-lg mb-4">
        Email Communications ({emails.length})
      </h3>
      <div className="space-y-4">
        {emails.map((email) => (
          <div
            key={email.id}
            className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {email.direction === "outbound" ? (
                  <svg
                    className="h-4 w-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                )}
                <h4 className="font-medium text-sm">{email.subject}</h4>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    email.status === "sent" || email.status === "delivered"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {email.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(email.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              {email.fromEmail && (
                <div>
                  <span className="font-medium">From:</span> {email.fromEmail}
                </div>
              )}
              {email.toEmail && (
                <div>
                  <span className="font-medium">To:</span> {email.toEmail}
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground line-clamp-3">
              <div dangerouslySetInnerHTML={{ __html: email.body }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
