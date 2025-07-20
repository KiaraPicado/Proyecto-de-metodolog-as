/**
 * Script para la página de pizarras compartidas
 */
class PizarraPage {
  constructor() {
    this.init();
  }

  init() {
    // Usar un pequeño delay para asegurar que todos los scripts se carguen
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          this.setupAuthentication();
          this.setupUserInterface();
          this.setupEventListeners();
          this.initializeWhiteboardModule();
        }, 100);
      });
    } else {
      // El DOM ya está cargado
      setTimeout(() => {
        this.setupAuthentication();
        this.setupUserInterface();
        this.setupEventListeners();
        this.initializeWhiteboardModule();
      }, 100);
    }
  }

  setupAuthentication() {
    // Verificar autenticación
    const authToken = localStorage.getItem('authToken');
    const userSession = localStorage.getItem('userSession');
    
    console.log('Estado de autenticación:');
    console.log('- authToken:', authToken ? 'Disponible' : 'No disponible');
    console.log('- userSession:', userSession ? 'Disponible' : 'No disponible');
    console.log('- webSocketService disponible:', typeof webSocketService !== 'undefined');
    console.log('- toastService disponible:', typeof toastService !== 'undefined');
    
    if (!authToken && !userSession) {
      console.warn('No hay tokens de autenticación, redirigiendo al login');
      window.location.href = '../index.html';
      return false;
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

  initializeWhiteboardModule() {
    // Verificar que todos los servicios estén disponibles antes de inicializar
    console.log('🔍 Verificando servicios disponibles:');
    console.log('- WhiteboardModule:', typeof WhiteboardModule !== 'undefined');
    console.log('- webSocketService:', typeof webSocketService !== 'undefined');
    console.log('- toastService:', typeof toastService !== 'undefined');
    console.log('- whiteboardService:', typeof whiteboardService !== 'undefined');
    
    // Inicializar módulo de pizarras
    if (typeof WhiteboardModule !== 'undefined') {
      console.log('✅ Inicializando WhiteboardModule...');
      WhiteboardModule.init();
    } else {
      console.warn('❌ WhiteboardModule no está disponible');
    }
  }
}

// Inicializar la página de pizarras
new PizarraPage();
