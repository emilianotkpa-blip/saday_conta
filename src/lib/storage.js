// Persistencia. Por defecto localStorage. Modo nocodb vía el backend (server.js).
import { API } from '../config.js'
import { uid, today } from './format.js'

const KEY = 'para-saday:v1'

function seed() {
  const p1 = uid(), p2 = uid(), p3 = uid()
  return {
    projects: [
      { id: p1, name: 'Mis ahorros', meta: 'Lo que voy guardando', color: '#FF6B9D' },
      { id: p2, name: 'Mis metas', meta: 'Para lo que sueño', color: '#C77DFF' },
      { id: p3, name: 'Mis gustitos', meta: 'Caprichos bonitos', color: '#F7B267' },
    ],
    tx: [
      { id: uid(), pid: p1, kind: 'in', concept: 'Ahorro del mes', amount: 3000, date: today(-9) },
      { id: uid(), pid: p1, kind: 'out', concept: 'Imprevisto', amount: 500, date: today(-5) },
      { id: uid(), pid: p2, kind: 'in', concept: 'Para mi viaje', amount: 2500, date: today(-7) },
      { id: uid(), pid: p3, kind: 'out', concept: 'Café y postre', amount: 220, date: today(-2) },
    ],
  }
}

const local = {
  async load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return JSON.parse(raw)
    } catch (_) {}
    const fresh = seed()
    localStorage.setItem(KEY, JSON.stringify(fresh))
    return fresh
  },
  async save(state) {
    localStorage.setItem(KEY, JSON.stringify(state))
  },
}

// Modo NocoDB: pasa por el backend, que guarda el token. Si no hay datos aún,
// siembra el estado inicial (que luego se persistirá solo).
const nocodb = {
  async load() {
    try {
      const res = await fetch(API.dataLoadUrl)
      if (res.ok) {
        const data = await res.json()
        if (data && data.state && Array.isArray(data.state.projects)) return data.state
      }
    } catch (_) {}
    return seed()
  },
  async save(state) {
    try {
      await fetch(API.dataSaveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      })
    } catch (_) {}
  },
}

const driver = API.dataMode === 'nocodb' ? nocodb : local
export const loadState = () => driver.load()
export const saveState = (state) => driver.save(state)
