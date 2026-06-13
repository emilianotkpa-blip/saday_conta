// Configuración central. Tema romántico para Saday.

export const PERSON = {
  name: 'Saday',
  greeting: 'Bienvenida',
  legend: 'Novia de Emiliano Trujillo',
}

// Endpoints del backend (server.js). Las API keys viven en el servidor.
export const API = {
  dataMode: import.meta.env.VITE_DATA_MODE || 'local',
  aiUrl: '/api/ai',
  dataLoadUrl: '/api/data/load',
  dataSaveUrl: '/api/data/save',
}

// Colores de los "corazones/orbes" (proyectos), en tonos rosa/vino
export const PLANETS = ['#FF6B9D', '#E5436A', '#C77DFF', '#F7B267', '#FF8FB1', '#FFA3C2']
