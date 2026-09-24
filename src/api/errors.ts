export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type ErrorBody = { detail?: string | { msg: string }[] }

/** Turn a FastAPI error body ({detail: "..."} or a 422 validation list) into a readable message. */
export function toApiError(status: number, body: unknown): ApiError {
  const detail = (body as ErrorBody | undefined)?.detail
  if (typeof detail === 'string') return new ApiError(status, detail)
  if (Array.isArray(detail)) return new ApiError(status, detail.map((d) => d.msg).join('. '))
  return new ApiError(status, 'Qualcosa è andato storto, riprova.')
}
