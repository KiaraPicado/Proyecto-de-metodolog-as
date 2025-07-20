/**
 * Módulo para manejar la creación de foros
 */
class ForumCreateModule {
  constructor() {
    this.forumForm = null;
    this.forumMsg = null;
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
    this.forumForm = document.getElementById('formForo');
    this.setupMessageContainer();

    if (this.forumForm) {
      this.forumForm.addEventListener('submit', (e) => this.handleCreateForum(e));
    }
  }

  setupMessageContainer() {
    this.forumMsg = document.getElementById('foro-msg');
    if (!this.forumMsg && this.forumForm) {
      this.forumMsg = document.createElement('div');
      this.forumMsg.id = 'foro-msg';
      this.forumMsg.className = 'alert d-none';
      this.forumForm.parentNode.insertBefore(this.forumMsg, this.forumForm.nextSibling);
    }
  }

  async handleCreateForum(e) {
    e.preventDefault();

    const forumData = this.getFormData();
    this.clearMessages();

    if (!this.validateInputs(forumData)) {
      return;
    }

    const currentUser = authService.getCurrentSession();
    if (!currentUser || !currentUser.id) {
      this.showErrorMessage("No se encontró usuario logueado. Vuelve a iniciar sesión.");
      return;
    }

    try {
      const response = await forumService.createForum({
        titulo: forumData.titulo,
        descripcion: forumData.descripcion,
        creado_por: currentUser.id
      });

      if (response.status === 200 || response.status === 201) {
        this.showSuccessMessage("¡Foro creado exitosamente!");
        this.resetForm();
      }
    } catch (error) {
      console.error(error);
      this.showErrorMessage(error.message);
    }
  }

  getFormData() {
    return {
      titulo: document.getElementById('titulo')?.value.trim() || '',
      descripcion: document.getElementById('descripcion')?.value.trim() || ''
    };
  }

  validateInputs(forumData) {
    if (!forumData.titulo || !forumData.descripcion) {
      this.showErrorMessage("Completa todos los campos.");
      return false;
    }

    if (forumData.titulo.length < 3) {
      this.showErrorMessage("El título debe tener al menos 3 caracteres.");
      return false;
    }

    if (forumData.descripcion.length < 10) {
      this.showErrorMessage("La descripción debe tener al menos 10 caracteres.");
      return false;
    }

    return true;
  }

  clearMessages() {
    if (this.forumMsg) {
      this.forumMsg.className = "alert d-none";
      this.forumMsg.textContent = "";
    }
  }

  showSuccessMessage(message) {
    if (this.forumMsg) {
      this.forumMsg.textContent = message;
      this.forumMsg.className = "alert alert-success mt-3";
    }
  }

  showErrorMessage(message) {
    if (this.forumMsg) {
      this.forumMsg.textContent = message;
      this.forumMsg.className = "alert alert-danger mt-3";
    }
  }

  resetForm() {
    if (this.forumForm) {
      this.forumForm.reset();
    }
  }
}

// Inicializar el módulo
const forumCreateModule = new ForumCreateModule();
