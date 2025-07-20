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
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userSession");
  }
}

// Exportar instancia del servicio
const authService = new AuthService();
