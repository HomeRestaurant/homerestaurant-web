import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-500/60',
  secondary: 'border border-ink text-ink hover:bg-gray-50 disabled:opacity-60',
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      className={`rounded-lg px-5 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
