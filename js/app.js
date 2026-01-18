/* ==========================================
   YAHIR CUTZ - Sistema de Reservas PRO
   Los Magicos Barbershop - Carolina, PR
   ========================================== */

console.log('🚀 app.js iniciando...');

let deferredInstallPrompt = null;
const INSTALL_DISMISSED_KEY = 'yahir-pwa-dismissed';

// ============ MENÚ HAMBURGUESA ============
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.getElementById('hamburger-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', function() {
      hamburgerBtn.classList.toggle('open');
      mainNav.classList.toggle('open');
    });
    
    // Cerrar menú al hacer clic en un enlace
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        hamburgerBtn.classList.remove('open');
        mainNav.classList.remove('open');
      });
    });
  }

  // ============ CARRUSEL DE HERO ============
  const heroImages = document.querySelectorAll('.hero-carousel .hero-img');
  if (heroImages.length > 0) {
    let heroIndex = 0;
    function rotateHeroImage() {
      heroImages.forEach(img => img.classList.remove('active'));
      heroIndex = (heroIndex + 1) % heroImages.length;
      heroImages[heroIndex].classList.add('active');
    }
    setInterval(rotateHeroImage, 1200);
  }

  // ============ CARRUSEL DE GALERÍA ============
  const galeraImages = document.querySelectorAll('.galeria-img');
  console.log('Imágenes del carrusel encontradas:', galeraImages.length);
  
  if (galeraImages.length > 0) {
    let currentImageIndex = 0;
    
    function showNextImage() {
      galeraImages.forEach(img => img.classList.remove('active'));
      currentImageIndex = (currentImageIndex + 1) % galeraImages.length;
      galeraImages[currentImageIndex].classList.add('active');
      console.log('Mostrando imagen:', currentImageIndex + 1);
    }
    
    setInterval(showNextImage, 1200); // 1.2 segundos
  } else {
    console.log('No se encontraron imágenes del carrusel');
  }
});

// ============ CONFIGURACIÓN ============
const CONFIG = {
  TIMEZONE: 'America/Puerto_Rico',
  OPEN_DAYS: [2, 3, 4, 5, 6], // Martes a Sábado (0=dom, 1=lun, 6=dom)
  OPEN_HOUR: 8,
  CLOSE_HOUR: 19,
  SLOT_MINUTES: 15,
  BLOCK_MINUTES: 45,
  API_ENDPOINT: API_ENDPOINTS.BOOKING,
  API_BOOKED: API_ENDPOINTS.BOOKED_TIMES
};

// ============ ESTADO GLOBAL ============
const STATE = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDate: null,
  selectedTime: null,
  selectedService: null,
  currentStep: 1,
  bookedTimes: {},
  formData: {
    name: '',
    email: '',
    phone: '',
    instagram: '',
    service: '',
    location: ''
  }
};

// ============ UTILIDADES ============
const pad = (n) => String(n).padStart(2, '0');

function to12h(hhmm) {
  const [H, M] = hhmm.split(':').map(Number);
  const period = H >= 12 ? 'PM' : 'AM';
  const h = H % 12 || 12;
  return `${h}:${pad(M)} ${period}`;
}

function to24h(time12) {
  const [time, period] = time12.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${pad(h)}:${pad(m)}`;
}

function getMonthName(month, year) {
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${months[month]} ${year}`;
}

  // Helper: return first existing element by given ids
  function $id(...ids) {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatShortDate(date) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function isToday(dateStr) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return dateStr === `${y}-${m}-${d}`;
}

function isFuture(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateStr + 'T00:00:00');
  return checkDate >= today;
}

function isOpenDay(dayOfWeek) {
  return CONFIG.OPEN_DAYS.includes(dayOfWeek);
}

function generateTimeSlots(dateStr) {
  const slots = [];
  for (let h = CONFIG.OPEN_HOUR; h < CONFIG.CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += CONFIG.SLOT_MINUTES) {
      const time24h = `${pad(h)}:${pad(m)}`;
      const time12h = to12h(time24h);
      slots.push({
        time24h,
        time12h,
        booked: false,
        partial: false
      });
    }
  }
  return slots;
}

// ============ CALENDARIO ============
// NUEVO CALENDARIO MODERNO Y SELECCIONABLE
function renderCalendar() {
  const grid = $id('calendar-grid', 'calendar');
  const monthLabel = $id('calendar-month', 'current-month');
  if (!grid || !monthLabel) return;
  monthLabel.textContent = getMonthName(STATE.currentMonth, STATE.currentYear);
  grid.innerHTML = '';
  // Encabezados de días (Domingo a Sábado)
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  dayNames.forEach(name => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = name;
    grid.appendChild(header);
  });
  // Primer día del mes
  const firstDay = new Date(STATE.currentYear, STATE.currentMonth, 1);
  const lastDay = new Date(STATE.currentYear, STATE.currentMonth + 1, 0);
  let start = firstDay.getDay(); // 0=Domingo
  // Espacios vacíos antes del primer día
  for (let i = 0; i < start; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day-empty';
    grid.appendChild(empty);
  }
  // Días del mes
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(STATE.currentYear, STATE.currentMonth, day);
    const dateStr = formatDate(date);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day';
    btn.textContent = day;
    btn.setAttribute('data-date', dateStr);
    // Marcar hoy
    if (isToday(dateStr)) btn.classList.add('today');
    // Permitir seleccionar cualquier día del mes actual o futuro
    if (!isFuture(dateStr)) btn.disabled = true;
    btn.addEventListener('click', () => selectDate(dateStr, btn));
    grid.appendChild(btn);
  }
}

function selectDate(dateStr, element) {
  // Remover selección anterior
  document.querySelectorAll('.calendar-day.selected').forEach(el => {
    el.classList.remove('selected');
  });
  
  // Seleccionar nuevo día
  element.classList.add('selected');
  STATE.selectedDate = dateStr;
  STATE.selectedTime = null;
  
  console.log('📅 Fecha seleccionada:', dateStr, formatShortDate(new Date(dateStr)));
  
  // Cargar horarios y ir al paso siguiente
  loadTimeSlots(dateStr);
  // Mostrar panel de horas (step-1)
  goToStep(1);
  // Mostrar botón de reset para permitir cambiar fecha (support reset-selection or reset-btn)
  const resetBtn = $id('reset-selection', 'reset-btn');
  if (resetBtn && resetBtn.style) resetBtn.style.display = 'inline-block';
  showConfirmation();
  showConfirmation();
}

// ============ HORARIOS ============
async function loadTimeSlots(dateStr) {
  try {
    // Si no hay servicio seleccionado aún, mostrar mensaje
    if (!STATE.selectedService) {
      console.log('⚠️ Servicio no seleccionado, mostrando mensaje al usuario');
      const grid = $id('time-grid', 'hours');
      if (grid) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 2rem; background: var(--card); border-radius: 10px; border: 2px dashed var(--border);">🔔 Por favor, selecciona un servicio primero en el Paso 3</div>';
      }
      return;
    }

    // Llamar a API con serviceId
    const url = new URL(CONFIG.API_BOOKED);
    url.searchParams.set('serviceId', STATE.selectedService);
    url.searchParams.set('date', dateStr);
    
    console.log('📡 Llamando a API:', url.toString());
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Horarios disponibles recibidos:', data.slots?.length || 0, 'slots');
    
    // La API devuelve { slots: [...] }
    STATE.bookedTimes[dateStr] = data.slots || [];
  } catch (error) {
    console.warn('⚠️ Backend no disponible, usando modo offline:', error.message);
    // Modo offline: generar horarios sin validación
    STATE.bookedTimes[dateStr] = [];
  }
  
  renderTimeSlots(dateStr);
}

function renderTimeSlots(dateStr) {
  const grid = $id('time-grid', 'hours');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // Usar horarios disponibles de la API (o generados en offline)
  const availableSlots = STATE.bookedTimes[dateStr] || [];
  
  // Si la API no devolvió horarios, generar offline (sin validación)
  const slotsToShow = availableSlots.length > 0 
    ? availableSlots.map(time24h => ({
        time24h,
        time12h: to12h(time24h)
      }))
    : generateTimeSlots(dateStr);
  
  slotsToShow.forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot';
    btn.textContent = slot.time12h;
    btn.setAttribute('data-time', slot.time24h);
    
    // Si tenemos datos de la API, todos estos horarios son disponibles
    // Si estamos en offline, todos son clickeables
    
    btn.addEventListener('click', () => selectTime(slot.time24h, slot.time12h, btn));
    grid.appendChild(btn);
  });
  
  const slotCount = slotsToShow.length;
  console.log(`⏰ Horarios disponibles cargados: ${slotCount}`);
  
  if (slotCount === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 2rem;">No hay horarios disponibles para esta fecha</div>';
  }
}

function selectTime(time24h, time12h, element) {
  // Remover selección anterior
  document.querySelectorAll('.time-slot.selected').forEach(el => {
    el.classList.remove('selected');
  });
  
  element.classList.add('selected');
  STATE.selectedTime = time24h;
  
  console.log('⏱️ Hora seleccionada:', time12h);
  
  goToStep(2);
  showConfirmation();
}

// ============ FORMULARIO ============
function setupFormHandlers() {
  const serviceSelect = $id('service-select', 'serviceId');
  const houseCallGroup = $id('house-call-location-group', 'housecall-address-label');
  
  if (serviceSelect) {
    serviceSelect.addEventListener('change', (e) => {
      STATE.selectedService = e.target.value;
      STATE.selectedTime = null; // Resetear hora seleccionada
      
      const option = e.target.options[e.target.selectedIndex];
      const duration = option?.getAttribute('data-duration');
      const price = option?.getAttribute('data-price');
      const sd = $id('service-duration', 'serviceDuration');
      const sp = $id('service-price', 'servicePrice');
      if (sd) sd.value = duration ? duration + ' min' : '--';
      if (sp) sp.value = price ? '$' + price : '--';

      // Mostrar/ocultar campo de ubicación (house call)
      if (e.target.value === 'HouseCall' || e.target.value === 'house-call' || e.target.value === 'House Call') {
        if (houseCallGroup) houseCallGroup.style.display = '';
      } else if (houseCallGroup) {
        houseCallGroup.style.display = 'none';
      }

      console.log('📋 Servicio seleccionado:', e.target.value);
      
      // Si ya hay una fecha seleccionada, recargar horarios con el nuevo servicio
      if (STATE.selectedDate) {
        console.log('🔄 Recargando horarios para el nuevo servicio...');
        loadTimeSlots(STATE.selectedDate);
      }
      
      showConfirmation();
    });
  }
  
  // Guardar datos del formulario en tiempo real
  $id('client-name', 'clientName')?.addEventListener('input', (e) => { STATE.formData.name = e.target.value; showConfirmation(); });
  $id('client-email', 'clientEmail')?.addEventListener('input', (e) => { STATE.formData.email = e.target.value; showConfirmation(); });
  $id('client-phone', 'clientPhone')?.addEventListener('input', (e) => { STATE.formData.phone = e.target.value; showConfirmation(); });
  $id('client-instagram', 'clientInstagram')?.addEventListener('input', (e) => { STATE.formData.instagram = e.target.value; showConfirmation(); });
  $id('house-call-location', 'housecallAddress')?.addEventListener('input', (e) => { STATE.formData.location = e.target.value; showConfirmation(); });
}

// ============ NAVEGACIÓN DE PASOS ============
function goToStep(step) {
  console.log('📍 Navegando al paso:', step);
  
  STATE.currentStep = step;
  
  // Ocultar todos los pasos
  document.querySelectorAll('.booking-step').forEach(el => {
    el.classList.remove('active');
  });
  
  // Mostrar paso actual (IDs en index.html: step-1 .. step-4)
  const stepElement = document.getElementById(`step-${step}`);
  if (stepElement) stepElement.classList.add('active');

  // Actualizar barra de progreso (3 items: Fecha/Hora, Datos, Confirmar)
  document.querySelectorAll('.progress-item').forEach((el, i) => {
    el.classList.toggle('active', i === step - 1);
    el.classList.toggle('completed', i < step - 1);
  });

  // Si llegamos a confirmación (step 3), generar resumen
  if (step === 3) showConfirmation();
  
  // Scroll suave al panel
  const panel = document.querySelector('.booking-panel') || document.getElementById('booking');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetSelection() {
  STATE.selectedDate = null;
  STATE.selectedTime = null;
  document.querySelectorAll('.calendar-day.selected, .time-slot.selected').forEach(el => {
    el.classList.remove('selected');
  });
  // Volver al estado inicial: mostrar selección de horas vacía
  const tg = $id('time-grid', 'hours'); if (tg) tg.innerHTML = '';
  const rs = $id('reset-selection', 'reset-btn'); if (rs && rs.style) rs.style.display = 'none';
  goToStep(1);
  console.log('🔄 Selección reseteada');
}

// ============ CONFIRMACIÓN ============
function showConfirmation() {
  const summary = document.getElementById('summary-container');
  if (!summary) {
    console.warn('⚠️ No se encontró el elemento summary-container');
    return;
  }
  
  const selectedDateObj = STATE.selectedDate ? new Date(STATE.selectedDate) : null;
  const time12h = STATE.selectedTime ? to12h(STATE.selectedTime) : '';
  
  const svcEl = document.getElementById('serviceId');
  const service = svcEl ? svcEl.value : '';
  const serviceText = svcEl && svcEl.options ? svcEl.options[svcEl.selectedIndex]?.text || '' : '';
  
  // Obtener duración y precio del servicio
  const selectedOption = svcEl?.options[svcEl.selectedIndex];
  const duration = selectedOption?.getAttribute('data-duration') || '--';
  const price = selectedOption?.getAttribute('data-price') || '--';
  
  // Si no hay datos seleccionados, mostrar placeholder
  if (!STATE.selectedDate || !STATE.selectedTime || !service) {
    summary.innerHTML = `<div class="summary-placeholder">📋 Selecciona día, hora y servicio para ver el resumen aquí...</div>`;
    return;
  }
  
  // Construir el resumen con los datos disponibles
  let summaryHTML = `
    <div class="summary-item">
      <span class="summary-label">📅 Fecha</span>
      <span class="summary-value">${STATE.selectedDate ? formatShortDate(selectedDateObj) : '<span class="empty">(no seleccionada)</span>'}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">⏱️ Hora</span>
      <span class="summary-value">${STATE.selectedTime ? time12h : '<span class="empty">(no seleccionada)</span>'}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">📋 Servicio</span>
      <span class="summary-value">${serviceText || '<span class="empty">(no seleccionado)</span>'}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">⏳ Duración</span>
      <span class="summary-value">${duration ? duration + ' min' : '<span class="empty">--</span>'}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">💰 Precio</span>
      <span class="summary-value">${price ? '$' + price : '<span class="empty">--</span>'}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">👤 Nombre</span>
      <span class="summary-value">${STATE.formData.name ? STATE.formData.name : '<span class="empty">(por completar)</span>'}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">📧 Email</span>
      <span class="summary-value">${STATE.formData.email ? STATE.formData.email : '<span class="empty">(por completar)</span>'}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">📞 Teléfono</span>
      <span class="summary-value">${STATE.formData.phone ? STATE.formData.phone : '<span class="empty">(por completar)</span>'}</span>
    </div>
  `;
  
  // Agregar Instagram si está completo
  if (STATE.formData.instagram) {
    summaryHTML += `
    <div class="summary-item">
      <span class="summary-label">📸 Instagram</span>
      <span class="summary-value">@${STATE.formData.instagram}</span>
    </div>
    `;
  }
  
  // Agregar ubicación si está completo (solo para House Call)
  if (STATE.formData.location && service === 'HouseCall') {
    summaryHTML += `
    <div class="summary-item">
      <span class="summary-label">🏠 Ubicación</span>
      <span class="summary-value">${STATE.formData.location}</span>
    </div>
    `;
  }
  
  // Agregar animación de actualización
  summary.classList.remove('updating');
  void summary.offsetWidth; // Fuerza un reflow para reiniciar la animación
  summary.classList.add('updating');
  
  summary.innerHTML = summaryHTML;
  
  // Habilitar botón de confirmación si todos los campos requeridos están completos
  const consentCheckbox = document.getElementById('optIn');
  const confirmBtn = document.getElementById('reserve-btn');
  const isValid = STATE.selectedDate && STATE.selectedTime && STATE.formData.name && STATE.formData.email && STATE.formData.phone && STATE.selectedService;
  if (confirmBtn) {
    confirmBtn.disabled = !isValid || !(consentCheckbox && consentCheckbox.checked);
    // Cambiar texto del botón si hay errores de validación
    if (!isValid) {
      confirmBtn.textContent = '⏳ Completa todos los campos';
    } else if (!(consentCheckbox && consentCheckbox.checked)) {
      confirmBtn.textContent = '☑️ Acepta los términos para reservar';
    } else {
      confirmBtn.textContent = '✅ Reservar Ahora';
    }
  }
  
  // Agregar listener al checkbox solo una vez
  if (consentCheckbox && !consentCheckbox.hasConfirmationListener) {
    consentCheckbox.hasConfirmationListener = true;
    consentCheckbox.addEventListener('change', () => {
      const isStillValid = STATE.selectedDate && STATE.selectedTime && STATE.formData.name && STATE.formData.email && STATE.formData.phone && STATE.selectedService;
      if (confirmBtn) {
        confirmBtn.disabled = !isStillValid || !consentCheckbox.checked;
        if (!isStillValid) {
          confirmBtn.textContent = '⏳ Completa todos los campos';
        } else if (!consentCheckbox.checked) {
          confirmBtn.textContent = '☑️ Acepta los términos para reservar';
        } else {
          confirmBtn.textContent = '✅ Reservar Ahora';
        }
      }
    });
  }
  
  console.log('✅ Confirmación actualizada en tiempo real', {
    fecha: STATE.selectedDate,
    hora: STATE.selectedTime,
    servicio: STATE.selectedService,
    nombre: STATE.formData.name,
    email: STATE.formData.email,
    completo: isValid ? '✅' : '⏳'
  });
}

// ============ ENVÍO DE RESERVA ============
async function submitBooking() {
  if (!STATE.selectedDate || !STATE.selectedTime || !STATE.formData.name) {
    alert('❌ Por favor completa todos los campos requeridos');
    return;
  }
  
  const bookingData = {
    date: STATE.selectedDate,
    time24h: STATE.selectedTime,
    time12h: to12h(STATE.selectedTime),
    name: STATE.formData.name,
    email: STATE.formData.email,
    phone: STATE.formData.phone,
    instagram: STATE.formData.instagram,
    service: STATE.selectedService,
    location: STATE.formData.location || null
  };
  
  console.log('📤 Enviando reserva...', bookingData);
  
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Reserva confirmada:', result.message);
      // Mostrar éxito en el paso 4
      const msg = `Se ha enviado una confirmación a ${STATE.formData.email}. Tu cita es el ${formatShortDate(new Date(STATE.selectedDate))} a las ${to12h(STATE.selectedTime)}.`;
      const successEl = document.getElementById('success-message');
      if (successEl) successEl.textContent = msg;
      goToStep(4);
    } else {
      // Backend returned error — fallback to local storage
      const bookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
      bookings.push(bookingData);
      localStorage.setItem('localBookings', JSON.stringify(bookings));
      const msg = `Reserva guardada localmente. Tu cita: ${formatShortDate(new Date(STATE.selectedDate))} a las ${to12h(STATE.selectedTime)}.`;
      const successEl = document.getElementById('success-message');
      if (successEl) successEl.textContent = msg;
      goToStep(4);
    }
  } catch (error) {
    console.error('❌ Error enviando reserva:', error);
    // Fallback offline: save booking to localStorage and show success
    const bookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('localBookings', JSON.stringify(bookings));
    const msg = `Reserva guardada localmente (offline). Tu cita: ${formatShortDate(new Date(STATE.selectedDate))} a las ${to12h(STATE.selectedTime)}.`;
    const successEl = document.getElementById('success-message');
    if (successEl) successEl.textContent = msg;
    goToStep(4);
  }
}

// ============ NAVEGACIÓN PRINCIPAL ============
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============ PWA / SERVICE WORKER ============
function showPwaBanner() {
  const banner = $id('pwa-install-banner');
  if (!banner) return;
  if (localStorage.getItem(INSTALL_DISMISSED_KEY) === '1') return;
  banner.hidden = false;
  banner.classList.add('visible');
  document.body.classList.add('pwa-banner-open');
}

function hidePwaBanner(permanent = false) {
  const banner = $id('pwa-install-banner');
  if (!banner) return;
  banner.classList.remove('visible');
  banner.hidden = true;
  document.body.classList.remove('pwa-banner-open');
  if (permanent) localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
}

function setupPwaInstallUi() {
  const installBtn = $id('pwa-install-btn');
  const closeBtn = $id('pwa-install-close');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isStandalone) {
    hidePwaBanner(true);
    return;
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showPwaBanner();
    console.log('📲 PWA install disponible');
  });

  window.addEventListener('appinstalled', () => {
    hidePwaBanner(true);
    console.log('✅ PWA instalada en home screen');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) {
        showPwaBanner();
        return;
      }
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log('📥 Resultado instalación:', outcome);
      if (outcome === 'accepted') hidePwaBanner(true);
      deferredInstallPrompt = null;
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => hidePwaBanner(true));
  }
}

function registerServiceWorker() {
  // No registrar Service Worker si se está ejecutando desde file:// (local)
  if (window.location.protocol === 'file:') {
    console.log('ℹ️ Service Worker no disponible en file:// - usa un servidor HTTP');
    return;
  }
  
  if (!('serviceWorker' in navigator)) {
    console.log('ℹ️ Service Worker no soportado en este navegador');
    return;
  }
  
  navigator.serviceWorker.register('/service-worker.js')
    .then((reg) => console.log('🛡️ Service Worker registrado:', reg.scope))
    .catch((err) => console.error('⚠️ Error registrando Service Worker:', err));
}

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOMContentLoaded - Iniciando aplicación');
  console.log('📱 Navegador:', navigator.userAgent);

  setupPwaInstallUi();
  registerServiceWorker();
  
  // Renderizar calendario inmediatamente (support multiple IDs)
  const calendarioExiste = $id('calendar-grid', 'calendar');
  console.log('🔍 Elemento calendar encontrado:', !!calendarioExiste);
  if (!calendarioExiste) {
    console.error('❌ CRÍTICO: No se encontró el elemento calendar');
    return;
  }
  
  // Esperar un tick para asegurar que el DOM esté listo
  setTimeout(() => {
    try {
      console.log('📅 Renderizando calendario...');
      renderCalendar();
      console.log('✅ Calendario renderizado exitosamente');
      
      // Setup controles de calendario (support both ids)
      const prevBtn = $id('prev-month');
      const nextBtn = $id('next-month');
      
      console.log('🔘 Botón prev:', !!prevBtn, 'Botón next:', !!nextBtn);
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          STATE.currentMonth--;
          if (STATE.currentMonth < 0) {
            STATE.currentMonth = 11;
            STATE.currentYear--;
          }
          renderCalendar();
          console.log('⬅️ Mes anterior:', getMonthName(STATE.currentMonth, STATE.currentYear));
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          STATE.currentMonth++;
          if (STATE.currentMonth > 11) {
            STATE.currentMonth = 0;
            STATE.currentYear++;
          }
          renderCalendar();
          console.log('➡️ Mes siguiente:', getMonthName(STATE.currentMonth, STATE.currentYear));
        });
      }

      // Setup botón reset (support reset-selection or reset-btn)
      $id('reset-selection', 'reset-btn')?.addEventListener('click', resetSelection);

      // Setup formulario handlers
      setupFormHandlers();

      // Setup botón de confirmación (confirm-booking or reserve-btn)
      $id('confirm-booking', 'reserve-btn')?.addEventListener('click', submitBooking);
      
      console.log('✅ Aplicación lista');
      console.log('📊 Estado inicial:', {
        mes: getMonthName(STATE.currentMonth, STATE.currentYear),
        horas: '8AM - 7PM',
        dias: 'Martes-Sábado'
      });
    } catch (error) {
      console.error('❌ Error en inicialización:', error);
      console.error('📋 Stack:', error.stack);
    }
  }, 50);

  // Smooth open booking when clicking hero button
  document.querySelectorAll('.btn-main').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // No interceptar enlaces externos (Instagram, WhatsApp, etc)
      const href = btn.getAttribute('href');
      if (href && (href.startsWith('http') || href.startsWith('https') || href.startsWith('mailto') || href.startsWith('tel'))) {
        return; // Dejar que el navegador maneje el enlace
      }
      
      e.preventDefault();
      const bookingSection = document.getElementById('booking');
      if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
      // open calendar/time panel
      setTimeout(() => goToStep(1), 300);
    });
  });

  // IntersectionObserver for reveal animations
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(r => obs.observe(r));
  } else {
    // fallback: show all
    reveals.forEach(r => r.classList.add('visible'));
  }

  // Hero carousel: auto cross-fade every 2s
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides && heroSlides.length > 0) {
    let heroIndex = 0;
    heroSlides.forEach((s, i) => s.classList.toggle('active', i === 0));
    setInterval(() => {
      const prev = heroIndex;
      heroIndex = (heroIndex + 1) % heroSlides.length;
      heroSlides[prev].classList.remove('active');
      heroSlides[heroIndex].classList.add('active');
    }, 1500);
  }
});

console.log('✅ app.js cargado correctamente');
