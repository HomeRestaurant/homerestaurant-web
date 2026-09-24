import type { ReactNode } from 'react'

/** Centered card used by the login and sign-up pages. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <div className="rounded-card border border-line p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
        {children}
      </div>
    </main>
  )
}
