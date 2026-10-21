import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  /** Label of the first button, e.g. "Elimina". */
  label: string
  /** Accessible name of the first button, when the label alone is ambiguous in a list. */
  ariaLabel?: string
  /** Label of the second, confirming button, e.g. "Conferma eliminazione". */
  confirmLabel: string
  /** Label of the confirming button while the action runs. */
  pendingLabel: string
  isPending: boolean
  /** Runs on the second click; call `done` when the action settles to close the confirmation. */
  onConfirm: (done: () => void) => void
  /** Called when the user backs out. */
  onCancel?: () => void
  /** Extra content (e.g. an optional reason) shown only during the confirmation step. */
  details?: ReactNode
  tone?: 'danger' | 'primary'
}

const tones = {
  danger: 'bg-red-600 hover:bg-red-700',
  primary: 'bg-brand-500 hover:bg-brand-600',
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2'

/** Two-step inline action: a first click asks for confirmation, the second one runs it. */
export function ConfirmAction({
  label,
  ariaLabel,
  confirmLabel,
  pendingLabel,
  isPending,
  onConfirm,
  onCancel,
  details,
  tone = 'danger',
}: Props) {
  const [confirming, setConfirming] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const step = useRef<HTMLDivElement>(null)
  const backedOut = useRef(false)

  // Keyboard users must not lose their place: move focus into the confirmation step
  // (the optional field first, else the confirm button) and back to the trigger if they back out
  useEffect(() => {
    if (confirming) {
      step.current?.querySelector<HTMLElement>('input, textarea, button')?.focus()
    } else if (backedOut.current) {
      backedOut.current = false
      trigger.current?.focus()
    }
  }, [confirming])

  if (!confirming) {
    return (
      <button
        ref={trigger}
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={ariaLabel}
        className={`rounded-lg px-3 py-1.5 text-muted hover:bg-gray-100 ${focusRing}`}
      >
        {label}
      </button>
    )
  }

  const close = () => setConfirming(false)
  return (
    <div ref={step} className="flex flex-col gap-2">
      {details}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onConfirm(close)}
          disabled={isPending}
          className={`rounded-lg px-3 py-1.5 font-semibold text-white disabled:opacity-60 ${tones[tone]} ${focusRing}`}
        >
          {isPending ? pendingLabel : confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            backedOut.current = true
            close()
            onCancel?.()
          }}
          disabled={isPending}
          className={`rounded-lg px-3 py-1.5 text-muted hover:bg-gray-100 ${focusRing}`}
        >
          Annulla
        </button>
      </div>
    </div>
  )
}
