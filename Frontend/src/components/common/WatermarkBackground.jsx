import { useEffect, useState } from 'react'

const WatermarkBackground = () => {
  const [elements, setElements] = useState([])

  useEffect(() => {
    // Create various 3D watermark elements
    const watermarkElements = []
    
    // Chess pieces
    const chessPieces = ['♔', '♕', '♖', '♗', '♘', '♙']
    chessPieces.forEach((piece, index) => {
      watermarkElements.push({
        id: `piece-${index}`,
        type: 'piece',
        content: piece,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 120 + Math.random() * 80, // 120-200px
        rotation: Math.random() * 360,
        duration: 15 + Math.random() * 10, // 15-25s
        delay: Math.random() * 5,
        opacity: 0.03 + Math.random() * 0.05, // 0.03-0.08
        color: index % 2 === 0 ? '#003366' : '#FC8A24'
      })
    })

    // Geometric shapes (chess board squares pattern)
    for (let i = 0; i < 8; i++) {
      watermarkElements.push({
        id: `shape-${i}`,
        type: 'shape',
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 100 + Math.random() * 100, // 100-200px
        rotation: Math.random() * 360,
        duration: 20 + Math.random() * 15, // 20-35s
        delay: Math.random() * 8,
        opacity: 0.02 + Math.random() * 0.03, // 0.02-0.05
        color: i % 2 === 0 ? '#003366' : '#FC8A24'
      })
    }

    setElements(watermarkElements)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((element) => {
        if (element.type === 'piece') {
          return (
            <div
              key={element.id}
              className="absolute font-bold watermark-3d"
              style={{
                left: `${element.left}%`,
                top: `${element.top}%`,
                fontSize: `${element.size}px`,
                color: element.color,
                opacity: element.opacity,
                transform: `rotate(${element.rotation}deg)`,
                animation: `watermarkFloat ${element.duration}s ease-in-out infinite ${element.delay}s`,
                willChange: 'transform',
                textShadow: `
                  0 0 ${element.size * 0.1}px ${element.color}40,
                  0 0 ${element.size * 0.2}px ${element.color}20
                `
              }}
              aria-hidden="true"
            >
              {element.content}
            </div>
          )
        } else {
          // Geometric shape (chess board square)
          return (
            <div
              key={element.id}
              className="absolute watermark-3d"
              style={{
                left: `${element.left}%`,
                top: `${element.top}%`,
                width: `${element.size}px`,
                height: `${element.size}px`,
                border: `2px solid ${element.color}`,
                opacity: element.opacity,
                transform: `rotate(${element.rotation}deg)`,
                animation: `watermarkFloat ${element.duration}s ease-in-out infinite ${element.delay}s`,
                willChange: 'transform',
                boxShadow: `0 0 ${element.size * 0.2}px ${element.color}30`
              }}
              aria-hidden="true"
            />
          )
        }
      })}
    </div>
  )
}

export default WatermarkBackground
