// Verifica login
if (localStorage.getItem('auth') !== 'true') {
  window.location.href = 'auth/login.html';
}

// Variables globales para datos
let planesData = [];
let comprasData = [];
let mensajesData = [];
let numerosGenerados = [];

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  initEventListeners();
  inicializarSincronizacionTiempoReal();
  restaurarEstadoNavegacion();
});

// Navegación
document.querySelectorAll('.sidebar li').forEach(li => {
  li.addEventListener('click', () => {
    document.querySelectorAll('.sidebar li').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('visible'));

    li.classList.add('active');
    const section = li.dataset.section;
    if (section) {
      document.getElementById(section).classList.add('visible');
      
      // Guardar estado actual
      guardarEstadoNavegacion();
      
      // Cargar datos específicos de la sección
      switch(section) {
        case 'compras':
          cargarCompras();
          break;
        case 'mensajes':
          cargarMensajes();
          break;
        case 'planes':
          cargarPlanes();
          break;
        case 'numeros':
          cargarNumeros();
          break;
        case 'consultas':
          cargarConsultas();
          break;
      }
    }
  });
});

// Logout
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('auth');
  window.location.href = 'auth/login.html';
});

// Funciones para cargar datos
async function cargarDatos() {
  try {
    // Cargar planes
    const planesResponse = await fetch('data/planes.json');
    planesData = await planesResponse.json();
    
    // Cargar compras
    const comprasResponse = await fetch('data/compras.json');
    comprasData = await comprasResponse.json();
    
    // Cargar mensajes del cliente desde localStorage
    limpiarDuplicados(); // Limpiar duplicados antes de cargar
    mensajesData = JSON.parse(localStorage.getItem('numstore_mensajes_admin') || '[]');
    console.log('Mensajes cargados en dashboard:', mensajesData);
    
    // Cargar consultas del formulario
    cargarConsultasData();
    
    // Actualizar contadores
    actualizarContadores();
    
    // Cargar la sección activa por defecto
    cargarCompras();
  } catch (error) {
    console.error('Error cargando datos:', error);
    // Usar datos de respaldo si no se pueden cargar los archivos
    usarDatosRespaldo();
  }
}

function actualizarContadores() {
  // Contador de compras pendientes
  const comprasPendientes = comprasData.filter(c => c.estado === 'pendiente').length;
  document.getElementById('contador-compras').textContent = comprasPendientes || '';
  
  // Contador de mensajes no leídos
  const mensajesNoLeidos = mensajesData.filter(m => 
    m.from === 'usuario' && !m.leido && m.tipoConversacion === 'compra'
  ).length;
  document.getElementById('contador-mensajes').textContent = mensajesNoLeidos || '';
  
  // Contador de consultas no leídas
  const consultasNoLeidas = consultasData.filter(c => !c.leida).length;
  document.getElementById('contador-consultas').textContent = consultasNoLeidas || '';
}

function usarDatosRespaldo() {
  planesData = [
    {
      id: 1,
      nombre: "E-Sim Full Privado",
      duracion: "De por vida",
      precio: 35,
      precioGuaranies: "250.000",
      activo: true,
      beneficios: ["Duplicación de número telefónico manual", "Reemplaza número existente de WhatsApp"]
    }
  ];
  
  comprasData = [
    {
      id: 1,
      cliente: "Cliente Ejemplo",
      plan: "E-Sim Full Privado",
      monto: "Gs. 250.000",
      estado: "pendiente",
      comprobante: "sample.png"
    }
  ];
  
  mensajesData = [];
  cargarCompras();
}

function initEventListeners() {
  // Botón nuevo plan
  const btnNuevoPlan = document.getElementById('nuevoPlan');
  if (btnNuevoPlan) {
    btnNuevoPlan.addEventListener('click', mostrarFormularioPlan);
  }
}

// ===== GESTIÓN DE COMPRAS =====
function cargarCompras() {
  const tabla = document.getElementById('tabla-compras');
  const tbody = tabla.querySelector('tbody');
  
  tbody.innerHTML = '';
  
  comprasData.forEach(compra => {
    const row = document.createElement('tr');
    
    const estadoClass = compra.estado === 'pendiente' ? 'pendiente' : 
                       compra.estado === 'aprobado' ? 'aprobado' : 'rechazado';
    
    row.innerHTML = `
      <td>${compra.cliente}</td>
      <td>${compra.plan}</td>
      <td>${compra.monto}</td>
      <td><span class="estado ${estadoClass}">${compra.estado}</span></td>
      <td>
        ${compra.comprobante ? 
          `<img src="uploads/${compra.comprobante}" width="40" alt="Comprobante" onclick="verComprobante('${compra.comprobante}')">` : 
          'Sin comprobante'
        }
      </td>
      <td>
        <button onclick="verDetalleCompra(${compra.id})" class="btn-accion">Ver</button>
        ${compra.estado === 'pendiente' ? 
          `<button onclick="aprobarCompra(${compra.id})" class="btn-aprobar">Aprobar</button>
           <button onclick="rechazarCompra(${compra.id})" class="btn-rechazar">Rechazar</button>` : 
          ''
        }
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

function verDetalleCompra(id) {
  const compra = comprasData.find(c => c.id === id);
  if (!compra) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Detalle de Compra #${compra.id}</h3>
      <p><strong>Cliente:</strong> ${compra.cliente}</p>
      <p><strong>Email:</strong> ${compra.email || 'No disponible'}</p>
      <p><strong>Plan:</strong> ${compra.plan}</p>
      <p><strong>Monto:</strong> ${compra.monto}</p>
      <p><strong>Fecha:</strong> ${new Date(compra.fecha).toLocaleString()}</p>
      <p><strong>Estado:</strong> ${compra.estado}</p>
      ${compra.numero ? `<p><strong>Número asignado:</strong> ${compra.numero}</p>` : ''}
      <div class="modal-buttons">
        <button onclick="cerrarModal()" class="btn-cancelar">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function aprobarCompra(id) {
  const compra = comprasData.find(c => c.id === id);
  if (!compra) return;
  
  compra.estado = 'aprobado';
  
  // Generar número si no tiene
  if (!compra.numero && compra.plan !== 'E-Sim Full Privado') {
    compra.numero = generarNumeroAleatorio();
    compra.numeroCompleto = compra.numero.replace(/\*/g, Math.floor(Math.random() * 10));
  }
  
  // Actualizar la tabla
  cargarCompras();
  
  // Enviar notificación (simulada)
  alert(`Compra aprobada para ${compra.cliente}. ${compra.numero ? 'Número asignado: ' + compra.numero : ''}`);
}

function rechazarCompra(id) {
  const motivo = prompt('Motivo del rechazo (opcional):');
  const compra = comprasData.find(c => c.id === id);
  if (!compra) return;
  
  compra.estado = 'rechazado';
  compra.motivoRechazo = motivo;
  
  cargarCompras();
  alert(`Compra rechazada para ${compra.cliente}`);
}

function generarNumeroAleatorio() {
  const prefijos = ['961', '971', '972', '973', '974', '975', '976', '981', '982', '983', '984', '985', '986', '987', '991', '992', '993', '994'];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const numeroBase = Math.floor(100 + Math.random() * 900).toString();
  const numeroOculto = '***';
  return `(+595) ${prefijo}-${numeroBase}-${numeroOculto}`;
}

// ===== GESTIÓN DE MENSAJES =====
function cargarMensajes() {
  const container = document.getElementById('chat-container');
  
  // Filtrar solo mensajes de compra (no consultas)
  const mensajesCompra = mensajesData.filter(m => m.tipoConversacion === 'compra' || !m.tipoConversacion);
  
  // NUEVA LÓGICA: Agrupar correctamente por cliente
  const conversaciones = new Map();
  
  mensajesCompra.forEach(mensaje => {
    const nombreCliente = (mensaje.cliente || 'Cliente Anónimo').trim();
    
    // Buscar si ya existe una conversación para este cliente
    let conversacionExistente = null;
    let claveExistente = null;
    
    for (let [clave, conv] of conversaciones) {
      if (conv.cliente.toLowerCase().trim() === nombreCliente.toLowerCase().trim()) {
        conversacionExistente = conv;
        claveExistente = clave;
        break;
      }
    }
    
    // Si no existe, crear nueva conversación
    if (!conversacionExistente) {
      const nuevaClave = nombreCliente.toLowerCase().replace(/\s+/g, '_');
      conversaciones.set(nuevaClave, {
        cliente: nombreCliente,
        email: mensaje.email || 'No disponible',
        telefono: mensaje.telefono || 'No disponible',
        sessionId: mensaje.sessionId || 'sin-session',
        mensajes: [mensaje],
        ultimoMensaje: mensaje,
        noLeidos: mensaje.leido ? 0 : 1,
        estado: 'pendiente'
      });
    } else {
      // Si existe, agregar mensaje a la conversación existente
      conversacionExistente.mensajes.push(mensaje);
      
      // Actualizar último mensaje si es más reciente
      if (new Date(mensaje.fecha) > new Date(conversacionExistente.ultimoMensaje.fecha)) {
        conversacionExistente.ultimoMensaje = mensaje;
      }
      
      // Actualizar contador de no leídos
      if (!mensaje.leido) {
        conversacionExistente.noLeidos++;
      }
    }
  });
  
  // Convertir Map a objeto para compatibilidad
  const conversacionesObj = {};
  for (let [clave, conv] of conversaciones) {
    conversacionesObj[clave] = conv;
  }
  
  // Guardar conversaciones para uso posterior
  window.conversacionesActuales = conversacionesObj;
  
  const totalConversaciones = Object.keys(conversacionesObj).length;
  const totalMensajes = mensajesCompra.length;
  const totalNoLeidos = mensajesCompra.filter(m => !m.leido).length;
  
  container.innerHTML = `
    <div class="mensajes-header">
      <div class="mensajes-header-top">
        <h4>Conversaciones de Clientes (${totalConversaciones})</h4>
      </div>
      <div class="mensajes-stats">
        <span class="stat">📨 ${totalMensajes} mensajes</span>
        <span class="stat">👥 ${totalConversaciones} clientes</span>
        <span class="stat ${totalNoLeidos > 0 ? 'stat-alert' : ''}">🔔 ${totalNoLeidos} no leídos</span>
      </div>
      <div class="mensajes-acciones">
        <button onclick="responderTodos()" class="btn-responder-todos">Responder Automático</button>
        <button onclick="reagruparConversaciones()" class="btn-reagrupar">🔄 Reagrupar</button>
        <button onclick="limpiarMensajesAdmin()" class="btn-limpiar-mensajes">Limpiar Mensajes</button>
      </div>
    </div>
    <div class="conversaciones-lista" id="conversaciones-lista"></div>
    <div class="chat-conversacion" id="chat-conversacion" style="display: none;">
      <div class="chat-header-conversacion">
        <button onclick="volverAConversaciones()" class="btn-volver">← Volver</button>
        <div class="info-cliente-conversacion">
          <span id="nombre-cliente-conversacion"></span>
          <span id="info-cliente-conversacion"></span>
        </div>
      </div>
      <div class="mensajes-conversacion" id="mensajes-conversacion"></div>
      <div class="chat-input-admin">
        <form id="form-respuesta-admin" onsubmit="enviarRespuestaAdmin(event)">
          <input type="text" id="input-respuesta-admin" placeholder="Escribe tu respuesta..." required>
          <button type="submit" class="btn-enviar-respuesta">Enviar</button>
        </form>
      </div>
    </div>
  `;
  
  const lista = document.getElementById('conversaciones-lista');
  
  if (totalConversaciones === 0) {
    lista.innerHTML = '<div class="no-mensajes">No hay conversaciones de clientes aún</div>';
    return;
  }
  
  // Renderizar conversaciones
  Object.keys(conversacionesObj).forEach(claveCliente => {
    const conversacion = conversacionesObj[claveCliente];
    const div = document.createElement('div');
    div.className = `conversacion-item ${conversacion.noLeidos > 0 ? 'no-leida' : ''}`;
    div.onclick = () => abrirConversacion(claveCliente);
    
    const ultimoMensaje = conversacion.ultimoMensaje;
    const previewTexto = ultimoMensaje.text.length > 100 ? 
      ultimoMensaje.text.substring(0, 100) + '...' : ultimoMensaje.text;
    
    div.innerHTML = `
      <div class="conversacion-avatar">
        <div class="avatar-inicial">${conversacion.cliente.charAt(0).toUpperCase()}</div>
        ${conversacion.noLeidos > 0 ? 
          `<div class="badge-contador">${conversacion.noLeidos}</div>` : ''
        }
      </div>
      <div class="conversacion-info">
        <div class="conversacion-header">
          <div class="nombre-cliente">${conversacion.cliente}</div>
          <div class="fecha-ultima">${new Date(ultimoMensaje.fecha).toLocaleDateString()}</div>
        </div>
        <div class="conversacion-preview">
          <div class="ultimo-mensaje">${previewTexto}</div>
          <div class="conversacion-meta">
            <span class="total-mensajes">${conversacion.mensajes.length} mensajes</span>
            <span class="email-preview">${conversacion.email}</span>
          </div>
        </div>
      </div>
      <div class="conversacion-acciones">
        <button onclick="event.stopPropagation(); abrirConversacion('${claveCliente}')" class="btn-abrir-chat">💬</button>
        ${conversacion.noLeidos > 0 ? 
          `<button onclick="event.stopPropagation(); marcarConversacionLeida('${claveCliente}')" class="btn-marcar-leida">✓</button>` : ''
        }
      </div>
    `;
    
    lista.appendChild(div);
  });
  
  // Crear elementos para cada conversación
  Object.entries(conversaciones).forEach(([sessionId, conversacion]) => {
    const div = document.createElement('div');
    div.className = `conversacion-item ${conversacion.noLeidos > 0 ? 'no-leida' : ''}`;
    
    const ultimoMensaje = conversacion.ultimoMensaje;
    const fechaFormateada = new Date(ultimoMensaje.fecha).toLocaleString();
    const previewTexto = ultimoMensaje.text.length > 50 ? 
      ultimoMensaje.text.substring(0, 50) + '...' : ultimoMensaje.text;
    
    div.innerHTML = `
      <div class="conversacion-avatar">
        <div class="avatar-inicial">${conversacion.cliente.charAt(0).toUpperCase()}</div>
        ${conversacion.noLeidos > 0 ? `<span class="badge-contador">${conversacion.noLeidos}</span>` : ''}
      </div>
      <div class="conversacion-info">
        <div class="conversacion-header">
          <strong class="nombre-cliente">${conversacion.cliente}</strong>
          <span class="fecha-ultima">${fechaFormateada}</span>
        </div>
        <div class="conversacion-preview">
          <span class="ultimo-mensaje">${previewTexto}</span>
          <div class="conversacion-meta">
            <span class="total-mensajes">${conversacion.mensajes.length} mensajes</span>
            ${conversacion.email !== 'No disponible' ? `<span class="email-preview">📧 ${conversacion.email}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="conversacion-acciones">
        <button onclick="abrirConversacion('${sessionId}')" class="btn-abrir-chat">💬</button>
        <button onclick="marcarConversacionLeida('${sessionId}')" class="btn-marcar-leida" title="Marcar leída">✓</button>
      </div>
    `;
    
    lista.appendChild(div);
  });
  
}

// ===== FUNCIONES PARA CONVERSACIONES AGRUPADAS =====
function abrirConversacion(claveCliente) {
  const conversacion = window.conversacionesActuales[claveCliente];
  if (!conversacion) return;
  
  // Guardar referencia de la conversación actual
  window.conversacionActualId = claveCliente;
  
  // Guardar estado para mantener posición en refresh
  guardarEstadoNavegacion();
  
  // Ocultar lista de conversaciones y mostrar chat individual
  document.getElementById('conversaciones-lista').style.display = 'none';
  document.getElementById('chat-conversacion').style.display = 'block';
  
  // Actualizar información del header
  document.getElementById('nombre-cliente-conversacion').textContent = conversacion.cliente;
  document.getElementById('info-cliente-conversacion').innerHTML = `
    📧 ${conversacion.email} | 📱 ${conversacion.telefono} | ${conversacion.mensajes.length} mensajes
  `;
  
  // Renderizar mensajes como chat fluido
  const mensajesContainer = document.getElementById('mensajes-conversacion');
  mensajesContainer.innerHTML = '';
  
  // Agregar todos los mensajes y respuestas al chat
  const todosMensajes = [];
  
  conversacion.mensajes
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .forEach(mensaje => {
      // Agregar mensaje original del usuario
      todosMensajes.push({
        from: 'usuario',
        text: mensaje.text,
        image: mensaje.image,
        fecha: mensaje.fecha,
        id: mensaje.id,
        leido: mensaje.leido
      });
      
      // Agregar respuesta del admin si existe
      if (mensaje.respuesta) {
        todosMensajes.push({
          from: 'admin',
          text: mensaje.respuesta,
          fecha: mensaje.fecha, // Usar la misma fecha por simplicidad
          parentId: mensaje.id
        });
      }
    });
  
  // Renderizar como chat fluido
  todosMensajes.forEach(mensaje => {
    const div = document.createElement('div');
    div.className = `chat-bubble-message ${mensaje.from === 'usuario' ? 'user-bubble' : 'admin-bubble'}`;
    
    div.innerHTML = `
      <div class="bubble-content">
        <div class="bubble-text">${mensaje.text}</div>
        ${mensaje.image ? 
          `<div class="bubble-image">
            <img src="${mensaje.image}" alt="Comprobante" onclick="verImagenCompleta('${mensaje.image}')">
          </div>` : ''
        }
        <div class="bubble-time">${new Date(mensaje.fecha).toLocaleTimeString()}</div>
      </div>
    `;
    
    mensajesContainer.appendChild(div);
  });
  
  // Auto scroll al final
  mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
  
  // Marcar todos los mensajes de la conversación como leídos automáticamente
  setTimeout(() => {
    conversacion.mensajes.forEach(mensaje => {
      if (!mensaje.leido) {
        mensaje.leido = true;
      }
    });
    localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesData));
    actualizarContadores();
  }, 1000);
}

function volverAConversaciones() {
  document.getElementById('conversaciones-lista').style.display = 'block';
  document.getElementById('chat-conversacion').style.display = 'none';
  
  // Limpiar conversación actual
  window.conversacionActualId = null;
  guardarEstadoNavegacion();
  
  cargarMensajes(); // Recargar para actualizar contadores
}

function marcarConversacionLeida(claveCliente) {
  const conversacion = window.conversacionesActuales[claveCliente];
  if (!conversacion) return;
  
  conversacion.mensajes.forEach(mensaje => {
    mensaje.leido = true;
  });
  
  localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesData));
  cargarMensajes();
  actualizarContadores();
}

// Función para enviar respuesta desde el chat
function enviarRespuestaAdmin(event) {
  event.preventDefault();
  
  const input = document.getElementById('input-respuesta-admin');
  const respuesta = input.value.trim();
  
  if (!respuesta) return;
  
  // Obtener la conversación actual
  const claveCliente = window.conversacionActualId;
  if (!claveCliente) return;
  
  const conversacion = window.conversacionesActuales[claveCliente];
  if (!conversacion) return;
  
  // Buscar el último mensaje del usuario para responder
  const ultimoMensaje = conversacion.mensajes
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
  
  if (ultimoMensaje) {
    ultimoMensaje.respuesta = respuesta;
    ultimoMensaje.leido = true;
    
    // Actualizar en localStorage del admin
    localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesData));
    
    // SINCRONIZAR CON EL CLIENTE: Agregar respuesta al chat del cliente
    const mensajesCliente = JSON.parse(localStorage.getItem('numstore_mensajes') || '[]');
    
    // Crear mensaje del admin para el cliente
    const mensajeAdmin = {
      from: 'admin',
      text: respuesta,
      time: new Date().toLocaleTimeString(),
      id: Date.now() + Math.random(),
      fecha: new Date().toISOString(),
      esNuevo: true // Marcar como nuevo para notificaciones
    };
    
    // Agregar al chat del cliente
    mensajesCliente.push(mensajeAdmin);
    localStorage.setItem('numstore_mensajes', JSON.stringify(mensajesCliente));
    
    // Disparar evento personalizado para notificar al cliente
    window.dispatchEvent(new CustomEvent('nuevoMensajeAdmin', {
      detail: { mensaje: mensajeAdmin }
    }));
    
    // Recargar la conversación
    abrirConversacion(claveCliente);
    
    // Limpiar input
    input.value = '';
    
    // Mostrar confirmación visual sutil en lugar de alert
    mostrarNotificacionSutil('Respuesta enviada ✓');
  }
}

// Variable para mantener referencia de la conversación actual
window.conversacionActualId = null;

// ===== SINCRONIZACIÓN TIEMPO REAL PARA ADMIN =====
function inicializarSincronizacionTiempoReal() {
  let ultimoConteoMensajes = mensajesData.length;
  
  // Verificar nuevos mensajes cada 2 segundos
  setInterval(() => {
    const mensajesActuales = JSON.parse(localStorage.getItem('numstore_mensajes_admin') || '[]');
    
    if (mensajesActuales.length > ultimoConteoMensajes) {
      console.log('Nuevos mensajes detectados en admin');
      mensajesData = mensajesActuales;
      ultimoConteoMensajes = mensajesActuales.length;
      
      // Solo recargar si estamos en la sección de mensajes
      const seccionMensajes = document.getElementById('mensajes');
      if (seccionMensajes && seccionMensajes.classList.contains('visible')) {
        cargarMensajes();
        actualizarContadores();
      } else {
        // Solo actualizar contadores si no estamos en mensajes
        actualizarContadores();
      }
    }
  }, 2000);
  
  // Escuchar cambios en localStorage desde el cliente
  window.addEventListener('storage', (e) => {
    if (e.key === 'numstore_mensajes_admin') {
      console.log('Cambio detectado en mensajes admin desde cliente');
      mensajesData = JSON.parse(e.newValue || '[]');
      
      const seccionMensajes = document.getElementById('mensajes');
      if (seccionMensajes && seccionMensajes.classList.contains('visible')) {
        cargarMensajes();
      }
      actualizarContadores();
    }
  });
}

// Función para guardar y restaurar estado de navegación
function guardarEstadoNavegacion() {
  const seccionActiva = document.querySelector('.section.visible')?.id;
  const conversacionAbierta = window.conversacionActualId;
  
  const estado = {
    seccionActiva: seccionActiva,
    conversacionAbierta: conversacionAbierta,
    timestamp: Date.now()
  };
  
  localStorage.setItem('numstore_admin_estado', JSON.stringify(estado));
}

function restaurarEstadoNavegacion() {
  const estadoGuardado = localStorage.getItem('numstore_admin_estado');
  if (!estadoGuardado) return;
  
  try {
    const estado = JSON.parse(estadoGuardado);
    
    // Solo restaurar si es reciente (menos de 5 minutos)
    if (Date.now() - estado.timestamp < 300000) {
      
      // Restaurar sección activa
      if (estado.seccionActiva) {
        // Quitar active de todos
        document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('visible'));
        
        // Activar la sección guardada
        const sidebarItem = document.querySelector(`[data-section="${estado.seccionActiva}"]`);
        const seccion = document.getElementById(estado.seccionActiva);
        
        if (sidebarItem && seccion) {
          sidebarItem.classList.add('active');
          seccion.classList.add('visible');
          
          // Cargar datos de la sección
          switch(estado.seccionActiva) {
            case 'mensajes':
              cargarMensajes();
              // Si había una conversación abierta, restaurarla
              if (estado.conversacionAbierta) {
                setTimeout(() => {
                  abrirConversacion(estado.conversacionAbierta);
                }, 500);
              }
              break;
            case 'compras':
              cargarCompras();
              break;
            case 'planes':
              cargarPlanes();
              break;
            case 'consultas':
              cargarConsultas();
              break;
            case 'numeros':
              cargarNumeros();
              break;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error restaurando estado:', error);
  }
}

function responderMensaje(id) {
  const mensaje = mensajesData.find(m => m.id === id);
  if (!mensaje) return;
  
  const respuesta = prompt(`Responder a ${mensaje.cliente}:`);
  if (!respuesta) return;
  
  mensaje.respuesta = respuesta;
  mensaje.estado = 'respondido';
  
  cargarMensajes();
  mostrarNotificacionSutil('✓ Respuesta enviada');
}

function marcarResuelto(id) {
  const mensaje = mensajesData.find(m => m.id === id);
  if (!mensaje) return;
  
  mensaje.estado = 'resuelto';
  cargarMensajes();
}

function responderTodos() {
  const respuestaAuto = `¡Hola! Gracias por tu interés en nuestros planes E-Sim privados. 

Para realizar tu compra:
1. Transfiere el monto del plan elegido
2. Envía el comprobante por este chat
3. Te activaremos tu número en menos de 30 minutos

Datos bancarios:
- Banco: Itaú
- Cuenta: 1234567890
- Titular: NumStore

¿En qué más te puedo ayudar?`;

  let mensajesRespondidos = 0;

  mensajesData.forEach(mensaje => {
    if (mensaje.estado === 'pendiente' && !mensaje.respuesta) {
      mensaje.respuesta = respuestaAuto;
      mensaje.estado = 'respondido';
      mensaje.leido = true;
      mensajesRespondidos++;
      
      // ENVIAR RESPUESTA AL CLIENTE EN TIEMPO REAL
      const mensajesCliente = JSON.parse(localStorage.getItem('numstore_mensajes') || '[]');
      
      const mensajeAdmin = {
        from: 'admin',
        text: respuestaAuto,
        time: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random() + Math.random(), // ID único
        fecha: new Date().toISOString(),
        esNuevo: true
      };
      
      mensajesCliente.push(mensajeAdmin);
      localStorage.setItem('numstore_mensajes', JSON.stringify(mensajesCliente));
      
      // Disparar evento para notificar al cliente
      window.dispatchEvent(new CustomEvent('nuevoMensajeAdmin', {
        detail: { mensaje: mensajeAdmin }
      }));
    }
  });
  
  // Actualizar localStorage del admin
  localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesData));
  
  cargarMensajes();
  actualizarContadores();
  mostrarNotificacionSutil(`✓ Respuesta automática enviada a ${mensajesRespondidos} conversaciones`);
}

// ===== GESTIÓN DE PLANES =====
function cargarPlanes() {
  const container = document.getElementById('lista-planes');
  
  container.innerHTML = '';
  
  planesData.forEach(plan => {
    const div = document.createElement('div');
    div.className = 'plan-admin-card';
    
    div.innerHTML = `
      <div class="plan-header">
        <h4>${plan.nombre}</h4>
        <div class="plan-acciones">
          <button onclick="editarPlan(${plan.id})" class="btn-editar">Editar</button>
          <button onclick="togglePlan(${plan.id})" class="btn-toggle ${plan.activo ? 'activo' : 'inactivo'}">
            ${plan.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button onclick="eliminarPlan(${plan.id})" class="btn-eliminar">Eliminar</button>
        </div>
      </div>
      <div class="plan-details">
        <p><strong>Duración:</strong> ${plan.duracion}</p>
        <p><strong>Precio:</strong> $${plan.precio} (Gs. ${plan.precioGuaranies})</p>
        <p><strong>Estado:</strong> ${plan.activo ? 'Activo' : 'Inactivo'}</p>
        <div class="beneficios">
          <strong>Beneficios:</strong>
          <ul>
            ${plan.beneficios.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    container.appendChild(div);
  });
}

function mostrarFormularioPlan(planId = null) {
  const plan = planId ? planesData.find(p => p.id === planId) : null;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content plan-form">
      <h3>${plan ? 'Editar Plan' : 'Nuevo Plan'}</h3>
      <form id="formPlan">
        <input type="hidden" id="planId" value="${plan ? plan.id : ''}">
        
        <label>Nombre del Plan:</label>
        <input type="text" id="nombrePlan" value="${plan ? plan.nombre : ''}" required>
        
        <label>Duración:</label>
        <input type="text" id="duracionPlan" value="${plan ? plan.duracion : ''}" required>
        
        <label>Precio (USD):</label>
        <input type="number" id="precioPlan" value="${plan ? plan.precio : ''}" step="0.01" required>
        
        <label>Precio (Guaraníes):</label>
        <input type="text" id="precioGuaraniesPlan" value="${plan ? plan.precioGuaranies : ''}" required>
        
        <label>Beneficios (uno por línea):</label>
        <textarea id="beneficiosPlan" rows="8" required>${plan ? plan.beneficios.join('\n') : ''}</textarea>
        
        <label>
          <input type="checkbox" id="activoPlan" ${plan && plan.activo ? 'checked' : ''}>
          Plan Activo
        </label>
        
        <div class="modal-buttons">
          <button type="submit" class="btn-guardar">Guardar</button>
          <button type="button" onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('formPlan').addEventListener('submit', guardarPlan);
}

function guardarPlan(e) {
  e.preventDefault();
  
  const planId = document.getElementById('planId').value;
  const planData = {
    nombre: document.getElementById('nombrePlan').value,
    duracion: document.getElementById('duracionPlan').value,
    precio: parseFloat(document.getElementById('precioPlan').value),
    precioGuaranies: document.getElementById('precioGuaraniesPlan').value,
    beneficios: document.getElementById('beneficiosPlan').value.split('\n').filter(b => b.trim()),
    activo: document.getElementById('activoPlan').checked
  };
  
  if (planId) {
    // Editar plan existente
    const plan = planesData.find(p => p.id === parseInt(planId));
    Object.assign(plan, planData);
  } else {
    // Crear nuevo plan
    const nuevoId = Math.max(...planesData.map(p => p.id), 0) + 1;
    planesData.push({ id: nuevoId, ...planData });
  }
  
  cargarPlanes();
  cerrarModal();
  alert('Plan guardado correctamente');
}

function editarPlan(id) {
  mostrarFormularioPlan(id);
}

function togglePlan(id) {
  const plan = planesData.find(p => p.id === id);
  if (!plan) return;
  
  plan.activo = !plan.activo;
  cargarPlanes();
  alert(`Plan ${plan.activo ? 'activado' : 'desactivado'}`);
}

function eliminarPlan(id) {
  if (!confirm('¿Estás seguro de eliminar este plan?')) return;
  
  const index = planesData.findIndex(p => p.id === id);
  if (index > -1) {
    planesData.splice(index, 1);
    cargarPlanes();
    alert('Plan eliminado');
  }
}

// ===== GESTIÓN DE NÚMEROS =====
function cargarNumeros() {
  const lista = document.getElementById('numeros-lista');
  
  // Obtener números de las compras aprobadas
  const numerosGenerados = comprasData
    .filter(c => c.estado === 'aprobado' && c.numero)
    .map(c => ({
      numero: c.numero,
      cliente: c.cliente,
      plan: c.plan,
      fecha: c.fecha
    }));
  
  lista.innerHTML = '';
  
  if (numerosGenerados.length === 0) {
    lista.innerHTML = '<li>No hay números generados aún</li>';
    return;
  }
  
  numerosGenerados.forEach(num => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="numero-item">
        <strong>${num.numero}</strong>
        <div class="numero-info">
          <span>Cliente: ${num.cliente}</span>
          <span>Plan: ${num.plan}</span>
          <span>Fecha: ${new Date(num.fecha).toLocaleDateString()}</span>
        </div>
      </div>
    `;
    lista.appendChild(li);
  });
}

// ===== UTILIDADES =====
function verComprobante(archivo) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Comprobante de Pago</h3>
      <img src="uploads/${archivo}" style="max-width: 100%; max-height: 500px;" alt="Comprobante">
      <div class="modal-buttons">
        <button onclick="cerrarModal()" class="btn-cancelar">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function cerrarModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.remove();
  }
}

// ===== GESTIÓN DE CONSULTAS =====
let consultasData = [
  {
    id: 1,
    nombre: "María González",
    email: "maria@email.com",
    telefono: "+595981123456",
    mensaje: "Hola, me interesa el plan Full Privado. ¿Es realmente inrastreable? Necesito privacidad total para mi trabajo.",
    fecha: "2025-11-12T08:30:00Z",
    leida: false,
    respondida: false
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    email: "carlos@empresa.com",
    telefono: "+595971654321",
    mensaje: "Necesito 5 números para mi empresa. ¿Tienen descuentos por volumen? ¿Qué plan me recomiendan?",
    fecha: "2025-11-12T10:15:00Z",
    leida: true,
    respondida: false
  }
];

function cargarConsultas() {
  const lista = document.getElementById('consultas-lista');
  
  lista.innerHTML = '';
  
  if (consultasData.length === 0) {
    lista.innerHTML = '<div class="no-consultas">No hay consultas recibidas</div>';
    return;
  }
  
  consultasData.forEach(consulta => {
    const div = document.createElement('div');
    div.className = `consulta-item ${!consulta.leida ? 'no-leida' : ''} ${consulta.respondida ? 'respondida' : ''}`;
    
    div.innerHTML = `
      <div class="consulta-header">
        <div class="consulta-info">
          <strong>${consulta.nombre}</strong>
          <span class="email">${consulta.email}</span>
          <span class="telefono">${consulta.telefono}</span>
        </div>
        <div class="consulta-meta">
          <span class="fecha">${new Date(consulta.fecha).toLocaleString()}</span>
          <div class="consulta-estados">
            ${!consulta.leida ? '<span class="badge nueva">Nueva</span>' : ''}
            ${consulta.respondida ? '<span class="badge respondida">Respondida</span>' : '<span class="badge pendiente">Pendiente</span>'}
          </div>
        </div>
      </div>
      <div class="consulta-mensaje">
        <p>${consulta.mensaje}</p>
      </div>
      <div class="consulta-acciones">
        <button onclick="responderConsulta(${consulta.id})" class="btn-responder">
          ${consulta.respondida ? 'Ver respuesta' : 'Responder'}
        </button>
        ${!consulta.leida ? 
          `<button onclick="marcarLeida(${consulta.id})" class="btn-marcar-leida">Marcar leída</button>` : ''
        }
        <button onclick="eliminarConsulta(${consulta.id})" class="btn-eliminar-consulta">Eliminar</button>
      </div>
    `;
    
    lista.appendChild(div);
  });
  
  // Event listeners para botones de header
  const btnMarcarTodas = document.getElementById('marcarTodasLeidas');
  const btnExportar = document.getElementById('exportarConsultas');
  const btnLimpiarConsultas = document.getElementById('limpiarConsultas');
  
  if (btnMarcarTodas) {
    btnMarcarTodas.onclick = marcarTodasLeidas;
  }
  
  if (btnExportar) {
    btnExportar.onclick = exportarConsultas;
  }
  
  if (btnLimpiarConsultas) {
    btnLimpiarConsultas.onclick = limpiarConsultas;
  }
}

function responderConsulta(id) {
  const consulta = consultasData.find(c => c.id === id);
  if (!consulta) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content consulta-respuesta">
      <h3>Responder a ${consulta.nombre}</h3>
      <div class="consulta-original">
        <h4>Consulta original:</h4>
        <p><strong>Email:</strong> ${consulta.email}</p>
        <p><strong>Teléfono:</strong> ${consulta.telefono}</p>
        <p><strong>Mensaje:</strong> ${consulta.mensaje}</p>
      </div>
      
      <form id="formRespuesta">
        <label>Tu respuesta:</label>
        <textarea id="respuestaTexto" rows="8" placeholder="Escribe tu respuesta aquí..." required>${consulta.respuesta || ''}</textarea>
        
        <div class="plantillas-respuesta">
          <h4>Plantillas rápidas:</h4>
          <button type="button" onclick="usarPlantilla('info-general')" class="btn-plantilla">Información general</button>
          <button type="button" onclick="usarPlantilla('precios')" class="btn-plantilla">Lista de precios</button>
          <button type="button" onclick="usarPlantilla('proceso')" class="btn-plantilla">Proceso de compra</button>
        </div>
        
        <div class="modal-buttons">
          <button type="submit" class="btn-enviar">Enviar respuesta</button>
          <button type="button" onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('formRespuesta').addEventListener('submit', (e) => {
    e.preventDefault();
    const respuesta = document.getElementById('respuestaTexto').value;
    
    consulta.respuesta = respuesta;
    consulta.respondida = true;
    consulta.leida = true;
    
    // Simular envío de email
    alert(`Respuesta enviada a ${consulta.email}`);
    
    cargarConsultas();
    cerrarModal();
  });
  
  // Marcar como leída al abrir
  if (!consulta.leida) {
    consulta.leida = true;
    setTimeout(cargarConsultas, 1000);
  }
}

function usarPlantilla(tipo) {
  const textarea = document.getElementById('respuestaTexto');
  let plantilla = '';
  
  switch(tipo) {
    case 'info-general':
      plantilla = `¡Hola! Gracias por tu interés en NumStore.

Nuestros planes E-Sim ofrecen números completamente privados e inrastreables:

📱 **E-Sim Full Privado** (Gs. 250.000)
• Duplicación de tu número actual
• Privacidad total de por vida
• VPN militar incluido

📱 **E-Sim Medio Pro** (Gs. 110.000)  
• Número privado por 3 meses
• VPN avanzado incluido

📱 **E-Sim Básico** (Gs. 70.000)
• Número privado por 30 días
• VPN básico incluido

¿Te interesa algún plan en particular?

Saludos,
Equipo NumStore`;
      break;
      
    case 'precios':
      plantilla = `Estos son nuestros precios actuales:

💰 **PLANES DISPONIBLES:**

🥇 **E-Sim Full Privado**
• Precio: Gs. 250.000 (USD $35)
• Duración: De por vida
• Incluye: Duplicación + VPN militar

🥈 **E-Sim Medio Pro**  
• Precio: Gs. 110.000 (USD $12)
• Duración: 3 meses
• Incluye: Número nuevo + VPN avanzado

🥉 **E-Sim Básico**
• Precio: Gs. 70.000 (USD $9.99)
• Duración: 30 días
• Incluye: Número nuevo + VPN básico

Todos los planes incluyen activación inmediata y soporte 24/7.

¿Cuál te interesa más?`;
      break;
      
    case 'proceso':
      plantilla = `El proceso de compra es muy simple:

✅ **PASOS PARA COMPRAR:**

1️⃣ **Elige tu plan** en nuestra web
2️⃣ **Genera tu número** (o ingresa el que quieres duplicar)
3️⃣ **Realiza la transferencia** a nuestros datos bancarios
4️⃣ **Envía el comprobante** por WhatsApp o email
5️⃣ **Recibe tu número activado** en menos de 30 minutos

💳 **FORMAS DE PAGO:**
• Transferencia bancaria
• Tigo Money
• Personal Pay
• Giros Tigo

⏰ **ACTIVACIÓN:** Inmediata después de verificar el pago

¿Necesitas los datos bancarios para transferir?`;
      break;
  }
  
  textarea.value = plantilla;
}

function marcarLeida(id) {
  const consulta = consultasData.find(c => c.id === id);
  if (!consulta) return;
  
  consulta.leida = true;
  cargarConsultas();
}

function marcarTodasLeidas() {
  consultasData.forEach(consulta => {
    consulta.leida = true;
  });
  cargarConsultas();
  alert('Todas las consultas marcadas como leídas');
}

function eliminarConsulta(id) {
  if (!confirm('¿Estás seguro de eliminar esta consulta?')) return;
  
  const index = consultasData.findIndex(c => c.id === id);
  if (index > -1) {
    consultasData.splice(index, 1);
    cargarConsultas();
    alert('Consulta eliminada');
  }
}

function exportarConsultas() {
  const csv = ['Nombre,Email,Teléfono,Mensaje,Fecha,Leída,Respondida'];
  
  consultasData.forEach(consulta => {
    const fila = [
      `"${consulta.nombre}"`,
      `"${consulta.email}"`,
      `"${consulta.telefono}"`,
      `"${consulta.mensaje.replace(/"/g, '""')}"`,
      `"${new Date(consulta.fecha).toLocaleString()}"`,
      consulta.leida ? 'Sí' : 'No',
      consulta.respondida ? 'Sí' : 'No'
    ].join(',');
    csv.push(fila);
  });
  
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `consultas_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  alert('Consultas exportadas correctamente');
}

// ===== FUNCIONES PARA MENSAJES DE CLIENTES =====
function responderMensajeCliente(id) {
  const mensaje = mensajesData.find(m => m.id == id);
  if (!mensaje) return;
  
  const respuesta = prompt(`Responder a ${mensaje.cliente || 'Cliente'}:`);
  if (!respuesta) return;
  
  mensaje.respuesta = respuesta;
  mensaje.leido = true;
  
  localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesData));
  cargarMensajes();
  actualizarContadores();
  mostrarNotificacionSutil('✓ Respuesta enviada');
}

function marcarMensajeLeido(id) {
  const mensaje = mensajesData.find(m => m.id == id);
  if (!mensaje) return;
  
  mensaje.leido = true;
  localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesData));
  cargarMensajes();
  actualizarContadores();
}

function cambiarEstadoMensaje(id, nuevoEstado) {
  const mensaje = mensajesData.find(m => m.id == id);
  if (!mensaje) return;
  
  mensaje.estado = nuevoEstado;
  mensaje.leido = true;
  
  localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesData));
  cargarMensajes();
  actualizarContadores();
  
  alert(`Mensaje marcado como ${nuevoEstado}`);
}

function verImagenCompleta(src) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Comprobante de Pago</h3>
      <img src="${src}" style="max-width: 100%; max-height: 70vh;" alt="Comprobante">
      <div class="modal-buttons">
        <button onclick="cerrarModal()" class="btn-cancelar">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Cargar consultas del formulario
function cargarConsultasData() {
  consultasData = JSON.parse(localStorage.getItem('numstore_consultas') || '[]');
}

// Función para limpiar todas las consultas
function limpiarConsultas() {
  if (confirm('¿Estás seguro de limpiar todas las consultas? Esta acción no se puede deshacer.')) {
    consultasData = [];
    localStorage.removeItem('numstore_consultas');
    cargarConsultas();
    actualizarContadores();
    alert('Todas las consultas han sido eliminadas');
  }
}

function limpiarMensajesAdmin() {
  if (confirm('¿Estás seguro de limpiar todos los mensajes del admin?')) {
    localStorage.removeItem('numstore_mensajes_admin');
    localStorage.removeItem('numstore_mensajes'); // También limpiar mensajes del cliente
    mensajesData = [];
    cargarMensajes();
    actualizarContadores();
    alert('Mensajes limpiados');
  }
}

// Función para limpiar duplicados del localStorage
function limpiarDuplicados() {
  const mensajes = JSON.parse(localStorage.getItem('numstore_mensajes_admin') || '[]');
  const mensajesUnicos = [];
  const idsVistos = new Set();
  
  mensajes.forEach(mensaje => {
    // Crear clave más específica para detectar duplicados exactos
    const cliente = (mensaje.cliente || '').trim().toLowerCase();
    const texto = (mensaje.text || '').trim();
    const fecha = mensaje.fecha || '';
    const clave = `${cliente}|${texto}|${fecha}`;
    
    if (!idsVistos.has(clave)) {
      idsVistos.add(clave);
      mensajesUnicos.push(mensaje);
    }
  });
  
  if (mensajesUnicos.length !== mensajes.length) {
    localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesUnicos));
    console.log(`Eliminados ${mensajes.length - mensajesUnicos.length} mensajes duplicados`);
    
    // También limpiar mensajes del cliente
    const mensajesCliente = JSON.parse(localStorage.getItem('numstore_mensajes') || '[]');
    const clienteUnicos = [];
    const clienteVistos = new Set();
    
    mensajesCliente.forEach(mensaje => {
      const claveCliente = `${mensaje.from}|${mensaje.text}|${mensaje.time}`;
      if (!clienteVistos.has(claveCliente)) {
        clienteVistos.add(claveCliente);
        clienteUnicos.push(mensaje);
      }
    });
    
    localStorage.setItem('numstore_mensajes', JSON.stringify(clienteUnicos));
  }
}

// Función para reagrupar conversaciones manualmente
function reagruparConversaciones() {
  console.log('Iniciando reagrupación manual...');
  
  // Limpiar duplicados primero
  limpiarDuplicados();
  
  // Recargar datos limpios
  mensajesData = JSON.parse(localStorage.getItem('numstore_mensajes_admin') || '[]');
  
  // Reagrupar por cliente único
  const gruposLimpios = {};
  mensajesData.forEach(mensaje => {
    const clienteKey = (mensaje.cliente || 'Anónimo').toLowerCase().trim().replace(/\s+/g, '_');
    
    if (!gruposLimpios[clienteKey]) {
      gruposLimpios[clienteKey] = [];
    }
    gruposLimpios[clienteKey].push(mensaje);
  });
  
  // Reconstruir array con mensajes agrupados
  const mensajesReagrupados = [];
  Object.values(gruposLimpios).forEach(grupo => {
    mensajesReagrupados.push(...grupo);
  });
  
  // Guardar mensajes reagrupados
  localStorage.setItem('numstore_mensajes_admin', JSON.stringify(mensajesReagrupados));
  mensajesData = mensajesReagrupados;
  
  // Recargar vista
  cargarMensajes();
  actualizarContadores();
  
  mostrarNotificacionSutil(`✓ Reagrupación completa. ${Object.keys(gruposLimpios).length} conversaciones`);
}

// Función para mostrar notificaciones sutiles sin alertas molestas
function mostrarNotificacionSutil(mensaje) {
  // Crear elemento de notificación
  const notificacion = document.createElement('div');
  notificacion.className = 'notificacion-sutil';
  notificacion.textContent = mensaje;
  
  // Agregar al body
  document.body.appendChild(notificacion);
  
  // Mostrar con animación
  setTimeout(() => {
    notificacion.classList.add('mostrar');
  }, 100);
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    notificacion.classList.remove('mostrar');
    setTimeout(() => {
      document.body.removeChild(notificacion);
    }, 300);
  }, 3000);
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    cerrarModal();
  }
});
