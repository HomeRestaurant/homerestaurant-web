import { useState } from 'react'
import { Link, useParams } from 'react-router'
import type { HostBooking, MealOwner } from '../api/client'
import { Button } from '../components/Button'
import { ConfirmAction } from '../components/ConfirmAction'
import { ChipRadio } from '../components/ChipSelect'
import { FormError } from '../components/FormError'
import { PageState } from '../components/PageState'
import { TextField } from '../components/TextField'
import {
  bookingStatusLabel,
  formatSeats,
  formatSeatsLeft,
} from '../features/bookings/bookingStatus'
import {
  useConfirmBooking,
  useDeclineBooking,
  useHostCancelBooking,
  useMealBookings,
} from '../features/bookings/queries'
import {
  groupByStart,
  matchesTab,
  REQUEST_TAB_LABELS,
  scopeForTab,
  type RequestTab,
} from '../features/bookings/requestFilters'
import { foodWarnings } from '../features/meals/foodWarnings'
import { useMyMeals } from '../features/meals/queries'
import { ALLERGENS, DIETS, labelList } from '../features/preferences/options'
import { formatLongDate, formatSlotTime } from '../lib/format'

const STATUS_STYLES: Record<HostBooking['status'], string> = {
  pending: 'bg-brand-100 text-brand-700',
  confirmed: 'bg-green-100 text-green-800',
  declined: 'bg-gray-100 text-muted',
  cancelled: 'bg-gray-100 text-muted',
  expired: 'bg-gray-100 text-muted',
}

const EMPTY_TEXT: Record<RequestTab, string> = {
  pending:
    'Nessuna richiesta in attesa. Quando qualcuno vorrà sedersi alla tua tavola lo vedrai qui.',
  confirmed: 'Nessuna prenotazione confermata per le prossime date.',
  other: 'Nessuna richiesta rifiutata, annullata o scaduta.',
  past: 'Nessuna richiesta per le date passate.',
}

export function MealRequestsPage() {
  const { mealId = '' } = useParams()
  // From "my meals" so hidden meals work too, and we get allergens/diets/seats of the meal
  const meals = useMyMeals()
  const meal = meals.data?.find((m) => m.id === mealId)

  if (meals.isPending) return <PageState>Caricamento…</PageState>
  if (meals.isError) {
    return (
      <PageState>Non riusciamo a caricare i tuoi pasti. Ricarica la pagina e riprova.</PageState>
    )
  }
  if (!meal) {
    return (
      <PageState>
        Pasto non trovato tra i tuoi.{' '}
        <Link to="/i-miei-pasti" className="font-semibold text-ink underline">
          Torna ai tuoi pasti
        </Link>
      </PageState>
    )
  }
  return <Requests meal={meal} />
}

function Requests({ meal }: { meal: MealOwner }) {
  const [tab, setTab] = useState<RequestTab>('pending')
  const bookings = useMealBookings(meal.id, { scope: scopeForTab(tab) })
  const confirm = useConfirmBooking(meal.id)
  const decline = useDeclineBooking(meal.id)
  const cancel = useHostCancelBooking(meal.id)
  const [message, setMessage] = useState('')

  const visible = bookings.data?.filter((b) => matchesTab(b.status, tab)) ?? []
  const groups = groupByStart(visible)
  const seatsLeft = new Map(meal.slots.map((slot) => [slot.id, slot.available_seats]))

  function run<V>(
    mutation: { mutate: (v: V, o: { onSuccess: () => void }) => void },
    text: string,
  ) {
    return (variables: V, onSuccess?: () => void) => {
      setMessage('')
      mutation.mutate(variables, {
        onSuccess: () => {
          setMessage(text)
          onSuccess?.()
        },
      })
    }
  }
  const doConfirm = run(confirm, 'Richiesta confermata: l’ospite è stato avvisato.')
  const doDecline = run(decline, 'Richiesta rifiutata: l’ospite è stato avvisato.')
  const doCancel = run(cancel, 'Prenotazione annullata: l’ospite è stato avvisato.')

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold">Richieste di prenotazione</h1>
          <p className="mt-1 break-words text-muted">{meal.title}</p>
        </div>
        <Link to={`/pasti/${meal.id}/modifica`} className="text-sm font-semibold underline">
          Gestisci il pasto
        </Link>
      </div>

      <div className="mt-6">
        <ChipRadio
          aria-label="Filtra le richieste"
          options={REQUEST_TAB_LABELS}
          value={tab}
          onChange={(next) => {
            setTab(next)
            setMessage('')
          }}
        />
      </div>

      <p role="status" className="mt-4 text-sm text-green-700">
        {message}
      </p>

      {bookings.isPending && <PageState>Caricamento…</PageState>}
      {bookings.isError && (
        <PageState>
          <p>Non riusciamo a caricare le richieste.</p>
          <Button variant="secondary" className="mt-4" onClick={() => bookings.refetch()}>
            Riprova
          </Button>
        </PageState>
      )}
      {bookings.data && visible.length === 0 && <PageState>{EMPTY_TEXT[tab]}</PageState>}

      <div className="mt-4 space-y-10">
        {groups.map((group) => {
          const slotId = group.items[0]?.slot_id
          const left = slotId ? seatsLeft.get(slotId) : undefined
          return (
            <section key={group.startsAt} aria-labelledby={`slot-${group.startsAt}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line pb-2">
                <h2 id={`slot-${group.startsAt}`} className="text-lg font-semibold">
                  <span className="inline-block first-letter:uppercase">
                    {formatLongDate(group.startsAt)}
                  </span>
                  , {formatSlotTime(group.startsAt)}
                </h2>
                {left !== undefined && tab !== 'past' && (
                  <p className="text-sm text-muted">{formatSeatsLeft(left)}</p>
                )}
              </div>
              <ul className="divide-y divide-line">
                {group.items.map((booking) => (
                  <RequestRow
                    key={booking.id}
                    booking={booking}
                    meal={meal}
                    isConfirming={confirm.isPending && confirm.variables?.bookingId === booking.id}
                    confirmLocked={confirm.isPending}
                    isDeclining={decline.isPending && decline.variables?.bookingId === booking.id}
                    isCancelling={cancel.isPending && cancel.variables?.bookingId === booking.id}
                    error={
                      [confirm, decline, cancel]
                        .filter((m) => m.variables?.bookingId === booking.id)
                        .find((m) => m.error)?.error ?? null
                    }
                    onConfirm={() => doConfirm({ bookingId: booking.id })}
                    onDecline={(reason, done) => doDecline({ bookingId: booking.id, reason }, done)}
                    onCancel={(reason, done) => doCancel({ bookingId: booking.id, reason }, done)}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </main>
  )
}

type RowProps = {
  booking: HostBooking
  meal: MealOwner
  isConfirming: boolean
  confirmLocked: boolean
  isDeclining: boolean
  isCancelling: boolean
  error: Error | null
  onConfirm: () => void
  onDecline: (reason: string, done: () => void) => void
  onCancel: (reason: string, done: () => void) => void
}

function RequestRow({
  booking,
  meal,
  isConfirming,
  confirmLocked,
  isDeclining,
  isCancelling,
  error,
  onConfirm,
  onDecline,
  onCancel,
}: RowProps) {
  const [reason, setReason] = useState('')
  const reasonField = (
    <TextField
      label="Motivo (facoltativo)"
      maxLength={300}
      value={reason}
      onChange={(e) => setReason(e.target.value)}
    />
  )
  const name = booking.guest.first_name
  const busy = isConfirming || isDeclining || isCancelling

  return (
    <li className="space-y-3 py-5">
      <div className="flex flex-wrap items-center gap-3">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700"
        >
          {name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold break-words">{name}</p>
          <p className="text-sm text-muted">{formatSeats(booking.seats)}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}
        >
          {bookingStatusLabel(booking)}
        </span>
      </div>

      {booking.message && (
        <p className="text-sm break-words whitespace-pre-line">“{booking.message}”</p>
      )}
      {booking.status_reason && (
        <p className="text-sm text-muted break-words">Motivo: {booking.status_reason}</p>
      )}
      {booking.guest_dietary && <GuestDietaryBlock booking={booking} meal={meal} />}

      {booking.status === 'pending' && (
        <div className="flex flex-wrap items-start gap-2 text-sm">
          <Button size="sm" disabled={busy || confirmLocked} onClick={onConfirm}>
            {isConfirming ? 'Conferma in corso…' : 'Conferma'}
          </Button>
          <ConfirmAction
            label="Rifiuta"
            ariaLabel={`Rifiuta la richiesta di ${name}`}
            confirmLabel="Conferma il rifiuto"
            pendingLabel="Rifiuto…"
            isPending={isDeclining}
            details={reasonField}
            onCancel={() => setReason('')}
            onConfirm={(done) =>
              onDecline(reason, () => {
                setReason('')
                done()
              })
            }
          />
        </div>
      )}
      {booking.status === 'confirmed' && (
        <div className="text-sm">
          {booking.late_cancellation_window && (
            <p className="mb-2 text-muted">
              Manca poco all’inizio: l’annullamento verrà registrato come tardivo.
            </p>
          )}
          <ConfirmAction
            label="Annulla prenotazione"
            ariaLabel={`Annulla la prenotazione di ${name}`}
            confirmLabel="Conferma l’annullamento"
            pendingLabel="Annullamento…"
            isPending={isCancelling}
            details={reasonField}
            onCancel={() => setReason('')}
            onConfirm={(done) =>
              onCancel(reason, () => {
                setReason('')
                done()
              })
            }
          />
        </div>
      )}
      <FormError error={error} />
    </li>
  )
}

/** Health data of the guest, only sent by the backend for live requests. */
function GuestDietaryBlock({ booking, meal }: { booking: HostBooking; meal: MealOwner }) {
  const dietary = booking.guest_dietary
  if (!dietary) return null
  const { allergens, unsuitableDiets } = foodWarnings(dietary, meal)
  const diets = dietary.diets.filter((diet) => diet !== 'omnivore')
  const allergies = [labelList(dietary.allergies, ALLERGENS), dietary.allergy_notes].filter(Boolean)
  const hasAnything = diets.length > 0 || allergies.length > 0 || dietary.disliked_foods

  return (
    <div className="space-y-2 rounded-card bg-brand-50 p-4 text-sm">
      <p className="font-semibold">Alimentazione e allergie</p>
      {hasAnything ? (
        <ul className="space-y-1">
          {diets.length > 0 && (
            <li>
              <span className="font-semibold">Alimentazione:</span> {labelList(diets, DIETS)}
            </li>
          )}
          {allergies.length > 0 && (
            <li>
              <span className="font-semibold">Allergie e intolleranze:</span> {allergies.join(', ')}
            </li>
          )}
          {dietary.disliked_foods && (
            <li>
              <span className="font-semibold">Non gradisce:</span> {dietary.disliked_foods}
            </li>
          )}
        </ul>
      ) : (
        <p>{booking.guest.first_name} mangia di tutto e non ha allergie.</p>
      )}
      {(allergens.length > 0 || unsuitableDiets.length > 0) && (
        <div className="space-y-1 rounded-lg border border-red-200 bg-red-50 p-3">
          {allergens.length > 0 && (
            <p className="font-semibold text-red-800">
              Attenzione: il tuo pasto contiene {labelList(allergens, ALLERGENS).toLowerCase()}, che{' '}
              {booking.guest.first_name} ha indicato tra le sue allergie.
            </p>
          )}
          {unsuitableDiets.length > 0 && (
            <p className="text-red-800">
              Non l’hai indicato come adatto all’alimentazione di {booking.guest.first_name} (
              {labelList(unsuitableDiets, DIETS).toLowerCase()}).
            </p>
          )}
        </div>
      )}
    </div>
  )
}
