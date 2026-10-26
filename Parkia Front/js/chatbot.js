/**
 * PARKIABOT - Asistente Virtual y Chatbot de Preguntas Frecuentes
 * Parkia Platform (c) 2026
 */

(function () {
  // Base de conocimiento de Preguntas Frecuentes
  const FAQ_DATA = [
    {
      id: "reserva",
      pregunta: "🔍 ¿Cómo buscar y reservar un lugar?",
      keywords: ["buscar", "reservar", "cochera", "estacionamiento", "como funciona", "lugar", "pasos", "reserva"],
      respuesta: `Para reservar en Parkia es muy simple:
1. 📍 **Buscá en el mapa** o escribí tu destino en el buscador.
2. ⏱️ **Elegí tu horario** de entrada y salida estimada.
3. 🚗 **Seleccioná tu cochera** preferida y hacé clic en *Reservar ahora*.
4. 💳 **Aboná con Mercado Pago** o tu medio preferido.
5. 🎟️ **¡Listo!** Obtenés tu código QR único para entrar sin demoras.`,
      link: { text: "Ir al Buscador", url: (window.location.pathname.includes('/vistas/') ? 'buscador.html' : 'vistas/buscador.html') }
    },
    {
      id: "mercadopago",
      pregunta: "💳 ¿Cómo pagar con Mercado Pago?",
      keywords: ["mercado pago", "mercadopago", "mp", "pagar", "pago", "tarjeta", "debito", "credito", "dinero en cuenta", "efectivo"],
      respuesta: `¡En Parkia podés pagar en segundos con **Mercado Pago**! 💙
• **Dinero en cuenta**: Acreditación inmediata con tu saldo disponible.
• **Tarjetas de débito y crédito**: Hasta en cuotas sin interés según tu banco.
• **Código QR**: Escaneá directamente desde tu app de Mercado Pago.
• **Efectivo**: También podés abonar en el comercio al ingresar si el estacionamiento lo admite.`,
      badge: "Mercado Pago Oficial",
      link: { text: "Ver cocheras con Mercado Pago", url: (window.location.pathname.includes('/vistas/') ? '../index.html' : 'index.html') }
    },
    {
      id: "qr",
      pregunta: "🎟️ ¿Cómo ingreso con el código QR?",
      keywords: ["qr", "codigo", "entrar", "ingreso", "acceso", "barrera", "ticket"],
      respuesta: `Al confirmar tu reserva, se genera tu **Código QR Parkia**:
1. Llegás al estacionamiento seleccionado.
2. Mostrás la pantalla de tu celular al lector del tótem o al encargado.
3. El sistema valida tu horario y te abre la barrera automáticamente.
*¡Sin necesidad de tickets de papel ni esperar en la cabina!*`,
      link: { text: "Ver mis reservas", url: (window.location.pathname.includes('/vistas/') ? 'reservas.html' : 'vistas/reservas.html') }
    },
    {
      id: "tolerancia",
      pregunta: "⏱️ ¿Qué pasa si llego antes o después?",
      keywords: ["tolerancia", "tarde", "antes", "demora", "retraso", "tiempo extra", "fraccion"],
      respuesta: `• **Llegada anticipada**: Tenés **15 minutos de cortesía** antes del horario de tu reserva para ingresar si hay disponibilidad.
• **Llegada con demora**: Tu lugar se mantiene garantizado y reservado durante todo el período abonado.
• **Salida posterior**: Si te quedás más tiempo, podés abonar la fracción adicional directamente desde la app o en la caja del garage.`
    },
    {
      id: "cancelar",
      pregunta: "❌ ¿Cómo cancelar y pedir reembolso?",
      keywords: ["cancelar", "cancelacion", "reembolso", "devolucion", "anular", "plata"],
      respuesta: `Podés cancelar tu reserva hasta **30 minutos antes** de la hora de inicio:
1. Andá a **Mis Reservas**.
2. Tocá en la reserva activa y presioná **Cancelar Reserva**.
3. El espacio se libera al instante y el monto se reintegra a tu cuenta de Mercado Pago o método original en 24/48 hs hábiles.`
    },
    {
      id: "servicios",
      pregunta: "⚡ ¿Hay cocheras con carga eléctrica o techadas?",
      keywords: ["electrica", "electrico", "carga", "techado", "seguridad", "camaras", "24hs", "servicios", "comodidades"],
      respuesta: `¡Sí! Parkia cuenta con filtros rápidos en el mapa para:
• 🔌 **Carga para autos eléctricos / híbridos**.
• 🏢 **Estacionamiento techado** protegido contra granizo y lluvia.
• 🛡️ **Vigilancia 24 hs** y cámaras de seguridad monitoreadas.
• ♿ **Cocheras accesibles** para movilidad reducida.`
    },
    {
      id: "publicar",
      pregunta: "🏢 ¿Cómo registrar mi estacionamiento en Parkia?",
      keywords: ["registrar", "dueno", "publicar", "garagista", "empresa", "b2b", "plan", "asociar"],
      respuesta: `¿Sos dueño o administrador de un estacionamiento?
Sumate a la red Parkia para maximizar tu ocupación:
• Publicá tus espacios y tarifas en tiempo real.
• Cobrá automáticamente mediante Mercado Pago y recibí liquidaciones quincenales.
• Panel de control web con métricas de ocupación e ingresos.`,
      link: { text: "Contactar área comercial", url: "mailto:empresas@parkia.com" }
    },
    {
      id: "parkia_pass",
      pregunta: "⭐ ¿Qué es Parkia Pass y qué descuentos incluye?",
      keywords: ["pass", "parkia pass", "vip", "descuento", "membresia", "freemium", "suscripcion", "beneficios", "ahorro"],
      respuesta: `**Parkia Pass** es nuestra membresía mensual exclusiva para conductores ($2.999/mes):
• 🏷️ **10% de descuento directo** en todas tus reservas de estacionamiento.
• ⚡ **Reserva prioritaria** en garages con alta demanda en horario pico.
• 📊 **Reporte de gastos descargable** para deducciones impositivas y control de flota.
• 🎁 **Beneficios y 2x1** en cafeterías y lavaderos de la zona asociada.`,
      link: { text: "Ver y Activar Parkia Pass", url: (window.location.pathname.includes('/vistas/') ? 'perfil.html' : 'vistas/perfil.html') }
    },
    {
      id: "modelo_negocio",
      pregunta: "💼 ¿Cómo funciona el modelo de negocio para cocheras?",
      keywords: ["modelo", "negocio", "comision", "porcentaje", "saas", "plan basico", "plan premium", "publicidad", "monetizacion", "insights"],
      respuesta: `El ecosistema Parkia opera bajo 6 pilares de monetización:
1. 🏷️ **Comisión Marketplace (8%)**: El estacionamiento solo abona comisión sobre reservas confirmadas.
2. 👑 **Suscripción B2B SaaS**: Plan Básico ($15.000) o Premium ($35.000 con badge dorado, top ranking y analítica).
3. ☕ **Publicidad Geolocalizada**: Comercios vecinos (cafés, lavaderos) pagan pauta para ofrecer beneficios a los conductores.
4. ⭐ **Parkia Pass (B2C)**: Membresía para usuarios frecuentes con 10% OFF.
5. 💳 **Fee Pasarela Digital (2.5%)**: Procesamiento seguro con Mercado Pago.
6. 📈 **Datos e Insights B2B**: Reportes de horas pico, ocupación y precios zonales.`,
      link: { text: "Abrir Panel Cocheras B2B", url: (window.location.pathname.includes('/vistas/') ? 'dashboard_negocio.html' : 'vistas/dashboard_negocio.html') }
    },
    {
      id: "soporte",
      pregunta: "📞 ¿Cómo hablo con soporte humano?",
      keywords: ["humano", "persona", "soporte", "contacto", "telefono", "whatsapp", "ayuda", "asesor"],
      respuesta: `Nuestro equipo de soporte está disponible todos los días:
• 📧 Email: **soporte@parkia.com**
• 📱 WhatsApp directo: **+54 9 11 4567-8900**
• ⏰ Horario de atención: Lunes a Domingos de 07:00 a 23:00 hs.`
    }
  ];

  function createChatbotUI() {
    if (document.getElementById('parkiabot-root')) return;

    const root = document.createElement('div');
    root.id = 'parkiabot-root';
    root.innerHTML = `
      <!-- Launcher flotante -->
      <button class="parkiabot-launcher" id="parkiabotLauncher" aria-label="Abrir asistente de preguntas frecuentes">
        <div class="parkiabot-launcher-icon">
          🤖
          <span class="parkiabot-status-dot"></span>
        </div>
        <div class="parkiabot-launcher-text">
          <span class="parkiabot-launcher-title">ParkiaBot</span>
          <span class="parkiabot-launcher-sub">Preguntas Frecuentes</span>
        </div>
      </button>

      <!-- Ventana de Chat -->
      <div class="parkiabot-window hidden" id="parkiabotWindow" role="dialog" aria-modal="true">
        <div class="parkiabot-header">
          <div class="parkiabot-header-info">
            <div class="parkiabot-header-avatar">🤖</div>
            <div>
              <h3 class="parkiabot-header-title">ParkiaBot Asistente</h3>
              <span class="parkiabot-header-status">En línea · Respuestas al instante</span>
            </div>
          </div>
          <button class="parkiabot-header-close" id="parkiabotClose" aria-label="Cerrar chat">✕</button>
        </div>

        <div class="parkiabot-messages" id="parkiabotMessages">
          <!-- Mensaje de bienvenida inicial -->
          <div class="parkiabot-msg bot">
            <div class="parkiabot-msg-bubble">
              ¡Hola! 👋 Soy <strong>ParkiaBot</strong>, el asistente de Parkia.
              <br><br>
              ¿Tenés dudas sobre reservas, <strong>pagos con Mercado Pago</strong> o cómo acceder?
              <br><br>
              <em>Elegí una pregunta frecuente o escribime directamente abajo:</em>
              <div class="parkiabot-faq-container" id="parkiabotFaqChips"></div>
            </div>
          </div>
        </div>

        <form class="parkiabot-footer" id="parkiabotForm">
          <input 
            type="text" 
            class="parkiabot-input" 
            id="parkiabotInput" 
            placeholder="Escribí tu consulta..." 
            autocomplete="off"
          />
          <button type="submit" class="parkiabot-send-btn" aria-label="Enviar mensaje">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(root);
    setupChatbotEvents();
    renderFaqChips();
  }

  function renderFaqChips() {
    const container = document.getElementById('parkiabotFaqChips');
    if (!container) return;
    container.innerHTML = '';
    
    FAQ_DATA.forEach(faq => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'parkiabot-faq-chip';
      btn.innerHTML = `<span>${faq.pregunta}</span><span class="arrow">›</span>`;
      btn.addEventListener('click', () => {
        handleUserFaqClick(faq);
      });
      container.appendChild(btn);
    });
  }

  function appendMessage(sender, htmlContent) {
    const messages = document.getElementById('parkiabotMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `parkiabot-msg ${sender}`;
    msgDiv.innerHTML = `<div class="parkiabot-msg-bubble">${htmlContent}</div>`;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTypingIndicator() {
    const messages = document.getElementById('parkiabotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'parkiabot-msg bot';
    typingDiv.id = 'parkiabotTyping';
    typingDiv.innerHTML = `
      <div class="parkiabot-typing">
        <span class="parkiabot-typing-dot"></span>
        <span class="parkiabot-typing-dot"></span>
        <span class="parkiabot-typing-dot"></span>
      </div>
    `;
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('parkiabotTyping');
    if (el) el.remove();
  }

  function handleUserFaqClick(faq) {
    appendMessage('user', faq.pregunta);
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      let responseHtml = faq.respuesta.replace(/\n/g, '<br>');
      if (faq.badge) {
        responseHtml = `<div style="margin-bottom:6px;"><span class="parkiabot-badge-mp">✓ ${faq.badge}</span></div>` + responseHtml;
      }
      if (faq.link) {
        responseHtml += `<br><a href="${faq.link.url}" class="parkiabot-action-link ${faq.id === 'mercadopago' ? 'mp' : ''}">${faq.link.text} →</a>`;
      }
      
      // Agregar sugerencias rápidas
      responseHtml += `
        <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #E2E8F0; font-size:11px; color:#64748B;">
          ¿Te sirvió esta respuesta? Podés consultar otra pregunta frecuente o escribir tu consulta.
        </div>
      `;

      appendMessage('bot', responseHtml);
    }, 450);
  }

  function findAnswerByKeyword(query) {
    const q = query.toLowerCase().trim();
    if (!q) return null;

    let bestMatch = null;
    let maxScore = 0;

    FAQ_DATA.forEach(faq => {
      let score = 0;
      faq.keywords.forEach(kw => {
        if (q.includes(kw)) {
          score += kw.length;
        }
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = faq;
      }
    });

    if (maxScore > 0 && bestMatch) {
      return bestMatch;
    }
    return null;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('parkiabotInput');
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = '';
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const match = findAnswerByKeyword(text);

      if (match) {
        let responseHtml = match.respuesta.replace(/\n/g, '<br>');
        if (match.badge) {
          responseHtml = `<div style="margin-bottom:6px;"><span class="parkiabot-badge-mp">✓ ${match.badge}</span></div>` + responseHtml;
        }
        if (match.link) {
          responseHtml += `<br><a href="${match.link.url}" class="parkiabot-action-link ${match.id === 'mercadopago' ? 'mp' : ''}">${match.link.text} →</a>`;
        }
        appendMessage('bot', responseHtml);
      } else {
        appendMessage('bot', `
          Entiendo tu consulta sobre <em>"${text}"</em>.<br><br>
          Para darte una respuesta precisa, te sugiero elegir una de nuestras preguntas frecuentes principales:
          <div class="parkiabot-faq-container" style="margin-top:8px;">
            <button type="button" class="parkiabot-faq-chip" onclick="window.parkiabotTriggerFaq('reserva')">🔍 ¿Cómo reservar?</button>
            <button type="button" class="parkiabot-faq-chip" onclick="window.parkiabotTriggerFaq('mercadopago')">💳 Pagar con Mercado Pago</button>
            <button type="button" class="parkiabot-faq-chip" onclick="window.parkiabotTriggerFaq('qr')">🎟️ Acceso con QR</button>
            <button type="button" class="parkiabot-faq-chip" onclick="window.parkiabotTriggerFaq('soporte')">📞 Hablar con soporte</button>
          </div>
        `);
      }
    }, 500);
  }

  window.parkiabotTriggerFaq = function (faqId) {
    const item = FAQ_DATA.find(f => f.id === faqId);
    if (item) handleUserFaqClick(item);
  };

  function setupChatbotEvents() {
    const launcher = document.getElementById('parkiabotLauncher');
    const windowEl = document.getElementById('parkiabotWindow');
    const closeBtn = document.getElementById('parkiabotClose');
    const form = document.getElementById('parkiabotForm');

    launcher.addEventListener('click', () => {
      windowEl.classList.toggle('hidden');
      if (!windowEl.classList.contains('hidden')) {
        document.getElementById('parkiabotInput').focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      windowEl.classList.add('hidden');
    });

    form.addEventListener('submit', handleFormSubmit);
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbotUI);
  } else {
    createChatbotUI();
  }
})();
