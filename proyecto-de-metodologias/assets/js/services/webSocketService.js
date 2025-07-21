/**
 * Servicio WebSocket para comunicación en tiempo real con las pizarras
 * Implementación completa de Socket.IO para actualizaciones en tiempo real
 * Adaptado para funcionar con el servidor Socket.IO existente
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentBoardId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventHandlers = {};
    
    // Configuración del servidor
    this.SOCKET_URL = 'https://api-metodologias-production.up.railway.app';
  }

  /**
   * Conectar al servidor Socket.IO
   */
  connect() {
    if (this.socket && this.isConnected) {
      console.log('Socket ya está conectado');
      return;
    }

    // Verificar si Socket.IO está disponible
    if (typeof io === 'undefined') {
      console.error('Socket.IO no está disponible. Asegúrate de cargar la librería.');
      if (typeof showError === 'function') {
        showError('Error: Socket.IO no está disponible');
      }
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('userSession');
      
      if (!authToken) {
        console.warn('No hay token de autenticación para Socket.IO');
        return;
      }

      console.log('🔌 Conectando a Socket.IO...', this.SOCKET_URL);

      // Configurar conexión Socket.IO
      this.socket = io(this.SOCKET_URL, {
        auth: {
          token: authToken
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Error al conectar Socket.IO:', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Configurar los event listeners del socket
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO conectado:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.updateConnectionStatus(true);
      
      if (typeof showSuccess === 'function') {
        showSuccess('Conectado al servidor en tiempo real');
      }

      console.log('🏠 Conectado a la sala general "pizarra"');
      this.executeHandlers('connect');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO desconectado:', reason);
      this.isConnected = false;
      this.updateConnectionStatus(false);
      
      if (typeof showWarning === 'function') {
        showWarning('Desconectado del servidor');
      }

      if (reason === 'io server disconnect') {
        this.attemptReconnect();
      }

      this.executeHandlers('disconnect', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket.IO:', error);
      this.handleConnectionError(error);
      this.executeHandlers('connect_error', error);
    });

    // Eventos específicos de la aplicación (según tu servidor)
    this.socket.on('cardAdded', (data) => {
      console.log('📝 Nueva tarjeta agregada:', data);
      this.handleCardAdded(data);
    });

    this.socket.on('cardRemoved', (data) => {
      console.log('🗑️ Tarjeta eliminada:', data);
      this.handleCardRemoved(data);
    });

    this.socket.on('pizarraCreated', (data) => {
      console.log('📋 Nueva pizarra creada:', data);
      this.handlePizarraCreated(data);
    });

    this.socket.on('userConnected', (data) => {
      console.log('👤 Usuario conectado:', data);
      this.handleUserConnected(data);
    });

    this.socket.on('userDisconnected', (data) => {
      console.log('👤 Usuario desconectado:', data);
      this.handleUserDisconnected(data);
    });

    this.socket.on('updateTodayAccess', () => {
      console.log('📊 Actualización de accesos de hoy');
      this.handleUpdateTodayAccess();
    });

    this.socket.on('error', (error) => {
      console.error('❌ Error del servidor:', error);
      if (typeof showError === 'function') {
        showError(error.message || 'Error del servidor');
      }
      this.executeHandlers('error', error);
    });
  }

  /**
   * Desconectar del servidor
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando Socket.IO...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentBoardId = null;
      this.updateConnectionStatus(false);
    }
  }

  /**
   * Unirse a una pizarra específica
   */
  joinBoard(boardId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket no está conectado, no se puede unir a la pizarra');
      return;
    }

    console.log(`📋 Usuario uniéndose a la sala de la pizarra ${boardId}`);
    this.currentBoardId = boardId;
    
    // Emitir evento al servidor para unirse a la sala específica de la pizarra
    this.socket.emit('joinBoard', boardId);
  }

  /**
   * Salir de una pizarra
   */
  leaveBoard(boardId = null) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    const boardToLeave = boardId || this.currentBoardId;
    if (boardToLeave) {
      console.log(`📋 Usuario saliendo de la sala de la pizarra ${boardToLeave}`);
      this.socket.emit('leaveBoard', boardToLeave);
    }
    
    this.currentBoardId = null;
  }

  /**
   * Emitir evento de nueva tarjeta creada
   */
  emitCardAdded(cardData) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket no está conectado, no se puede emitir evento de tarjeta');
      return;
    }

    console.log('📝 Emitiendo evento addCard:', cardData);
    this.socket.emit('addCard', cardData);
  }

  /**
   * Emitir evento de tarjeta eliminada
   */
  emitCardRemoved(cardData) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket no está conectado, no se puede emitir evento de eliminación');
      return;
    }

    console.log('🗑️ Emitiendo evento removeCard:', cardData);
    this.socket.emit('removeCard', cardData);
  }

  /**
   * Manejar nueva tarjeta agregada (según estructura de tu servidor)
   */
  handleCardAdded(data) {
    console.log('📝 [WebSocketService] Datos de nueva tarjeta recibidos:', data);
    console.log('📝 [WebSocketService] Estructura completa:', JSON.stringify(data, null, 2));
    
    // Pasar los datos tal como llegan del servidor al WhiteboardModule
    // WhiteboardModule se encargará de manejar la estructura correcta
    if (typeof WhiteboardModule !== 'undefined' && WhiteboardModule.handleRealTimeCardAdded) {
      WhiteboardModule.handleRealTimeCardAdded(data);
    }

    this.executeHandlers('cardAdded', data);
  }

  /**
   * Manejar tarjeta eliminada (cardRemoved según tu servidor)
   */
  handleCardRemoved(data) {
    console.log('🗑️ Datos de tarjeta eliminada recibidos:', data);
    
    const { cardId } = data;
    
    // Delegar al WhiteboardModule para manejar la eliminación correcta del DOM
    if (typeof WhiteboardModule !== 'undefined' && WhiteboardModule.handleRealTimeCardDeleted) {
      WhiteboardModule.handleRealTimeCardDeleted(data);
    }

    this.executeHandlers('cardDeleted', data);
  }

  /**
   * Manejar nueva pizarra creada
   */
  handlePizarraCreated(data) {
    console.log('📋 Nueva pizarra creada:', data);
    
    // Recargar la lista de pizarras si estamos en la página principal
    if (typeof WhiteboardModule !== 'undefined' && WhiteboardModule.loadBoards) {
      WhiteboardModule.loadBoards();
    }

    if (typeof showSuccess === 'function') {
      showSuccess(`Nueva pizarra creada: "${data.titulo}" por ${data.creador}`);
    }

    this.executeHandlers('pizarraCreated', data);
  }

  /**
   * Manejar usuario conectado
   */
  handleUserConnected(data) {
    console.log('👤 Usuario conectado:', data);
    this.executeHandlers('userConnected', data);
  }

  /**
   * Manejar usuario desconectado
   */
  handleUserDisconnected(data) {
    console.log('👤 Usuario desconectado:', data);
    this.executeHandlers('userDisconnected', data);
  }

  /**
   * Manejar actualización de accesos de hoy
   */
  handleUpdateTodayAccess() {
    console.log('📊 Actualizando accesos de hoy...');
    // Si hay una función para recargar los accesos, llamarla
    if (typeof loadTodayAccesses === 'function') {
      loadTodayAccesses();
    }
    this.executeHandlers('updateTodayAccess');
  }

  /**
   * Manejar errores de conexión
   */
  handleConnectionError(error) {
    console.error('Error de conexión:', error);
    this.updateConnectionStatus(false);
    
    if (typeof showError === 'function') {
      showError('Error de conexión al servidor');
    }

    this.attemptReconnect();
  }

  /**
   * Intentar reconectar
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Máximo número de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`🔄 Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts}) en ${delay}ms`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Actualizar estado de conexión en la UI
   */
  updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
      if (connected) {
        statusEl.className = 'connection-status connected';
        statusEl.innerHTML = '<div class="connection-indicator"></div><span>Conectado</span>';
      } else {
        statusEl.className = 'connection-status disconnected';
        statusEl.innerHTML = '<div class="connection-indicator"></div><span>Desconectado</span>';
      }
    }
  }

  /**
   * Registrar manejador de eventos
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  /**
   * Remover manejador de eventos
   */
  off(event, handler) {
    if (this.eventHandlers[event]) {
      const index = this.eventHandlers[event].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1);
      }
    }
  }

  /**
   * Ejecutar manejadores de eventos
   */
  executeHandlers(event, data = null) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error ejecutando handler para evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * Verificar si está conectado
   */
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  /**
   * Obtener ID del socket actual
   */
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Instancia global del servicio
const webSocketService = new WebSocketService();
