import { useRef } from 'react'
import { PERSON } from '../config.js'
import { MXN } from '../lib/format.js'
import { useParallax } from '../hooks/useParallax.js'
import ProjectOrb from './ProjectOrb.jsx'

export default function Dashboard({ projects, totalsOf, grandTotal, onOpen, onNew, onDelete }) {
  const shell = useRef(null)
  useParallax([{ el: shell, factor: 10 }])

  return (
    <div className="shell" ref={shell}>
      <div className="top">
        <div className="brand">
          <span className="mark-chip" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 21 C5 15.5 2 12 2 8 C2 4.7 4.5 2.5 7.5 2.5 C9.6 2.5 11.2 3.7 12 5.5 C12.8 3.7 14.4 2.5 16.5 2.5 C19.5 2.5 22 4.7 22 8 C22 12 19 15.5 12 21 Z" fill="#E5436A"/></svg>
          </span>
          <div>
            <span className="bn">Para Saday</span>
            <span className="bs">CON AMOR</span>
          </div>
        </div>
        <div className="eyebrow"><span className="dot" /> Hecho por Emiliano</div>
      </div>

      <div className="hero">
        <div className="eyebrow"><span className="dot" /> Para ti</div>
        <h1>{PERSON.greeting}, {PERSON.name}</h1>
        <p className="legend">{PERSON.legend}</p>
        <div className="total">
          <span className="lab">Balance total</span>
          <span className={`val mono ${grandTotal >= 0 ? 'pos' : 'neg'}`}>{MXN.format(grandTotal)}</span>
        </div>
      </div>

      <div className="field-head"><h2>Mis apartados</h2></div>
      <div className="orbits">
        {projects.map((p, i) => (
          <ProjectOrb
            key={p.id}
            project={p}
            balance={totalsOf(p.id).bal}
            index={i}
            onOpen={(rect) => onOpen(p.id, rect)}
            onDelete={() => onDelete(p.id)}
          />
        ))}
        <button className="orb add" onClick={onNew}>
          <span className="plus">+</span>
          <span>Nuevo apartado</span>
        </button>
      </div>
    </div>
  )
}
