import { Navigate, useLocation, useNavigate } from 'react-router'
import { PageState } from '../components/PageState'
import { useAuth } from '../features/auth/AuthContext'
import { PreferencesForm } from '../features/preferences/PreferencesForm'
import { useSavePreferences } from '../features/preferences/queries'

export function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const save = useSavePreferences()

  if (!user) return <PageState>Caricamento…</PageState>
  if (user.has_completed_preferences && !save.isSuccess) return <Navigate to="/" replace />

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="text-sm font-semibold text-brand-600">Ultimo passo</p>
      <h1 className="mt-1 text-3xl font-semibold">Ciao {user.first_name}, come mangi?</h1>
      <p className="mt-2 text-muted">
        A tavola conta sapere cosa piace e cosa no. Le tue risposte aiutano host e ospiti a
        prepararsi al meglio, e servono per avvisarti se un pasto contiene qualcosa che non puoi
        mangiare.
      </p>
      <div className="mt-8">
        <PreferencesForm
          user={user}
          submitLabel="Completa la registrazione"
          isPending={save.isPending}
          error={save.error}
          onSubmit={(preferences) =>
            save.mutate(preferences, { onSuccess: () => navigate(from, { replace: true }) })
          }
        />
      </div>
    </main>
  )
}
