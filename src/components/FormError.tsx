export function FormError({ error }: { error: Error | null }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      {error.message}
    </p>
  )
}
