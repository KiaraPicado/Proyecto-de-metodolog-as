/**
 * Script para la página de lista de foros
 */
class ForumsListPage {
  constructor() {
    this.newForumModal = null;
    this.authService = null;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      if (!this.setupAuthentication()) return;
      
      this.setupUserInterface();
      this.setupServices();
      this.setupModules();
      this.setupEventListeners();
      this.setupForumModal();
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

  setupServices() {
    // Inicializar servicio de autenticación
    if (typeof AuthService !== 'undefined') {
      this.authService = new AuthService();
      window.authService = this.authService;
    }
  }

  setupModules() {
    // Inicializar módulos
    if (typeof ForumListModule !== 'undefined') {
      new ForumListModule();
    }
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
  }

  setupForumModal() {
    // Configurar modal de nuevo foro
    const newForumBtn = document.getElementById('newForumBtn');
    const newForumModalElement = document.getElementById('newForumModal');
    const createForumBtn = document.getElementById('createForumBtn');
    const formForo = document.getElementById('formForo');

    if (newForumModalElement) {
      this.newForumModal = new bootstrap.Modal(newForumModalElement);
    }

    if (newForumBtn) {
      newForumBtn.addEventListener('click', () => {
        if (formForo) formForo.reset();
        this.clearModalMessages();
        if (this.newForumModal) this.newForumModal.show();
      });
    }

    if (createForumBtn) {
      createForumBtn.addEventListener('click', () => this.handleCreateForum());
    }
  }

  async handleCreateForum() {
    // Obtener datos del formulario usando la misma lógica del módulo
    const forumData = {
      titulo: document.getElementById('titulo')?.value.trim() || '',
      descripcion: document.getElementById('descripcion')?.value.trim() || ''
    };

    // Limpiar mensajes previos
    this.clearModalMessages();

    // Validar inputs usando la misma lógica del módulo
    if (!this.validateForumInputs(forumData)) {
      return;
    }

    if (!this.authService) {
      this.showModalError('Servicio de autenticación no disponible.');
      return;
    }

    const currentUser = this.authService.getCurrentSession();
    if (!currentUser || !currentUser.id) {
      this.showModalError('No se encontró usuario logueado. Vuelve a iniciar sesión.');
      return;
    }

    // Mostrar spinner
    const spinner = document.getElementById('createForumSpinner');
    const btnText = document.getElementById('createForumBtnText');
    const createForumBtn = document.getElementById('createForumBtn');
    
    if (spinner) spinner.classList.remove('d-none');
    if (btnText) btnText.textContent = 'Creando...';
    if (createForumBtn) createForumBtn.disabled = true;

    try {
      if (typeof forumService === 'undefined') {
        throw new Error('Servicio de foros no disponible');
      }

      const response = await forumService.createForum({
        titulo: forumData.titulo,
        descripcion: forumData.descripcion,
        creado_por: currentUser.id
      });

      if (response.status === 200 || response.status === 201) {
        this.showToast('Éxito', 'Foro creado exitosamente', 'success');
        if (this.newForumModal) this.newForumModal.hide();
        
        const formForo = document.getElementById('formForo');
        if (formForo) formForo.reset();
        
        // Recargar la lista de foros
        if (window.forumListInstance) {
          window.forumListInstance.loadForums();
        }
      }

    } catch (error) {
      console.error('Error al crear foro:', error);
      this.showModalError(error.message || 'No se pudo crear el foro');
    } finally {
      // Ocultar spinner
      if (spinner) spinner.classList.add('d-none');
      if (btnText) btnText.textContent = 'Crear Foro';
      if (createForumBtn) createForumBtn.disabled = false;
    }
  }

  validateForumInputs(forumData) {
    if (!forumData.titulo || !forumData.descripcion) {
      this.showModalError('Completa todos los campos.');
      return false;
    }

    if (forumData.titulo.length < 3) {
      this.showModalError('El título debe tener al menos 3 caracteres.');
      return false;
    }

    if (forumData.descripcion.length < 10) {
      this.showModalError('La descripción debe tener al menos 10 caracteres.');
      return false;
    }

    return true;
  }

  showModalError(message) {
    const modalBody = document.querySelector('#newForumModal .modal-body');
    if (!modalBody) return;

    let errorDiv = modalBody.querySelector('.alert-danger');
    
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-danger';
      modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }
    
    errorDiv.textContent = message;
  }

  clearModalMessages() {
    const modalBody = document.querySelector('#newForumModal .modal-body');
    if (!modalBody) return;

    const errorDiv = modalBody.querySelector('.alert-danger');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  showToast(title, message, type = 'info') {
    // Usar el nuevo servicio de toasts si está disponible
    if (typeof toastService !== 'undefined') {
      toastService.show(message, type, 5000, title);
    } else {
      // Fallback al método anterior
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
      
      // Limpiar después de que se oculte
      toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
      });
    }
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

// Inicializar la página de foros
new ForumsListPage();
