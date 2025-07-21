// Módulo para manejar la interfaz de pizarras
const WhiteboardModule = {
  // Estado del módulo
  boards: [],
  filteredBoards: [],
  groups: [],
  currentUser: null,
  currentBoardId: null,
  currentBoardCards: [],

  // Inicializar el módulo
  init() {
    this.currentUser = {
      userId: localStorage.getItem('userId') || 15,
      userName: localStorage.getItem('userName') || "Usuario Demo",
      userEmail: localStorage.getItem('userEmail') || "demo@utn.ac.cr"
    };

    this.setupEventListeners();
    this.loadGroups();
    this.loadBoards();
    this.initializeSocketIO();
  },

  // ========================================
  // MÉTODOS DE CONFIGURACIÓN Y UTILIDADES
  // ========================================

  // Inicializar Socket.IO
  initializeSocketIO() {
    console.log('🔌 Inicializando Socket.IO para pizarras...');
    
    // Conectar WebSocket
    if (webSocketService) {
      webSocketService.connect();
      
      // Configurar manejadores de eventos específicos para pizarras
      webSocketService.on('cardAdded', (data) => {
        this.handleRealTimeCardAdded(data);
      });

      webSocketService.on('cardDeleted', (data) => {
        this.handleRealTimeCardDeleted(data);
      });

      webSocketService.on('pizarraCreated', (data) => {
        this.handleRealTimePizarraCreated(data);
      });
    } else {
      console.warn('webSocketService no está disponible');
    }
  },

  // Manejar nueva tarjeta en tiempo real
  // Manejar nueva tarjeta en tiempo real
  handleRealTimeCardAdded(data) {
    console.log('📝 [WhiteboardModule] Recibida nueva tarjeta en tiempo real:', data);
    console.log('🔍 Estado actual - currentBoardId:', this.currentBoardId, 'data.pizarra_id:', data.pizarra_id);
    
    // Normalizar la estructura de datos que puede venir del servidor
    const normalizedCard = {
      id: data.id,
      titulo: data.title || data.titulo || 'Sin título',
      contenido: data.content || data.contenido || 'Sin contenido',
      pizarra_id: data.pizarra_id,
      creador_nombre: data.addedBy?.userName || data.creador_nombre || data.usuario_nombre || 'Usuario',
      creado_en: data.timestamp || data.creado_en || new Date().toISOString()
    };
    
    console.log('📋 Tarjeta normalizada:', normalizedCard);
    
    // Debug: Estado completo del modal
    const boardModal = document.getElementById('boardModal');
    const cardsGrid = document.querySelector('#boardModal .cards-grid');
    console.log('🔍 Debug estado del modal:');
    console.log('- Modal existe:', !!boardModal);
    console.log('- Modal visible:', boardModal?.classList.contains('show'));
    console.log('- Cards grid existe:', !!cardsGrid);
    console.log('- CardModule disponible:', !!CardModule);
    console.log('- currentBoardCards length:', this.currentBoardCards.length);
    
    // Solo procesar si estamos viendo la pizarra correspondiente
    if (this.currentBoardId && normalizedCard.pizarra_id === this.currentBoardId) {
      console.log('✅ Procesando tarjeta para la pizarra actual');
      
      if (cardsGrid && CardModule) {
        // Verificar si ya existe el mensaje de "no hay notas"
        const emptyMessage = cardsGrid.querySelector('.empty-board-message');
        if (emptyMessage) {
          console.log('🗑️ Removiendo mensaje vacío');
          emptyMessage.remove();
        }
        
        console.log('🎯 Intentando crear elemento de tarjeta con data normalizada:', normalizedCard);
        
        // Crear y agregar la nueva tarjeta usando CardModule
        try {
          const cardElement = CardModule.createCardElement(normalizedCard);
          console.log('✅ Elemento de tarjeta creado:', cardElement);
          
          // Verificar que no existe ya una tarjeta con el mismo ID
          const existingCard = cardsGrid.querySelector(`[data-card-id="${normalizedCard.id}"]`);
          if (existingCard) {
            console.log('⚠️ Tarjeta ya existe, no agregando duplicado');
            return;
          }
          
          cardsGrid.appendChild(cardElement);
          console.log('✅ Tarjeta agregada al DOM en tiempo real');
          
          // Actualizar el contador en el header
          const boardHeader = document.querySelector('#boardModal .board-header h6');
          if (boardHeader) {
            const currentCount = this.currentBoardCards.length + 1;
            boardHeader.innerHTML = `<i class="bi bi-sticky me-2"></i>Notas y Tareas (${currentCount})`;
            console.log('📊 Contador actualizado a:', currentCount);
          }
          
          // Agregar a la lista local
          this.currentBoardCards.push(normalizedCard);
          console.log('📝 Tarjeta agregada a currentBoardCards. Total:', this.currentBoardCards.length);
          
          // Mostrar notificación
          const currentUserName = localStorage.getItem('userName');
          if (normalizedCard.creador_nombre !== currentUserName && window.toastService) {
            window.toastService.success(`Nueva tarjeta agregada: "${normalizedCard.titulo}"`);
          }
          
        } catch (error) {
          console.error('❌ Error creando elemento de tarjeta:', error);
          console.log('🔍 Data normalizada:', normalizedCard);
          console.log('🔍 Error stack:', error.stack);
        }
        
      } else {
        console.warn('❌ No se encontró el contenedor de tarjetas o CardModule no está disponible');
        console.log('- cardsGrid:', cardsGrid);
        console.log('- CardModule:', CardModule);
      }
    } else {
      console.log('⏩ Ignorando tarjeta - no es para la pizarra actual o no hay pizarra abierta');
      console.log('- currentBoardId:', this.currentBoardId);
      console.log('- normalizedCard.pizarra_id:', normalizedCard.pizarra_id);
    }
  },

  // Manejar eliminación de tarjeta en tiempo real
  handleRealTimeCardDeleted(data) {
    console.log('🗑️ Tarjeta eliminada en tiempo real:', data);
    console.log('🗑️ Estructura de datos recibida:', JSON.stringify(data, null, 2));
    
    // Como el backend emite a la sala general 'pizarra', necesitamos verificar si la tarjeta existe en nuestra pizarra actual
    // El backend solo envía { cardId, removedBy, timestamp }
    const cardId = data.cardId || data.id;
    
    // Buscar la tarjeta en el DOM para verificar si pertenece a nuestra pizarra actual
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    
    // Solo procesar si la tarjeta existe en nuestra vista actual (significa que está en nuestra pizarra)
    if (cardElement) {
      cardElement.remove();
      
      // Actualizar la lista local
      this.currentBoardCards = this.currentBoardCards.filter(card => 
        card.id !== cardId
      );
      
      // Actualizar el contador en el header
      const boardHeader = document.querySelector('#boardModal .board-header h6');
      if (boardHeader) {
        boardHeader.innerHTML = `<i class="bi bi-sticky me-2"></i>Notas y Tareas (${this.currentBoardCards.length})`;
      }
      
      // Si no quedan tarjetas, mostrar mensaje vacío
      const cardsGrid = document.querySelector('#boardModal .cards-grid');
      if (cardsGrid && this.currentBoardCards.length === 0) {
        cardsGrid.innerHTML = `
          <div class="empty-board-message">
            <i class="bi bi-sticky display-1 text-muted"></i>
            <h5 class="text-muted mt-3">No hay notas en esta pizarra</h5>
            <p class="text-muted">Agrega tu primera nota para comenzar a colaborar</p>
          </div>
        `;
      }
      
      // Mostrar notificación solo si no fue el usuario actual quien la eliminó
      const currentUserName = localStorage.getItem('userName');
      const deletedByUser = data.removedBy?.userName || data.deletedBy?.userName;
      if (deletedByUser && deletedByUser !== currentUserName) {
        if (window.toastService) {
          window.toastService.info(`Tarjeta eliminada por ${deletedByUser}`);
        }
      }
    } else {
      console.log('🗑️ Tarjeta no encontrada en esta pizarra, ignorando evento de eliminación');
    }
  },

  // Manejar nueva pizarra creada en tiempo real
  handleRealTimePizarraCreated(data) {
    console.log('📋 Nueva pizarra creada en tiempo real:', data);
    
    // Recargar la lista de pizarras
    this.loadBoards();
    
    if (window.toastService) {
      window.toastService.success(`Nueva pizarra creada: "${data.titulo}" por ${data.creador}`);
    }
  },

  // Configurar event listeners
  setupEventListeners() {
    const newBoardBtn = document.getElementById('newBoardBtn');
    if (newBoardBtn) {
      newBoardBtn.addEventListener('click', () => this.showNewBoardModal());
    }

    const createBoardBtn = document.getElementById('createBoardBtn');
    if (createBoardBtn) {
      createBoardBtn.addEventListener('click', () => this.createBoard());
    }

    const createCardBtn = document.getElementById('createCardBtn');
    if (createCardBtn) {
      createCardBtn.addEventListener('click', () => this.createCard());
    }

    this.setupFilters();
  },

  // Configurar filtros
  setupFilters() {
    const searchInput = document.getElementById('searchBoards');
    const groupFilter = document.getElementById('filterGroup');
    const clearFiltersBtn = document.getElementById('clearFilters');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    if (groupFilter) {
      groupFilter.addEventListener('change', () => this.applyFilters());
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearFilters());
    }
  },

  // Cargar grupos
  async loadGroups() {
    try {
      const authToken = localStorage.getItem('authToken');
      const userSession = localStorage.getItem('userSession');
      
      if (!authToken && !userSession) {
        console.warn('No hay token de autenticación para cargar grupos');
        this.setDefaultGroups();
        return;
      }

      console.log('📊 Cargando grupos desde el backend...');
      const response = await groupService.getUserGroups();
      
      console.log('🔍 Respuesta completa del backend:', response);
      console.log('🔍 response.success:', response.success);
      console.log('🔍 response.data:', response.data);
      console.log('🔍 Tipo de response.data:', typeof response.data);
      console.log('🔍 Es array response.data:', Array.isArray(response.data));
      
      if (response.success && response.data && response.data.length > 0) {
        this.groups = response.data;
        console.log('✅ Grupos asignados a this.groups:', this.groups);
        this.populateGroupSelects();
      } else {
        console.warn('No se encontraron grupos, usando grupos predeterminados');
        this.setDefaultGroups();
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      console.warn('Usando grupos predeterminados debido al error');
      this.setDefaultGroups();
    }
  },

  // Establecer grupos predeterminados
  setDefaultGroups() {
    this.groups = [
      { id: 1, nombre_grupo: 'Grupo General' },
      { id: 2, nombre_grupo: 'Equipo de Desarrollo' },
      { id: 3, nombre_grupo: 'Gestión de Proyectos' }
    ];
    this.populateGroupSelects();
  },

  // Poblar selects de grupos
  populateGroupSelects() {
    const boardGroupSelect = document.getElementById('boardGroup');
    const filterGroupSelect = document.getElementById('filterGroup');

    console.log('🔍 Datos de grupos para poblar selects:', this.groups);

    [boardGroupSelect, filterGroupSelect].forEach(select => {
      if (select) {
        while (select.children.length > 1) {
          select.removeChild(select.lastChild);
        }
      }
    });

    this.groups.forEach((group, index) => {
      console.log(`📝 Procesando grupo ${index}:`, {
        id: group.id,
        nombre_grupo: group.nombre_grupo,
        nombre: group.nombre,
        descripcion: group.descripcion
      });

      if (boardGroupSelect) {
        const option = document.createElement('option');
        option.value = group.id;
        // Usar múltiples fallbacks para el nombre
        option.textContent = group.nombre_grupo || group.nombre || group.name || group.titulo || `Grupo ${group.id}`;
        boardGroupSelect.appendChild(option);
        console.log(`✅ Opción agregada al boardGroupSelect: ${option.textContent}`);
      }

      if (filterGroupSelect) {
        const option = document.createElement('option');
        option.value = group.id;
        // Usar múltiples fallbacks para el nombre
        option.textContent = group.nombre_grupo || group.nombre || group.name || group.titulo || `Grupo ${group.id}`;
        filterGroupSelect.appendChild(option);
        console.log(`✅ Opción agregada al filterGroupSelect: ${option.textContent}`);
      }
    });
    
    console.log(`📋 Selects poblados con ${this.groups.length} grupos`);
    console.log('📋 boardGroupSelect opciones:', boardGroupSelect?.children.length);
    console.log('📋 filterGroupSelect opciones:', filterGroupSelect?.children.length);
  },

  // Aplicar filtros
  applyFilters() {
    const searchTerm = document.getElementById('searchBoards')?.value.toLowerCase() || '';
    const groupFilter = document.getElementById('filterGroup')?.value || '';

    this.filteredBoards = this.boards.filter(board => {
      const matchesSearch = board.titulo.toLowerCase().includes(searchTerm) ||
                          (board.descripcion && board.descripcion.toLowerCase().includes(searchTerm));
      const matchesGroup = !groupFilter || board.grupo_id.toString() === groupFilter;
      
      return matchesSearch && matchesGroup;
    });

    this.renderBoards();
  },

  // Limpiar filtros
  clearFilters() {
    const searchInput = document.getElementById('searchBoards');
    const groupFilter = document.getElementById('filterGroup');

    if (searchInput) searchInput.value = '';
    if (groupFilter) groupFilter.value = '';

    this.filteredBoards = [...this.boards];
    this.renderBoards();
  },

  // Cargar pizarras
  async loadBoards() {
    try {
      const authToken = localStorage.getItem('authToken');
      const userSession = localStorage.getItem('userSession');
      
      if (!authToken && !userSession) {
        if (window.toastService) {
          window.toastService.error('Error de autenticación. Por favor inicia sesión nuevamente.');
        }
        setTimeout(() => window.location.href = '../index.html', 2000);
        return;
      }

      const response = await whiteboardService.getAllBoards();
      
      if (response.success && response.data) {
        this.boards = response.data.map(board => ({
          id: board.id,
          titulo: board.titulo,
          descripcion: board.descripcion,
          grupo_id: board.grupo_id,
          nombre_grupo: board.nombre_grupo,
          creado_por: board.creado_por,
          creador_nombre: board.creador_nombre,
          creado_en: board.creado_en,
          cards: []
        }));
        
        this.filteredBoards = [...this.boards];
        this.renderBoards();
      } else {
        this.boards = [];
        this.filteredBoards = [];
        this.renderBoards();
      }
    } catch (error) {
      console.error('Error loading boards:', error);
      
      if (error.message.includes('Invalid token') || error.message.includes('Unauthorized')) {
        if (window.toastService) {
          window.toastService.warning('Sesión expirada. Redirigiendo al login...');
        }
        setTimeout(() => window.location.href = '../index.html', 2000);
      } else {
        if (window.toastService) {
          window.toastService.error('Error al cargar pizarras: ' + error.message);
        }
      }
      
      this.boards = [];
      this.filteredBoards = [];
      this.renderBoards();
    }
  },

  // Renderizar pizarras
  renderBoards() {
    const container = document.getElementById('boardsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (this.filteredBoards.length === 0) {
      container.innerHTML = '<div class="alert alert-warning">No se encontraron pizarras. ¡Crea una nueva!</div>';
      return;
    }
    
    this.filteredBoards.forEach(board => {
      container.appendChild(this.createBoardElement(board));
    });
  },

  // Crear elemento de pizarra
  createBoardElement(board) {
    const boardEl = document.createElement('div');
    boardEl.className = 'board-item';
    boardEl.innerHTML = `
      <h5 class="board-title">${board.titulo}</h5>
      <p class="board-description">${board.descripcion || 'Sin descripción'}</p>
      <div class="board-meta">
        <span><i class="bi bi-calendar3 me-1"></i>${this.formatDate(new Date(board.creado_en))}</span>
        <span><i class="bi bi-person me-1"></i>${board.creador_nombre}</span>
        <span><i class="bi bi-people me-1"></i>${board.nombre_grupo}</span>
      </div>
      <div class="mt-2">
        <span class="badge bg-primary me-1">Grupo: ${board.nombre_grupo}</span>
        <span class="badge bg-secondary">ID: ${board.id}</span>
      </div>
    `;
    
    boardEl.addEventListener('click', () => this.openBoard(board));
    return boardEl;
  },

  // Mostrar modales
  showNewBoardModal() {
    const modal = new bootstrap.Modal(document.getElementById('newBoardModal'));
    modal.show();
  },

  showNewCardModal(boardId) {
    const modal = new bootstrap.Modal(document.getElementById('newCardModal'));
    modal.show();
    document.getElementById('createCardBtn').dataset.boardId = boardId;
  },

  // Crear nueva pizarra
  async createBoard() {
    const title = document.getElementById('boardTitle').value.trim();
    const content = document.getElementById('boardContent').value.trim();
    const groupId = document.getElementById('boardGroup').value;

    if (!title || !content || !groupId) {
      if (window.toastService) {
        window.toastService.error('Por favor completa todos los campos obligatorios');
      }
      return;
    }

    const spinner = document.getElementById('createBoardSpinner');
    const buttonText = document.getElementById('createBoardBtnText');
    const button = document.getElementById('createBoardBtn');
    
    spinner.classList.remove('d-none');
    buttonText.textContent = 'Creando...';
    button.disabled = true;

    try {
      const boardData = {
        grupo_id: parseInt(groupId),
        titulo: title,
        descripcion: content
      };

      console.log('📝 Creando pizarra con datos:', boardData);
      const result = await whiteboardService.createBoard(boardData);

      if (result.success) {
        // El servidor automáticamente emitirá el evento Socket.IO cuando se cree la pizarra
        // this.emitPizarraCreated(result.data, title, content, groupId);
        
        // Recargar pizarras
        await this.loadBoards();

        // Cerrar modal y limpiar formulario
        const modalElement = document.getElementById('newBoardModal');
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
        
        // Limpiar formulario después de un pequeño delay para evitar conflictos
        setTimeout(() => {
          document.getElementById('newBoardForm').reset();
        }, 300);
        
        if (window.toastService) {
          window.toastService.success('Pizarra creada exitosamente');
        }
      } else {
        if (window.toastService) {
          window.toastService.error(result.message || 'Error al crear la pizarra');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (window.toastService) {
        window.toastService.error('Error al crear la pizarra');
      }
    } finally {
      spinner.classList.add('d-none');
      buttonText.textContent = 'Crear Pizarra';
      button.disabled = false;
    }
  },

  // Crear nueva tarjeta (usando CardModule)
  async createCard() {
    const title = document.getElementById('cardTitle').value.trim();
    const content = document.getElementById('cardContent').value.trim();
    const boardId = parseInt(document.getElementById('createCardBtn').dataset.boardId);
    
    if (!title || !content) {
      if (window.toastService) {
        window.toastService.error('Por favor completa todos los campos obligatorios');
      }
      return;
    }
    
    const spinner = document.getElementById('createCardSpinner');
    const button = document.getElementById('createCardBtn');
    
    spinner.classList.remove('d-none');
    button.disabled = true;
    
    try {
      // Inicializar CardModule con usuario actual
      CardModule.init(this.currentUser, this.currentBoardId);
      
      // Usar CardModule para crear la tarjeta
      const result = await CardModule.createCard(title, content, boardId);
      
      if (result.success) {
        // Recargar la vista local
        await this.loadBoardCards(boardId);
        
        // Cerrar modal y limpiar formulario
        const modalElement = document.getElementById('newCardModal');
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
        
        // Limpiar formulario después de un pequeño delay
        setTimeout(() => {
          document.getElementById('newCardForm').reset();
        }, 300);
        
        if (window.toastService) {
          window.toastService.success('Nota creada exitosamente');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (window.toastService) {
        window.toastService.error(error.message);
      }
    } finally {
      spinner.classList.add('d-none');
      button.disabled = false;
    }
  },

  // Cargar tarjetas de una pizarra específica
  async loadBoardCards(boardId) {
    try {
      const response = await whiteboardService.getBoardCards(boardId);
      if (response.success) {
        this.currentBoardCards = response.data;
        // Si el modal está abierto, actualizar la vista
        if (document.getElementById('boardModal').classList.contains('show')) {
          const board = this.boards.find(b => b.id === boardId);
          if (board) {
            board.cards = this.currentBoardCards;
            this.renderBoardCards(board);
          }
        }
      }
    } catch (error) {
      console.error('Error loading board cards:', error);
      if (window.toastService) {
        window.toastService.error('Error al cargar las tarjetas');
      }
    }
  },

  // Abrir pizarra
  async openBoard(board) {
    this.currentBoardId = board.id;
    document.getElementById('boardModalTitle').textContent = board.titulo;
    document.getElementById('boardModal').dataset.boardId = board.id;
    
    // Unirse a la sala de Socket.IO para esta pizarra
    if (webSocketService && webSocketService.isSocketConnected()) {
      webSocketService.joinBoard(board.id);
      console.log(`📋 Conectado a la pizarra ${board.id} via Socket.IO`);
    }
    
    // Inicializar CardModule con usuario actual
    CardModule.init(this.currentUser, this.currentBoardId);
    
    try {
      // Cargar tarjetas
      const cardsResponse = await whiteboardService.getBoardCards(board.id);
      
      if (cardsResponse.success) {
        board.cards = cardsResponse.data;
        this.currentBoardCards = cardsResponse.data;
      } else {
        board.cards = [];
        this.currentBoardCards = [];
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      board.cards = [];
      this.currentBoardCards = [];
      if (window.toastService) {
        window.toastService.warning('Error al cargar las tarjetas de la pizarra');
      }
    }

    this.renderBoardCards(board);
    
    const modal = new bootstrap.Modal(document.getElementById('boardModal'));
    modal.show();
    
    // Listener para salir de la pizarra al cerrar modal
    const modalElement = document.getElementById('boardModal');
    modalElement.addEventListener('hidden.bs.modal', () => {
      // Salir de la sala de Socket.IO
      if (webSocketService && webSocketService.isSocketConnected()) {
        webSocketService.leaveBoard(this.currentBoardId);
        console.log(`📋 Desconectado de la pizarra ${this.currentBoardId} via Socket.IO`);
      }
      this.currentBoardId = null;
    }, { once: true });
  },

  // Renderizar tarjetas usando CardModule
  renderBoardCards(board) {
    const columnsContainer = document.getElementById('boardColumns');
    columnsContainer.innerHTML = '';
    
    const boardContainer = document.createElement('div');
    boardContainer.className = 'simple-board-container';
    
    const boardHeader = document.createElement('div');
    boardHeader.className = 'board-header d-flex justify-content-between align-items-center mb-3';
    boardHeader.innerHTML = `
      <h6 class="mb-0">
        <i class="bi bi-sticky me-2"></i>Notas y Tareas (${board.cards.length})
      </h6>
      <button class="btn btn-primary btn-sm" id="addCardToBoard">
        <i class="bi bi-plus"></i> Agregar Nota
      </button>
    `;
    
    boardHeader.querySelector('#addCardToBoard').addEventListener('click', () => {
      this.showNewCardModal(board.id);
    });
    
    boardContainer.appendChild(boardHeader);
    
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'cards-grid';
    
    if (board.cards.length === 0) {
      cardsGrid.innerHTML = `
        <div class="empty-board-message">
          <i class="bi bi-sticky display-1 text-muted"></i>
          <h5 class="text-muted mt-3">No hay notas en esta pizarra</h5>
          <p class="text-muted">Agrega tu primera nota para comenzar a colaborar</p>
        </div>
      `;
    } else {
      // Usar CardModule para crear elementos de tarjeta
      board.cards.forEach(card => {
        cardsGrid.appendChild(CardModule.createCardElement(card));
      });
    }
    
    boardContainer.appendChild(cardsGrid);
    columnsContainer.appendChild(boardContainer);
  },

  // Formatear fecha
  formatDate(date) {
    const options = { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    return date.toLocaleString('es-ES', options);
  }
};