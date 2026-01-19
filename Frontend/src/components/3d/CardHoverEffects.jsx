import { useRef, useState } from 'react'

/**
 * FloatCard3D - Card floats up with shadow expansion on hover
 */
export const FloatCard3D = ({ children, floatHeight = 20, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${className}`}
      style={{
        transform: isHovered ? `translateY(-${floatHeight}px)` : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Expanding shadow */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: isHovered 
            ? '0 25px 50px rgba(0, 51, 102, 0.3)' 
            : '0 4px 8px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.4s ease',
          zIndex: -1,
        }}
      />
      {/* Orange glow on hover */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: '0 0 40px rgba(252, 138, 36, 0.4)',
            zIndex: -2,
          }}
        />
      )}
      {children}
    </div>
  )
}

/**
 * RotateCard3D - Card rotates in 3D space on hover
 */
export const RotateCard3D = ({ children, className = '' }) => {
  const cardRef = useRef(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    setRotation({
      x: (y / rect.height) * -20,
      y: (x / rect.width) * 20
    })
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.3s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      <div style={{ transform: 'translateZ(30px)' }}>
        {children}
      </div>
    </div>
  )
}

/**
 * ScaleCard3D - Card scales up with depth effect
 */
export const ScaleCard3D = ({ children, scaleAmount = 1.1, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${className}`}
      style={{
        transform: isHovered 
          ? `scale(${scaleAmount}) translateZ(50px)` 
          : 'scale(1) translateZ(0)',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow border effect */}
      <div
        className="absolute -inset-1 rounded-xl pointer-events-none"
        style={{
          background: isHovered 
            ? 'linear-gradient(135deg, rgba(252, 138, 36, 0.6), rgba(107, 142, 35, 0.6))' 
            : 'transparent',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
          zIndex: -1,
          filter: 'blur(10px)',
        }}
      />
      {children}
    </div>
  )
}

/**
 * FlipCard3D - Card flips to reveal back content
 */
export const FlipCard3D = ({ front, back, className = '' }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className={`relative cursor-pointer ${className}`}
      style={{
        perspective: '1500px',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
        }}
      >
        {/* Front */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {front}
        </div>
        
        {/* Back */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}

/**
 * GlowPulseCard3D - Card with pulsing glow on hover
 */
export const GlowPulseCard3D = ({ children, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${className}`}
      style={{
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Animated pulsing glow */}
      {isHovered && (
        <>
          <div
            className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
            style={{
              boxShadow: '0 0 30px rgba(252, 138, 36, 0.6), 0 0 60px rgba(252, 138, 36, 0.3)',
              zIndex: -1,
            }}
          />
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(252, 138, 36, 0.1), transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </>
      )}
      {children}
    </div>
  )
}

/**
 * BounceCard3D - Card bounces on hover with spring effect
 */
export const BounceCard3D = ({ children, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${className}`}
      style={{
        animation: isHovered ? 'bounce 0.6s ease' : 'none',
      }}
    >
      {/* Rainbow border on hover */}
      <div
        className="absolute -inset-0.5 rounded-xl pointer-events-none"
        style={{
          background: isHovered
            ? 'linear-gradient(45deg, #FC8A24, #6B8E23, #003366, #FC8A24)'
            : 'transparent',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: -1,
          backgroundSize: '300% 300%',
          animation: isHovered ? 'gradientShift 3s ease infinite' : 'none',
        }}
      />
      {children}
      
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-15px); }
          50% { transform: translateY(-5px); }
          75% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
