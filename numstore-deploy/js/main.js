// Definir países disponibles (GLOBAL) - Códigos coinciden con HTML
const paises = {
  'py': {
    codigo: '+595',
    prefijos: ['961', '971', '972', '973', '974', '975', '976', '981', '982', '983', '984', '985', '986', '987', '991', '992', '993', '994'],
    nombre: 'Paraguay'
  },
  'ar': {
    codigo: '+54',
    prefijos: ['9', '11', '15'],
    nombre: 'Argentina'
  },
  'br': {
    codigo: '+55',
    prefijos: ['11', '21', '31', '41', '51'],
    nombre: 'Brasil'
  },
  'uy': {
    codigo: '+598',
    prefijos: ['2', '9'],
    nombre: 'Uruguay'
  },
  'cl': {
    codigo: '+56',
    prefijos: ['2', '9'],
    nombre: 'Chile'
  },
  'bo': {
    codigo: '+591',
    prefijos: ['2', '3', '4', '7'],
    nombre: 'Bolivia'
  },
  'pe': {
    codigo: '+51',
    prefijos: ['1', '9'],
    nombre: 'Perú'
  },
  'co': {
    codigo: '+57',
    prefijos: ['1', '3'],
    nombre: 'Colombia'
  },
  've': {
    codigo: '+58',
    prefijos: ['2', '4'],
    nombre: 'Venezuela'
  },
  'us': {
    codigo: '+1',
    prefijos: ['555', '666', '777'],
    nombre: 'Estados Unidos'
  },
  'mx': {
    codigo: '+52',
    prefijos: ['55', '33', '81'],
    nombre: 'México'
  },
  'ca': {
    codigo: '+1',
    prefijos: ['416', '514', '604'],
    nombre: 'Canadá'
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const listaPlanes = document.getElementById("lista-planes");
  const chatBox = document.getElementById("chat-box");
  const numeroGenerado = document.getElementById("numero-generado");
  const estadoNumero = document.getElementById("estado-numero");
  const btnGenerar = document.getElementById("btn-generar");
  const planElegido = document.getElementById("planElegido");
  const numeroReemplazar = document.getElementById("numeroReemplazar");
  const buscarTitulo = document.getElementById("buscar-titulo");
  const buscarDescripcion = document.getElementById("buscar-descripcion");
  const contador = document.getElementById("contador-compra");
  const comprobanteBox = document.getElementById("subir-comprobante");
  let planSeleccionado = "";
  let temporizador;

  // Manejar cambio de plan
  planElegido.addEventListener("change", () => {
    const plan = planElegido.value;
    if (plan === "Duplicación E-sim Premium") {
      // Cambiar a modo duplicación
      buscarTitulo.textContent = "Duplicar número privado";
      buscarDescripcion.textContent = "Carga tu número actual para reemplazarlo de forma completamente privada.";
      numeroReemplazar.classList.remove("oculto");
      btnGenerar.textContent = "Duplicar número";
      
      // Limpiar número anterior si existe
      const numeroBox = document.querySelector('.numero-box');
      if (numeroBox && !numeroBox.classList.contains('vacia')) {
        numeroBox.classList.add('vacia');
        numeroGenerado.innerHTML = '';
        estadoNumero.innerHTML = '';
        contador.classList.add('oculto');
        comprobanteBox.classList.add('oculto');
      }
    } else if (plan) {
      // Modo normal
      buscarTitulo.textContent = "Buscar número privado";
      buscarDescripcion.textContent = "Escoge un plan y país para generar tu número privado completamente anónimo.";
      numeroReemplazar.classList.add("oculto");
      numeroReemplazar.value = "";
      btnGenerar.textContent = "Generar número";
      
      // Limpiar número anterior si existe
      const numeroBox = document.querySelector('.numero-box');
      if (numeroBox && !numeroBox.classList.contains('vacia')) {
        numeroBox.classList.add('vacia');
        numeroGenerado.innerHTML = '';
        estadoNumero.innerHTML = '';
        contador.classList.add('oculto');
        comprobanteBox.classList.add('oculto');
      }
    }
  });

  // ==============================
  // Navegación simple con botones
  // ==============================
  function initPlanNavigation() {
    const planBtns = document.querySelectorAll('.plan-btn');
    const cards = document.querySelectorAll('.card');
    
    planBtns.forEach((btn, index) => {
      btn.addEventListener('click', function() {
        // Quitar active de todos los botones
        planBtns.forEach(b => b.classList.remove('active'));
        // Agregar active al botón clickeado
        btn.classList.add('active');
        
        // Ocultar todas las cards
        cards.forEach(c => c.classList.remove('active'));
        // Mostrar la card correspondiente
        if (cards[index]) {
          cards[index].classList.add('active');
        }
      });
    });

    // Configurar botón de compra
    const btnComprar = document.getElementById('btn-comprar-plan');
    if (btnComprar) {
      btnComprar.addEventListener('click', function() {
        const activeCard = document.querySelector('.card.active');
        if (activeCard) {
          const planName = activeCard.querySelector('h3').textContent;
          const planSelect = document.getElementById('planElegido');
          if (planSelect) {
            planSelect.value = planName;
            document.getElementById('buscar').scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }
  }

  // Inicializar cuando la página esté lista
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanNavigation);
  } else {
    initPlanNavigation();
  }

  // Función global para toggle de beneficios
  window.toggleBeneficios = function(button, planNombre) {
    const card = button.closest('.card');
    const beneficiosOcultos = card.querySelectorAll('.beneficio-extra');
    const grid = document.querySelector('.grid');
    
    if (button.textContent === 'Ver más beneficios') {
      // Expandir
      beneficiosOcultos.forEach(li => {
        li.classList.remove('oculto');
      });
      card.classList.add('expanded');
      
      // Crear botón "Ver menos" y agregarlo al final de la lista
      const verMenosBtn = document.createElement('button');
      verMenosBtn.textContent = 'Ver menos beneficios';
      verMenosBtn.onclick = () => toggleBeneficios(verMenosBtn, planNombre);
      button.parentNode.replaceChild(verMenosBtn, button);
    } else {
      // Colapsar
      beneficiosOcultos.forEach(li => {
        li.classList.add('oculto');
      });
      card.classList.remove('expanded');
      
      // Crear botón "Ver más" y agregarlo
      const verMasBtn = document.createElement('button');
      verMasBtn.textContent = 'Ver más beneficios';
      verMasBtn.onclick = () => toggleBeneficios(verMasBtn, planNombre);
      button.parentNode.replaceChild(verMasBtn, button);
    }
  };

  function generarNumero() {
    planSeleccionado = document.getElementById("planElegido").value;
    const pais = document.getElementById("pais").value;
    
    if (!planSeleccionado) {
      alert("Por favor selecciona un plan antes de continuar.");
      return;
    }

    if (planSeleccionado === "Duplicación E-sim Premium") {
      // Modo duplicación
      const numeroInput = numeroReemplazar.value.trim();
      if (!numeroInput) {
        alert("Por favor ingresa el número que quieres duplicar.");
        return;
      }
      
      // Mostrar mensaje de pago directo para duplicación
      const numeroBox = document.querySelector('.numero-box');
      numeroBox.classList.remove('vacia');
      numeroGenerado.innerHTML = `
        <div class="mensaje-pago">
          <h3>Duplicación de número iniciada</h3>
          <p>Tu número <strong>${numeroInput}</strong> será reemplazado de forma privada</p>
        </div>
      `;
      estadoNumero.innerHTML = `
        <div class="numero-disponible">Paga por este número antes de que acabe el tiempo</div>
      `;
      
      // Ir directo a compra y chat
      iniciarCompraDuplicacion(numeroInput);
      
    } else {
      // Modo normal - generar número para planes Pro y Básico
      if (!pais) {
        alert("Por favor selecciona un país.");
        return;
      }
      
      // Los países ya están definidos globalmente
      
      const info = paises[pais];
      if (!info) {
        alert("País no disponible. Selecciona otro país.");
        return;
      }
      
      const prefijo = info.prefijos[Math.floor(Math.random() * info.prefijos.length)];
      let cuerpo;
      
      if (pais === 'py') {
        // Formato paraguayo: (+595) 9XX-100-***
        const numeroBase = Math.floor(100 + Math.random() * 900).toString(); // 100-999
        const numeroOculto = Math.floor(100 + Math.random() * 900).toString(); // 100-999
        cuerpo = `${numeroBase}-${numeroOculto}`;
      } else {
        cuerpo = Math.floor(1000000 + Math.random() * 8999999).toString();
      }
      
      // Para planes Pro y Básico, mostrar parte del número
      let numeroMostrar;
      if (pais === 'py') {
        // Formato paraguayo específico
        if (planSeleccionado === "Duplicación E-sim Pro") {
          const partes = cuerpo.split('-');
          numeroMostrar = `(${info.codigo}) ${prefijo}-${partes[0]}-***`;
        } else if (planSeleccionado === "Duplicación E-sim Básico") {
          const partes = cuerpo.split('-');
          numeroMostrar = `(${info.codigo}) ${prefijo}-${partes[0].slice(0,2)}*-***`;
        } else {
          numeroMostrar = `(${info.codigo}) ${prefijo}-${cuerpo}`;
        }
      } else {
        // Otros países mantienen formato original
        if (planSeleccionado === "Duplicación E-sim Pro") {
          const visibles = cuerpo.slice(0, 4);
          const ocultos = cuerpo.slice(4).replace(/\d/g, "*");
          numeroMostrar = `${info.codigo} ${prefijo} ${visibles}${ocultos}`;
        } else if (planSeleccionado === "Duplicación E-sim Básico") {
          const visibles = cuerpo.slice(0, 3);
          const ocultos = cuerpo.slice(3).replace(/\d/g, "*");
          numeroMostrar = `${info.codigo} ${prefijo} ${visibles}${ocultos}`;
        } else {
          numeroMostrar = `${info.codigo} ${prefijo} ${cuerpo}`;
        }
      }

      // Guardar el número completo para uso interno
      const numeroCompleto = pais === 'py' ? `(${info.codigo}) ${prefijo}-${cuerpo}` : `${info.codigo} ${prefijo} ${cuerpo}`;
      
      // Actualizar la caja de número
      const numeroBox = document.querySelector('.numero-box');
      numeroBox.classList.remove('vacia');
      numeroGenerado.innerHTML = `
        <div class="numero-container">
          <div class="numero-rectangle-verde">
            <p>${numeroMostrar}</p>
          </div>
        </div>
      `;
      
      let mensajeEstado = '';
      if (planSeleccionado === "Duplicación E-sim Pro") {
        mensajeEstado = 'Número Pro generado - Ver número completo después del pago';
      } else if (planSeleccionado === "Duplicación E-sim Básico") {
        mensajeEstado = 'Número Básico generado - Ver número completo después del pago';
      }
      
      estadoNumero.innerHTML = `
        <div class="numero-disponible">${mensajeEstado}</div>
        <button id="btn-comprar-num" class="btn-comprar-numero">Comprar número</button>
      `;

      document.getElementById("btn-comprar-num").addEventListener("click", () => iniciarCompra(numeroCompleto, numeroMostrar));
    }
  }

  btnGenerar.addEventListener("click", generarNumero);
  
  // Botón limpiar chat
  const btnLimpiar = document.getElementById("limpiar-chat");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que quieres limpiar todo el chat?")) {
        limpiarChat();
        renderChat();
        // Agregar mensaje de bienvenida después de limpiar
        setTimeout(() => {
          agregarMensajeLocal({
            from: "admin",
            text: "¡Hola! 👋 Bienvenido a NumStore.\n\nSoy tu asistente automático. Estoy aquí para ayudarte con:\n• Información sobre planes\n• Proceso de compra\n• Datos bancarios\n• Activación de números\n\n¿En qué puedo ayudarte hoy?",
            time: new Date().toLocaleTimeString()
          });
          renderChat();
        }, 500);
      }
    });
  }
  
  // Formulario de consultas
  const formConsulta = document.getElementById("form-consulta");
  if (formConsulta) {
    formConsulta.addEventListener("submit", e => {
      e.preventDefault();
      
      const nombre = document.getElementById("nombreConsulta").value;
      const email = document.getElementById("emailConsulta").value;
      const telefono = document.getElementById("telefonoConsulta").value;
      const mensaje = document.getElementById("mensajeConsulta").value;
      
      // Guardar consulta en localStorage para el admin
      let consultas = JSON.parse(localStorage.getItem('numstore_consultas') || '[]');
      
      const nuevaConsulta = {
        id: Date.now(),
        nombre: nombre,
        email: email,
        telefono: telefono || 'No proporcionado',
        mensaje: mensaje,
        fecha: new Date().toISOString(),
        leida: false,
        respondida: false,
        tipo: 'consulta'
      };
      
      consultas.push(nuevaConsulta);
      localStorage.setItem('numstore_consultas', JSON.stringify(consultas));
      
      // Mostrar confirmación
      alert("¡Consulta enviada! Te responderemos por email a la brevedad.");
      formConsulta.reset();
    });
  }

  // Función local para agregar mensajes
  function agregarMensajeLocal(mensaje) {
    console.log('agregarMensajeLocal llamada con:', mensaje); // Debug
    
    mensaje.id = Date.now() + Math.random();
    mensaje.fecha = new Date().toISOString();
    mensaje.estado = mensaje.estado || 'pendiente';
    mensaje.leido = false;
    
    dataStore.mensajes.push(mensaje);
    console.log('Mensaje agregado, total mensajes:', dataStore.mensajes.length); // Debug
    
    guardarMensajes();
    
    // Si es del usuario, enviarlo al admin
    if (mensaje.from === 'usuario') {
      enviarMensajeAAdmin(mensaje);
    }
  }

  // Cargar mensajes existentes al iniciar
  renderChat();
  
  // Agregar mensaje de bienvenida si no hay mensajes
  if (dataStore.mensajes.length === 0) {
    setTimeout(() => {
      agregarMensajeLocal({
        from: "admin",
        text: "¡Hola! 👋 Bienvenido a NumStore.\n\nSoy tu asistente automático. Estoy aquí para ayudarte con:\n• Información sobre planes\n• Proceso de compra\n• Datos bancarios\n• Activación de números\n\n¿En qué puedo ayudarte hoy?",
        time: new Date().toLocaleTimeString()
      });
      renderChat();
    }, 1000);
  }

  // ==============================
  // CHAT y COMPRA
  // ==============================
  
  // Variables globales para la sesión del cliente
  let clienteActual = {
    sessionId: 'cliente_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    nombre: 'Usuario',
    email: null,
    telefono: null,
    iniciado: true // Inicializar directamente como true
  };
  
  // Cargar sesión existente si existe
  function cargarSesionCliente() {
    const sesion = localStorage.getItem('numstore_cliente_session');
    if (sesion) {
      clienteActual = JSON.parse(sesion);
      if (clienteActual.iniciado) {
        mostrarChatActivo();
      }
    } else {
      // Generar sessionId único si no existe
      clienteActual.sessionId = 'cliente_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
  }
  
  // Guardar sesión del cliente
  function guardarSesionCliente() {
    localStorage.setItem('numstore_cliente_session', JSON.stringify(clienteActual));
  }
  
  // Mostrar formulario de identificación
  function mostrarFormularioCliente() {
    document.getElementById('cliente-info').classList.remove('oculto');
    document.getElementById('chat-activo').classList.add('oculto');
  }
  
  // Mostrar chat activo
  function mostrarChatActivo() {
    document.getElementById('cliente-info').classList.add('oculto');
    document.getElementById('chat-activo').classList.remove('oculto');
    document.getElementById('nombre-cliente-activo').textContent = `Chat con: ${clienteActual.nombre}`;
    renderChat();
  }
  
  // Inicializar cliente
  cargarSesionCliente();
  
  // Mostrar chat activo desde el inicio
  mostrarChatActivo();
  
  // Inicializar burbuja flotante
  inicializarBurbujaChat();
  
  // Cargar mensajes existentes y sincronizar
  setTimeout(() => {
    verificarMensajesNuevos();
    renderChat();
  }, 1000);
  
  // Event listener para iniciar chat
  document.getElementById('iniciar-chat').addEventListener('click', () => {
    const nombre = document.getElementById('nombreCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const telefono = document.getElementById('telefonoCliente').value.trim();
    
    if (!nombre) {
      alert('Por favor ingresa tu nombre para continuar');
      return;
    }
    
    clienteActual.nombre = nombre;
    clienteActual.email = email;
    clienteActual.telefono = telefono;
    clienteActual.iniciado = true;
    
    guardarSesionCliente();
    mostrarChatActivo();
    
    // Mensaje de bienvenida personalizado
    setTimeout(() => {
      agregarMensaje({
        from: "admin",
        text: `¡Hola ${nombre}! 👋 

Bienvenido a NumStore, soy tu asistente personal para números privados.

Te puedo ayudar con:
✅ Información de planes
✅ Proceso de compra
✅ Activación inmediata
✅ Soporte técnico

Nuestros planes disponibles:
📱 Duplicación E-sim Premium - Gs. 250.000 (De por vida)
📱 Duplicación E-sim Pro - Gs. 110.000 (3 meses)  
📱 Duplicación E-sim Básico - Gs. 70.000 (30 días)

¿En qué puedo ayudarte hoy, ${nombre}?`,
        time: new Date().toLocaleTimeString()
      });
      renderChat();
      
      // Mostrar notificación si la burbuja está cerrada
      mostrarNotificacionBurbuja();
    }, 500);
  });
  
  // Event listener para cambiar cliente
  document.getElementById('cambiar-cliente').addEventListener('click', () => {
    if (confirm('¿Deseas cambiar de cliente? Se perderá la conversación actual.')) {
      clienteActual = {
        sessionId: 'cliente_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        nombre: null,
        email: null,
        telefono: null,
        iniciado: false
      };
      localStorage.removeItem('numstore_cliente_session');
      dataStore.mensajes = [];
      localStorage.removeItem('numstore_mensajes');
      
      // Limpiar campos
      document.getElementById('nombreCliente').value = '';
      document.getElementById('emailCliente').value = '';
      document.getElementById('telefonoCliente').value = '';
      
      mostrarFormularioCliente();
    }
  });
  
  // ==============================
  // BURBUJA FLOTANTE
  // ==============================
  
  function inicializarBurbujaChat() {
    const burbujaCerrada = document.getElementById('burbuja-cerrada');
    const chatAbierto = document.getElementById('chat-abierto');
    const minimizarBtn = document.getElementById('minimizar-chat');
    const cerrarBtn = document.getElementById('cerrar-chat');
    
    // Abrir chat al hacer click en burbuja
    burbujaCerrada.addEventListener('click', () => {
      burbujaCerrada.classList.add('oculto');
      chatAbierto.classList.remove('oculto');
      
      // Resetear contador de mensajes
      const contador = document.getElementById('contador-mensajes-burbuja');
      contador.classList.add('oculto');
      contador.textContent = '0';
    });
    
    // Minimizar chat
    minimizarBtn.addEventListener('click', () => {
      chatAbierto.classList.add('oculto');
      burbujaCerrada.classList.remove('oculto');
    });
    
    // Cerrar chat (mismo que minimizar para UX)
    cerrarBtn.addEventListener('click', () => {
      chatAbierto.classList.add('oculto');
      burbujaCerrada.classList.remove('oculto');
    });
    
    // Verificar mensajes nuevos cada 2 segundos
    setInterval(verificarMensajesNuevos, 2000);
    
    // Escuchar cambios en localStorage desde otras pestañas (admin)
    window.addEventListener('storage', (e) => {
      if (e.key === 'numstore_mensajes') {
        console.log('Detectado cambio en mensajes desde admin');
        verificarMensajesNuevos();
      }
    });
    
    // Escuchar eventos personalizados de nuevos mensajes
    window.addEventListener('nuevoMensajeAdmin', (e) => {
      console.log('Nuevo mensaje del admin recibido:', e.detail);
      const nuevoMensaje = e.detail.mensaje;
      
      // Agregar al dataStore si no existe
      if (!dataStore.mensajes.find(m => m.id === nuevoMensaje.id)) {
        dataStore.mensajes.push(nuevoMensaje);
        guardarMensajes();
        
        // Renderizar inmediatamente
        renderChat();
        
        mostrarNotificacionBurbuja();
      }
    });
  }
  
  let ultimoMensajeId = null;
  
  function verificarMensajesNuevos() {
    const mensajes = JSON.parse(localStorage.getItem('numstore_mensajes') || '[]');
    const mensajesAdmin = mensajes.filter(m => m.from === 'admin');
    
    if (mensajesAdmin.length > 0) {
      const ultimoMensaje = mensajesAdmin[mensajesAdmin.length - 1];
      
      // Si hay un nuevo mensaje que no hemos procesado
      if (ultimoMensajeId !== ultimoMensaje.id) {
        ultimoMensajeId = ultimoMensaje.id;
        
        // Verificar si es un mensaje muy reciente (menos de 10 segundos)
        const ahora = new Date();
        const fechaMensaje = new Date(ultimoMensaje.fecha || Date.now());
        const diferencia = ahora - fechaMensaje;
        
        if (diferencia < 10000) {
          // Actualizar dataStore con el nuevo mensaje
          if (!dataStore.mensajes.find(m => m.id === ultimoMensaje.id)) {
            dataStore.mensajes.push(ultimoMensaje);
            guardarMensajes();
          }
          
          // Renderizar chat actualizado
          renderChat();
          
          // Mostrar notificación si el chat está cerrado
          mostrarNotificacionBurbuja();
        }
      }
    }
  }
  
  function mostrarNotificacionBurbuja() {
    const contador = document.getElementById('contador-mensajes-burbuja');
    const chatAbierto = document.getElementById('chat-abierto');
    const burbujaCerrada = document.getElementById('burbuja-cerrada');
    
    // Solo mostrar notificación si el chat está cerrado
    if (chatAbierto.classList.contains('oculto')) {
      let count = parseInt(contador.textContent) || 0;
      count++;
      contador.textContent = count;
      contador.classList.remove('oculto');
      
      // Efecto visual de nueva notificación
      burbujaCerrada.style.animation = 'none';
      setTimeout(() => {
        burbujaCerrada.style.animation = 'bounce 0.6s ease-in-out';
      }, 10);
    } else {
      // Si el chat está abierto, hacer scroll al último mensaje
      const chatBox = document.getElementById('chat-box');
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }
  }

  const formChat = document.getElementById("form-chat");
  const fileUpload = document.getElementById("fileUpload");
  
  formChat.addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("msgUsuario");
    const msg = input.value.trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString();
    
    console.log('Enviando mensaje:', msg); // Debug
    
    // Usar la función local
    agregarMensajeLocal({
      from: "usuario",
      text: msg,
      time: time
    });
    
    console.log('Mensajes actuales:', dataStore.mensajes); // Debug
    
    // Manejar respuestas automáticas
    manejarRespuestaAutomatica(msg.toLowerCase());
    
    renderChat();
    input.value = "";
  });

  // Función para manejar respuestas automáticas
  function manejarRespuestaAutomatica(mensaje) {
    const respuestasSi = ['si', 'sí', 'yes', 'ok', 'dale', 'vamos', 'quiero', 'acepto'];
    const respuestasNo = ['no', 'cancel', 'cancelar', 'después', 'luego'];
    
    const esSi = respuestasSi.some(palabra => mensaje.includes(palabra));
    const esNo = respuestasNo.some(palabra => mensaje.includes(palabra));
    
    if (esSi && planSeleccionado) {
      setTimeout(() => {
        agregarMensaje({
          from: "admin",
          text: `Perfecto. Procederemos con tu compra del ${planSeleccionado}.

DATOS PARA TRANSFERENCIA:
• Banco: Banco Itaú
• Número de cuenta: 20123456789
• Titular: NumStore Digital SRL

TAMBIÉN ACEPTAMOS:
• Tigo Money: 0981-123456
• Personal Pay: 0971-654321

IMPORTANTE:
• Transfiere el monto exacto
• Envía el comprobante por este chat
• Tu número se activará en menos de 30 minutos

Una vez realizada la transferencia, sube el comprobante para proceder con la activación.`,
          time: new Date().toLocaleTimeString()
        });
        renderChat();
        
        // Mostrar botón de comprobante
        comprobanteBox.classList.remove("oculto");
        contador.classList.remove("oculto");
        iniciarContador(10 * 60);
      }, 1500);
      
    } else if (esNo) {
      setTimeout(() => {
        agregarMensaje({
          from: "admin",
          text: "Entendido. Si cambias de opinión o tienes alguna pregunta, no dudes en escribirnos.\n\n¿Hay algo más en lo que pueda ayudarte?",
          time: new Date().toLocaleTimeString()
        });
        renderChat();
      }, 1000);
    }
  }

  // Manejar subida de comprobante
  fileUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const time = new Date().toLocaleTimeString();
      const fileName = file.name;
      
      // Crear URL temporal para mostrar la imagen
      const imageUrl = URL.createObjectURL(file);
      
      agregarMensaje({ 
        from: "usuario", 
        text: `📎 Comprobante enviado: ${fileName}`,
        image: imageUrl,
        time 
      });
      
      // Respuesta automática del admin
      setTimeout(() => {
        agregarMensaje({
          from: "admin",
          text: "✅ Comprobante recibido correctamente. Verificando el pago...\n\n⏰ Tu número será activado en los próximos 30 minutos.\n\n📱 Te enviaremos los datos de activación por este mismo chat.",
          time: new Date().toLocaleTimeString()
        });
        renderChat();
      }, 2000);
      
      renderChat();
      e.target.value = ""; // Limpiar el input
    }
  });

  function iniciarCompra(numeroCompleto, numeroMostrado = null) {
    // Obtener el precio del plan seleccionado
    const planInfo = dataStore.planes.find(p => p.nombre === planSeleccionado);
    const precio = planInfo ? planInfo.precioGuaranies : "Consultar";
    
    const msgAuto = `Hola, quiero comprar el plan "${planSeleccionado}" por ${precio}. 
    
Mi número será: ${numeroMostrado || numeroCompleto}
    
¿Me puedes pasar los datos bancarios para realizar la transferencia?`;
    
    // Marcar como conversación de compra y agregar límite de tiempo
    const tiempoLimite = new Date();
    tiempoLimite.setMinutes(tiempoLimite.getMinutes() + 10); // 10 minutos
    
    agregarMensaje({ 
      from: "usuario", 
      text: msgAuto, 
      time: new Date().toLocaleTimeString(),
      tipoConversacion: 'compra',
      tiempoLimite: tiempoLimite.toISOString(),
      planSeleccionado: planSeleccionado,
      numeroAsignado: numeroCompleto
    });
    
    // Chatbot inteligente según el plan
    setTimeout(() => {
      let respuestaAdmin = '';
      
      if (planSeleccionado === "Duplicación E-sim Premium") {
        respuestaAdmin = `DUPLICACIÓN E-SIM PREMIUM - PLAN COMPLETO

Excelente elección. Este es nuestro plan más avanzado.

BENEFICIOS QUE RECIBIRÁS:
✓ Duplicación de tu número actual (mantienes WhatsApp)
✓ VPN militar de grado gubernamental 
✓ Disponible en más de 100 países
✓ Encriptación extremo a extremo
✓ Activación inmediata y de por vida
✓ Completamente inrastreable

IMPORTANTE - DUPLICACIÓN:
Este servicio te permite duplicar cualquier número telefónico, esté activo o no. Es perfecto para recuperar cuentas de WhatsApp, Telegram, etc.

AVISO LEGAL: No nos hacemos responsables por usurpación de identidad o suplantación. Solo prestamos servicios de E-SIM con nuestra tecnología. El uso debe ser legal y ético.

Precio: ${precio}

¿Quieres seguir con la compra de la Duplicación E-sim Premium?`;

      } else if (planSeleccionado === "Duplicación E-sim Pro") {
        respuestaAdmin = `E-SIM MEDIO PRO - 3 MESES

Gran elección para privacidad avanzada.

TODOS LOS BENEFICIOS:
✓ Número completamente privado y nuevo
✓ VPN avanzado no rastreable incluido
✓ Compatible con WhatsApp Business
✓ Sin registros de llamadas ni mensajes
✓ 30 países disponibles
✓ Encriptación de extremo a extremo
✓ Activación anónima inmediata
✓ Protección contra rastreo de ubicación

TU NÚMERO: ${numeroMostrado}
(Verás el número completo después del pago)

Precio: ${precio}

¿Quieres seguir con la compra del E-Sim Medio Pro?`;

      } else if (planSeleccionado === "Duplicación E-sim Básico") {
        respuestaAdmin = `E-SIM BÁSICO - 30 DÍAS

Perfecto para empezar con privacidad.

TODOS LOS BENEFICIOS:
✓ Número completamente privado y nuevo
✓ VPN integrado no rastreable
✓ Compatible con WhatsApp
✓ Sin registros de actividad
✓ Encriptación básica incluida
✓ Activación anónima inmediata
✓ Ideal para uso personal

TU NÚMERO: ${numeroMostrado}
(Número completo visible después del pago)

Precio: ${precio}

¿Quieres seguir con la compra del E-Sim Básico?`;
      }
      
      agregarMensaje({
        from: "admin",
        text: respuestaAdmin,
        time: new Date().toLocaleTimeString()
      });
      renderChat();
    }, 2000);
    
    renderChat();
    window.scrollTo({ top: document.getElementById("chat").offsetTop, behavior: "smooth" });

    // Mostrar contador y comprobante
    contador.classList.remove("oculto");
    comprobanteBox.classList.remove("oculto");
    iniciarContador(10 * 60); // 10 minutos para completar la compra
  }

  function iniciarCompraDuplicacion(numero) {
    const msgAuto = `Hola, quiero DUPLICAR mi número existente: ${numero}

Plan elegido: Duplicación E-sim Premium (Gs. 250.000)

Necesito que mi número actual ${numero} sea reemplazado de forma completamente privada e inrastreable.

¿Me confirman si pueden proceder con este servicio?`;
    
    // Marcar como conversación de compra y agregar límite de tiempo
    const tiempoLimite = new Date();
    tiempoLimite.setMinutes(tiempoLimite.getMinutes() + 15); // 15 minutos
    
    agregarMensaje({ 
      from: "usuario", 
      text: msgAuto, 
      time: new Date().toLocaleTimeString(),
      tipoConversacion: 'compra',
      tiempoLimite: tiempoLimite.toISOString(),
      planSeleccionado: 'Duplicación E-sim Premium',
      numeroOriginal: numero
    });
    
    // Respuesta automática para duplicación
    setTimeout(() => {
      const respuestaAdmin = `DUPLICACIÓN DE NÚMERO PRIVADO

Perfecto, procederemos a duplicar tu número ${numero} de forma completamente privada.

PROCESO DE DUPLICACIÓN:
✓ Tu número será duplicado manteniendo funcionalidad
✓ Conservarás todos tus chats de WhatsApp
✓ El número quedará 100% privado e inrastreable
✓ Activación en menos de 30 minutos

AVISO LEGAL: No nos hacemos responsables por usurpación de identidad o suplantación. Solo prestamos servicios de E-SIM con nuestra tecnología. El uso debe ser legal y ético.

IMPORTANTE: Este proceso es irreversible y tu número quedará completamente protegido.

Precio: Gs. 250.000

¿Quieres seguir con la duplicación del número ${numero}?`;
      
      agregarMensaje({
        from: "admin",
        text: respuestaAdmin,
        time: new Date().toLocaleTimeString()
      });
      renderChat();
    }, 2500);
    
    renderChat();
    window.scrollTo({ top: document.getElementById("chat").offsetTop, behavior: "smooth" });
  }

  function iniciarContador(segundos) {
    clearInterval(temporizador);
    const contadorElement = contador;
    
    function actualizar() {
      const m = String(Math.floor(segundos / 60)).padStart(2, "0");
      const s = String(segundos % 60).padStart(2, "0");
      
      if (segundos > 0) {
        contadorElement.className = 'contador activo';
        contadorElement.innerHTML = `
          <p>Compra antes de que acabe el tiempo</p>
          <div class="tiempo">${m}:${s}</div>
        `;
      } else {
        contadorElement.className = 'contador expirado';
        contadorElement.innerHTML = `
          <p>El tiempo de compra ha expirado</p>
          <div class="tiempo">00:00</div>
        `;
        clearInterval(temporizador);
        return;
      }
      segundos--;
    }
    actualizar();
    temporizador = setInterval(actualizar, 1000);
  }

  function renderChat() {
    chatBox.innerHTML = "";
    
    dataStore.mensajes.forEach((m, index) => {
      const chatMessage = document.createElement("div");
      chatMessage.className = `chat-message ${m.from === "usuario" ? "user-message" : "admin-message"}`;
      
      // Avatar
      const avatar = document.createElement("div");
      avatar.className = "chat-avatar";
      if (m.from === "usuario") {
        avatar.innerHTML = "👤";
      } else {
        avatar.innerHTML = "🔒";
      }
      
      // Bubble container
      const bubbleContainer = document.createElement("div");
      bubbleContainer.className = "bubble-container";
      
      // Message bubble
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      
      // Message content
      const content = document.createElement("div");
      content.className = "message-content";
      
      // Handle text with line breaks
      const textLines = m.text.split('\n');
      textLines.forEach((line, i) => {
        if (i > 0) content.appendChild(document.createElement('br'));
        content.appendChild(document.createTextNode(line));
      });
      
      bubble.appendChild(content);
      
      // Handle image if present
      if (m.image) {
        const imageContainer = document.createElement("div");
        imageContainer.className = "message-image";
        const img = document.createElement("img");
        img.src = m.image;
        img.alt = "Comprobante";
        img.style.maxWidth = "200px";
        img.style.borderRadius = "8px";
        imageContainer.appendChild(img);
        bubble.appendChild(imageContainer);
      }
      
      // Time
      const timeDiv = document.createElement("div");
      timeDiv.className = "message-time";
      timeDiv.textContent = m.time;
      bubble.appendChild(timeDiv);
      
      bubbleContainer.appendChild(bubble);
      
      // Status indicators for user messages
      if (m.from === "usuario") {
        const status = document.createElement("div");
        status.className = "message-status";
        // Simulate message status
        if (index === dataStore.mensajes.length - 1) {
          status.innerHTML = "✓✓"; // Double check for last message
          status.style.color = "#4fc3f7";
        } else {
          status.innerHTML = "✓✓"; // Read
          status.style.color = "#66bb6a";
        }
        bubbleContainer.appendChild(status);
      }
      
      chatMessage.appendChild(avatar);
      chatMessage.appendChild(bubbleContainer);
      
      chatBox.appendChild(chatMessage);
    });
    
    // Auto scroll to bottom with smooth animation
    setTimeout(() => {
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);
    
    // Add typing indicator if last message is from user and recent
    const lastMessage = dataStore.mensajes[dataStore.mensajes.length - 1];
    if (lastMessage && lastMessage.from === "usuario") {
      const now = new Date();
      const lastTime = new Date();
      const timeParts = lastMessage.time.split(':');
      lastTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2] || 0));
      
      if (now - lastTime < 5000) { // If message is less than 5 seconds old
        setTimeout(showTypingIndicator, 1000);
      }
    }
  }
  
  function showTypingIndicator() {
    // Remove existing typing indicator
    const existingIndicator = chatBox.querySelector('.typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    const typingMessage = document.createElement("div");
    typingMessage.className = "chat-message admin-message typing-indicator";
    
    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.innerHTML = "🔒";
    
    const bubbleContainer = document.createElement("div");
    bubbleContainer.className = "bubble-container";
    
    const bubble = document.createElement("div");
    bubble.className = "message-bubble typing-bubble";
    
    const dots = document.createElement("div");
    dots.className = "typing-dots";
    dots.innerHTML = '<span></span><span></span><span></span>';
    
    bubble.appendChild(dots);
    bubbleContainer.appendChild(bubble);
    typingMessage.appendChild(avatar);
    typingMessage.appendChild(bubbleContainer);
    
    chatBox.appendChild(typingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Remove typing indicator after 3 seconds
    setTimeout(() => {
      const indicator = chatBox.querySelector('.typing-indicator');
      if (indicator) {
        indicator.remove();
      }
    }, 3000);
  }

  // ===== FAQ INTERACTIVO =====
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Cerrar todos los otros items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle el item actual
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
});
