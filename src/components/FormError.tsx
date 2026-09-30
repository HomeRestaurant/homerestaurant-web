// fetch() rejects with a browser message in English ("Failed to fetch") when the network is down
const NETWORK_ERROR = 'Impossibile contattare il server. Controlla la connessione e riprova.'

/** API and validation messages are already in Italian; only network failures need replacing. */
function readableMessage(error: Error): string {
  return error instanceof TypeError ? NETWORK_ERROR : error.message
}

export function FormError({ error }: { error: Error | null }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      {readableMessage(error)}
    </p>
  )
}
