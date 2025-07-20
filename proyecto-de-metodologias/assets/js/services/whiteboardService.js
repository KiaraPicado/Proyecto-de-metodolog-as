/**
 * Servicio para manejar operaciones con pizarras
 */
class WhiteboardService {
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
   * Obtener todas las pizarras
   * @returns {Promise<Object>} Lista de pizarras
   */
  async getAllBoards() {
    try {
      const token = this.getAuthToken();
      
      const response = await axios.get(`${this.baseURL}/pizarras`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar las pizarras');
    }
  }

  /**
   * Obtener pizarra por ID
   * @param {number} boardId - ID de la pizarra
   * @returns {Promise<Object>} Datos de la pizarra
   */
  async getBoardById(boardId) {
    try {
      const token = this.getAuthToken();
      
      const response = await axios.get(`${this.baseURL}/pizarras/${boardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la pizarra');
    }
  }

  /**
   * Crear una nueva pizarra
   * @param {Object} boardData - Datos de la pizarra
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async createBoard(boardData) {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(
        `${this.baseURL}/pizarras`,
        boardData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la pizarra');
    }
  }

  /**
   * Obtener tarjetas de una pizarra
   * @param {number} boardId - ID de la pizarra
   * @returns {Promise<Object>} Lista de tarjetas
   */
  async getBoardCards(boardId) {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(`${this.baseURL}/pizarras/${boardId}/tarjetas`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener las tarjetas');
    }
  }

  /**
   * Crear una nueva tarjeta en una pizarra
   * @param {Object} cardData - Datos de la tarjeta
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async createCard(cardData) {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(
        `${this.baseURL}/pizarra/cards`,
        cardData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la tarjeta');
    }
  }

  /**
   * Eliminar una tarjeta
   * @param {number} cardId - ID de la tarjeta
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async deleteCard(cardId) {
    try {
      const authToken = localStorage.getItem('authToken');
      console.log('🗑️ Intentando eliminar tarjeta ID:', cardId);
      
      const response = await axios.delete(`${this.baseURL}/pizarra/cards/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('🗑️ Respuesta del servidor:', response.data);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Tarjeta eliminada correctamente'
        };
      } else {
        // Si la respuesta no tiene success: true, pero el status HTTP es 200
        // asumimos que se eliminó correctamente
        return {
          success: true,
          data: response.data,
          message: 'Tarjeta eliminada correctamente'
        };
      }
    } catch (error) {
      console.error('❌ Error al eliminar tarjeta:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 404) {
        throw new Error('La tarjeta no existe o ya fue eliminada');
      } else if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar esta tarjeta');
      } else if (error.response?.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente');
      } else {
        throw new Error(error.response?.data?.message || 'Error al eliminar la tarjeta');
      }
    }
  }
}

// Exportar instancia del servicio
const whiteboardService = new WhiteboardService();
