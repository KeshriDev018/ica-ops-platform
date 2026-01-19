const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  type = 'button',
  disabled = false 
}) => {
  const baseClasses = 'font-primary font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-navy text-white hover:opacity-90 focus:ring-navy',
    secondary: 'bg-orange text-white hover:opacity-90 focus:ring-orange',
    outline: 'bg-white text-navy border-2 border-navy hover:bg-navy hover:text-white focus:ring-navy',
    ghost: 'bg-transparent text-navy hover:bg-gray-100 focus:ring-navy'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  )
}

export default Button
