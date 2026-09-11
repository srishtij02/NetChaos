'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

/**
 * Accessible range slider built on a native <input type="range"> so keyboard
 * and screen-reader behaviour comes for free. The filled track is rendered via
 * a CSS gradient driven by the current percentage.
 */
export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled,
  className,
  ...props
}: SliderProps) {
  const id = useId()
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100

  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        'nc-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/60',
        className,
      )}
      style={{
        background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percent}%, var(--muted) ${percent}%, var(--muted) 100%)`,
      }}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      {...props}
    />
  )
}
