import React from 'react';

const DeleteConfirmModal = ({
  isOpen,
  bookToDelete,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !bookToDelete) return null;

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) {
          onCancel();
        }
      }}
    >
      <div className="modal-content small">
        <div className="modal-header">
          <h2>Excluir livro</h2>
          <button className="close-btn" onClick={onCancel}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p>
            Tem certeza que deseja excluir o livro{' '}
            <strong>{bookToDelete.title}</strong>?
          </p>
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              opacity: 0.8,
            }}
          >
            Essa ação não pode ser desfeita.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
