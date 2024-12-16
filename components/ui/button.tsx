import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  position?: 'left' | 'right'
  isMobile?: boolean
}

const Button = ({ 
  className,
  position,
  isMobile = false,
  ...props 
}: ButtonProps) => {
  const baseStyles = "w-10 h-10 bg-gray-25 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-200 active:scale-95 true-hover:hover:bg-gray-100 true-hover:hover:border-gray-300"
  
  const positionStyles = {
    left: "hidden sm:flex absolute left-[-8rem] top-1/2 transform -translate-y-1/2 z-10",
    right: "hidden sm:flex absolute right-[-8rem] top-1/2 transform -translate-y-1/2 z-10"
  }

  const getStyles = () => {
    if (isMobile) return baseStyles
    if (position) return cn(baseStyles, positionStyles[position])
    return baseStyles
  }

  return (
    <button
      className={cn(getStyles(), className)}
      {...props}
    />
  )
}

export default Button
