/**
 * Servicio para manejar autenticación
 */
class AuthService {
  constructor() {
    this.baseURL = 'https://api-metodologias-production.up.railway.app/api';
  }

  /**
   * Realizar login de usuario
   * @param {string} correo 
   * @param {string} clave 
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async login(correo, clave) {
    try {
      const response = await axios.post(
        `${this.baseURL}/login`,
        { correo, clave },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("TOKEN", response.data.token);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error de conexión al servidor');
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async register(userData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/user`,
        userData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }

  /**
   * Guardar datos de sesión en localStorage
   * @param {Object} userData - Datos del usuario
   * @param {string} token - Token de autenticación
   */
  saveSession(userData, token) {
    const { id, correo, nombre, rol_global } = userData;
    
    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", id);
    localStorage.setItem("userName", nombre);
    localStorage.setItem("userEmail", correo);
    localStorage.setItem("userSession", JSON.stringify({ id, correo, nombre, rol_global, token }));
  }

  /**
   * Obtener datos de sesión actual
   * @returns {Object|null} Datos del usuario o null si no hay sesión
   */
  getCurrentSession() {
    try {
      const session = localStorage.getItem('userSession');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} - True si está autenticado
   */
  isAuthenticated() {
    const authToken = localStorage.getItem('authToken');
    const userSession = localStorage.getItem('userSession');
    
    return !!(authToken || userSession);
  }

  /**
   * Obtener el token de autenticación disponible
   * @returns {string|null} - Token o null si no existe
   */
  getAuthToken() {
    const authToken = localStorage.getItem('authToken');
    const userSession = localStorage.getItem('userSession');
    
    return authToken || userSession;
  }

  /**
   * Verificar autenticación y redirigir si es necesario
   * @param {boolean} showToast - Mostrar notificación toast
   * @returns {boolean} - True si está autenticado
   */
  requireAuth(showToast = true) {
    if (!this.isAuthenticated()) {
      if (showToast && typeof showWarning === 'function') {
        showWarning('Debes iniciar sesión para acceder a esta página', 4000, 'Acceso Requerido');
      }
      
      // Pequeño retraso para que se vea el toast antes de redirigir
      setTimeout(() => {
        this.redirectToLogin();
      }, showToast ? 500 : 0);
      
      return false;
    }
    return true;
  }

  /**
   * Redirigir al login (index.html)
   */
  redirectToLogin() {
    // Construir la URL relativa correcta para index.html
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    
    // Determinar cuántos niveles subir para llegar al index.html
    let relativePath = '';
    if (pathSegments.includes('pages')) {
      // Si estamos en una subcarpeta como pages/, subir un nivel
      relativePath = '../index.html';
    } else {
      // Si estamos en la raíz, ir directo al index
      relativePath = './index.html';
    }
    
    console.log('🔄 Redirigiendo al login:', relativePath);
    window.location.href = relativePath;
  }

  /**
   * Redirigir al dashboard
   */
  redirectToDashboard() {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    
    let relativePath = '';
    if (pathSegments.includes('pages')) {
      relativePath = './inicio.html';
    } else {
      relativePath = './pages/inicio.html';
    }
    
    window.location.href = relativePath;
  }

  /**
   * Confirmar cierre de sesión con modal personalizado
   * @param {function} onConfirm - Callback opcional después de confirmar
   */
  confirmLogout(onConfirm = null) {
    return new Promise((resolve) => {
      // Crear modal de confirmación personalizado
      const modalId = 'confirmLogoutModal';
      
      // Remover modal existente si lo hay
      const existingModal = document.getElementById(modalId);
      if (existingModal) {
        existingModal.remove();
      }

      const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="confirmLogoutLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="border-radius: var(--border-radius); border: none; box-shadow: var(--shadow-lg);">
              <div class="modal-header" style="background: linear-gradient(135deg, var(--c-warning), #d97706); color: white; border-bottom: none;">
                <h5 class="modal-title d-flex align-items-center" id="confirmLogoutLabel">
                  <svg class="me-2" width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Confirmar Cierre de Sesión
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body text-center py-4">
                <div class="mb-3">
                  <svg width="48" height="48" fill="var(--c-warning)" viewBox="0 0 20 20" class="mx-auto">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <h6 class="mb-2">¿Estás seguro de que quieres cerrar sesión?</h6>
                <p class="text-muted small mb-0">Tendrás que volver a iniciar sesión para acceder a la plataforma.</p>
              </div>
              <div class="modal-footer border-0 justify-content-center">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                  <i class="fas fa-times me-2"></i>Cancelar
                </button>
                <button type="button" class="btn btn-warning" id="confirmLogoutBtn">
                  <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Agregar modal al DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Mostrar modal
      const modal = new bootstrap.Modal(document.getElementById(modalId));
      modal.show();

      // Manejar confirmación
      document.getElementById('confirmLogoutBtn').addEventListener('click', () => {
        modal.hide();
        this.logout(true);
        if (typeof showInfo === 'function') {
          showInfo('Sesión cerrada correctamente', 3000, 'Hasta luego');
        }
        setTimeout(() => {
          this.redirectToLogin();
        }, 1000);
        if (onConfirm) onConfirm();
        resolve(true);
      });

      // Limpiar modal del DOM cuando se cierre
      document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
        document.getElementById(modalId).remove();
      });
    });
  }

  /**
   * Inicializar verificación de autenticación para una página
   * @param {object} options - Opciones de configuración
   */
  initPageAuth(options = {}) {
    const {
      requireAuth = true,
      showToast = true,
      redirectOnFail = true
    } = options;

    // Verificar autenticación si es requerida
    if (requireAuth) {
      if (!this.isAuthenticated()) {
        if (showToast && typeof showWarning === 'function') {
          showWarning('Debes iniciar sesión para acceder a esta página', 4000, 'Acceso Requerido');
        }
        
        if (redirectOnFail) {
          setTimeout(() => {
            this.redirectToLogin();
          }, showToast ? 500 : 0);
        }
        
        return false;
      }
    }

    // Configurar logout handlers globales
    this.setupLogoutHandlers();
    
    return true;
  }

  /**
   * Configurar manejadores de logout globales
   */
  setupLogoutHandlers() {
    // Buscar elemento específico por ID (logoutBtn)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.confirmLogout();
      });
    }
    
    // Buscar todos los elementos con data-action="logout"
    const logoutElements = document.querySelectorAll('[data-action="logout"]');
    
    logoutElements.forEach(element => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        this.confirmLogout();
      });
    });

    // También buscar elementos con clase 'logout-btn'
    const logoutBtns = document.querySelectorAll('.logout-btn');
    
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.confirmLogout();
      });
    });
  }

  /**
   * Cerrar sesión mejorado
   */
  logout(silent = false) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userSession");
    localStorage.removeItem("userData");
    localStorage.removeItem("groupData");
    
    // Limpiar sessionStorage también
    sessionStorage.clear();
    
    if (!silent && typeof showInfo === 'function') {
      showInfo('Sesión cerrada correctamente', 3000, 'Hasta luego');
    }
  }
}

// Exportar instancia del servicio
const authService = new AuthService();

// Funciones globales para compatibilidad
function requireAuth(showToast = true) {
  return authService.requireAuth(showToast);
}

function isAuthenticated() {
  return authService.isAuthenticated();
}

function getAuthToken() {
  return authService.getAuthToken();
}

function confirmLogout(onConfirm = null) {
  return authService.confirmLogout(onConfirm);
}

// Auto-inicialización para páginas que requieren autenticación
document.addEventListener('DOMContentLoaded', () => {
  // Detectar si la página actual requiere autenticación
  const currentPath = window.location.pathname.toLowerCase();
  const publicPages = ['login.html', 'registro.html', 'index.html', ''];
  
  const isPublicPage = publicPages.some(page => 
    currentPath.endsWith(page) || 
    (page === '' && (currentPath === '/' || currentPath.endsWith('/proyecto-de-metodologias/')))
  );
  
  if (!isPublicPage) {
    // Esperar a que el toast service esté disponible
    setTimeout(() => {
      authService.initPageAuth({
        requireAuth: true,
        showToast: true,
        redirectOnFail: true
      });
    }, 100);
  }
});
