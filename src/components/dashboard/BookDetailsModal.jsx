import React from 'react';

const BookDetailsModal = ({
  isOpen,
  detailBook,
  detailReview,
  onClose,
  onEdit,
  onSaveReview,
  onReviewChange,
  getCover,
  formatStatus,
}) => {
  if (!isOpen || !detailBook) return null;

  const handleStarClick = (star) => {
    onReviewChange('nota', detailReview.nota === star ? 0 : star);
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) {
          onClose();
        }
      }}
    >
      <div className="modal-content details-view">
        <button
          className="close-btn"
          style={{ position: 'absolute', top: 15, right: 15 }}
          onClick={onClose}
        >
          &times;
        </button>
        <div className="details-grid">
          <div className="details-left">
            <img
              src={getCover(detailBook.isbn, detailBook.url_capa)}
              className="detail-cover-img"
              alt="Capa"
            />
            {detailBook.status !== 'none' && (
              <span
                className={`status-badge status-${detailBook.status}`}
                style={{
                  position: 'relative',
                  marginTop: 10,
                  display: 'inline-block',
                }}
              >
                {formatStatus(detailBook.status)}
              </span>
            )}
            <div className="details-actions" style={{ marginTop: '1rem' }}>
              <button
                className="btn-secondary"
                onClick={() => onEdit(detailBook)}
              >
                Editar Livro (Dados Gerais)
              </button>
            </div>
          </div>
          <div className="details-right">
            <h1>{detailBook.title}</h1>
            <p className="detail-author">{detailBook.author}</p>

            <div className="review-box" style={{ marginTop: '1.5rem' }}>
              <h3>Sua Avaliação</h3>
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${
                      star <= (detailReview?.nota || 0) ? 'active' : ''
                    }`}
                    onClick={() => handleStarClick(star)}
                    style={{ cursor: 'pointer' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {detailReview === null && <p>Carregando avaliação...</p>}
            </div>

            {detailBook.descricao && (
              <div className="review-box">
                <h3>Descrição</h3>
                <p>{detailBook.descricao}</p>
              </div>
            )}

            <div className="review-box">
              <h3>Resenha / Notas Pessoais</h3>
              {detailReview === null ? (
                <p>Carregando resenha...</p>
              ) : (
                <textarea
                  rows="4"
                  value={detailReview.comentario}
                  onChange={(e) => onReviewChange('comentario', e.target.value)}
                  placeholder="Adicione sua resenha ou notas pessoais aqui."
                  style={{
                    width: '100%',
                    padding: '10px',
                    minHeight: '100px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-color)',
                  }}
                ></textarea>
              )}
            </div>

            <div className="details-actions">
              <button
                className="btn-primary"
                disabled={!detailReview}
                onClick={() =>
                  onSaveReview(
                    detailReview.nota,
                    detailReview.comentario,
                    detailBook.id,
                    detailReview.id
                  )
                }
              >
                Salvar Avaliação
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
