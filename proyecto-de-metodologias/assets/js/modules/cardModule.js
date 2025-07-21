/**
 * Módulo para manejar la lógica de tarjetas
 */
const CardModule = {
  currentUser: null,
  currentBoardId: null,

  /**
   * Inicializar el módulo con usuario actual
   */
  init(user, boardId) {
    this.currentUser = user;
    this.currentBoardId = boardId;
  },

  /**
   * Crear nueva tarjeta
   */
  async createCard(title, content, boardId) {
    if (!title || !content) {
      throw new Error('Título y contenido son obligatorios');
    }
    
    try {
      const cardData = {
        pizarra_id: boardId,
        titulo: title,
        contenido: content
      };

      const result = await whiteboardService.createCard(cardData);
      
      if (result.success) {
        // Emitir evento Socket.IO para actualizaciones en tiempo real
        if (webSocketService && webSocketService.isSocketConnected()) {
          const cardForSocket = {
            id: result.data.id || result.data.insertId || Date.now(),
            titulo: title,
            contenido: content,
            pizarra_id: boardId,
            creador_nombre: localStorage.getItem('userName') || 'Usuario',
            creado_en: new Date().toISOString()
          };
          
          console.log('📝 Emitiendo evento de nueva tarjeta via Socket.IO:', cardForSocket);
          webSocketService.emitCardAdded(cardForSocket);
        }
        
        return result;
      } else {
        throw new Error(result.message || 'Error al crear la tarjeta');
      }
    } catch (error) {
      throw new Error('Error al crear la tarjeta: ' + error.message);
    }
  },

  /**
   * Eliminar tarjeta
   */
  async deleteCard(cardId) {
    try {
      const result = await whiteboardService.deleteCard(cardId);
      
      if (result.success) {
        // Emitir evento Socket.IO para notificar eliminación en tiempo real
        if (webSocketService && webSocketService.isSocketConnected()) {
          const boardId = webSocketService.currentBoardId;
          if (boardId) {
            console.log('🗑️ Notificando eliminación via Socket.IO');
            webSocketService.emitCardRemoved({
              cardId: cardId,
              pizarra_id: boardId
            });
          }
        }
        
        // Remover del DOM
        this.removeCardFromDOM(cardId);
        
        return result;
      } else {
        throw new Error('Error al eliminar la tarjeta');
      }
    } catch (error) {
      console.log('🗑️ Error al eliminar tarjeta:', error.message);
      
      // Si la tarjeta ya no existe (404), la removemos del DOM y emitimos el evento
      if (error.message.includes('no existe') || error.message.includes('eliminada') || error.message.includes('404')) {
        console.log('🗑️ Tarjeta no existe en backend, removiendo del DOM...');
        
        // Emitir evento Socket.IO para sincronizar con otros usuarios
        if (webSocketService && webSocketService.isSocketConnected()) {
          const boardId = webSocketService.currentBoardId;
          if (boardId) {
            console.log('🗑️ Notificando eliminación de tarjeta inexistente via Socket.IO');
            webSocketService.emitCardRemoved({
              cardId: cardId,
              pizarra_id: boardId
            });
          }
        }
        
        // Remover del DOM localmente
        this.removeCardFromDOM(cardId);
        
        // Mostrar mensaje informativo en lugar de error
        if (window.toastService) {
          window.toastService.info('La tarjeta ya fue eliminada anteriormente');
        }
        
        return { success: true, message: 'Tarjeta eliminada correctamente' };
      }
      
      // Para otros errores, mostrar el mensaje de error
      if (window.toastService) {
        window.toastService.error(error.message);
      }
      throw error;
    }
  },

  /**
   * Remover tarjeta del DOM
   */
  removeCardFromDOM(cardId) {
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    if (cardElement) {
      cardElement.remove();
    }
  },

  /**
   * Crear elemento de tarjeta
   */
  createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'note-card';
    cardEl.dataset.cardId = card.id;
    
    // Color aleatorio estilo post-it
    const colors = ['note-yellow', 'note-blue', 'note-green', 'note-pink', 'note-orange'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    cardEl.classList.add(randomColor);
    
    cardEl.innerHTML = `
      <div class="note-header">
        <h6 class="note-title">${card.titulo}</h6>
        <button class="btn btn-sm btn-outline-danger delete-note-btn" data-card-id="${card.id}" title="Eliminar nota">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="note-content">${card.contenido}</div>
      <div class="note-footer">
        <small class="text-muted">
          <i class="bi bi-person me-1"></i>${card.creador_nombre}
        </small>
        <small class="text-muted">
          <i class="bi bi-clock me-1"></i>${this.formatDate(new Date(card.creado_en))}
        </small>
      </div>
    `;
    
    // Event listener para eliminar
    const deleteBtn = cardEl.querySelector('.delete-note-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showDeleteConfirmation(card.id);
    });
    
    return cardEl;
  },

  /**
   * Mostrar modal de confirmación para eliminar
   */
  showDeleteConfirmation(cardId) {
    const modalId = 'confirmDeleteCardModal';
    
    // Remover modal existente
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }

    const modalHTML = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">Confirmar Eliminación</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center py-4">
              <h6 class="mb-2">¿Estás seguro de que quieres eliminar esta tarjeta?</h6>
              <p class="text-muted small mb-0">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();

    // Manejar confirmación
    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
      modal.hide();
      
      try {
        const result = await this.deleteCard(cardId);
        if (result && result.success) {
          // No mostrar mensaje de éxito si el mensaje ya fue mostrado en deleteCard
          if (!result.message || !result.message.includes('anteriormente')) {
            if (window.toastService) {
              window.toastService.success('Nota eliminada exitosamente');
            }
          }
        }
      } catch (error) {
        // Solo mostrar error si realmente es un error, no si la tarjeta ya fue eliminada
        console.error('❌ Error eliminando tarjeta:', error);
        if (window.toastService) {
          window.toastService.error(error.message);
        }
      }
    });

    // Limpiar modal
    document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
      document.getElementById(modalId).remove();
    });
  },

  /**
   * Formatear fecha
   */
  formatDate(date) {
    const options = { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    return date.toLocaleString('es-ES', options);
  }
};
