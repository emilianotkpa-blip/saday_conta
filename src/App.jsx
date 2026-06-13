import { useState, useEffect, useMemo, useCallback } from 'react'
import { loadState, saveState } from './lib/storage.js'
import { uid, today } from './lib/format.js'
import HeartsRain from './components/HeartsRain.jsx'
import BackgroundHeart from './components/BackgroundHeart.jsx'
import Dashboard from './components/Dashboard.jsx'
import Console from './components/Console.jsx'
import NewProjectModal from './components/NewProjectModal.jsx'

export default function App() {
  const [state, setState] = useState({ projects: [], tx: [] })
  const [ready, setReady] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [originRect, setOriginRect] = useState(null)
  const [modal, setModal] = useState(false)

  const handleOpen = (id, rect) => { setOriginRect(rect || null); setOpenId(id) }
  const handleBack = () => setOpenId(null)

  useEffect(() => {
    loadState().then((s) => { setState(s); setReady(true) })
  }, [])

  useEffect(() => { if (ready) saveState(state) }, [state, ready])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (modal) setModal(false)
      else if (openId) setOpenId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal, openId])

  const totalsOf = useCallback(
    (pid) => {
      let i = 0, o = 0
      for (const t of state.tx) {
        if (t.pid !== pid) continue
        t.kind === 'in' ? (i += +t.amount) : (o += +t.amount)
      }
      return { in: i, out: o, bal: i - o }
    },
    [state.tx]
  )

  const grandTotal = useMemo(
    () => state.projects.reduce((s, p) => s + totalsOf(p.id).bal, 0),
    [state.projects, totalsOf]
  )

  const openProject = state.projects.find((p) => p.id === openId)
  const openTx = useMemo(
    () => (openId ? state.tx.filter((t) => t.pid === openId) : []),
    [state.tx, openId]
  )

  const addTx = ({ kind, concept, amount, date }) =>
    setState((s) => ({
      ...s,
      tx: [...s.tx, { id: uid(), pid: openId, kind, concept, amount, date: date || today() }],
    }))

  const deleteTx = (id) =>
    setState((s) => ({ ...s, tx: s.tx.filter((t) => t.id !== id) }))

  const createProject = (p) => {
    setState((s) => ({ ...s, projects: [...s.projects, { id: uid(), ...p }] }))
    setModal(false)
  }

  const deleteProject = (id) => {
    setState((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      tx: s.tx.filter((t) => t.pid !== id),
    }))
    if (openId === id) setOpenId(null)
  }

  return (
    <>
      <HeartsRain />
      <BackgroundHeart />

      <Dashboard
        projects={state.projects}
        totalsOf={totalsOf}
        grandTotal={grandTotal}
        onOpen={handleOpen}
        onNew={() => setModal(true)}
      />

      {openProject && (
        <Console
          key={openId}
          project={openProject}
          originRect={originRect}
          transactions={openTx}
          totals={totalsOf(openId)}
          onAddTx={addTx}
          onDeleteTx={deleteTx}
          onDeleteProject={deleteProject}
          onBack={handleBack}
        />
      )}

      <NewProjectModal open={modal} onClose={() => setModal(false)} onCreate={createProject} />
    </>
  )
}
