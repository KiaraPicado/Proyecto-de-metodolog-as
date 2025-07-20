// Módulo para manejar la interfaz de pizarras
const WhiteboardModule = {
  // Estado del módulo
  boards: [],
  filteredBoards: [],
  currentUser: null,

  // Inicializar el módulo
  init() {
    this.currentUser = {
      userId: localStorage.getItem('userId') || 15,
      userName: localStorage.getItem('userName') || "Usuario Demo",
      userEmail: localStorage.getItem('userEmail') || "demo@utn.ac.cr"
    };

    this.setupEventListeners();
    this.loadBoards();
  },

  // Configurar event listeners
  setupEventListeners() {
    // Botón para nueva pizarra
    const newBoardBtn = document.getElementById('newBoardBtn');
    if (newBoardBtn) {
      newBoardBtn.addEventListener('click', () => this.showNewBoardModal());
    }

    // Botón para crear pizarra
    const createBoardBtn = document.getElementById('createBoardBtn');
    if (createBoardBtn) {
      createBoardBtn.addEventListener('click', () => this.createBoard());
    }

    // Botón para crear tarjeta
    const createCardBtn = document.getElementById('createCardBtn');
    if (createCardBtn) {
      createCardBtn.addEventListener('click', () => this.createCard());
    }

    // Filtros
    this.setupFilters();
  },

  // Configurar filtros
  setupFilters() {
    const searchInput = document.getElementById('searchBoards');
    const categoryFilter = document.getElementById('filterCategory');
    const priorityFilter = document.getElementById('filterPriority');
    const clearFiltersBtn = document.getElementById('clearFilters');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.applyFilters());
    }

    if (priorityFilter) {
      priorityFilter.addEventListener('change', () => this.applyFilters());
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearFilters());
    }
  },

  // Aplicar filtros
  applyFilters() {
    const searchTerm = document.getElementById('searchBoards')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const priorityFilter = document.getElementById('filterPriority')?.value || '';

    this.filteredBoards = this.boards.filter(board => {
      const matchesSearch = board.titulo.toLowerCase().includes(searchTerm) ||
                          (board.descripcion && board.descripcion.toLowerCase().includes(searchTerm));
      // Por ahora no hay filtros de categoría y prioridad en la API
      return matchesSearch;
    });

    this.renderBoards();
  },

  // Limpiar filtros
  clearFilters() {
    const searchInput = document.getElementById('searchBoards');
    const categoryFilter = document.getElementById('filterCategory');
    const priorityFilter = document.getElementById('filterPriority');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (priorityFilter) priorityFilter.value = '';

    this.filteredBoards = [...this.boards];
    this.renderBoards();
  },

  // Cargar pizarras
  async loadBoards() {
    try {
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
          cards: [] // Las tarjetas se cargan por separado
        }));
        
        this.filteredBoards = [...this.boards];
        this.renderBoards();
      } else {
        this.showToast('Error al cargar pizarras. Creando datos de ejemplo.', 'warning');
        this.boards = this.getExampleBoards();
        this.filteredBoards = [...this.boards];
        this.renderBoards();
      }
    } catch (error) {
      console.error('Error loading boards:', error);
      this.showToast('Error al cargar pizarras. Creando datos de ejemplo.', 'warning');
      this.boards = this.getExampleBoards();
      this.filteredBoards = [...this.boards];
      this.renderBoards();
    }
  },

  // Datos de ejemplo si falla la API
  getExampleBoards() {
    return [
      {
        id: 1,
        titulo: "Sprint Planning",
        descripcion: "Pizarra para planificación del sprint",
        grupo_id: 1,
        nombre_grupo: "Equipo Backend",
        creado_por: this.currentUser.userId,
        creador_nombre: this.currentUser.userName,
        creado_en: new Date().toISOString(),
        cards: []
      }
    ];
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

  // Mostrar modal para nueva pizarra
  showNewBoardModal() {
    const modal = new bootstrap.Modal(document.getElementById('newBoardModal'));
    modal.show();
  },

  // Mostrar modal para nueva tarjeta
  showNewCardModal(boardId) {
    const modal = new bootstrap.Modal(document.getElementById('newCardModal'));
    modal.show();
    
    document.getElementById('createCardBtn').dataset.boardId = boardId;
  },

  // Crear nueva pizarra
  async createBoard() {
    const title = document.getElementById('boardTitle').value.trim();
    const content = document.getElementById('boardContent').value.trim();

    if (!title || !content) {
      this.showToast('Por favor completa todos los campos obligatorios', 'danger');
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
        grupo_id: 1, // Por defecto grupo 1, podrías hacerlo dinámico
        titulo: title,
        descripcion: content
      };

      const result = await whiteboardService.createBoard(boardData);

      if (result.success) {
        // Crear nueva pizarra localmente para mostrarla inmediatamente
        const newBoard = {
          id: result.data.insertId,
          titulo: title,
          descripcion: content,
          grupo_id: 1,
          nombre_grupo: 'Mi Grupo',
          creado_por: this.currentUser.userId,
          creador_nombre: this.currentUser.userName,
          creado_en: new Date().toISOString(),
          cards: []
        };
        
        this.boards.push(newBoard);
        this.applyFilters();

        const modal = bootstrap.Modal.getInstance(document.getElementById('newBoardModal'));
        modal.hide();
        document.getElementById('newBoardForm').reset();
        
        this.showToast('Pizarra creada exitosamente');
      } else {
        this.showToast(result.message || 'Error al crear la pizarra.', 'danger');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showToast('Error al crear la pizarra. Por favor intenta nuevamente.', 'danger');
    } finally {
      spinner.classList.add('d-none');
      buttonText.textContent = 'Crear Pizarra';
      button.disabled = false;
    }
  },

  // Crear nueva tarjeta
  async createCard() {
    const title = document.getElementById('cardTitle').value.trim();
    const content = document.getElementById('cardContent').value.trim();
    const boardId = parseInt(document.getElementById('createCardBtn').dataset.boardId);
    
    if (!title || !content) {
      this.showToast('Por favor completa todos los campos obligatorios', 'danger');
      return;
    }
    
    const spinner = document.getElementById('createCardSpinner');
    const button = document.getElementById('createCardBtn');
    
    spinner.classList.remove('d-none');
    button.disabled = true;
    
    try {
      const cardData = {
        pizarra_id: boardId,
        titulo: title,
        contenido: content
      };

      const result = await whiteboardService.createCard(cardData);
      
      if (result.success) {
        // Agregar tarjeta a la pizarra local
        const board = this.boards.find(b => b.id === boardId);
        if (board) {
          if (!board.cards) board.cards = [];
          board.cards.push(result.data);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('newCardModal'));
        modal.hide();
        document.getElementById('newCardForm').reset();
        
        // Si el modal de pizarra está abierto, recargarlo
        if (document.getElementById('boardModal').classList.contains('show')) {
          this.openBoard(board);
        }
        
        this.showToast('Tarjeta creada exitosamente');
      } else {
        this.showToast(result.message || 'Error al crear la tarjeta.', 'danger');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showToast('Error al crear la tarjeta. Por favor intenta nuevamente.', 'danger');
    } finally {
      spinner.classList.add('d-none');
      button.disabled = false;
    }
  },

  // Abrir pizarra y cargar sus tarjetas
  async openBoard(board) {
    document.getElementById('boardModalTitle').textContent = board.titulo;
    document.getElementById('boardModal').dataset.boardId = board.id;
    
    try {
      // Cargar tarjetas de la pizarra
      const cardsResponse = await whiteboardService.getBoardCards(board.id);
      
      if (cardsResponse.success) {
        board.cards = cardsResponse.data;
      } else {
        board.cards = [];
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      board.cards = [];
    }

    const columnsContainer = document.getElementById('boardColumns');
    columnsContainer.innerHTML = '';
    
    // Crear una sola columna para las tarjetas (la API no maneja estados)
    const column = document.createElement('div');
    column.className = 'cards-column';
    
    const columnHeader = document.createElement('div');
    columnHeader.className = 'column-header bg-primary';
    columnHeader.innerHTML = `
      <h6 class="column-title mb-0 text-white">
        <i class="bi bi-kanban me-2"></i>Tarjetas (${board.cards.length})
      </h6>
    `;
    column.appendChild(columnHeader);
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    
    // Agregar tarjetas
    board.cards.forEach(card => {
      cardsContainer.appendChild(this.createCardElement(card));
    });
    
    // Botón para agregar nueva tarjeta
    const addCardBtn = document.createElement('button');
    addCardBtn.className = 'add-card-btn';
    addCardBtn.innerHTML = '<i class="bi bi-plus"></i> Agregar tarjeta';
    addCardBtn.addEventListener('click', () => {
      this.showNewCardModal(board.id);
    });
    cardsContainer.appendChild(addCardBtn);
    
    column.appendChild(cardsContainer);
    columnsContainer.appendChild(column);
    
    const modal = new bootstrap.Modal(document.getElementById('boardModal'));
    modal.show();
  },

  // Crear elemento de tarjeta
  createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-item';
    cardEl.dataset.cardId = card.id;
    cardEl.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="card-title mb-0">${card.titulo}</h6>
        <button class="btn btn-sm btn-outline-danger delete-card-btn" data-card-id="${card.id}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
      <p class="card-content">${card.contenido}</p>
      <div class="card-footer">
        <small class="text-muted">
          <i class="bi bi-person me-1"></i>${card.creador_nombre}
        </small>
        <small class="text-muted">
          <i class="bi bi-calendar me-1"></i>${this.formatDate(new Date(card.creado_en))}
        </small>
      </div>
    `;
    
    // Event listener para eliminar tarjeta
    const deleteBtn = cardEl.querySelector('.delete-card-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteCard(card.id);
    });
    
    return cardEl;
  },

  // Eliminar tarjeta
  async deleteCard(cardId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      return;
    }

    try {
      const result = await whiteboardService.deleteCard(cardId);
      
      if (result.success) {
        // Remover tarjeta del DOM
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
          cardElement.remove();
        }
        
        // Remover de los datos locales
        this.boards.forEach(board => {
          if (board.cards) {
            board.cards = board.cards.filter(card => card.id !== cardId);
          }
        });
        
        this.showToast('Tarjeta eliminada exitosamente');
      } else {
        this.showToast('Error al eliminar la tarjeta', 'danger');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      this.showToast('Error al eliminar la tarjeta', 'danger');
    }
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
  },

  // Mostrar notificación
  showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', function() {
      toastEl.remove();
    });
  }
};