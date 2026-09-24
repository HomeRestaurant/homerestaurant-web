import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  unwrap,
  type MealCreate,
  type MealType,
  type MealUpdate,
  type SlotCreate,
} from '../../api/client'

export type MealFilters = { city?: string; meal_type?: MealType; day?: string }

const keys = {
  all: ['meals'] as const,
  search: (filters: MealFilters) => ['meals', 'search', filters] as const,
  detail: (id: string) => ['meals', 'detail', id] as const,
  mine: ['meals', 'mine'] as const,
}

export function useMealSearch(filters: MealFilters) {
  return useQuery({
    queryKey: keys.search(filters),
    queryFn: () => unwrap(api.GET('/meals', { params: { query: filters } })),
  })
}

export function useMeal(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => unwrap(api.GET('/meals/{meal_id}', { params: { path: { meal_id: id } } })),
  })
}

export function useMyMeals() {
  return useQuery({
    queryKey: keys.mine,
    queryFn: () => unwrap(api.GET('/meals/mine')),
  })
}

/** Any change to a meal can affect search results, details and "my meals". */
function useMealMutation<TVariables, TData>(mutationFn: (variables: TVariables) => Promise<TData>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useCreateMeal() {
  return useMealMutation((body: MealCreate) => unwrap(api.POST('/meals', { body })))
}

export function useUpdateMeal(id: string) {
  return useMealMutation((body: MealUpdate) =>
    unwrap(api.PATCH('/meals/{meal_id}', { params: { path: { meal_id: id } }, body })),
  )
}

export function useAddSlots(id: string) {
  return useMealMutation((body: SlotCreate[]) =>
    unwrap(api.POST('/meals/{meal_id}/slots', { params: { path: { meal_id: id } }, body })),
  )
}

export function useDeleteSlot(id: string) {
  return useMealMutation((slotId: string) =>
    unwrap(
      api.DELETE('/meals/{meal_id}/slots/{slot_id}', {
        params: { path: { meal_id: id, slot_id: slotId } },
      }),
    ),
  )
}
