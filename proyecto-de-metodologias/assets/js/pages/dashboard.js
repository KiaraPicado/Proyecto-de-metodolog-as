/**
 * Script para la página del dashboard
 */
class DashboardPage {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupAuthentication();
      this.setupUserInterface();
      this.setupEventListeners();
    });
  }

  setupAuthentication() {
    // Verificar autenticación
    const authToken = localStorage.getItem('authToken');
    const userSession = localStorage.getItem('userSession');
    
    if (!authToken && !userSession) {
      window.location.href = '../index.html';
      return;
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
        return;
      }
    }
  }

  setupUserInterface() {
    // Mostrar nombre de usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = userName;
    }

    // Aquí se pueden agregar más funcionalidades como:
    // - Cargar estadísticas reales
    // - Cargar actividad reciente
    // - Actualizar contadores dinámicamente
    this.loadDashboardStats();
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

  loadDashboardStats() {
    // Aquí se pueden cargar estadísticas reales desde el servidor
    // Por ahora usamos datos estáticos pero se puede expandir
    console.log('Cargando estadísticas del dashboard...');
    
    // Ejemplo de cómo se podría implementar:
    // try {
    //   const stats = await dashboardService.getStats();
    //   this.updateStatsCards(stats);
    // } catch (error) {
    //   console.error('Error al cargar estadísticas:', error);
    // }
  }

  updateStatsCards(stats) {
    // Método para actualizar las tarjetas de estadísticas
    if (stats.forosActivos) {
      const forosCard = document.querySelector('.card-body .display-6');
      if (forosCard) forosCard.textContent = stats.forosActivos;
    }
    // Se pueden agregar más actualizaciones aquí
  }
}

// Inicializar la página del dashboard
new DashboardPage();
