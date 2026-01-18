/* ==========================================
   YAHIR CUTZ - API Configuration
   ========================================== */

// IMPORTANTE: Cambia esta URL cuando despliegues en AWS
// Desarrollo local: http://localhost:3000
// Producción (AWS): https://tu-aws-server.com o tu dominio de backend
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://tu-aws-backend.com'; // ⚠️ CAMBIAR ESTA URL A TU SERVIDOR AWS EN PRODUCCIÓN

const GH_PAGES_URL = 'https://iam-jr.github.io/Yahir/'; // Tu URL de GitHub Pages

const API_ENDPOINTS = {
  BOOKING: `${API_BASE_URL}/appointments`,
  BOOKED_TIMES: `${API_BASE_URL}/availability`
};
