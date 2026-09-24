import { useHealth } from '../api/health'

export function HomePage() {
  const health = useHealth()

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Mangia a casa di qualcuno, <span className="text-brand-500">come a casa tua</span>.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Scopri colazioni, pranzi e cene preparati da persone vicino a te, oppure apri la tua tavola
        agli altri.
      </p>

      <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm">
        <span
          className={`size-2.5 rounded-full ${
            health.isSuccess ? 'bg-green-500' : health.isError ? 'bg-red-500' : 'bg-gray-300'
          }`}
        />
        {health.isPending && 'Verifica API…'}
        {health.isSuccess && 'API online'}
        {health.isError && 'API offline'}
      </div>
    </main>
  )
}
