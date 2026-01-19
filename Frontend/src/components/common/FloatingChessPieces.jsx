import { useEffect, useState } from 'react'

const FloatingChessPieces = () => {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    // Initialize pieces with random positions
    const chessPieces = [
      { symbol: '♔', name: 'King', color: '#003366' }, // navy
      { symbol: '♕', name: 'Queen', color: '#FC8A24' }, // orange
      { symbol: '♖', name: 'Rook', color: '#003366' }, // navy
      { symbol: '♗', name: 'Bishop', color: '#FC8A24' }, // orange
      { symbol: '♘', name: 'Knight', color: '#003366' }, // navy
      { symbol: '♙', name: 'Pawn', color: '#FC8A24' } // orange
    ]

    const initializedPieces = chessPieces.map((piece, index) => {
      const floatRange = 30 + Math.random() * 40 // Random float range (30-70px)
      const duration = 3 + Math.random() * 5 // Random duration between 3-8s for parallax
      const delay = Math.random() * 2 // Random delay (0-2s)
      const rotationSpeed = 8 + Math.random() * 4 // Random rotation speed (8-12s)
      const fontSize = 64 + Math.random() * 48 // Random font size (64-112px)
      const opacity = 0.25 + Math.random() * 0.2 // Random opacity (0.25-0.45) - more visible
      const glowIntensity = 0.3 + Math.random() * 0.3 // Random glow intensity (0.3-0.6)

      return {
        ...piece,
        id: index,
        left: Math.random() * 100, // Random horizontal position (0-100%)
        top: Math.random() * 100, // Random vertical position (0-100%)
        duration,
        delay,
        floatRange,
        rotationSpeed,
        fontSize,
        opacity,
        glowIntensity
      }
    })

    setPieces(initializedPieces)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {pieces.map((piece) => {
        // Create glow color based on piece color
        const glowColor = piece.color === '#003366' 
          ? 'rgba(0, 51, 102, 0.6)' // Navy glow
          : 'rgba(252, 138, 36, 0.6)' // Orange glow
        
        const haloColor = piece.color === '#003366'
          ? 'rgba(0, 51, 102, 0.1)' // Navy halo
          : 'rgba(252, 138, 36, 0.1)' // Orange halo
        
        return (
          <div
            key={piece.id}
            className="absolute font-bold chess-piece-glow"
            style={{
              left: `${piece.left}%`,
              top: `${piece.top}%`,
              fontSize: `${piece.fontSize}px`,
              color: piece.color,
              opacity: piece.opacity,
              animation: `floatAnimation ${piece.duration}s ease-in-out infinite ${piece.delay}s`,
              transform: `translateY(0) rotateY(0deg)`,
              willChange: 'transform',
              '--float-range': `${piece.floatRange}px`,
              '--glow-color': glowColor,
              '--glow-intensity': piece.glowIntensity,
              '--halo-color': haloColor,
              textShadow: `
                0 0 ${10 * piece.glowIntensity}px ${glowColor},
                0 0 ${20 * piece.glowIntensity}px ${glowColor},
                0 0 ${30 * piece.glowIntensity}px ${glowColor},
                0 4px 8px rgba(0, 0, 0, 0.2)
              `,
              filter: `drop-shadow(0 0 ${8 * piece.glowIntensity}px ${glowColor}) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))`,
              WebkitTextStroke: `1.5px ${piece.color === '#003366' ? 'rgba(0, 51, 102, 0.4)' : 'rgba(252, 138, 36, 0.4)'}`,
              WebkitTextFillColor: piece.color,
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-hidden="true"
          >
            <span
              className="chess-piece-halo"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${piece.fontSize * 1.8}px`,
                height: `${piece.fontSize * 1.8}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${haloColor} 0%, transparent 70%)`,
                zIndex: -1,
                pointerEvents: 'none'
              }}
            />
            <span style={{ position: 'relative', zIndex: 1 }}>{piece.symbol}</span>
          </div>
        )
      })}
    </div>
  )
}

export default FloatingChessPieces
