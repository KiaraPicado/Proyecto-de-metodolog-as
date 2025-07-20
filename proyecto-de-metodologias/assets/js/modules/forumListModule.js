/**
 * Módulo para manejar la lista de foros
 */
class ForumListModule {
  constructor() {
    this.foroContainer = null;
    // Hacer la instancia disponible globalmente
    window.forumListInstance = this;
    this.init();
  }

  init() {
    // Esperar a que el DOM esté cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupModule());
    } else {
      this.setupModule();
    }
  }

  setupModule() {
    this.foroContainer = document.getElementById("foroContainer");
    this.setupFilters();
    if (this.foroContainer) {
      this.loadForums();
    }
  }

  setupFilters() {
    // Configurar búsqueda
    const searchInput = document.getElementById('searchForums');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.debounce(() => this.filterForums(), 300));
    }

    // Configurar ordenamiento
    const sortSelect = document.getElementById('sortForums');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => this.filterForums());
    }

    // Configurar botón limpiar filtros
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearFilters());
    }
  }

  // Debounce function para evitar demasiadas llamadas
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  filterForums() {
    const searchTerm = document.getElementById('searchForums')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortForums')?.value || 'newest';

    if (!this.originalForums) return;

    let filtered = this.originalForums.filter(foro => {
      const titleMatch = foro.titulo.toLowerCase().includes(searchTerm);
      const descMatch = foro.descripcion.toLowerCase().includes(searchTerm);
      return titleMatch || descMatch;
    });

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.creado_en) - new Date(b.creado_en);
        case 'title':
          return a.titulo.localeCompare(b.titulo);
        case 'activity':
          // Por ahora ordenar por fecha, más tarde se puede agregar lógica de actividad
          return new Date(b.creado_en) - new Date(a.creado_en);
        case 'newest':
        default:
          return new Date(b.creado_en) - new Date(a.creado_en);
      }
    });

    this.clearContainer();
    if (filtered.length === 0) {
      this.showEmptyState('No se encontraron foros que coincidan con tu búsqueda.');
    } else {
      this.renderForums(filtered);
    }
  }

  clearFilters() {
    document.getElementById('searchForums').value = '';
    document.getElementById('sortForums').value = 'newest';
    if (this.originalForums) {
      this.clearContainer();
      this.renderForums(this.originalForums);
    }
  }

  async loadForums() {
    try {
      this.showLoading();
      
      const forosData = await forumService.getAllForums();
      console.log("Foros recibidos:", forosData.data);

      this.clearContainer();

      if (!Array.isArray(forosData.data) || forosData.data.length === 0) {
        this.showEmptyState();
        this.originalForums = [];
        return;
      }

      // Guardar copia original para filtros
      this.originalForums = [...forosData.data];
      this.renderForums(forosData.data);

    } catch (error) {
      console.error("Error al cargar los foros:", error);
      this.showErrorState(error.message);
    }
  }

  renderForums(forums) {
    forums.forEach(foro => {
      const foroCard = this.createForumCard(foro);
      this.foroContainer.insertAdjacentHTML("beforeend", foroCard);
    });
  }

  createForumCard(foro) {
    const fechaCreacion = new Date(foro.creado_en).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${this.escapeHtml(foro.titulo)}</h5>
            <p class="card-text">${this.escapeHtml(foro.descripcion || "Sin descripción.")}</p>
            <p><strong>Creado por:</strong> ${this.escapeHtml(foro.creador_nombre || "Desconocido")}</p>
            <p><strong>Fecha creación:</strong> ${fechaCreacion}</p>
            <p><strong>¿Es público?:</strong> ${foro.es_publico ? 'Sí' : 'No'}</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm" onclick="window.forumListInstance.viewForum(${foro.id})">
              Ver foro
            </button>
          </div>
        </div>
      </div>
    `;
  }

  viewForum(forumId) {
    // Redirigir a la página de detalles del foro
    window.location.href = `detail.html?id=${forumId}`;
  }

  showLoading() {
    if (this.foroContainer) {
      this.foroContainer.innerHTML = `
        <div class="col-12 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 text-muted">Cargando foros...</p>
        </div>
      `;
    }
  }

  clearContainer() {
    if (this.foroContainer) {
      this.foroContainer.innerHTML = "";
    }
  }

  showEmptyState(message = 'No hay foros disponibles.') {
    if (this.foroContainer) {
      this.foroContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <i class="bi bi-info-circle me-2"></i>
            ${this.escapeHtml(message)}
          </div>
        </div>
      `;
    }
  }

  showErrorState(message) {
    if (this.foroContainer) {
      this.foroContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center">
            Error al cargar los foros: ${this.escapeHtml(message)}
          </div>
        </div>
      `;
    }
  }

  // Función utilitaria para escapar HTML y prevenir XSS
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
  }

  // Método público para refrescar la lista
  refresh() {
    this.loadForums();
  }
}

// Inicializar el módulo
const forumListModule = new ForumListModule();
