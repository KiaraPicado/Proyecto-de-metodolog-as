/**
 * Módulo para manejar el login
 */
class LoginModule {
  constructor() {
    this.loginForm = null;
    this.loginMsg = null;
    this.init();
  }

  init() {
    // Esperar a que el DOM esté cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    this.loginForm = document.getElementById("formLogin");
    this.loginMsg = document.getElementById("login-msg");

    if (this.loginForm) {
      this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const clave = document.getElementById("clave").value.trim();
    
    this.clearMessages();

    if (!this.validateInputs(correo, clave)) {
      return;
    }

    try {
      const { data, status } = await authService.login(correo, clave);

      if (status === 200 && data.success && data.data) {
        authService.saveSession(data.data, data.token);
        this.showSuccessMessage();
        this.redirectToHome();
      } else {
        this.showErrorMessage(data.message || "Credenciales incorrectas o usuario no registrado.");
      }
    } catch (error) {
      console.error(error);
      this.showErrorMessage("No fue posible conectarse al servidor. Intente de nuevo.");
    }
  }

  validateInputs(correo, clave) {
    if (!correo || !clave) {
      this.showWarningMessage("Debe completar ambos campos.");
      return false;
    }
    return true;
  }

  clearMessages() {
    if (this.loginMsg) {
      this.loginMsg.innerHTML = "";
    }
  }

  showSuccessMessage() {
    if (this.loginMsg) {
      this.loginMsg.innerHTML = '<div class="alert alert-success">¡Inicio de sesión exitoso! Redirigiendo…</div>';
    }
  }

  showErrorMessage(message) {
    if (this.loginMsg) {
      this.loginMsg.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
  }

  showWarningMessage(message) {
    if (this.loginMsg) {
      this.loginMsg.innerHTML = `<div class="alert alert-warning">${message}</div>`;
    }
  }

  redirectToHome() {
    setTimeout(() => {
      window.location.href = "../dashboard.html";
    }, 1000);
  }
}

// Inicializar el módulo
const loginModule = new LoginModule();
