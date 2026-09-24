import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const fieldClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-ink focus:ring-1 focus:ring-ink'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string }

export function TextField({ label, ...props }: Props) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input id={id} className={fieldClass} {...props} />
    </div>
  )
}

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }

export function TextArea({ label, ...props }: AreaProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea id={id} className={`${fieldClass} min-h-28`} {...props} />
    </div>
  )
}
