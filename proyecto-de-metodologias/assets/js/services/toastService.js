/**
 * Servicio de notificaciones Toast estilizado
 * Utiliza la paleta de colores de la aplicación
 */
class ToastService {
  constructor() {
    this.toastContainer = null;
    this.toastCounter = 0;
    this.init();
  }

  /**
   * Inicializar el contenedor de toasts
   */
  init() {
    // Crear contenedor si no existe
    this.toastContainer = document.getElementById('toast-container');
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }

    // Agregar estilos CSS si no existen
    this.addStyles();
  }

  /**
   * Agregar estilos CSS para los toasts
   */
  addStyles() {
    if (document.getElementById('toast-styles')) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'toast-styles';
    styleSheet.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      }

      .toast-custom {
        margin-bottom: 10px;
        border: none;
        border-radius: var(--border-radius, 12px);
        box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12));
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease-out;
        overflow: hidden;
        max-width: 100%;
      }

      .toast-custom.hide {
        animation: slideOutRight 0.3s ease-in;
      }

      .toast-custom .toast-header {
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding: 12px 16px;
        font-weight: 600;
        font-size: 14px;
      }

      .toast-custom .toast-body {
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.5;
      }

      .toast-custom .btn-close {
        margin: 0;
        padding: 8px;
      }

      /* Estilos por tipo */
      .toast-success {
        background: linear-gradient(135deg, var(--c-success, #10b981), var(--c-accent-teal, #14b8a6));
        color: white;
      }

      .toast-error {
        background: linear-gradient(135deg, var(--c-danger, #ef4444), #dc2626);
        color: white;
      }

      .toast-warning {
        background: linear-gradient(135deg, var(--c-warning, #f59e0b), #d97706);
        color: white;
      }

      .toast-info {
        background: linear-gradient(135deg, var(--c-info, #38bdf8), var(--c-accent-indigo, #818cf8));
        color: white;
      }

      .toast-primary {
        background: linear-gradient(135deg, var(--c-primary, #6891eb), var(--c-accent-blue, #60a5fa));
        color: white;
      }

      /* Iconos */
      .toast-icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
        flex-shrink: 0;
      }

      /* Animaciones */
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      /* Responsivo */
      @media (max-width: 768px) {
        .toast-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .toast-custom {
          margin-bottom: 8px;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  /**
   * Mostrar toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info', 'primary'
   * @param {number} duration - Duración en ms (0 = no auto-ocultar)
   * @param {string} title - Título opcional
   */
  show(message, type = 'info', duration = 5000, title = null) {
    const toastId = `toast-${++this.toastCounter}`;
    const icons = {
      success: `<svg class="toast-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>`,
      error: `<svg class="toast-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>`,
      warning: `<svg class="toast-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>`,
      info: `<svg class="toast-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>`,
      primary: `<svg class="toast-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>`
    };

    const titleText = title || this.getDefaultTitle(type);
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.className = `toast toast-custom toast-${type}`;
    toastElement.setAttribute('role', 'alert');
    toastElement.innerHTML = `
      <div class="toast-header">
        ${icons[type] || icons.info}
        <strong class="me-auto">${titleText}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;

    this.toastContainer.appendChild(toastElement);

    // Configurar auto-ocultado
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toastId);
      }, duration);
    }

    // Agregar event listener para el botón de cerrar
    const closeBtn = toastElement.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      this.hide(toastId);
    });

    return toastId;
  }

  /**
   * Ocultar toast específico
   * @param {string} toastId - ID del toast
   */
  hide(toastId) {
    const toastElement = document.getElementById(toastId);
    if (toastElement) {
      toastElement.classList.add('hide');
      setTimeout(() => {
        if (toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }
      }, 300);
    }
  }

  /**
   * Limpiar todos los toasts
   */
  clearAll() {
    if (this.toastContainer) {
      this.toastContainer.innerHTML = '';
    }
  }

  /**
   * Obtener título por defecto según el tipo
   * @param {string} type - Tipo de toast
   */
  getDefaultTitle(type) {
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      primary: 'Notificación'
    };
    return titles[type] || 'Notificación';
  }

  // Métodos de conveniencia
  success(message, duration = 5000, title = null) {
    return this.show(message, 'success', duration, title);
  }

  error(message, duration = 7000, title = null) {
    return this.show(message, 'error', duration, title);
  }

  warning(message, duration = 6000, title = null) {
    return this.show(message, 'warning', duration, title);
  }

  info(message, duration = 5000, title = null) {
    return this.show(message, 'info', duration, title);
  }

  primary(message, duration = 5000, title = null) {
    return this.show(message, 'primary', duration, title);
  }
}

// Exportar instancia global del servicio
const toastService = new ToastService();

// Métodos globales para compatibilidad
function showToast(message, type = 'info', duration = 5000, title = null) {
  return toastService.show(message, type, duration, title);
}

function showSuccess(message, duration = 5000, title = null) {
  return toastService.success(message, duration, title);
}

function showError(message, duration = 7000, title = null) {
  return toastService.error(message, duration, title);
}

function showWarning(message, duration = 6000, title = null) {
  return toastService.warning(message, duration, title);
}

function showInfo(message, duration = 5000, title = null) {
  return toastService.info(message, duration, title);
}
