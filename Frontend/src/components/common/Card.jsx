const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'default'
}) => {
  const baseClasses = 'bg-white rounded-card shadow-soft'
  
  const paddingClasses = {
    default: 'p-6',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: 'p-0'
  }
  
  const hoverClasses = hover ? 'transition-transform duration-200 hover:shadow-medium hover:-translate-y-1' : ''
  
  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}

export default Card
