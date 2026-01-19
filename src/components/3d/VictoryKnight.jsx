import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Sparkle Particles Component
const SparkleParticles = () => {
  const particlesRef = useRef()
  const particleCount = 50

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = []
    const phases = []
    
    for (let i = 0; i < particleCount; i++) {
      // Random position around the knight
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 3
      const height = Math.random() * 6 - 2
      
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius
      
      // Random velocity for floating effect
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: 0.01 + Math.random() * 0.02,
        z: (Math.random() - 0.5) * 0.02
      })
      
      // Random phase for twinkling
      phases.push(Math.random() * Math.PI * 2)
    }
    
    return { positions, velocities, phases }
  }, [particleCount])

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array
      const time = state.clock.getElapsedTime()
      
      for (let i = 0; i < particleCount; i++) {
        // Update position with velocity
        positions[i * 3] += particles.velocities[i].x
        positions[i * 3 + 1] += particles.velocities[i].y
        positions[i * 3 + 2] += particles.velocities[i].z
        
        // Reset if too high
        if (positions[i * 3 + 1] > 6) {
          positions[i * 3 + 1] = -2
        }
        
        // Reset if too far
        const distance = Math.sqrt(
          positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2
        )
        if (distance > 6) {
          const angle = Math.random() * Math.PI * 2
          const radius = 2 + Math.random() * 3
          positions[i * 3] = Math.cos(angle) * radius
          positions[i * 3 + 2] = Math.sin(angle) * radius
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      
      // Rotate particle group slowly
      particlesRef.current.rotation.y = time * 0.1
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#FC8A24"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Chess Knight with Victory Animation
const VictoryKnightPiece = ({ bounceComplete }) => {
  const meshRef = useRef()
  const groupRef = useRef()
  const [rotationPhase, setRotationPhase] = useState(0)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (meshRef.current && groupRef.current) {
      // Victory spin animation - spins once then gentle rotation
      if (rotationPhase < Math.PI * 2) {
        meshRef.current.rotation.y += 0.05
        setRotationPhase(prev => prev + 0.05)
      } else {
        // Gentle continuous rotation after victory spin
        meshRef.current.rotation.y += 0.01
      }
      
      // Gentle bounce after initial load
      if (bounceComplete) {
        groupRef.current.position.y = Math.sin(time * 2) * 0.15
      }
      
      // Slight tilt for dynamic effect
      groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        {/* Base */}
        <mesh position={[0, -1.2, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.8, 0.3, 32]} />
          <meshStandardMaterial
            color="#FFFEF3"
            metalness={0.4}
            roughness={0.3}
            emissive="#FC8A24"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Body */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 1, 32]} />
          <meshStandardMaterial
            color="#FFFEF3"
            metalness={0.4}
            roughness={0.3}
            emissive="#FC8A24"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Horse head (simplified) */}
        <mesh position={[0, 0.3, 0.2]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.8, 0.4]} />
          <meshStandardMaterial
            color="#FFFEF3"
            metalness={0.4}
            roughness={0.3}
            emissive="#FC8A24"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Mane */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <coneGeometry args={[0.3, 0.5, 4]} />
          <meshStandardMaterial
            color="#FFFEF3"
            metalness={0.5}
            roughness={0.2}
            emissive="#FC8A24"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Eye detail */}
        <mesh position={[0.15, 0.5, 0.45]} castShadow>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color="#003366"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  )
}

// Main Victory Knight Component
const VictoryKnight = () => {
  const [bounceComplete, setBounceComplete] = useState(false)

  useEffect(() => {
    // Initial bounce animation timing
    const timer = setTimeout(() => {
      setBounceComplete(true)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 2, 8], fov: 50 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#FC8A24" />
        <hemisphereLight intensity={0.5} groundColor="#003366" />
        
        {/* Spotlight for dramatic effect */}
        <spotLight
          position={[0, 8, 0]}
          angle={0.6}
          intensity={1.5}
          color="#FC8A24"
          castShadow
        />
        
        {/* Victory Knight */}
        <VictoryKnightPiece bounceComplete={bounceComplete} />
        
        {/* Sparkle Particles */}
        <SparkleParticles />
        
        {/* Background */}
        <color attach="background" args={['transparent']} />
      </Canvas>
    </div>
  )
}

export default VictoryKnight
