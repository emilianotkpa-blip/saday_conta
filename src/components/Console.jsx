import { useState, useEffect, useRef } from 'react'
import { MXN, shade, fmtDate, today, renderMarkdown } from '../lib/format.js'
import { useParallax } from '../hooks/useParallax.js'
import { analyzeProject, findSavings, chatWithAgent } from '../lib/chatgpt.js'

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Convierte el rect de la card a un transform que hace que el panel parezca
// estar exactamente donde estaba la card (mismo tamaño y posición).
function toTransform(rect) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return `translate(${rect.x}px, ${rect.y}px) scale(${rect.width / vw}, ${rect.height / vh})`
}

export default function Console({ project, originRect, transactions, totals, onAddTx, onDeleteTx, onBack }) {
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState('in')
  const [date, setDate] = useState(today())
  const [ai, setAi] = useState({ open: false, loading: false, title: '', html: '' })

  // Chat con el agente
  const [chat, setChat] = useState([]) // [{ role:'user'|'assistant', content }]
  const [chatInput, setChatInput] = useState('')
  const [chatBusy, setChatBusy] = useState(false)

  // Animación card → pantalla completa
  const animated = !REDUCED && !!originRect
  const [phase, setPhase] = useState(animated ? 'entering' : 'open')
  const [flash, setFlash] = useState(animated)

  const inner = useRef(null)
  useParallax([{ el: inner, factor: 8 }])

  // Double rAF: espera a que el navegador pinte el estado inicial (pequeño)
  // antes de cambiar a 'open', para que la transición CSS tenga algo que animar.
  useEffect(() => {
    if (!animated) return
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('open'))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [animated])

  const handleBack = () => {
    if (!animated) { onBack(); return }
    setPhase('closing')
  }

  const handleTransitionEnd = (e) => {
    if (phase === 'closing' && e.propertyName === 'transform') onBack()
  }

  // Style según la fase
  let style
  if (animated) {
    if (phase === 'open') {
      style = { transform: 'none', opacity: 1, overflowY: 'auto' }
    } else {
      // 'entering' y 'closing' comparten el estado "colapsado" sobre la card
      style = { transform: toTransform(originRect), opacity: 0, overflowY: 'hidden' }
    }
  }

  const add = () => {
    const a = parseFloat(amount)
    if (!concept.trim() || !(a > 0)) return
    onAddTx({ kind, concept: concept.trim(), amount: a, date: date || today() })
    setConcept(''); setAmount(''); setDate(today())
  }

  const rows = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  const movementsList = () =>
    transactions.map(
      (t) => `${t.date} | ${t.kind === 'in' ? 'INGRESO' : 'EGRESO'} | ${t.concept} | ${t.amount} MXN`
    )

  const projectCtx = { name: project.name, meta: project.meta }

  const runAnalyze = async () => {
    setAi({ open: true, loading: true, title: 'Lo que ChatGPT opina 💭', html: '' })
    const text = await analyzeProject({ project: projectCtx, totals, movements: movementsList() })
    setAi({ open: true, loading: false, title: 'Lo que ChatGPT opina 💭', html: renderMarkdown(text) })
  }

  const runSavings = async () => {
    setAi({ open: true, loading: true, title: 'Dónde ahorrar mejor ✨', html: '' })
    const text = await findSavings({ capital: Math.max(totals.bal, 0) })
    setAi({ open: true, loading: false, title: 'Dónde ahorrar mejor ✨', html: renderMarkdown(text) })
  }

  const sendChat = async () => {
    const q = chatInput.trim()
    if (!q || chatBusy) return
    const history = [...chat, { role: 'user', content: q }]
    setChat(history)
    setChatInput('')
    setChatBusy(true)
    const text = await chatWithAgent({
      project: projectCtx,
      totals,
      movements: movementsList(),
      messages: history,
    })
    setChat([...history, { role: 'assistant', content: text }])
    setChatBusy(false)
  }

  return (
    <div className="console" style={style} onTransitionEnd={handleTransitionEnd}>
      {flash && (
        <div
          className="warp-flash"
          style={{ background: project.color }}
          onAnimationEnd={() => setFlash(false)}
        />
      )}
      <div className="console-inner" ref={inner}>
        <button className="back" onClick={handleBack}>← Volver</button>

        <div className="c-title">
          <span
            className="planet"
            style={{ background: `radial-gradient(circle at 35% 30%, ${project.color}, ${shade(project.color, -50)} 70%)` }}
          />
          <h2>{project.name}</h2>
        </div>

        <div className="tiles">
          <div className="tile ing"><div className="t-lab">Ingresos</div><div className="t-val mono">{MXN.format(totals.in)}</div></div>
          <div className="tile egr"><div className="t-lab">Gastos</div><div className="t-val mono">{MXN.format(totals.out)}</div></div>
          <div className="tile bal"><div className="t-lab">Balance</div><div className={`t-val mono ${totals.bal >= 0 ? 'pos' : 'neg'}`}>{MXN.format(totals.bal)}</div></div>
        </div>

        <div className="section-lab">Registrar movimiento</div>
        <div className="add-row">
          <input
            className="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Concepto (ej. ahorro, café, regalo)"
          />
          <input
            className="amount mono"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="0.00"
          />
          <input
            className="date mono"
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
          />
          <select className="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="in">Ingreso</option>
            <option value="out">Gasto</option>
          </select>
          <button className="btn" onClick={add}>Agregar</button>
        </div>

        <div className="section-lab">Desglose</div>
        <div className="tx-list">
          {rows.length === 0 && (
            <div className="empty">Sin movimientos todavía. Registra el primero arriba 💕</div>
          )}
          {rows.map((t) => (
            <div key={t.id} className={`tx ${t.kind === 'in' ? 'in' : 'out'}`}>
              <span className="tx-dot" />
              <span className="tx-con">
                <b>{t.concept}</b>
                <span className="tx-date">{fmtDate(t.date)}</span>
              </span>
              <span className="tx-amt">{t.kind === 'in' ? '+' : '−'}{MXN.format(t.amount)}</span>
              <button className="tx-del" title="Eliminar" onClick={() => onDeleteTx(t.id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="ai-actions">
          <button className="btn gold" onClick={runAnalyze}>♥ Analizar con ChatGPT</button>
          <button className="btn ghost" onClick={runSavings}>✨ Buscar dónde ahorrar</button>
        </div>

        {ai.open && (
          <div className="ai-out show">
            <div className="ai-head">{ai.title}</div>
            <div className="ai-body">
              {ai.loading ? (
                <p><span className="spin" /> Pensando con cariño…</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: ai.html }} />
              )}
            </div>

            {!ai.loading && (
              <div className="chat">
                <div className="chat-lab">Pregúntale al agente 💬</div>
                {chat.length > 0 && (
                  <div className="chat-thread">
                    {chat.map((m, i) => (
                      <div key={i} className={`bubble ${m.role}`}>
                        {m.role === 'assistant' ? (
                          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                        ) : (
                          m.content
                        )}
                      </div>
                    ))}
                    {chatBusy && (
                      <div className="bubble assistant"><span className="spin" /> Escribiendo…</div>
                    )}
                  </div>
                )}
                <div className="chat-row">
                  <input
                    className="chat-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Ej. ¿En qué estoy gastando de más?"
                  />
                  <button className="btn gold" onClick={sendChat} disabled={chatBusy}>Enviar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
