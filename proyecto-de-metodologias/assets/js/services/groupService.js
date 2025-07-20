/**
 * Servicio para manejar operaciones con grupos
 */
class GroupService {
  constructor() {
    this.baseURL = 'https://api-metodologias-production.up.railway.app/api';
  }

  /**
   * Obtener token de autenticación
   * @returns {string} Token de autenticación
   */
  getAuthToken() {
    const authToken = localStorage.getItem('authToken');
    const userSession = localStorage.getItem('userSession');
    const token = authToken || userSession;
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    return token;
  }

  /**
   * Obtener todos los grupos del usuario
   * @returns {Promise<Object>} Lista de grupos
   */
  async getUserGroups() {
    try {
      const token = this.getAuthToken();
      
      const response = await axios.get(`${this.baseURL}/grupos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar los grupos');
    }
  }

  /**
   * Obtener grupo por ID
   * @param {number} groupId - ID del grupo
   * @returns {Promise<Object>} Datos del grupo
   */
  async getGroupById(groupId) {
    try {
      const token = this.getAuthToken();
      
      const response = await axios.get(`${this.baseURL}/grupos/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el grupo');
    }
  }
}

// Exportar instancia del servicio
const groupService = new GroupService();
