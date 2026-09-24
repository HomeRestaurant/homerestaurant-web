import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api, type User } from '../api/client'
import { toApiError } from '../api/errors'
import { Button } from '../components/Button'
import { FormError } from '../components/FormError'
import { TextArea, TextField } from '../components/TextField'
import { ME_QUERY_KEY, useAuth } from '../features/auth/AuthContext'

export function ProfilePage() {
  const { user, isLoadingUser } = useAuth()

  if (isLoadingUser || !user) {
    return <main className="mx-auto max-w-2xl px-6 py-12 text-muted">Caricamento profilo…</main>
  }
  // key: reset the form state if a different user logs in
  return <ProfileForm key={user.id} user={user} />
}

function ProfileForm({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    city: user.city ?? '',
    bio: user.bio ?? '',
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error, response } = await api.PATCH('/users/me', {
        body: { ...form, city: form.city || null, bio: form.bio || null },
      })
      if (error) throw toApiError(response.status, error)
      return data
    },
    onSuccess: (updated) => queryClient.setQueriesData({ queryKey: ME_QUERY_KEY }, updated),
  })

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate()
  }

  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase()
  const memberSince = new Date(user.created_at).toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center gap-5">
        <div className="flex size-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
          {initials}
        </div>
        <div>
          <h1 className="text-3xl font-semibold">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-muted">Su HomeRestaurant da {memberSince}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Nome"
            required
            value={form.first_name}
            onChange={update('first_name')}
          />
          <TextField
            label="Cognome"
            required
            value={form.last_name}
            onChange={update('last_name')}
          />
        </div>
        <TextField label="Città" value={form.city} onChange={update('city')} />
        <TextArea
          label="Parlaci di te e della tua cucina"
          value={form.bio}
          onChange={update('bio')}
          maxLength={2000}
        />
        <TextField label="Email" value={user.email} disabled />
        <FormError error={mutation.error} />
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvataggio…' : 'Salva modifiche'}
          </Button>
          {mutation.isSuccess && <span className="text-sm text-green-700">Profilo aggiornato</span>}
        </div>
      </form>
    </main>
  )
}
