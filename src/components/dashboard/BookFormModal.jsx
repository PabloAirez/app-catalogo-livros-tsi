import React, { useState } from 'react';

const BookFormModal = ({
  isOpen,
  formData,
  allCategories,
  onFormChange,
  onSubmit,
  onClose,
  onFetchISBN,
}) => {
  const [activeTab, setActiveTab] = useState('manual');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    onFormChange(id, value);
  };

  const handleRatingChange = (star) => {
    onFormChange('rating', formData.rating === star ? 0 : star);
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{formData.id ? 'Editar' : 'Adicionar'}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual
          </button>
          <button
            className={`tab-btn ${activeTab === 'isbn' ? 'active' : ''}`}
            onClick={() => setActiveTab('isbn')}
          >
            ISBN
          </button>
        </div>

        {activeTab === 'manual' ? (
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Autor</label>
              <input
                id="author"
                value={formData.author}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <input
                  id="genre"
                  list="cats"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  placeholder="Selecione ou crie..."
                />
                <datalist id="cats">
                  {allCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="none">Sem etiqueta</option>
                  <option value="para-ler">Para Ler</option>
                  <option value="lendo">Lendo</option>
                  <option value="lido">Lido</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ano</label>
                <input
                  type="number"
                  id="year"
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Editora</label>
                <input
                  id="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>ISBN (obrigatório)</label>
              <input
                id="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                required
                placeholder="Ex: 978..."
              />
              <small style={{ opacity: 0.7 }}>
                Use a aba &quot;ISBN&quot; para buscar os dados automaticamente.
              </small>
            </div>

            <div className="form-group">
              <label>URL da capa (opcional)</label>
              <input
                id="url_capa"
                value={formData.url_capa}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>

            <div
              className="form-group"
              style={{
                marginTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
              }}
            >
              <label>Sua Avaliação (opcional)</label>
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Resenha / Notas Pessoais</label>
              <textarea
                id="review"
                rows="3"
                value={formData.review}
                onChange={handleInputChange}
                placeholder="O que você achou do livro?"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Descrição do livro (opcional)</label>
              <textarea
                id="descricao"
                rows="3"
                value={formData.descricao}
                onChange={handleInputChange}
                placeholder="Sinopse, resumo ou descrição geral."
              ></textarea>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Salvar
              </button>
            </div>
          </form>
        ) : (
          <div className="tab-content active">
            <div className="form-group">
              <label>ISBN</label>
              <div className="isbn-input-group">
                <input
                  id="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="Ex: 978..."
                />
                <button
                  type="button"
                  className="btn-scan"
                  onClick={onFetchISBN}
                >
                  🔍
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Informe o ISBN e clique na lupa para buscar título, autor, ano, editora e capa automaticamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookFormModal;
