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
  },

  // ========================================
  // MÉTODOS DE CONFIGURACIÓN Y UTILIDADES
  // ========================================

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
        this.setDefaultGroups();
        return;
      }

      const response = await groupService.getUserGroups();
      if (response.success) {
        this.groups = response.data || [];
        this.populateGroupSelects();
      } else {
        this.setDefaultGroups();
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      this.setDefaultGroups();
    }
  },

  // Establecer grupos predeterminados
  setDefaultGroups() {
    this.groups = [
      { id: 1, nombre: 'Grupo General' },
      { id: 2, nombre: 'Equipo de Desarrollo' },
      { id: 3, nombre: 'Gestión de Proyectos' }
    ];
    this.populateGroupSelects();
  },

  // Poblar selects de grupos
  populateGroupSelects() {
    const boardGroupSelect = document.getElementById('boardGroup');
    const filterGroupSelect = document.getElementById('filterGroup');

    [boardGroupSelect, filterGroupSelect].forEach(select => {
      if (select) {
        while (select.children.length > 1) {
          select.removeChild(select.lastChild);
        }
      }
    });

    this.groups.forEach(group => {
      if (boardGroupSelect) {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.nombre;
        boardGroupSelect.appendChild(option);
      }

      if (filterGroupSelect) {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.nombre;
        filterGroupSelect.appendChild(option);
      }
    });
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

      const result = await whiteboardService.createBoard(boardData);

      if (result.success) {
        // Emitir evento WebSocket
        this.emitPizarraCreated(result.data, title, content, groupId);
        
        // Recargar pizarras
        await this.loadBoards();

        const modal = bootstrap.Modal.getInstance(document.getElementById('newBoardModal'));
        modal.hide();
        document.getElementById('newBoardForm').reset();
        
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
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('newCardModal'));
        modal.hide();
        document.getElementById('newCardForm').reset();
        
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