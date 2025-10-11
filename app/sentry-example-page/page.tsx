'use client'

import * as Sentry from '@sentry/nextjs'

export default function SentryExamplePage() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sentry Example</h1>
        <button
          className="px-4 py-2 bg-black text-white rounded"
          onClick={() => {
            // Trigger a test error
            try {
              const w = window as unknown as { myUndefinedFunction?: () => void }
              // Intentionally call an undefined function to test Sentry
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (w.myUndefinedFunction) {
                w.myUndefinedFunction()
              } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore – intentionally call an undefined function to trigger Sentry
                w.myUndefinedFunction()
              }
            } catch (err) {
              Sentry.captureException(err)
              throw err
            }
          }}
        >
          Trigger Error
        </button>
      </main>
    </div>
  )
}
