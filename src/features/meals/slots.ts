export type SlotRow = { key: number; startsAt: string; capacity: string }

let nextKey = 0
export const newSlotRow = (): SlotRow => ({ key: nextKey++, startsAt: '', capacity: '' })

/** Rows (value from <input type="datetime-local">) -> API payload, skipping empty rows. */
export function toSlotPayload(rows: SlotRow[]) {
  return rows
    .filter((row) => row.startsAt)
    .map((row) => ({
      starts_at: new Date(row.startsAt).toISOString(),
      capacity: row.capacity ? Number(row.capacity) : null,
    }))
}
