import React from 'react'

export const Card = React.forwardRef(({ children, className, ...props }, ref) => (
    <div
        ref={ref}
        className={`bg-gray-900 border border-gray-700 rounded-lg shadow-md p-4 mb-4 ${className}`}
        {...props}
    >
        {children}
    </div>
))

export const CardHeader = React.forwardRef(({ children, className, ...props }, ref) => (
    <div ref={ref} className={`text-xl font-bold mb-2 ${className}`} {...props}>
        {children}
    </div>
))

export const CardContent = React.forwardRef(({ children, className, ...props }, ref) => (
    <div ref={ref} className={`text-base ${className}`} {...props}>
        {children}
    </div>
))

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
