import { useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { Meal, Slot } from '../../api/client'
import { Button } from '../../components/Button'
import { FormError } from '../../components/FormError'
import { TextArea } from '../../components/TextField'
import { formatLongDate, formatSlotTime } from '../../lib/format'
import { useAuth } from '../auth/AuthContext'
import { foodWarnings } from '../meals/foodWarnings'
import { ALLERGENS, DIETS, labelList } from '../preferences/options'
import { formatSeats, formatSeatsLeft, seatOptions } from './bookingStatus'
import {
  activeBookingBySlot,
  activeBookingText,
  clampSeats,
  futureSlots,
  isChoosable,
  resolveSelectedSlot,
} from './guestBookings'
import { useCreateBooking, useMyBookings } from './queries'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2'
const linkClass = `font-semibold underline rounded ${focusRing}`

/** Date choice and booking request in the sidebar of the meal page. */
export function BookingPanel({ meal }: { meal: Meal }) {
  const { isAuthenticated, user } = useAuth()
  const isHost = user?.id === meal.host.id
  const slots = futureSlots(meal.slots)

  return (
    <div className="mt-6">
      {slots.length === 0 && (
        <>
          <h3 className="text-sm font-semibold">Prossime date</h3>
          <p className="mt-2 text-sm text-muted">Nessuna data disponibile al momento.</p>
        </>
      )}
      {slots.length > 0 && !isAuthenticated && (
        <>
          <DateList slots={slots} />
          <Link
            to="/accedi"
            className={`mt-6 block w-full rounded-lg bg-brand-500 py-3 text-center font-semibold text-white hover:bg-brand-600 ${focusRing}`}
          >
            Accedi per prenotare
          </Link>
        </>
      )}
      {slots.length > 0 && isHost && (
        <>
          <DateList slots={slots} />
          <p className="mt-6 text-sm text-muted">È il tuo pasto: le richieste arrivano qui.</p>
          <Link
            to={`/pasti/${meal.id}/richieste`}
            className={`mt-2 block w-full rounded-lg border border-ink py-3 text-center font-semibold hover:bg-gray-50 ${focusRing}`}
          >
            Gestisci le richieste
          </Link>
        </>
      )}
      {slots.length > 0 && isAuthenticated && !isHost && <RequestForm meal={meal} slots={slots} />}
    </div>
  )
}

/** Read-only list of dates, for visitors and for the host. */
function DateList({ slots }: { slots: Slot[] }) {
  return (
    <>
      <h3 className="text-sm font-semibold">Prossime date</h3>
      <ul className="mt-2 divide-y divide-line">
        {slots.map((slot) => (
          <li key={slot.id} className="flex flex-wrap justify-between gap-x-3 py-2.5 text-sm">
            <SlotWhen startsAt={slot.starts_at} />
            <span className="text-muted">{formatSeatsLeft(slot.available_seats)}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function SlotWhen({ startsAt }: { startsAt: string }) {
  return (
    <span>
      <span className="inline-block first-letter:uppercase">{formatLongDate(startsAt)}</span>,{' '}
      {formatSlotTime(startsAt)}
    </span>
  )
}

function RequestForm({ meal, slots }: { meal: Meal; slots: Slot[] }) {
  const { user } = useAuth()
  const mine = useMyBookings({ scope: 'upcoming' })
  const create = useCreateBooking(meal.id)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [seats, setSeats] = useState(1)
  const [message, setMessage] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [sent, setSent] = useState('')
  const seatsId = useId()
  const summary = useRef<HTMLDivElement>(null)
  const firstStepButton = useRef<HTMLButtonElement>(null)

  const active = activeBookingBySlot(mine.data ?? [])
  const selected = resolveSelectedSlot(slots, active, slotId)
  const options = selected ? seatOptions(selected.available_seats) : []
  const chosenSeats = selected ? clampSeats(seats, selected.available_seats) : 1
  const hasChoosable = slots.some((slot) => isChoosable(slot, active))
  const warnings = foodWarnings(user, meal)
  const hasWarnings = warnings.allergens.length > 0 || warnings.unsuitableDiets.length > 0

  function reset() {
    setReviewing(false)
    create.reset()
  }

  function submit() {
    if (!selected) return
    create.mutate(
      { slotId: selected.id, seats: chosenSeats, message },
      {
        onSuccess: () => {
          setSent(
            `Richiesta inviata: ${meal.host.first_name} ti risponderà appena possibile. Ti avvisiamo con una notifica.`,
          )
          setMessage('')
          setSeats(1)
          setReviewing(false)
        },
        // The seats may have just run out: go back to the choice, where the error is shown
        onError: () => setReviewing(false),
      },
    )
  }

  return (
    <div className="space-y-5">
      <fieldset className="min-w-0">
        <legend className="text-sm font-semibold">Scegli una data</legend>
        <ul className="mt-2 space-y-2">
          {slots.map((slot) => {
            const booking = active.get(slot.id)
            return (
              <li key={slot.id}>
                {booking ? (
                  <div className="rounded-lg border border-line bg-brand-50 px-4 py-3 text-sm">
                    <SlotWhen startsAt={slot.starts_at} />
                    <p className="mt-1 font-semibold">{activeBookingText(booking.status)}</p>
                    <Link to="/prenotazioni" className={`text-sm ${linkClass}`}>
                      Vai alle tue prenotazioni
                    </Link>
                  </div>
                ) : (
                  <label
                    className={`flex items-start gap-3 rounded-lg border border-line px-4 py-3 text-sm has-[:checked]:border-ink has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink ${
                      slot.available_seats > 0 ? 'cursor-pointer' : 'text-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={slot.id}
                      disabled={slot.available_seats <= 0 || reviewing}
                      checked={selected?.id === slot.id}
                      onChange={() => {
                        setSlotId(slot.id)
                        setSent('')
                      }}
                      className="mt-0.5 size-4 accent-brand-500 focus:outline-none"
                    />
                    <span className="min-w-0">
                      <SlotWhen startsAt={slot.starts_at} />
                      <span className="block text-muted">
                        {formatSeatsLeft(slot.available_seats)}
                      </span>
                    </span>
                  </label>
                )}
              </li>
            )
          })}
        </ul>
      </fieldset>

      {!hasChoosable && (
        <p className="text-sm text-muted">
          Non ci sono altre date con posti liberi: se ti interessa, riprova più avanti.
        </p>
      )}

      {selected && !reviewing && (
        <>
          <div>
            <label htmlFor={seatsId} className="text-sm font-medium">
              Quanti posti?
            </label>
            <select
              id={seatsId}
              value={chosenSeats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:border-ink focus:ring-2 focus:ring-ink"
            >
              {options.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
          <TextArea
            label="Messaggio per l’host (facoltativo)"
            maxLength={300}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            ref={firstStepButton}
            type="button"
            className="w-full"
            onClick={() => {
              setSent('')
              create.reset()
              setReviewing(true)
              // Move focus to the summary once it is on screen
              setTimeout(() => summary.current?.focus(), 0)
            }}
          >
            Richiedi di partecipare
          </Button>
        </>
      )}

      {selected && reviewing && (
        <div
          ref={summary}
          tabIndex={-1}
          aria-labelledby="riepilogo-titolo"
          className="space-y-4 rounded-card bg-brand-50 p-4 focus:outline-none"
        >
          <h4 id="riepilogo-titolo" className="font-semibold">
            Riepilogo della richiesta
          </h4>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="inline font-semibold">Quando: </dt>
              <dd className="inline">
                <SlotWhen startsAt={selected.starts_at} />
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold">Posti: </dt>
              <dd className="inline">{formatSeats(chosenSeats)}</dd>
            </div>
            {message.trim() && (
              <div>
                <dt className="inline font-semibold">Messaggio: </dt>
                <dd className="inline break-words">“{message.trim()}”</dd>
              </div>
            )}
          </dl>
          <p className="text-sm">
            Questa è una richiesta: {meal.host.first_name} deve confermarla prima che il posto sia
            tuo. Il pasto è gratuito.
          </p>
          {hasWarnings && (
            <div
              role="alert"
              className="space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {warnings.allergens.length > 0 && (
                <p className="font-semibold">
                  Attenzione: questo pasto contiene{' '}
                  {labelList(warnings.allergens, ALLERGENS).toLowerCase()}, che hai indicato tra le
                  tue allergie.
                </p>
              )}
              {warnings.unsuitableDiets.length > 0 && (
                <p>
                  L’host non l’ha indicato come adatto alla tua alimentazione (
                  {labelList(warnings.unsuitableDiets, DIETS).toLowerCase()}). Puoi inviare la
                  richiesta lo stesso.
                </p>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={create.isPending} onClick={submit}>
              {create.isPending ? 'Invio…' : 'Invia richiesta'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={create.isPending}
              onClick={() => {
                reset()
                setTimeout(() => firstStepButton.current?.focus(), 0)
              }}
            >
              Indietro
            </Button>
          </div>
        </div>
      )}

      <FormError error={create.error} />
      {/* Always mounted so screen readers announce the text when it changes */}
      <p role="status" className="text-sm text-green-700">
        {sent}
      </p>
    </div>
  )
}
