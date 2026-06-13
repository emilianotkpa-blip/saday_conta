export const MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const today = (offset = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

const M = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const fmtDate = (d) => {
  const [y, m, dd] = d.split('-')
  return `${dd} ${M[+m - 1]} ${y}`
}

export const shade = (hex, p) => {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v) => Math.max(0, Math.min(255, v))
  const r = clamp((n >> 16) + p)
  const g = clamp(((n >> 8) & 255) + p)
  const b = clamp((n & 255) + p)
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

const esc = (s) =>
  (s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export const renderMarkdown = (text) => {
  let h = esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  const lines = h.split('\n')
  let out = '', inList = false
  const closeList = () => { if (inList) { out += '</ul>'; inList = false } }
  for (const raw of lines) {
    const l = raw.trim()
    const head = l.match(/^(#{1,3})\s+(.*)$/)
    if (head) {
      closeList()
      const lvl = head[1].length + 2 // # -> h3, ## -> h4, ### -> h5
      out += `<h${lvl}>${head[2]}</h${lvl}>`
    } else if (/^([-•*]|\d+[.)])\s+/.test(l)) {
      if (!inList) { out += '<ul>'; inList = true }
      out += '<li>' + l.replace(/^([-•*]|\d+[.)])\s+/, '') + '</li>'
    } else {
      closeList()
      if (l) out += '<p>' + l + '</p>'
    }
  }
  closeList()
  return out
}
