# CLAUDE.md — Para Saday

App gemela de "Contabilidad Estelar" con tema romántico, hecha para Saday.

## Qué es
Finanzas personales con apartados; cada apartado abre una consola con ingresos,
gastos, balance y un panel donde ChatGPT analiza y sugiere ahorro vía búsqueda web.
Tema: corazones lloviendo + destellos. Saludo fijo "Bienvenida, Saday" con leyenda
"Novia de Emiliano Trujillo".

## Arquitectura
- React + Vite, CSS plano en `src/index.css` (sin Tailwind). Fuentes: Playfair Display
  (títulos), DM Sans (texto), DM Mono (números).
- Persistencia en `src/lib/storage.js`: `local` (default) o `nocodb` vía n8n.
- IA en `src/lib/chatgpt.js`: POST al webhook de n8n (`VITE_N8N_GPT_URL`).
  La API key vive en n8n, jamás en el frontend.
- Estado en `App.jsx`: `{ projects:[{id,name,meta,color}], tx:[{id,pid,kind,concept,amount,date}] }`.

## Convenciones
- Español mexicano. Tono cálido.
- Saludo/leyenda en `src/config.js` (`PERSON`). Paleta de apartados en `PLANETS`.
- Montos con `MXN` (Intl es-MX). Respetar `prefers-reduced-motion`.
- Sin dependencias nuevas salvo necesidad real.

## Ideas de roadmap
- Animación de "entrar al apartado" (zoom desde la tarjeta a pantalla completa).
- Mover persistencia a NocoDB (segundo workflow de n8n).
- Gráfica de balance en el tiempo.
- Mensajitos de cariño aleatorios en el encabezado.

## Correr
```bash
npm install && npm run dev      # http://localhost:5174
npm run build                   # /dist
```
