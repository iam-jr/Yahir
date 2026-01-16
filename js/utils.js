/* ==========================================
   YAHIR CUTZ - Utilidades
   Funciones de conversión de fecha y hora
   ========================================== */

// Pad con ceros
const pad = (n) => String(n).padStart(2, '0');

// Convertir 24h a 12h con AM/PM
function to12h(hhmm) {
  const [H, M] = hhmm.split(':').map(Number);
  const period = H >= 12 ? 'PM' : 'AM';
  const h = H % 12 || 12;
  return `${h}:${pad(M)} ${period}`;
}

// Convertir 12h AM/PM a 24h
function to24h(time12) {
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time12;
  let [, h, m, period] = match;
  h = parseInt(h);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${pad(h)}:${m}`;
}

// Formatear fecha larga
function formatDate(dateStr) {
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} de ${month} de ${year}`;
}

// Formatear fecha corta
function formatShortDate(dateStr) {
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${dayName} ${day} ${month}`;
}

// Validar email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validar teléfono (formato flexible)
function isValidPhone(phone) {
  const re = /^[0-9 +\-()]{10,}$/;
  return re.test(phone);
}
