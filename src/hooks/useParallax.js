import { useEffect, useRef } from 'react'

export function useParallax(layers) {
  const ref = useRef(layers)
  ref.current = layers
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e) => {
      const dx = e.clientX / window.innerWidth - 0.5
      const dy = e.clientY / window.innerHeight - 0.5
      for (const { el, factor, extra } of ref.current) {
        if (!el?.current) continue
        el.current.style.transform = extra ? extra(dx, dy) : `translate(${dx * factor}px, ${dy * factor}px)`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
}
