type Option<T extends string> = { value: T; label: string }

function toOptions<T extends string>(labels: Partial<Record<T, string>>): Option<T>[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }))
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        selected ? 'border-ink bg-ink text-white' : 'border-gray-300 hover:border-ink'
      }`}
    >
      {children}
    </button>
  )
}

type MultiProps<T extends string> = {
  options: Partial<Record<T, string>>
  value: T[]
  onChange: (value: T[]) => void
}

/** Pick any number of options, shown as toggleable chips. */
export function ChipSelect<T extends string>({ options, value, onChange }: MultiProps<T>) {
  const toggle = (option: T) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])
  return (
    <div className="flex flex-wrap gap-2">
      {toOptions(options).map((option) => (
        <Chip
          key={option.value}
          selected={value.includes(option.value)}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}

type SingleProps<T extends string> = {
  options: Partial<Record<T, string>>
  value: T | null
  onChange: (value: T) => void
}

/** Pick exactly one option, shown as chips. */
export function ChipRadio<T extends string>({ options, value, onChange }: SingleProps<T>) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {toOptions(options).map((option) => (
        <Chip
          key={option.value}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}
