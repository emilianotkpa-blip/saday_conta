import { useState, useEffect, useRef } from 'react'
import { PLANETS } from '../config.js'

export default function NewProjectModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [meta, setMeta] = useState('')
  const [color, setColor] = useState(PLANETS[0])
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName(''); setMeta(''); setColor(PLANETS[0])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  if (!open) return null

  const submit = () => {
    if (!name.trim()) return inputRef.current?.focus()
    onCreate({ name: name.trim(), meta: meta.trim(), color })
  }

  return (
    <div className="modal open" onClick={(e) => e.target.classList.contains('modal') && onClose()}>
      <div className="card">
        <h3>Nuevo apartado</h3>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Nombre (ej. Mis ahorros)"
        />
        <input
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder="Descripción corta (opcional)"
        />
        <div className="swatches">
          {PLANETS.map((c) => (
            <span
              key={c}
              className={`sw ${c === color ? 'on' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="m-actions">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn gold" onClick={submit}>Crear</button>
        </div>
      </div>
    </div>
  )
}
