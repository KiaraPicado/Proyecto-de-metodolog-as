/**
 * Servicio para manejar operaciones con pizarras
 */
class WhiteboardService {
  constructor() {
    this.baseURL = 'https://api-metodologias-production.up.railway.app/api';
  }

  /**
   * Obtener todas las pizarras
   * @returns {Promise<Object>} Lista de pizarras
   */
  async getAllBoards() {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(`${this.baseURL}/pizarras`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
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
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(`${this.baseURL}/pizarras/${boardId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
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
      const response = await axios.delete(`${this.baseURL}/pizarra/cards/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la tarjeta');
    }
  }
}

// Exportar instancia del servicio
const whiteboardService = new WhiteboardService();
