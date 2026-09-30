import type { ReactNode } from 'react'

/** Loading / error / empty message shown in place of a page's content. */
export function PageState({ children }: { children: ReactNode }) {
  return (
    <div aria-live="polite" className="py-16 text-center text-muted">
      {children}
    </div>
  )
}
