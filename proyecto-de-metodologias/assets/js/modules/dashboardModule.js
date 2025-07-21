/**
 * Módulo principal para manejar el dashboard
 */
class DashboardModule {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDashboard());
    } else {
      this.setupDashboard();
    }
  }

  setupDashboard() {
    if (!this.checkAuthentication()) {
      return;
    }

    this.setupNavigation();
    this.setupEventListeners();
    this.displayUserInfo();
    this.handleNavigation('dashboard');
  }

  /**
   * Verificar autenticación del usuario
   */
  checkAuthentication() {
    const authToken = localStorage.getItem('authToken');
    const userSession = localStorage.getItem('userSession');
    
    if (!authToken && !userSession) {
      console.log('No hay autenticación válida, redirigiendo al login...');
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

    this.currentUser = {
      userId: localStorage.getItem('userId') || 15,
      userName: localStorage.getItem('userName') || "Usuario Demo",
      userEmail: localStorage.getItem('userEmail') || "demo@utn.ac.cr"
    };

    return true;
  }

  /**
   * Mostrar información del usuario
   */
  displayUserInfo() {
    const userNameElement = document.getElementById('userName');
    if (userNameElement && this.currentUser) {
      userNameElement.textContent = this.currentUser.userName;
    }
    
    console.log('Usuario autenticado:', this.currentUser);
    console.log('Token presente:', !!localStorage.getItem('authToken'));
  }

  /**
   * Configurar navegación
   */
  setupNavigation() {
    this.navLinks = document.querySelectorAll('.sidebar .nav-link[data-section]');
    this.quickAccessBtns = document.querySelectorAll('.card-body [data-section]');
    this.dashboardSection = document.getElementById('dashboard-section');
    this.dynamicContent = document.getElementById('dynamic-content');
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleNavigation(link.getAttribute('data-section'));
      });
    });

    // Quick access buttons
    this.quickAccessBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = btn.getAttribute('data-section');
        if (section) {
          e.preventDefault();
          this.handleNavigation(section);
        }
      });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }

    // Event listeners para modals de pizarras
    this.setupWhiteboardEventListeners();
  }

  /**
   * Configurar event listeners específicos de pizarras
   */
  setupWhiteboardEventListeners() {
    // Crear nueva pizarra
    const createBoardBtn = document.getElementById('createBoardBtn');
    if (createBoardBtn) {
      createBoardBtn.addEventListener('click', async (e) => {
        await this.handleCreateBoard(e.target);
      });
    }

    // Crear nueva tarjeta
    const createCardBtn = document.getElementById('createCardBtn');
    if (createCardBtn) {
      createCardBtn.addEventListener('click', async (e) => {
        await this.handleCreateCard(e.target);
      });
    }
  }

  /**
   * Manejar navegación entre secciones
   */
  handleNavigation(section) {
    // Actualizar navegación activa
    this.navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-section="${section}"]`);
    if (activeLink && activeLink.classList.contains('nav-link')) {
      activeLink.classList.add('active');
    }

    // Mostrar sección correspondiente
    if (section === 'dashboard') {
      this.dashboardSection.style.display = 'block';
      this.dynamicContent.style.display = 'none';
    } else {
      this.dashboardSection.style.display = 'none';
      this.dynamicContent.style.display = 'block';
      this.loadSection(section);
    }
  }

  /**
   * Cargar sección específica
   */
  loadSection(section) {
    switch(section) {
      case 'pizarra':
        whiteboardModule.showWhiteboardSection();
        break;
      case 'foros':
        this.loadForumsCreateSection();
        break;
      case 'lista-foros':
        this.loadForumsListSection();
        break;
      default:
        this.dynamicContent.innerHTML = `<div class="alert alert-info">Sección "${section}" en desarrollo</div>`;
    }
  }

  /**
   * Cargar sección de crear foros
   */
  loadForumsCreateSection() {
    // Redirigir a la página de foros (ahora incluye crear en modal)
    window.location.href = 'list.html';
  }

  /**
   * Cargar sección de lista de foros
   */
  loadForumsListSection() {
    // Redirigir a la página de lista de foros
    window.location.href = 'list.html';
  }

  /**
   * Manejar creación de pizarra
   */
  async handleCreateBoard(button) {
    const title = document.getElementById('boardTitle')?.value.trim();
    const content = document.getElementById('boardContent')?.value.trim();
    const category = document.getElementById('boardCategory')?.value;
    const priority = document.getElementById('boardPriority')?.value;
    const grupoId = 1;

    if (!title || !content || !category) {
      this.showToast('Por favor completa todos los campos obligatorios', 'danger');
      return;
    }

    const spinner = document.getElementById('createBoardSpinner');
    const buttonText = document.getElementById('createBoardBtnText');
    spinner?.classList.remove('d-none');
    if (buttonText) buttonText.textContent = ' Creando...';
    button.disabled = true;

    try {
      await whiteboardModule.createBoard({
        grupo_id: grupoId,
        titulo: title,
        descripcion: content,
        categoria: category,
        prioridad: priority
      });
    } finally {
      spinner?.classList.add('d-none');
      if (buttonText) buttonText.textContent = 'Crear Pizarra';
      button.disabled = false;
    }
  }

  /**
   * Manejar creación de tarjeta
   */
  async handleCreateCard(button) {
    const title = document.getElementById('cardTitle')?.value.trim();
    const content = document.getElementById('cardContent')?.value.trim();
    const priority = document.getElementById('cardPriority')?.value;
    const boardId = parseInt(button.dataset.boardId);
    
    if (!title || !content) {
      this.showToast('Por favor completa todos los campos obligatorios', 'danger');
      return;
    }
    
    const spinner = document.getElementById('createCardSpinner');
    const buttonText = button.querySelector('span:not(.spinner-border)');
    spinner?.classList.remove('d-none');
    if (buttonText) buttonText.textContent = ' Creando...';
    button.disabled = true;
    
    try {
      await whiteboardModule.createCard(boardId, {
        titulo: title,
        descripcion: content,
        prioridad: priority,
        estado: 'pendiente'
      });
    } finally {
      spinner?.classList.add('d-none');
      if (buttonText) buttonText.textContent = 'Crear Tarjeta';
      button.disabled = false;
    }
  }

  /**
   * Manejar logout
   */
  handleLogout() {
    // Usar el nuevo servicio de autenticación
    if (typeof authService !== 'undefined') {
      authService.confirmLogout();
    } else {
      // Fallback al método anterior
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userSession');
        window.location.href = '../index.html';
      }
    }
  }

  /**
   * Mostrar notificación toast
   */
  showToast(message, type = 'success') {
    whiteboardModule.showToast(message, type);
  }
}

// Inicializar el módulo del dashboard
const dashboardModule = new DashboardModule();
