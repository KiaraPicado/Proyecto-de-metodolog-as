/**
 * Módulo para manejar el registro de usuarios
 */
class RegisterModule {
  constructor() {
    this.registerForm = null;
    this.registerMsg = null;
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
    this.registerForm = document.getElementById('formRegistro');
    this.registerMsg = document.getElementById('register-msg');

    if (this.registerForm) {
      this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const userData = this.getFormData();
    this.clearMessages();

    if (!this.validateInputs(userData)) {
      return;
    }

    try {
      const response = await authService.register({
        nombre: userData.nombre,
        correo: userData.correo,
        clave: userData.clave,
        rol_global: userData.rol
      });

      if (response.status === 200 || response.status === 201) {
        this.showSuccessMessage();
        this.resetForm();
        this.redirectToLogin();
      }
    } catch (error) {
      console.error(error);
      this.showErrorMessage(error.message);
    }
  }

  getFormData() {
    return {
      nombre: document.getElementById('nombre').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      clave: document.getElementById('clave').value.trim(),
      rol: document.getElementById('rol').value
    };
  }

  validateInputs(userData) {
    if (!userData.nombre || !userData.correo || !userData.clave || !userData.rol) {
      this.showErrorMessage("Todos los campos son obligatorios.");
      return false;
    }

    if (!this.isValidEmail(userData.correo)) {
      this.showErrorMessage("Por favor ingrese un correo electrónico válido.");
      return false;
    }

    if (userData.clave.length < 6) {
      this.showErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearMessages() {
    if (this.registerMsg) {
      this.registerMsg.innerHTML = "";
    }
  }

  showSuccessMessage() {
    if (this.registerMsg) {
      this.registerMsg.innerHTML = '<div class="alert alert-success">Usuario registrado exitosamente. Redirigiendo al login...</div>';
    }
  }

  showErrorMessage(message) {
    if (this.registerMsg) {
      this.registerMsg.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
  }

  resetForm() {
    if (this.registerForm) {
      this.registerForm.reset();
    }
  }

  redirectToLogin() {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  }
}

// Inicializar el módulo
const registerModule = new RegisterModule();
