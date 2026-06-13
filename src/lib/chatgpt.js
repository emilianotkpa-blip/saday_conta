// Llama a ChatGPT (OpenAI) a través del backend seguro (server.js).
// La API key vive en el servidor, jamás en el frontend.
import { API } from '../config.js'

async function callAi(payload) {
  const res = await fetch(API.aiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('ai ' + res.status)
  const data = await res.json()
  return typeof data.text === 'string' ? data.text : JSON.stringify(data)
}

export async function analyzeProject({ project, totals, movements }) {
  try {
    return await callAi({ action: 'analizar', project, totals, movements })
  } catch (e) {
    return 'No se pudo conectar con el servidor. Revisa que esté activo e intenta de nuevo.'
  }
}

export async function findSavings({ capital }) {
  try {
    return await callAi({ action: 'ahorro', capital })
  } catch (e) {
    return 'No se pudo completar la búsqueda. Intenta de nuevo en un momento.'
  }
}

// Chat directo con el agente, con contexto del apartado.
export async function chatWithAgent({ project, totals, movements, messages }) {
  try {
    return await callAi({ action: 'chat', project, totals, movements, messages })
  } catch (e) {
    return 'No se pudo enviar tu mensaje. Intenta de nuevo.'
  }
}
