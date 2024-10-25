const Button = ({ children, className, ...props }) => (
    <button className={`px-4 py-2 rounded-md font-medium  ${className}`} {...props}>
        {children}
    </button>
)

export default Button
