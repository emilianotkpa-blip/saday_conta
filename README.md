# Para Saday 💕

App de finanzas personales con tema romántico — corazones lloviendo y destellos de
amor — hecha para Saday. Misma arquitectura que Contabilidad Estelar: apartados como
"corazones", consola de desglose por apartado y ChatGPT para analizar y sugerir ahorro
(vía webhook de n8n; la API key nunca toca el navegador).

## Stack
- React + Vite (CSS plano, sin librerías de UI)
- Datos en `localStorage` por defecto · NocoDB vía n8n opcional
- IA: ChatGPT (OpenAI) a través de un webhook de n8n

## Correr en local
```bash
npm install
cp .env.example .env     # opcional: pega tu webhook de n8n
npm run dev
```
Abre http://localhost:5174. Sin configurar nada ya puedes registrar movimientos.
Las funciones de ChatGPT se encienden al poner `VITE_N8N_GPT_URL` en `.env`
(ver `n8n/README.md`).

## El saludo
El "Bienvenida, Saday" y la leyenda "Novia de Emiliano Trujillo" se editan en
`src/config.js` (objeto `PERSON`).

## Tema
- Lluvia de corazones y destellos: `src/components/HeartsRain.jsx`
- Corazón gigante de fondo + halo: `src/components/BackgroundHeart.jsx`
- Paleta y tipografías (Playfair + DM Sans + DM Mono): `src/index.css`

## Build
```bash
npm run build      # genera /dist para subir a tu hosting
```

## Estructura
```
src/
  config.js              PERSON (saludo/leyenda), paleta, endpoints
  lib/                   storage (local|nocodb), chatgpt (n8n), format
  hooks/useParallax.js   parallax con el mouse
  components/
    HeartsRain.jsx       lluvia de corazones + destellos
    BackgroundHeart.jsx  corazón flotante + halo
    Dashboard.jsx        saludo + apartados
    ProjectOrb.jsx       tarjeta de cada apartado
    Console.jsx          detalle + panel de ChatGPT
    NewProjectModal.jsx  alta de apartado
n8n/                     workflow de ChatGPT + esquema NocoDB
```
