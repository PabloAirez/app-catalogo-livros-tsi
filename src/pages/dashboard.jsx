import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Logo from '../assets/img/livro.png'; 
import '../assets/css/dashboard.css';

const API_BASE = 'http://localhost/app-catalogo-livros-tsi/api';

const Dashboard = () => {
  const [libraryData, setLibraryData] = useState([]);
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

  // --- ESTADOS DE UI ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // --- MODAIS E FORMS ---
  const [activeModal, setActiveModal] = useState(null); // 'form', 'details' ou null
  const [activeTab, setActiveTab] = useState('manual');
  const [detailBook, setDetailBook] = useState(null);

  const initialForm = {
    id: '',
    title: '',
    author: '',
    isbn: '',
    year: '',
    publisher: '',
    genre: '',
    status: 'none',
    rating: 0,
    review: '',
    coverUrl: '',
    descricao: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // --- HELPERS ---

  const getCover = (livro) => {
    // prioridade: url vinda do backend, depois ISBN, depois placeholder
    if (livro.url_capa) return livro.url_capa;
    if (livro.isbn) {
      const isbnClean = livro.isbn.replace(/-/g, '').trim();
      return `https://covers.openlibrary.org/b/isbn/${isbnClean}-L.jpg`;
    }
    return 'https://placehold.co/200x300?text=Capa';
  };

  const formatStatus = (s) => {
    const map = { 'para-ler': 'Para Ler', 'lendo': 'Lendo', 'lido': 'Lido', 'none': '' };
    return map[s] || '';
  };

  const handleApiError = async (res, defaultMessage = 'Erro na requisição.') => {
    let errorMessage = defaultMessage;
    try {
      const data = await res.json();
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.message) {
        errorMessage = data.message;
      } else {
        const firstKey = Object.keys(data)[0];
        if (firstKey) errorMessage = data[firstKey];
      }
    } catch {
      // mantém mensagem padrão
    }
    throw new Error(errorMessage);
  };

  // --- EFEITOS ---

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/livros?usuario_id=${usuarioLogado.id}`
        );

        if (!res.ok) {
          await handleApiError(res, 'Erro ao carregar seus livros.');
        }

        const data = await res.json();
        // data esperado: array de livros simples (sem categoria)
        // Vamos agrupar por "editora" ou "categoria fictícia"? 
        // Como não há categoria no backend, vamos agrupar em uma única categoria "Minha Biblioteca"
        // Se depois o backend tiver campo categoria/gênero, dá pra agrupar por ele.

        const categoryName = 'Minha Biblioteca';
        const books = data.map(livro => ({
          id: livro.id,
          title: livro.titulo,
          author: livro.autor,
          isbn: livro.isbn,
          year: livro.data_publicacao ? new Date(livro.data_publicacao).getFullYear() : '',
          publisher: livro.editora,
          status: livro.status || 'none', // se backend não tiver status, caímos em 'none'
          rating: livro.avaliacao || 0,
          review: livro.resenha || '',
          url_capa: livro.url_capa,
          descricao: livro.descricao || ''
        }));

        setLibraryData([
          {
            category: categoryName,
            books
          }
        ]);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Erro inesperado ao carregar seus livros.');
      }
    };

    if (usuarioLogado?.id) {
      fetchBooks();
    }
  }, [usuarioLogado]);

  // --- AÇÕES ---

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    document.body.classList.toggle('dark-mode', newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const field = id === 'genre' ? 'genre' : id;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openForm = (book = null, catName = '') => {
    if (book) {
      setFormData({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        year: book.year || '',
        publisher: book.publisher || '',
        genre: catName,
        status: book.status || 'none',
        rating: book.rating || 0,
        review: book.review || '',
        coverUrl: book.url_capa || '',
        descricao: book.descricao || ''
      });
    } else {
      setFormData(initialForm);
    }
    setActiveTab('manual');
    setActiveModal('form');
  };

  const deleteBook = (id) => {
    if (window.confirm('Excluir este livro?')) {
      // Aqui só removemos do front.
      // Se quiser, depois liga com DELETE na API.
      setLibraryData(prev =>
        prev
          .map(c => ({
            ...c,
            books: c.books.filter(b => b.id !== id)
          }))
          .filter(c => c.books.length > 0)
      );
      toast.error('Livro excluído (apenas no frontend por enquanto).');
    }
  };

  const fetchISBN = async () => {
    const isbn = formData.isbn.replace(/-/g, '').trim();
    if (isbn.length < 10) return toast.error('ISBN inválido');
    try {
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
      );
      const data = await res.json();
      const info = data[`ISBN:${isbn}`];
      if (info) {
        const coverUrl =
          info.cover?.large ||
          info.cover?.medium ||
          info.cover?.small ||
          `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

        setFormData(prev => ({
          ...prev,
          title: info.title || prev.title || '',
          author: info.authors?.[0]?.name || prev.author || '',
          publisher: info.publishers?.[0]?.name || prev.publisher || '',
          year: info.publish_date
            ? info.publish_date.split(' ').pop()
            : prev.year || '',
          coverUrl
        }));
        setActiveTab('manual');
        toast.success('Dados encontrados pelo ISBN!');
      } else toast.warn('Livro não encontrado.');
    } catch {
      toast.error('Erro de conexão na busca de ISBN.');
    }
  };

  const saveBook = async (e) => {
    e.preventDefault();

    const normalizedIsbn = formData.isbn
      ? formData.isbn.replace(/-/g, '').trim()
      : null;

    const payload = {
      titulo: formData.title,
      autor: formData.author,
      isbn: normalizedIsbn,
      usuario_id: usuarioLogado.id,
      editora: formData.publisher || null,
      data_publicacao: formData.year ? `${formData.year}-01-01` : null,
      url_capa:
        formData.coverUrl ||
        (normalizedIsbn
          ? `https://covers.openlibrary.org/b/isbn/${normalizedIsbn}-L.jpg`
          : null),
      descricao: formData.descricao || null,
      avaliacao: formData.rating || null
    };

    try {
      const res = await fetch(`${API_BASE}/livros`, {
        method: formData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        await handleApiError(res, 'Erro ao salvar livro.');
      }

      const livroSalvo = await res.json();

      const newBook = {
        id: livroSalvo.id || formData.id || Date.now(),
        title: livroSalvo.titulo || formData.title,
        author: livroSalvo.autor || formData.author,
        isbn: livroSalvo.isbn || normalizedIsbn,
        year: livroSalvo.data_publicacao
          ? new Date(livroSalvo.data_publicacao).getFullYear()
          : formData.year,
        publisher: livroSalvo.editora || formData.publisher,
        status: livroSalvo.status || formData.status || 'none',
        rating: livroSalvo.avaliacao || formData.rating || 0,
        review: livroSalvo.resenha || formData.review || '',
        url_capa: livroSalvo.url_capa || payload.url_capa,
        descricao: livroSalvo.descricao || formData.descricao || ''
      };

      setLibraryData(prev => {
        const data = [...prev];
        const categoryName = data[0]?.category || 'Minha Biblioteca';

        // se estiver editando, remove o antigo
        if (formData.id) {
          data.forEach(c => {
            c.books = c.books.filter(b => b.id !== formData.id);
          });
        }

        if (data.length === 0) {
          data.push({ category: categoryName, books: [newBook] });
        } else {
          data[0].books.push(newBook);
        }

        return data;
      });

      toast.success(formData.id ? 'Livro atualizado!' : 'Livro cadastrado!');
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Erro inesperado ao salvar livro.');
    }
  };

  const scrollContainer = (id, dir) => {
    const container = document.getElementById(id);
    if (container)
      container.scrollBy({
        left: dir === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
  };

  // --- FILTROS ---

  const allCategories = libraryData.map(c => c.category);
  const filteredData = libraryData
    .map(cat => {
      if (filterCategory && cat.category !== filterCategory) return null;
      const books = cat.books.filter(b => {
        return (
          (b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (!filterStatus || b.status === filterStatus)
        );
      });
      return books.length > 0 ? { ...cat, books } : null;
    })
    .filter(Boolean);

  const totalBooks = filteredData.reduce((acc, c) => acc + c.books.length, 0);

  // ================= RETORNO JSX =================

  return (
    <div className={`dashboard-container ${isDark ? 'dark-mode' : ''}`}>
      {/* 1. NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <span className="logo">
            <img src={Logo} width="60px" alt="Logo" />
          </span>
          <div className="search-wrapper">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              ></line>
            </svg>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="nav-actions">
            <button className="btn-primary" onClick={() => openForm()}>
              + Novo Livro
            </button>
            <button className="theme-btn" onClick={toggleTheme}>
              {isDark ? (
                <svg
                  className="icon-sun"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 2V4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 20V22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.92969 4.92969L6.34969 6.34969"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.6484 17.6484L19.0684 19.0684"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12H4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 12H22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.34969 17.6484L4.92969 19.0684"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.0684 4.92969L17.6484 6.34969"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            <div className="user-dropdown-container">
              <div
                className="user-avatar"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${usuarioLogado.nome}&background=0071e3&color=fff`}
                  alt="User"
                />
              </div>
              {userMenuOpen && (
                <div className="user-menu show">
                  <div className="user-info">
                    <strong>{usuarioLogado.nome}</strong>
                    <br />
                    <span>{usuarioLogado.email}</span>
                  </div>
                  <hr />
                  <button
                    className="btn-logout"
                    onClick={() => window.location.reload()}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. BARRA DE FILTROS */}
      <div className="filter-bar">
        <div className="filter-container">
          <span className="filter-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filtrar:
          </span>
          <select
            className="filter-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">Todas as Categorias</option>
            {allCategories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="para-ler">Para Ler</option>
            <option value="lendo">Lendo</option>
            <option value="lido">Lido</option>
          </select>
          {(searchTerm || filterCategory || filterStatus) && (
            <button
              className="btn-clear"
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterStatus('');
              }}
            >
              Limpar
            </button>
          )}
        </div>
        <span className="result-count">{totalBooks} livros encontrados</span>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <main id="app">
        {filteredData.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem',
              color: 'var(--text-muted)'
            }}
          >
            <h3>Nenhum livro encontrado</h3>
          </div>
        ) : (
          filteredData.map((data, index) => (
            <section className="category-section" key={index}>
              <div className="section-header">
                <h2 className="section-title">{data.category}</h2>
                <button
                  className="view-all-btn"
                  onClick={() =>
                    setExpandedCategories(p => ({
                      ...p,
                      [index]: !p[index]
                    }))
                  }
                >
                  {expandedCategories[index] ? 'Ver menos' : 'Ver tudo'}
                </button>
              </div>

              <div
                className={`carousel-wrapper ${
                  expandedCategories[index] ? 'expanded' : ''
                }`}
                id={`wrapper-${index}`}
              >
                {!expandedCategories[index] && (
                  <button
                    className="nav-btn prev"
                    onClick={() => scrollContainer(`track-${index}`, 'left')}
                  >
                    ❮
                  </button>
                )}

                <div
                  id={`track-${index}`}
                  className={`carousel-track ${
                    expandedCategories[index] ? 'grid-view' : ''
                  }`}
                >
                  {data.books.map(book => (
                    <article
                      className="book-card"
                      key={book.id}
                      onClick={() => {
                        setDetailBook({
                          ...book,
                          categoryName: data.category
                        });
                        setActiveModal('details');
                      }}
                    >
                      {book.status && book.status !== 'none' && (
                        <span
                          className={`status-badge status-${book.status}`}
                        >
                          {formatStatus(book.status)}
                        </span>
                      )}
                      <div className="card-actions">
                        <button
                          className="action-btn"
                          onClick={e => {
                            e.stopPropagation();
                            openForm(book, data.category);
                          }}
                        >
                          ✎
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={e => {
                            e.stopPropagation();
                            deleteBook(book.id);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                      <div className="cover-container">
                        <img
                          src={getCover(book)}
                          className="book-cover"
                          loading="lazy"
                          alt="Capa"
                        />
                      </div>
                      <div className="book-info">
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                        <div className="card-rating">
                          {[1, 2, 3, 4, 5].map(i => (
                            <span
                              key={i}
                              className={i <= book.rating ? '' : 'empty-star'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {!expandedCategories[index] && (
                  <button
                    className="nav-btn next"
                    onClick={() => scrollContainer(`track-${index}`, 'right')}
                  >
                    ❯
                  </button>
                )}
              </div>
            </section>
          ))
        )}
      </main>

      {/* MODAL FORMULÁRIO (CRIAÇÃO/EDIÇÃO) */}
      {activeModal === 'form' && (
        <div className="modal-overlay open">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{formData.id ? 'Editar' : 'Adicionar'}</h2>
              <button
                className="close-btn"
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>

            <div className="modal-tabs">
              <button
                className={`tab-btn ${
                  activeTab === 'manual' ? 'active' : ''
                }`}
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
              <form onSubmit={saveBook}>
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
                  <label>ISBN</label>
                  <input
                    id="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: 9780132350884"
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
                      {allCategories.map(c => (
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
                  <label>Descrição</label>
                  <textarea
                    id="descricao"
                    rows="3"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Descrição do livro (opcional)"
                  />
                </div>

                <div
                  className="form-group"
                  style={{
                    marginTop: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1rem'
                  }}
                >
                  <label>Sua Avaliação</label>
                  <div className="star-rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`star ${
                          star <= formData.rating ? 'active' : ''
                        }`}
                        onClick={() =>
                          setFormData(prev => ({ ...prev, rating: star }))
                        }
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

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveModal(null)}
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
                      onClick={fetchISBN}
                    >
                      🔍
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALHES (VISUALIZAÇÃO) */}
      {activeModal === 'details' && detailBook && (
        <div
          className="modal-overlay open"
          onClick={e => {
            if (e.target.className.includes('modal-overlay')) {
              setActiveModal(null);
            }
          }}
        >
          <div className="modal-content details-view">
            <div className="details-grid">
              <div className="details-left">
                <img
                  src={getCover(detailBook)}
                  className="detail-cover-img"
                  alt="Capa"
                />
                {detailBook.status !== 'none' && (
                  <span
                    className={`status-badge status-${detailBook.status}`}
                    style={{
                      position: 'relative',
                      marginTop: 10,
                      display: 'inline-block'
                    }}
                  >
                    {formatStatus(detailBook.status)}
                  </span>
                )}
              </div>
              <div className="details-right">
                <h1>{detailBook.title}</h1>
                <p className="detail-author">{detailBook.author}</p>
                <div className="detail-rating">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span
                      key={i}
                      style={{
                        color: i <= detailBook.rating ? '#f59e0b' : '#d1d5db'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <div className="review-box">
                  <h3>Resenha</h3>
                  <p>{detailBook.review || 'Nenhuma resenha adicionada.'}</p>
                </div>

                {detailBook.descricao && (
                  <div className="review-box">
                    <h3>Descrição</h3>
                    <p>{detailBook.descricao}</p>
                  </div>
                )}

                <div className="details-actions">
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      openForm(detailBook, detailBook.categoryName)
                    }
                  >
                    Editar Informações
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
