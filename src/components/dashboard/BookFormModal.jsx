import React, { useState } from 'react';

const BookFormModal = ({
  isOpen,
  formData,
  allCategories,
  categoriasIdMap,
  allListas,
  listasIdMap,
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

            <div className="form-group">
              <label>Categorias</label>
              <div className="categories-selector">
                {allCategories.map((catName) => {
                  const catId = categoriasIdMap[catName];
                  return (
                    <label key={catName} className="category-checkbox">
                      <input
                        type="checkbox"
                        value={catId}
                        checked={
                          formData.categories
                            ? formData.categories.some(cat => 
                                (typeof cat === 'number' ? cat === catId : cat.id === catId)
                              )
                            : false
                        }
                        onChange={(e) => {
                          const newCategories = formData.categories || [];
                          const catIdNum = parseInt(catId);
                          
                          if (e.target.checked) {
                            // Adicionar categoria se não existir
                            if (!newCategories.some(c => 
                              (typeof c === 'number' ? c === catIdNum : c.id === catIdNum)
                            )) {
                              onFormChange('categories', [...newCategories, catIdNum]);
                            }
                          } else {
                            // Remover categoria
                            onFormChange(
                              'categories',
                              newCategories.filter(c => 
                                !(typeof c === 'number' ? c === catIdNum : c.id === catIdNum)
                              )
                            );
                          }
                        }}
                      />
                      <span>{catName}</span>
                    </label>
                  );
                })}
              </div>
              <small style={{ opacity: 0.7, display: 'block', marginTop: '0.5rem' }}>
                Selecione uma ou mais categorias para este livro
              </small>
            </div>

            <div className="form-group">
              <label>Listas</label>
              <div className="categories-selector">
                {allListas && allListas.length > 0 ? (
                  allListas.map((listaName) => {
                    const listaId = listasIdMap[listaName];
                    return (
                      <label key={listaName} className="category-checkbox">
                        <input
                          type="checkbox"
                          value={listaId}
                          checked={
                            formData.listas
                              ? formData.listas.some(lst => 
                                  (typeof lst === 'number' ? lst === listaId : lst.id === listaId)
                                )
                              : false
                          }
                          onChange={(e) => {
                            const newListas = formData.listas || [];
                            const listaIdNum = parseInt(listaId);
                            
                            if (e.target.checked) {
                              // Adicionar lista se não existir
                              if (!newListas.some(l => 
                                (typeof l === 'number' ? l === listaIdNum : l.id === listaIdNum)
                              )) {
                                onFormChange('listas', [...newListas, listaIdNum]);
                              }
                            } else {
                              // Remover lista
                              onFormChange(
                                'listas',
                                newListas.filter(l => 
                                  !(typeof l === 'number' ? l === listaIdNum : l.id === listaIdNum)
                                )
                              );
                            }
                          }}
                        />
                        <span>{listaName}</span>
                      </label>
                    );
                  })
                ) : (
                  <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Nenhuma lista disponível</p>
                )}
              </div>
              <small style={{ opacity: 0.7, display: 'block', marginTop: '0.5rem' }}>
                Selecione uma ou mais listas para este livro (ex: "Para ler", "Favoritos")
              </small>
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
