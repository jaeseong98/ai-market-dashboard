import React from 'react'

const Input = React.forwardRef(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
    />
))

Input.displayName = 'Input'

export default Input
