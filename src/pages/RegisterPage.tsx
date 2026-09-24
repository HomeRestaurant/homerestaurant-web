import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { api } from '../api/client'
import { toApiError } from '../api/errors'
import { AuthCard } from '../components/AuthCard'
import { Button } from '../components/Button'
import { FormError } from '../components/FormError'
import { TextField } from '../components/TextField'
import { useAuth } from '../features/auth/AuthContext'

export function RegisterPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' })

  const mutation = useMutation({
    mutationFn: async () => {
      const { error, response } = await api.POST('/auth/register', { body: form })
      if (error) throw toApiError(response.status, error)
      await login(form.email, form.password)
    },
    onSuccess: () => navigate('/benvenuto', { replace: true }),
  })

  if (isAuthenticated && !mutation.isSuccess) return <Navigate to="/" replace />

  const update = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <AuthCard title="Crea il tuo account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Nome"
            autoComplete="given-name"
            required
            value={form.first_name}
            onChange={update('first_name')}
          />
          <TextField
            label="Cognome"
            autoComplete="family-name"
            required
            value={form.last_name}
            onChange={update('last_name')}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update('email')}
        />
        <TextField
          label="Password (almeno 8 caratteri)"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={update('password')}
        />
        <FormError error={mutation.error} />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creazione account…' : 'Registrati'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Hai già un account?{' '}
        <Link to="/accedi" className="font-semibold text-ink underline">
          Accedi
        </Link>
      </p>
    </AuthCard>
  )
}
