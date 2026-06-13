import { useRef } from 'react'
import { useParallax } from '../hooks/useParallax.js'

// Corazón gigante tenue flotando al fondo + halo suave (vibe romántico)
export default function BackgroundHeart() {
  const heart = useRef(null)
  const halo = useRef(null)

  useParallax([
    { el: heart, factor: -28 },
    {
      el: halo,
      factor: 16,
      extra: (dx, dy) => `translate(calc(-50% + ${dx * 16}px), calc(-50% + ${dy * 12}px))`,
    },
  ])

  return (
    <>
      <div className="bg-halo" ref={halo} />
      <div className="bg-heart" ref={heart}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 175 C40 130 15 95 15 62 C15 35 36 18 60 18 C78 18 92 28 100 45 C108 28 122 18 140 18 C164 18 185 35 185 62 C185 95 160 130 100 175 Z"
            fill="rgba(255,107,157,0.05)"
            stroke="rgba(255,140,180,0.06)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </>
  )
}
