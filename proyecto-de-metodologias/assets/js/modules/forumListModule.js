/**
 * Módulo para manejar la lista de foros
 */
class ForumListModule {
  constructor() {
    this.foroContainer = null;
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
    if (this.foroContainer) {
      this.loadForums();
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
        return;
      }

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
            <button class="btn btn-primary btn-sm" onclick="forumListModule.viewForum(${foro.id})">
              Ver foro
            </button>
          </div>
        </div>
      </div>
    `;
  }

  viewForum(forumId) {
    // Aquí puedes agregar la lógica para ver un foro específico
    console.log(`Ver foro con ID: ${forumId}`);
    // Por ejemplo: window.location.href = `foro-detalle.html?id=${forumId}`;
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

  showEmptyState() {
    if (this.foroContainer) {
      this.foroContainer.innerHTML = `
        <div class="col-12">
          <p class="text-muted text-center">No hay foros disponibles.</p>
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
