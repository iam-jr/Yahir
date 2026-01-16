/* ==========================================
   YAHIR CUTZ - API Configuration
   ========================================== */

// IMPORTANTE: Cambia esta URL cuando despliegues en producción
// Desarrollo local: http://localhost:3000
// Producción: https://tu-servidor.com o tu dominio de backend
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://tu-servidor-backend.com'; // ⚠️ CAMBIAR ESTA URL EN PRODUCCIÓN

const API_ENDPOINTS = {
  BOOKING: `${API_BASE_URL}/api/booking.php`,
  BOOKED_TIMES: `${API_BASE_URL}/api/booked-times.php`
};
