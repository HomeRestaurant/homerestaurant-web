import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  unwrap,
  type BookingAction,
  type BookingScope,
  type BookingStatus,
} from '../../api/client'

export type MealBookingsFilters = { scope: BookingScope; slotId?: string; status?: BookingStatus }

const keys = {
  all: ['bookings'] as const,
  forMeal: (mealId: string, filters: MealBookingsFilters) =>
    ['bookings', 'meal', mealId, filters] as const,
}

/** Booking requests received by the host of a meal. */
export function useMealBookings(mealId: string, filters: MealBookingsFilters) {
  return useQuery({
    queryKey: keys.forMeal(mealId, filters),
    queryFn: () =>
      unwrap(
        api.GET('/meals/{meal_id}/bookings', {
          params: {
            path: { meal_id: mealId },
            query: {
              scope: filters.scope,
              slot_id: filters.slotId,
              status: filters.status,
              limit: 100,
            },
          },
        }),
      ),
  })
}

export type BookingActionVariables = { bookingId: string; reason?: string }

/** A transition changes bookings, free seats on the meal and the notifications of both sides. */
function useBookingMutation(mutationFn: (variables: BookingActionVariables) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    // onSettled: after a 409 the lists are stale too (the guest may have just cancelled)
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.all }),
        queryClient.invalidateQueries({ queryKey: ['meals'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ]),
  })
}

/** Optional reason: blank becomes an empty body, which the backend accepts. */
function actionBody({ reason }: BookingActionVariables): BookingAction {
  const trimmed = reason?.trim()
  return trimmed ? { reason: trimmed } : {}
}

export function useConfirmBooking(mealId: string) {
  return useBookingMutation(({ bookingId }) =>
    unwrap(
      api.POST('/meals/{meal_id}/bookings/{booking_id}/confirm', {
        params: { path: { meal_id: mealId, booking_id: bookingId } },
      }),
    ),
  )
}

export function useDeclineBooking(mealId: string) {
  return useBookingMutation((variables) =>
    unwrap(
      api.POST('/meals/{meal_id}/bookings/{booking_id}/decline', {
        params: { path: { meal_id: mealId, booking_id: variables.bookingId } },
        body: actionBody(variables),
      }),
    ),
  )
}

/** Host cancelling an already confirmed booking. */
export function useHostCancelBooking(mealId: string) {
  return useBookingMutation((variables) =>
    unwrap(
      api.POST('/meals/{meal_id}/bookings/{booking_id}/cancel', {
        params: { path: { meal_id: mealId, booking_id: variables.bookingId } },
        body: actionBody(variables),
      }),
    ),
  )
}
