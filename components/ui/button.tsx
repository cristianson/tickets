import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  position?: 'left' | 'right'
  isMobile?: boolean
  variant?: 'next' | 'previous'
}

const Button = ({ 
  className,
  position,
  isMobile = false,
  variant,
  ...props 
}: ButtonProps) => {
  const baseStyles = `
    w-10 h-10                                    // Size
    bg-gray-25                                   // Background color
    rounded-full                                 // Shape
    border border-gray-200                       // Border
    flex items-center justify-center             // Flex layout
    transition-all duration-200                  // Animation properties
    active:scale-95                             // Active state
    hover:bg-gray-100 hover:border-gray-300     // Hover states
  `
  
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
    >
      {variant === 'previous' && <ChevronLeft className="h-4 w-4" />}
      {variant === 'next' && <ChevronRight className="h-4 w-4" />}
    </button>
  )
}

export default Button
