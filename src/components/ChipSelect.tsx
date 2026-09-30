import type { ButtonHTMLAttributes, KeyboardEvent } from 'react'

type Option<T extends string> = { value: T; label: string }

function toOptions<T extends string>(labels: Partial<Record<T, string>>): Option<T>[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }))
}

function Chip({
  selected,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean; children: string }) {
  return (
    <button
      type="button"
      className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
        selected ? 'border-ink bg-ink text-white' : 'border-gray-300 hover:border-ink'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

// Name the group when it isn't inside a <fieldset> with a <legend>
type GroupLabel = { 'aria-label'?: string; 'aria-labelledby'?: string }

type MultiProps<T extends string> = GroupLabel & {
  options: Partial<Record<T, string>>
  value: T[]
  onChange: (value: T[]) => void
}

/** Pick any number of options, shown as toggleable chips. */
export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  ...label
}: MultiProps<T>) {
  const toggle = (option: T) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])
  return (
    <div role="group" className="flex flex-wrap gap-2" {...label}>
      {toOptions(options).map((option) => (
        <Chip
          key={option.value}
          selected={value.includes(option.value)}
          aria-pressed={value.includes(option.value)}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}

type SingleProps<T extends string> = GroupLabel & {
  options: Partial<Record<T, string>>
  value: T | null
  onChange: (value: T) => void
}

/** Pick exactly one option, shown as chips. Behaves like a radio group (arrow keys move the choice). */
export function ChipRadio<T extends string>({
  options,
  value,
  onChange,
  ...label
}: SingleProps<T>) {
  const items = toOptions(options)
  // Only one chip is tabbable: the selected one, or the first if none is selected yet
  const tabbable = items.some((o) => o.value === value) ? value : items[0]?.value

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const current = items.findIndex((o) => o.value === tabbable)
    const next = (current + step + items.length) % items.length
    onChange(items[next].value)
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    buttons[next]?.focus()
  }

  return (
    <div role="radiogroup" className="flex flex-wrap gap-2" onKeyDown={handleKeyDown} {...label}>
      {items.map((option) => (
        <Chip
          key={option.value}
          role="radio"
          selected={value === option.value}
          aria-checked={value === option.value}
          tabIndex={option.value === tabbable ? 0 : -1}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}
