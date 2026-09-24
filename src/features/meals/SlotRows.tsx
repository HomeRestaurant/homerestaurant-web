import { nowForDatetimeInput } from '../../lib/format'
import { newSlotRow, type SlotRow } from './slots'

type Props = { rows: SlotRow[]; onChange: (rows: SlotRow[]) => void; maxGuests?: number }

/** Editable list of new dates for a meal. */
export function SlotRows({ rows, onChange, maxGuests }: Props) {
  const update = (key: number, patch: Partial<SlotRow>) =>
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.key} className="flex flex-wrap items-end gap-3">
          <label className="flex-1 text-sm font-medium">
            Data e ora
            <input
              type="datetime-local"
              min={nowForDatetimeInput()}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"
              value={row.startsAt}
              onChange={(e) => update(row.key, { startsAt: e.target.value })}
            />
          </label>
          <label className="w-28 text-sm font-medium">
            Posti
            <input
              type="number"
              min={1}
              max={maxGuests}
              placeholder={maxGuests ? String(maxGuests) : ''}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"
              value={row.capacity}
              onChange={(e) => update(row.key, { capacity: e.target.value })}
            />
          </label>
          <button
            type="button"
            onClick={() => onChange(rows.filter((r) => r.key !== row.key))}
            className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-gray-100"
            aria-label="Rimuovi data"
          >
            Rimuovi
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, newSlotRow()])}
        className="text-sm font-semibold underline"
      >
        + Aggiungi una data
      </button>
    </div>
  )
}
