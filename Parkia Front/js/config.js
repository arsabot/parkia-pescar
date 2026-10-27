// Configuración dinámica de API para PARKIA
(function() {
  var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // URL del túnel público activo que conecta con la PC local
  var PUBLIC_TUNNEL_URL = 'https://delivery-whatever-authorized-forever.trycloudflare.com/api';

  var apiBase;
  if (isLocal && (window.location.port === '8080' || window.location.port === '3000' || window.location.port === '5500')) {
    // Si corre en localhost, usar backend local
    apiBase = 'http://127.0.0.1:8000/api';
  } else {
    // Si está desplegado en Vercel o acceso externo, conectar directamente al túnel HTTPS de la PC
    apiBase = PUBLIC_TUNNEL_URL;
  }

  window.PARKIA_CONFIG = {
    API_BASE_URL: apiBase,
    PUBLIC_TUNNEL_URL: PUBLIC_TUNNEL_URL
  };

  window.getParkiaApiUrl = function(endpoint) {
    var base = window.PARKIA_CONFIG.API_BASE_URL.replace(/\/+$/, '');
    var path = (endpoint || '').replace(/^\/+/, '');
    return path ? (base + '/' + path) : base;
  };
})();
