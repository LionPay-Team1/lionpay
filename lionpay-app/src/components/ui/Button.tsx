import * as React from "react"
import { Loader2 } from 'lucide-react'
import { cn } from "../../lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, rightIcon, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    {
                        'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30': variant === 'primary',
                        'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
                        'border-2 border-primary-500 text-primary-500 hover:bg-primary-50': variant === 'outline',
                        'hover:bg-gray-100 text-gray-700': variant === 'ghost',
                        'h-9 px-4 text-sm': size === 'sm',
                        'h-12 px-6 text-base': size === 'md',
                        'h-14 px-8 text-lg': size === 'lg',
                    },
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
