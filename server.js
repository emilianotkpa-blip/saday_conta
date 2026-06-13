// Backend de Para Saday.
// - Sirve el frontend ya compilado (dist) en producción.
// - Proxy seguro a OpenAI: la OPENAI_API_KEY vive solo aquí.
// - Proxy a NocoDB: el NOCO_TOKEN vive solo aquí. Sincroniza el estado de la app.
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '2mb' }))

const PORT = process.env.PORT || 3000
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o'
const OPENAI_MODEL_WEB = process.env.OPENAI_MODEL_WEB || 'gpt-4o-search-preview'

// ---------- NocoDB ----------
// NOCO_URL puede ser la URL del dashboard (con workspace/base/tabla/vista) o el
// host raíz. De cualquiera extraemos el origen y el ID de tabla (segmento "m...").
function nocoConfig() {
  const raw = process.env.NOCO_URL || ''
  let origin = ''
  let tableId = process.env.NOCO_TABLE_ID || ''
  try {
    const u = new URL(raw)
    origin = u.origin
    if (!tableId) {
      const seg = u.pathname.split('/').filter(Boolean).find((s) => /^m[a-z0-9]{8,}$/i.test(s))
      if (seg) tableId = seg
    }
  } catch (_) {}
  return { origin, tableId, token: process.env.NOCO_TOKEN || '' }
}

const NOCO_TITLE = 'saday' // identifica la fila única donde guardamos el estado

function nocoHeaders(token) {
  return { 'xc-token': token, 'Content-Type': 'application/json' }
}

async function nocoFindRow(cfg) {
  const url = `${cfg.origin}/api/v2/tables/${cfg.tableId}/records?where=${encodeURIComponent(
    `(Title,eq,${NOCO_TITLE})`
  )}&limit=1`
  const res = await fetch(url, { headers: nocoHeaders(cfg.token) })
  if (!res.ok) throw new Error('NocoDB load ' + res.status)
  const data = await res.json()
  return (data.list && data.list[0]) || null
}

app.get('/api/data/load', async (req, res) => {
  const cfg = nocoConfig()
  if (!cfg.origin || !cfg.tableId || !cfg.token) {
    return res.status(200).json({ state: null })
  }
  try {
    const row = await nocoFindRow(cfg)
    if (!row || !row.state_json) return res.json({ state: null })
    let state = null
    try {
      state = JSON.parse(row.state_json)
    } catch (_) {}
    return res.json({ state })
  } catch (e) {
    console.error('load error', e.message)
    return res.status(502).json({ state: null, error: e.message })
  }
})

app.post('/api/data/save', async (req, res) => {
  const cfg = nocoConfig()
  if (!cfg.origin || !cfg.tableId || !cfg.token) {
    return res.status(200).json({ ok: false, reason: 'sin-config' })
  }
  const state = req.body && req.body.state ? req.body.state : req.body
  const state_json = JSON.stringify(state)
  try {
    const row = await nocoFindRow(cfg)
    const recordsUrl = `${cfg.origin}/api/v2/tables/${cfg.tableId}/records`
    let out
    if (row) {
      out = await fetch(recordsUrl, {
        method: 'PATCH',
        headers: nocoHeaders(cfg.token),
        body: JSON.stringify([{ Id: row.Id, Title: NOCO_TITLE, state_json }]),
      })
    } else {
      out = await fetch(recordsUrl, {
        method: 'POST',
        headers: nocoHeaders(cfg.token),
        body: JSON.stringify({ Title: NOCO_TITLE, state_json }),
      })
    }
    if (!out.ok) throw new Error('NocoDB save ' + out.status)
    return res.json({ ok: true })
  } catch (e) {
    console.error('save error', e.message)
    return res.status(502).json({ ok: false, error: e.message })
  }
})

// ---------- OpenAI ----------
function buildPrompt(b) {
  const action = b.action
  if (action === 'ahorro') {
    const capital = b.capital ?? 0
    return {
      web: true,
      messages: [
        {
          role: 'user',
          content:
            `Busca en la web opciones ACTUALES en México (año en curso) para hacer rendir o ahorrar dinero con mayores rendimientos, para un capital aproximado de ${capital} MXN.\n` +
            `Considera: CETES / cetesdirecto, cuentas y fintech de alto rendimiento (Nu, Klar, Stori, Mercado Pago, Hey Banco, Finsus, etc.) y pagarés bancarios.\n` +
            `Para cada opción dame, con viñetas: nombre, rendimiento anual aproximado (tasa), nivel de riesgo y liquidez. Cierra con una recomendación breve según el monto.\n` +
            `Responde en español mexicano, usa **negritas** para nombres y tasas, e incluye de dónde sale el dato.`,
        },
      ],
    }
  }

  const p = b.project || {}
  const t = b.totals || {}
  const movs = (b.movements || []).join('\n')
  const contexto =
    `PROYECTO: ${p.name || 'Sin nombre'} (${p.meta || 'sin descripción'})\n` +
    `Ingresos totales: ${t.in ?? 0} MXN\n` +
    `Egresos totales: ${t.out ?? 0} MXN\n` +
    `Balance: ${t.bal ?? 0} MXN\n\n` +
    `Movimientos:\n${movs || '(sin movimientos)'}`

  if (action === 'chat') {
    const system = {
      role: 'system',
      content:
        `Eres un asesor financiero cálido y práctico que habla español mexicano claro y directo, sin tecnicismos. ` +
        `Respondes preguntas sobre las finanzas de este apartado. Usa **negritas** para lo importante y viñetas cuando ayuden. No inventes datos que no estén en el contexto.\n\n` +
        `CONTEXTO DEL APARTADO:\n${contexto}`,
    }
    const history = Array.isArray(b.messages) ? b.messages : []
    return { web: false, messages: [system, ...history] }
  }

  // analizar (default)
  return {
    web: false,
    messages: [
      {
        role: 'user',
        content:
          `Eres un asesor financiero práctico que habla español mexicano claro y directo, sin tecnicismos. Analiza este proyecto/negocio.\n\n` +
          `${contexto}\n\n` +
          `Dame, con viñetas cortas y concretas:\n` +
          `1. Qué está bien.\n2. Qué está mal o representa un riesgo.\n` +
          `3. 2-3 recomendaciones específicas para ahorrar o mejorar el flujo de dinero.\n` +
          `Sé breve y directo. Usa **negritas** para lo importante. No inventes datos que no te di.`,
      },
    ],
  }
}

app.post('/api/ai', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(200).json({ text: 'Falta configurar **OPENAI_API_KEY** en el servidor.' })
  }
  try {
    const { web, messages } = buildPrompt(req.body || {})
    const body = {
      model: web ? OPENAI_MODEL_WEB : OPENAI_MODEL,
      max_tokens: 2000,
      messages,
    }
    const out = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await out.json()
    if (!out.ok) {
      console.error('openai error', data?.error?.message)
      return res.status(502).json({ text: 'OpenAI: ' + (data?.error?.message || out.status) })
    }
    const text =
      (data.choices || []).map((c) => (c.message && c.message.content) || '').join('\n\n') ||
      'Sin respuesta.'
    return res.json({ text })
  } catch (e) {
    console.error('ai error', e.message)
    return res.status(502).json({ text: 'No se pudo conectar con OpenAI. Intenta de nuevo.' })
  }
})

// ---------- Frontend estático (producción) ----------
const dist = path.join(__dirname, 'dist')
app.use(express.static(dist))
app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Para Saday escuchando en http://localhost:${PORT}`)
})
