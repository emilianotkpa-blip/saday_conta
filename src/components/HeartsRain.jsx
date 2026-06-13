import { useEffect, useRef } from 'react'

const HEART_COLORS = ['255,107,157', '229,67,106', '199,125,255', '247,178,103', '255,163,194']

function drawHeart(ctx, x, y, s, rot, color, alpha) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.globalAlpha = alpha
  ctx.fillStyle = `rgba(${color}, 1)`
  ctx.beginPath()
  ctx.moveTo(0, s * 0.3)
  ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s * 0.3)
  ctx.bezierCurveTo(-s / 2, s * 0.62, 0, s * 0.86, 0, s)
  ctx.bezierCurveTo(0, s * 0.86, s / 2, s * 0.62, s / 2, s * 0.3)
  ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s * 0.3)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawSparkle(ctx, x, y, r, alpha) {
  ctx.save()
  ctx.translate(x, y)
  ctx.globalAlpha = alpha
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3)
  grd.addColorStop(0, 'rgba(255,225,235,0.9)')
  grd.addColorStop(1, 'rgba(255,225,235,0)')
  ctx.fillStyle = grd
  ctx.beginPath(); ctx.arc(0, 0, r * 3, 0, 7); ctx.fill()
  ctx.fillStyle = 'rgba(255,240,245,0.95)'
  ctx.beginPath()
  ctx.moveTo(0, -r * 2); ctx.lineTo(r * 0.5, 0); ctx.lineTo(0, r * 2); ctx.lineTo(-r * 0.5, 0)
  ctx.closePath(); ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-r * 2, 0); ctx.lineTo(0, r * 0.5); ctx.lineTo(r * 2, 0); ctx.lineTo(0, -r * 0.5)
  ctx.closePath(); ctx.fill()
  ctx.restore()
}

export default function HeartsRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const c = canvasRef.current
    const x = c.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, hearts, sparkles, raf

    const rnd = (a, b) => a + Math.random() * (b - a)

    const size = () => {
      w = c.width = window.innerWidth
      h = c.height = window.innerHeight
      const hc = Math.min(26, Math.floor(w / 60))
      hearts = Array.from({ length: hc }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: rnd(10, 26),
        speed: rnd(0.3, 1.1),
        drift: rnd(8, 26),
        phase: Math.random() * Math.PI * 2,
        rot: rnd(-0.3, 0.3),
        color: HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0],
        alpha: rnd(0.15, 0.5),
      }))
      const sc = Math.min(40, Math.floor((w * h) / 38000))
      sparkles = Array.from({ length: sc }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rnd(0.8, 2),
        a: Math.random(),
        tw: rnd(0.005, 0.02),
      }))
    }
    size()
    window.addEventListener('resize', size)

    const loop = () => {
      x.clearRect(0, 0, w, h)
      for (const s of sparkles) {
        if (!reduce) { s.a += s.tw; if (s.a > 1 || s.a < 0.1) s.tw *= -1 }
        drawSparkle(x, s.x, s.y, s.r, s.a * 0.7)
      }
      for (const ht of hearts) {
        if (!reduce) {
          ht.y += ht.speed
          ht.phase += 0.012
          ht.x += Math.sin(ht.phase) * (ht.drift / 60)
          if (ht.y > h + ht.s) { ht.y = -ht.s; ht.x = Math.random() * w }
        }
        drawHeart(x, ht.x, ht.y, ht.s, ht.rot + Math.sin(ht.phase) * 0.1, ht.color, ht.alpha)
      }
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
    }
  }, [])

  return <canvas ref={canvasRef} className="hearts-rain" />
}
