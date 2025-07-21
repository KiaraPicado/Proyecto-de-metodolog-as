/**
 * Script para la página de detalles de foro
 */
class ForumDetailPage {
  constructor() {
    this.currentForumId = null;
    this.originalMessages = [];
    this.newMessageModal = null;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      if (!this.setupAuthentication()) return;
      
      this.setupUserInterface();
      this.setupForumId();
      this.setupEventListeners();
      this.loadContent();
    });
  }

  setupAuthentication() {
    // Verificar autenticación
    const authToken = localStorage.getItem('authToken');
    const userSession = localStorage.getItem('userSession');

    if (!authToken && !userSession) {
      window.location.href = '../index.html';
      return false;
    }

    // Si hay sesión pero no están las keys individuales, crearlas
    if (userSession && !authToken) {
      try {
        const session = JSON.parse(userSession);
        localStorage.setItem('authToken', session.token);
        localStorage.setItem('userId', session.id);
        localStorage.setItem('userName', session.nombre);
        localStorage.setItem('userEmail', session.correo);
      } catch (error) {
        console.error('Error al parsear la sesión:', error);
        localStorage.clear();
        window.location.href = '../index.html';
        return false;
      }
    }

    return true;
  }

  setupUserInterface() {
    // Mostrar nombre de usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = userName;
    }
  }

  setupForumId() {
    // Obtener ID del foro desde URL
    const urlParams = new URLSearchParams(window.location.search);
    this.currentForumId = urlParams.get('id');

    if (!this.currentForumId) {
      this.showToast('Error', 'ID de foro no válido', 'error');
      setTimeout(() => window.location.href = 'list.html', 2000);
      return false;
    }

    return true;
  }

  setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }

    // Modal de nuevo mensaje
    const newMessageBtn = document.getElementById('newMessageBtn');
    const newMessageModalElement = document.getElementById('newMessageModal');
    const createMessageBtn = document.getElementById('createMessageBtn');
    const messageForm = document.getElementById('messageForm');

    if (newMessageModalElement) {
      this.newMessageModal = new bootstrap.Modal(newMessageModalElement);
    }

    if (newMessageBtn) {
      newMessageBtn.addEventListener('click', () => {
        if (messageForm) messageForm.reset();
        if (this.newMessageModal) this.newMessageModal.show();
      });
    }

    if (createMessageBtn) {
      createMessageBtn.addEventListener('click', () => this.createMessage());
    }

    // Filtros
    const searchMessages = document.getElementById('searchMessages');
    const sortMessages = document.getElementById('sortMessages');
    const clearMessageFilters = document.getElementById('clearMessageFilters');

    if (searchMessages) {
      searchMessages.addEventListener('input', this.debounce(() => this.filterMessages(), 300));
    }

    if (sortMessages) {
      sortMessages.addEventListener('change', () => this.filterMessages());
    }

    if (clearMessageFilters) {
      clearMessageFilters.addEventListener('click', () => this.clearFilters());
    }
  }

  async loadContent() {
    await this.loadForumDetails();
    await this.loadMessages();
  }

  async loadForumDetails() {
    try {
      // Aquí iría la llamada al servicio para obtener detalles del foro
      // Por ahora, simularemos con datos de ejemplo
      const forum = {
        id: this.currentForumId,
        titulo: 'Foro de Ejemplo',
        descripcion: 'Este es un foro de ejemplo para mostrar la funcionalidad.',
        creador_nombre: 'Usuario Ejemplo',
        creado_en: new Date().toISOString(),
        es_publico: true
      };

      this.updateForumInfo(forum);

    } catch (error) {
      console.error('Error al cargar detalles del foro:', error);
      this.showToast('Error', 'No se pudo cargar la información del foro', 'error');
    }
  }

  updateForumInfo(forum) {
    const elements = {
      forumTitle: document.getElementById('forumTitle'),
      forumInfoTitle: document.getElementById('forumInfoTitle'),
      forumInfoDescription: document.getElementById('forumInfoDescription'),
      forumCreator: document.getElementById('forumCreator'),
      forumDate: document.getElementById('forumDate'),
      forumStatus: document.getElementById('forumStatus')
    };

    if (elements.forumTitle) elements.forumTitle.textContent = forum.titulo;
    if (elements.forumInfoTitle) elements.forumInfoTitle.textContent = forum.titulo;
    if (elements.forumInfoDescription) elements.forumInfoDescription.textContent = forum.descripcion;
    if (elements.forumCreator) elements.forumCreator.textContent = forum.creador_nombre;
    if (elements.forumDate) elements.forumDate.textContent = new Date(forum.creado_en).toLocaleDateString('es-ES');
    
    if (elements.forumStatus) {
      elements.forumStatus.textContent = forum.es_publico ? 'Público' : 'Privado';
      elements.forumStatus.className = `badge ${forum.es_publico ? 'bg-success' : 'bg-warning'}`;
    }
  }

  async loadMessages() {
    try {
      this.showLoadingMessages();
      
      // Aquí iría la llamada al servicio para obtener mensajes
      // Por ahora, simularemos con datos de ejemplo
      const messages = [
        {
          id: 1,
          contenido: '¡Bienvenidos al foro! Aquí pueden discutir y compartir ideas.',
          autor_nombre: 'Profesor',
          creado_en: new Date(Date.now() - 86400000).toISOString() // 1 día atrás
        },
        {
          id: 2,
          contenido: 'Tengo una duda sobre el tema que estamos viendo en clase.',
          autor_nombre: 'Estudiante 1',
          creado_en: new Date(Date.now() - 43200000).toISOString() // 12 horas atrás
        }
      ];

      this.originalMessages = messages;
      this.renderMessages(messages);

    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      this.showErrorMessages('No se pudieron cargar los mensajes');
    }
  }

  renderMessages(messages) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    if (messages.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info text-center">
          <i class="bi bi-info-circle me-2"></i>
          No hay mensajes en este foro. ¡Sé el primero en escribir!
        </div>
      `;
      return;
    }

    const messagesHtml = messages.map(message => `
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <p class="card-text">${this.escapeHtml(message.contenido)}</p>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <small class="text-muted">
              <i class="bi bi-person me-1"></i>${this.escapeHtml(message.autor_nombre)}
            </small>
            <small class="text-muted">
              <i class="bi bi-clock me-1"></i>${new Date(message.creado_en).toLocaleString('es-ES')}
            </small>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = messagesHtml;
  }

  async createMessage() {
    const messageContent = document.getElementById('messageContent')?.value.trim();

    if (!messageContent) {
      this.showToast('Error', 'Por favor escribe un mensaje', 'error');
      return;
    }

    // Mostrar spinner
    const spinner = document.getElementById('createMessageSpinner');
    const btnText = document.getElementById('createMessageBtnText');
    const createBtn = document.getElementById('createMessageBtn');
    
    if (spinner) spinner.classList.remove('d-none');
    if (btnText) btnText.textContent = 'Enviando...';
    if (createBtn) createBtn.disabled = true;

    try {
      // Aquí iría la llamada al servicio para crear el mensaje
      // Por ahora simularemos la creación
      const newMessage = {
        id: Date.now(),
        contenido: messageContent,
        autor_nombre: localStorage.getItem('userName') || 'Usuario',
        creado_en: new Date().toISOString()
      };

      this.originalMessages.unshift(newMessage);
      this.renderMessages(this.originalMessages);

      this.showToast('Éxito', 'Mensaje enviado correctamente', 'success');
      
      const messageForm = document.getElementById('messageForm');
      if (messageForm) messageForm.reset();
      if (this.newMessageModal) this.newMessageModal.hide();

    } catch (error) {
      console.error('Error al crear mensaje:', error);
      this.showToast('Error', 'No se pudo enviar el mensaje', 'error');
    } finally {
      if (spinner) spinner.classList.add('d-none');
      if (btnText) btnText.textContent = 'Enviar Mensaje';
      if (createBtn) createBtn.disabled = false;
    }
  }

  filterMessages() {
    const searchTerm = document.getElementById('searchMessages')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortMessages')?.value || 'newest';

    let filtered = this.originalMessages.filter(message => 
      message.contenido.toLowerCase().includes(searchTerm) ||
      message.autor_nombre.toLowerCase().includes(searchTerm)
    );

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.creado_en) - new Date(b.creado_en);
      } else {
        return new Date(b.creado_en) - new Date(a.creado_en);
      }
    });

    this.renderMessages(filtered);
  }

  clearFilters() {
    const searchMessages = document.getElementById('searchMessages');
    const sortMessages = document.getElementById('sortMessages');
    
    if (searchMessages) searchMessages.value = '';
    if (sortMessages) sortMessages.value = 'newest';
    
    this.renderMessages(this.originalMessages);
  }

  showLoadingMessages() {
    const container = document.getElementById('messagesContainer');
    if (container) {
      container.innerHTML = `
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 text-muted">Cargando mensajes...</p>
        </div>
      `;
    }
  }

  showErrorMessages(message) {
    const container = document.getElementById('messagesContainer');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Error: ${this.escapeHtml(message)}
        </div>
      `;
    }
  }

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

  showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toastId = 'toast-' + Date.now();
    
    const toastHtml = `
      <div class="toast" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <i class="bi bi-${type === 'success' ? 'check-circle-fill text-success' : type === 'error' ? 'exclamation-triangle-fill text-danger' : 'info-circle-fill text-primary'} me-2"></i>
          <strong class="me-auto">${title}</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', function() {
      toastElement.remove();
    });
  }

  handleLogout() {
    // Usar el nuevo servicio de autenticación
    if (typeof authService !== 'undefined') {
      authService.confirmLogout();
    } else {
      // Fallback al método anterior
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.clear();
        window.location.href = '../index.html';
      }
    }
  }
}

// Inicializar la página de detalles del foro
new ForumDetailPage();
