/**
 * Servicio para manejar operaciones con foros
 */
class ForumService {
  constructor() {
    this.baseURL = 'https://api-metodologias-production.up.railway.app/api';
  }

  /**
   * Obtener todos los foros
   * @returns {Promise<Object>} Lista de foros
   */
  async getAllForums() {
    try {
      const response = await axios.get(`${this.baseURL}/forums`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar los foros');
    }
  }

  /**
   * Crear un nuevo foro
   * @param {Object} forumData - Datos del foro
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async createForum(forumData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/forums`,
        forumData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear foro');
    }
  }

  /**
   * Obtener foro por ID
   * @param {number} forumId - ID del foro
   * @returns {Promise<Object>} Datos del foro
   */
  async getForumById(forumId) {
    try {
      const response = await axios.get(`${this.baseURL}/forums/${forumId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el foro');
    }
  }

  /**
   * Actualizar foro
   * @param {number} forumId - ID del foro
   * @param {Object} forumData - Datos actualizados del foro
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async updateForum(forumId, forumData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/forums/${forumId}`,
        forumData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el foro');
    }
  }

  /**
   * Eliminar foro
   * @param {number} forumId - ID del foro
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async deleteForum(forumId) {
    try {
      const response = await axios.delete(`${this.baseURL}/forums/${forumId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar el foro');
    }
  }
}

// Exportar instancia del servicio
const forumService = new ForumService();
