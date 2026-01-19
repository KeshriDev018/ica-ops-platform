import { useRef, useState } from 'react'

/**
 * Card3DHover - Wraps any card component with 3D tilt and depth effects
 * 
 * @param {React.ReactNode} children - The card content to wrap
 * @param {number} maxRotation - Maximum rotation angle in degrees (default: 15)
 * @param {number} depth - 3D depth effect intensity (default: 100px)
 * @param {boolean} enableGlow - Enable orange glow effect on hover (default: true)
 * @param {boolean} enableScale - Enable slight scale up on hover (default: true)
 */
const Card3DHover = ({ 
  children, 
  maxRotation = 15, 
  depth = 100,
  enableGlow = true,
  enableScale = true,
  className = ''
}) => {
  const cardRef = useRef(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    
    // Get mouse position relative to card
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Calculate center point
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Calculate rotation based on mouse position
    // Negative because moving mouse down should rotate card forward
    const rotateX = ((y - centerY) / centerY) * -maxRotation
    const rotateY = ((x - centerX) / centerX) * maxRotation
    
    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        transform: `
          perspective(${depth * 10}px) 
          rotateX(${rotation.x}deg) 
          rotateY(${rotation.y}deg)
          ${enableScale && isHovered ? 'scale(1.05)' : 'scale(1)'}
        `,
        transition: isHovered 
          ? 'transform 0.15s ease-out' 
          : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow effect overlay */}
      {enableGlow && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            boxShadow: '0 0 30px rgba(252, 138, 36, 0.4), 0 0 60px rgba(252, 138, 36, 0.2)',
            zIndex: -1,
          }}
        />
      )}
      
      {/* Content */}
      <div
        style={{
          transform: 'translateZ(20px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
      
      {/* Shine effect */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              ${rotation.y > 0 ? '90deg' : '270deg'}, 
              transparent 0%, 
              rgba(255, 255, 255, 0.1) 50%, 
              transparent 100%
            )`,
            transform: `translateX(${rotation.y * 3}px)`,
            transition: 'transform 0.15s ease-out',
          }}
        />
      </div>
    </div>
  )
}

export default Card3DHover
