import type { ComponentProps } from 'react'

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm'
}

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-500/60',
  secondary: 'border border-ink text-ink hover:bg-gray-50 disabled:opacity-60',
}

const sizes = {
  md: 'px-5 py-3 text-base',
  sm: 'px-4 py-1.5 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: Props) {
  return (
    <button
      className={`rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
