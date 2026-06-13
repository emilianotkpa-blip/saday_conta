# n8n — Conexión a ChatGPT (Para Saday)

Puente entre la app y la API de OpenAI. La API key vive aquí, nunca en el frontend.

## Pasos
1. Importa `workflow-gpt.json` en n8n.
2. Guarda tu API key como env var de n8n: `OPENAI_API_KEY=sk-...` y reinicia el servicio.
3. Activa el workflow.
4. Copia la Production URL del Webhook (algo como
   `https://n8n.tudominio.com/webhook/para-saday-gpt`).
5. Pégala en `.env` como `VITE_N8N_GPT_URL`.

## Entrada / salida
La app hace POST con `{ action: "analizar", project, totals, movements }` o
`{ action: "ahorro", capital }`. El flujo responde `{ "text": "..." }`.

## Notas
- Modelo: `gpt-4o`. Para la búsqueda de ahorro se usa `gpt-4o-search-preview`
  (con acceso a web). Cámbialos en el nodo "Construir prompt".
- CORS: el webhook ya manda `Access-Control-Allow-Origin: *`. Restríngelo a tu
  dominio en producción.
- Puedes reutilizar el MISMO webhook que la app de Contabilidad Estelar; solo apunta
  ambas apps a la misma URL si quieres un solo flujo.
