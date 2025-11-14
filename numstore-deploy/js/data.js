const dataStore = {
  planes: [
    {
      nombre: "E-Sim Full Privado",
      duracion: "De por vida",
      compraAnonima: true,
      precio: 35,
      precioGuaranies: "250.000",
      masComprado: true,
      beneficios: [
        "Duplicación de número telefónico manual",
        "Reemplaza número existente de WhatsApp",
        "Número completamente privado e inrastreable", 
        "VPN privado militar no rastreable",
        "Compatible con WhatsApp y WhatsApp Business",
        "Sin registros de chat, llamadas ni datos",
        "Protección total contra rastreo",
        "Activación anónima inmediata",
        "+100 países seleccionables",
        "Encriptación militar de extremo a extremo",
        "Soporte confidencial 24/7"
      ]
    },
    {
      nombre: "E-Sim Privado Medio Pro",
      duracion: "3 meses",
      compraAnonima: true,
      precio: 12,
      precioGuaranies: "110.000",
      masComprado: false,
      beneficios: [
        "Número completamente privado",
        "VPN privado avanzado no rastreable",
        "Compatible con WhatsApp Business", 
        "Sin registros de chat ni llamadas",
        "Protección contra rastreo de ubicación",
        "Activación anónima inmediata",
        "30 países disponibles",
        "Encriptación de extremo a extremo"
      ]
    },
    {
      nombre: "E-Sim Privado Básico",
      duracion: "30 días",
      compraAnonima: true,
      precio: 9.99,
      precioGuaranies: "70.000",
      masComprado: false,
      beneficios: [
        "Número completamente privado",
        "VPN integrado no rastreable", 
        "Compatible con WhatsApp",
        "Sin registros de actividad",
        "Activación anónima inmediata",
        "Encriptación básica"
      ]
    }
  ],
  // Cargar mensajes desde localStorage o iniciar vacío
  mensajes: JSON.parse(localStorage.getItem('numstore_mensajes') || '[]')
};

// Función para guardar mensajes en localStorage
function guardarMensajes() {
  localStorage.setItem('numstore_mensajes', JSON.stringify(dataStore.mensajes));
}

// Función para agregar mensaje y guardarlo automáticamente
function agregarMensaje(mensaje) {
  // Agregar ID único y datos adicionales
  mensaje.id = Date.now() + Math.random();
  mensaje.fecha = new Date().toISOString();
  mensaje.estado = mensaje.estado || 'pendiente';
  mensaje.leido = false;
  mensaje.tipoConversacion = mensaje.tipoConversacion || 'compra'; // 'compra' o 'consulta'
  
  dataStore.mensajes.push(mensaje);
  guardarMensajes();
  
  // Enviar también al sistema del admin (simular API)
  enviarMensajeAAdmin(mensaje);
}

// Función para enviar mensajes al admin
function enviarMensajeAAdmin(mensaje) {
  // Solo enviar mensajes del usuario al admin
  if (mensaje.from !== 'usuario') return;
  
  // Obtener información del cliente actual desde localStorage
  const clienteSession = JSON.parse(localStorage.getItem('numstore_cliente_session') || '{}');
  
  // Obtener mensajes del admin desde localStorage
  let mensajesAdmin = JSON.parse(localStorage.getItem('numstore_mensajes_admin') || '[]');
  
  // Crear estructura compatible con el dashboard
  const mensajeParaAdmin = {
    id: mensaje.id,
    sessionId: clienteSession.sessionId || 'unknown',
    cliente: clienteSession.nombre || 'Cliente Anónimo',
    email: clienteSession.email || 'No disponible',
    telefono: clienteSession.telefono || 'No disponible',
    fecha: mensaje.fecha,
    text: mensaje.text,
    image: mensaje.image || null,
    estado: mensaje.estado || 'pendiente',
    leido: false,
    tipoConversacion: mensaje.tipoConversacion || 'compra',
    tiempoLimite: mensaje.tiempoLimite || null,
    planSeleccionado: mensaje.planSeleccionado || null,
    numeroAsignado: mensaje.numeroAsignado || null,
    from: 'usuario'
  };
  
  // Verificar si ya existe este mensaje
  const existe = mensajesAdmin.find(m => m.id === mensaje.id);
  if (!existe) {
    mensajesAdmin.push(mensajeParaAdmin);
    localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesAdmin));
    console.log('Mensaje enviado al admin:', mensajeParaAdmin);
  }
}

// Función para limpiar chat (opcional, para testing)
function limpiarChat() {
  dataStore.mensajes = [];
  localStorage.removeItem('numstore_mensajes');
}
