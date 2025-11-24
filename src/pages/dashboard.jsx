import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Logo from '../assets/img/livro.png';
import '../assets/css/dashboard.css';

const API_BASE = 'http://localhost/app-catalogo-livros-tsi/api';

const Dashboard = () => {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

  // --- ESTADOS DE DADOS ---
  const [libraryData, setLibraryData] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const [detailReview, setDetailReview] = useState(null);
  
  // NOVO ESTADO: Usado para checar se a avaliação/comentário foi modificado no modal de detalhes
  const [initialDetailReview, setInitialDetailReview] = useState(null); 

  // modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

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
    descricao: '',
    url_capa: '',
  };
  const [formData, setFormData] = useState(initialForm);

  // --- EFFECTS ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    const fetchLivros = async () => {
      if (!usuarioLogado || !usuarioLogado.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/livros?usuario_id=${encodeURIComponent(usuarioLogado.id)}`
        );

        if (!res.ok) {
          await handleApiError(res, 'Erro ao carregar livros.');
        }

        const data = await res.json();

        // data é um array de livros no formato do backend
        const categoriasMap = {};
        data.forEach((livro) => {
          const categoria =
            livro.categoria && livro.categoria.trim().length > 0
              ? livro.categoria
              : 'Sem categoria';

          if (!categoriasMap[categoria]) {
            categoriasMap[categoria] = [];
          }

          categoriasMap[categoria].push({
            id: livro.id,
            title: livro.titulo,
            author: livro.autor,
            isbn: livro.isbn || '',
            year: livro.data_publicacao
              ? new Date(livro.data_publicacao).getFullYear()
              : '',
            publisher: livro.editora || '',
            status: livro.status || 'none',
            rating: livro.avaliacao || 0,
            review: livro.resenha || '',
            url_capa: livro.url_capa || '',
            descricao: livro.descricao || '',
          });
        });

        const categoriasArray = Object.keys(categoriasMap).map((cat) => ({
          category: cat,
          books: categoriasMap[cat],
        }));

        setLibraryData(categoriasArray);
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
        toast.error(error.message || 'Erro ao buscar livros.');
      } finally {
        setLoading(false);
      }
    };

    fetchLivros();
  }, [usuarioLogado]);

  // --- HELPERS ---
  const getCover = (isbn, url_capa) => {
    if (url_capa) return url_capa;
    if (isbn)
      return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    return 'https://placehold.co/200x300?text=Capa';
  };

  const formatStatus = (s) => {
    const map = {
      'para-ler': 'Para Ler',
      lendo: 'Lendo',
      lido: 'Lido',
      none: '',
    };
    return map[s] || '';
  };

  const toggleTheme = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    document.body.classList.toggle('dark-mode', newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const field = id === 'genre' ? 'genre' : id;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const scrollContainer = (id, dir) => {
    const container = document.getElementById(id);
    if (container)
      container.scrollBy({
        left: dir === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
  };

  const handleApiError = async (res, defaultMessage = 'Erro na requisição.') => {
    let errorMessage = defaultMessage;

    try {
      const contentType = res.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        const data = await res.json();

        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) errorMessage = data[firstKey];
        }
      } else {
        const text = await res.text();
        if (text) {
          errorMessage = text.substring(0, 200);
        }
      }
    } catch (e) {
      console.error('Erro ao tratar resposta da API:', e);
    }

    throw new Error(errorMessage);
  };

  // --- AÇÕES (CRUD) ---

  /**
   * Busca a avaliação do usuário para um livro específico
   * (GET /avaliacoes/livro/id)
   */
  const fetchBookReview = async (livroId) => {
    if (!livroId || !usuarioLogado?.id) return { nota: 0, comentario: '', id: null };

    try {
      const res = await fetch(
        `${API_BASE}/avaliacoes/livro/${livroId}?usuario_id=${encodeURIComponent(
          usuarioLogado.id
        )}`
      );

      if (res.status === 404) {
        return { nota: 0, comentario: '', id: null };
      }

      if (!res.ok) {
        await handleApiError(res, 'Erro ao carregar avaliação.');
      }

      const data = await res.json();
      return {
        id: data.id,
        nota: data.nota || 0,
        comentario: data.comentario || '',
      };
    } catch (error) {
      console.error('Erro ao buscar avaliação do livro:', error);
      toast.error(error.message || 'Erro ao buscar avaliação.');
      return { nota: 0, comentario: '', id: null };
    }
  };


  /**
   * Salva ou atualiza a avaliação (nota e comentário)
   * (POST /avaliacoes ou PUT /avaliacoes/{id})
   */
  const saveReview = async (newRating, newReview, livroId, reviewId) => {
    if (!usuarioLogado || !livroId) return;
    
    // PONTO CORRIGIDO: Só faz a requisição se houver nota ou comentário
    if (!newRating && !newReview) return; 

    const isEdit = !!reviewId;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `${API_BASE}/avaliacoes/${reviewId}`
      : `${API_BASE}/avaliacoes`;

    const payload = {
      livro_id: livroId,
      usuario_id: usuarioLogado.id,
      nota: newRating || null,
      comentario: newReview || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        await handleApiError(res, 'Erro ao salvar avaliação.');
      }

      const savedReview = await res.json();
      toast.success(isEdit ? 'Avaliação atualizada!' : 'Avaliação salva!');

      // Atualiza o livro na lista principal para refletir a nova nota/resenha
      setLibraryData((prevData) =>
        prevData.map((cat) => ({
          ...cat,
          books: cat.books.map((b) =>
            b.id === livroId
              ? {
                  ...b,
                  rating: savedReview.nota,
                  review: savedReview.comentario,
                }
              : b
          ),
        }))
      );
      
      return savedReview; // Retorna a avaliação salva para uso imediato
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error(error.message || 'Erro ao salvar avaliação.');
    }
  };
  
  // Função para abrir o modal de formulário (manual ou ISBN)
  const openForm = (book = null, catName = '') => {
    if (book) {
      setFormData({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        year: book.year || '',
        publisher: book.publisher || '',
        genre: catName || book.categoryName || '',
        status: book.status || 'none',
        rating: book.rating || 0,
        review: book.review || '',
        descricao: book.descricao || '',
        url_capa: book.url_capa || '',
      });
    } else {
      setFormData(initialForm);
    }
    setActiveTab('manual');
    setActiveModal('form');
  };

  // Função para abrir o modal de detalhes e busca a avaliação
  const openDetailsModal = async (book, categoryName) => {
    setDetailReview(null); // Limpa o estado enquanto carrega
    setDetailBook({
      ...book,
      categoryName,
    });
    setActiveModal('details');

    // Busca a avaliação assim que o modal é aberto
    const review = await fetchBookReview(book.id);
    setDetailReview(review);
    setInitialDetailReview(review); // Salva o estado inicial
  };


  const fetchISBN = async () => {
    const rawIsbn = formData.isbn.replace(/-/g, '').trim();
    if (rawIsbn.length < 10) {
      return toast.error('ISBN inválido');
    }

    try {
      const res = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${rawIsbn}&jscmd=data&format=json`
      );
      const data = await res.json();
      const info = data[`ISBN:${rawIsbn}`];

      if (info) {
        const capa =
          info.cover?.large ||
          info.cover?.medium ||
          info.cover?.small ||
          `https://covers.openlibrary.org/b/isbn/${rawIsbn}-L.jpg`;

        setFormData((prev) => ({
          ...prev,
          title: info.title || prev.title,
          author: info.authors?.[0]?.name || prev.author,
          publisher: info.publishers?.[0]?.name || prev.publisher,
          year: info.publish_date
            ? info.publish_date.split(' ').pop()
            : prev.year,
          url_capa: capa,
          isbn: rawIsbn,
        }));

        setActiveTab('manual');
        toast.success('Dados do ISBN encontrados!');
      } else {
        toast.warn('Livro não encontrado por esse ISBN.');
      }
    } catch (error) {
      console.error('Erro ao consultar ISBN:', error);
      toast.error('Erro ao consultar ISBN.');
    }
  };

  const saveBook = async (e) => {
    e.preventDefault();

    if (!usuarioLogado || !usuarioLogado.id) {
      toast.error('Usuário não encontrado. Faça login novamente.');
      return;
    }

    if (!formData.isbn || formData.isbn.replace(/-/g, '').trim().length < 10) {
      toast.error('Informe um ISBN válido (mínimo 10 dígitos).');
      return;
    }

    const isEdit = !!formData.id;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `${API_BASE}/livros/${formData.id}`
      : `${API_BASE}/livros`;

    const payload = {
      titulo: formData.title,
      autor: formData.author,
      isbn: formData.isbn.replace(/-/g, '').trim(),
      usuario_id: usuarioLogado.id,
      editora: formData.publisher || null,
      data_publicacao: formData.year
        ? `${formData.year}-01-01`
        : null,
      url_capa: formData.url_capa || null,
      descricao: formData.descricao || null,
      categoria: formData.genre || null,
      status: formData.status === 'none' ? null : formData.status,
      // Removidos: avaliacao e resenha, pois agora são tratadas pela rota /avaliacoes
    };
    
    let livroSalvo;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        await handleApiError(res, 'Erro ao salvar livro.');
      }

      livroSalvo = await res.json();
      toast.success(isEdit ? 'Livro atualizado!' : 'Livro cadastrado!');

    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      toast.error(error.message || 'Erro ao salvar livro.');
      return;
    }

    // PONTO CORRIGIDO: Integração com saveReview após salvar o livro
    const livroId = livroSalvo.id || formData.id;
    const rating = formData.rating;
    const review = formData.review;
    
    if (rating > 0 || review) {
        // Busca a avaliação existente para saber se é PUT ou POST
        const existingReview = await fetchBookReview(livroId);

        // Não precisa esperar o saveReview bloquear o fluxo principal
        saveReview(rating, review, livroId, existingReview.id);
    }

    const normalizedBook = {
        id: livroId,
        title: livroSalvo.titulo,
        author: livroSalvo.autor,
        isbn: livroSalvo.isbn || '',
        year: livroSalvo.data_publicacao
          ? new Date(livroSalvo.data_publicacao).getFullYear()
          : '',
        publisher: livroSalvo.editora || '',
        status: livroSalvo.status || 'none',
        // Usa os valores do form para garantir atualização imediata na lista
        rating: rating || 0, 
        review: review || '', 
        url_capa: livroSalvo.url_capa || '',
        descricao: livroSalvo.descricao || '',
      };

      const catName =
        livroSalvo.categoria && livroSalvo.categoria.trim().length > 0
          ? livroSalvo.categoria
          : formData.genre || 'Sem categoria';

      setLibraryData((prev) => {
        let data = [...prev];

        if (isEdit) {
          // Remove a versão antiga do livro de onde ela estava
          data = data
            .map((c) => ({
              ...c,
              books: c.books.filter((b) => b.id !== normalizedBook.id),
            }))
            .filter((c) => c.books.length > 0);
        }

        const catIndex = data.findIndex(
          (c) => c.category.toLowerCase() === catName.toLowerCase()
        );

        if (catIndex >= 0) {
          // Adiciona o livro atualizado/novo na categoria correta
          data[catIndex].books.push(normalizedBook);
        } else {
          // Cria uma nova categoria se necessário
          data.push({ category: catName, books: [normalizedBook] });
        }

        return data;
      });

    setActiveModal(null);
    setFormData(initialForm);
  };

  const deleteBook = async () => {
    if (!bookToDelete) return;

    const id = bookToDelete.id;

    try {
      const res = await fetch(`${API_BASE}/livros/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        await handleApiError(res, 'Erro ao excluir livro.');
      }

      // 204 No Content → não tenta res.json()

      setLibraryData((prev) =>
        prev
          .map((category) => ({
            ...category,
            books: category.books.filter((book) => book.id !== id),
          }))
          .filter((category) => category.books.length > 0)
      );

      toast.success('Livro excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir livro:', error);
      toast.error(error.message || 'Erro ao excluir livro.');
    } finally {
      setDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  // --- FILTROS ---
  const allCategories = libraryData.map((c) => c.category);

  const filteredData = libraryData
    .map((cat) => {
      if (filterCategory && cat.category !== filterCategory) return null;

      const books = cat.books.filter((b) => {
        const matchSearch =
          b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = !filterStatus || b.status === filterStatus;
        return matchSearch && matchStatus;
      });

      return books.length > 0 ? { ...cat, books } : null;
    })
    .filter(Boolean);

  const totalBooks = filteredData.reduce(
    (acc, c) => acc + c.books.length,
    0
  );
  
  // Função para salvar e fechar o modal de detalhes
  const handleSaveAndCloseDetails = async () => {
      if (!detailReview || !detailBook || !initialDetailReview) {
          setActiveModal(null);
          return;
      }
      
      const newRating = detailReview.nota;
      const newReview = detailReview.comentario;
      
      const isRatingChanged = newRating !== initialDetailReview.nota;
      const isReviewChanged = newReview !== initialDetailReview.comentario;
      
      // PONTO CORRIGIDO: Checa se houve alteração antes de salvar
      if (isRatingChanged || isReviewChanged) {
          await saveReview(
            newRating,
            newReview,
            detailBook.id,
            initialDetailReview.id
          );
      }
      
      setActiveModal(null);
      setInitialDetailReview(null);
  }

  // --- RENDER ---
  if (loading) {
    return (
      <div className="dashboard-container">
        <p style={{ padding: '2rem', textAlign: 'center' }}>
          Carregando seus livros...
        </p>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isDark ? 'dark-mode' : ''}`}>
      {/* NAVBAR */}
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    usuarioLogado?.nome || 'User'
                  )}&background=0071e3&color=fff`}
                  alt="User"
                />
              </div>
              {userMenuOpen && (
                <div className="user-menu show">
                  <div className="user-info">
                    <strong>{usuarioLogado?.nome}</strong>
                    <br />
                    <span>{usuarioLogado?.email}</span>
                  </div>
                  <hr />
                  <button
                    className="btn-logout"
                    onClick={() => {window.localStorage.removeItem('usuario');window.location = '/'}}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* FILTER BAR */}
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
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas as Categorias</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
        <span className="result-count">
          {totalBooks} livros encontrados
        </span>
      </div>

      {/* MAIN CONTENT */}
      <main id="app">
        {filteredData.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem',
              color: 'var(--text-muted)',
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
                    setExpandedCategories((p) => ({
                      ...p,
                      [index]: !p[index],
                    }))
                  }
                >
                  {expandedCategories[index]
                    ? 'Ver menos'
                    : 'Ver tudo'}
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
                    onClick={() =>
                      scrollContainer(`track-${index}`, 'left')
                    }
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
                  {data.books.map((book) => (
                    <article
                      className="book-card"
                      key={book.id}
                      onClick={() => {
                        openDetailsModal(book, data.category);
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openForm(book, data.category);
                          }}
                        >
                          ✎
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookToDelete({
                              ...book,
                              categoryName: data.category,
                            });
                            setDeleteModalOpen(true);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                      <div className="cover-container">
                        <img
                          src={getCover(book.isbn, book.url_capa)}
                          className="book-cover"
                          loading="lazy"
                          alt="Capa"
                        />
                      </div>
                      <div className="book-info">
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                        <div className="card-rating">
                          {[1, 2, 3, 4, 5].map((i) => (
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
                    onClick={() =>
                      scrollContainer(`track-${index}`, 'right')
                    }
                  >
                    ❯
                  </button>
                )}
              </div>
            </section>
          ))
        )}
      </main>

      {/* MODAL FORM (CREATE/EDIT) */}
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
                className={`tab-btn ${
                  activeTab === 'isbn' ? 'active' : ''
                }`}
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
                    Use a aba &quot;ISBN&quot; para buscar os dados
                    automaticamente.
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
                        className={`star ${
                          star <= formData.rating ? 'active' : ''
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            rating:
                              prev.rating === star ? 0 : star,
                          }))
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
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  Informe o ISBN e clique na lupa para buscar título,
                  autor, ano, editora e capa automaticamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALHES (AGORA EDITÁVEL PARA AVALIAÇÃO) */}
      {activeModal === 'details' && detailBook && (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target.className.includes('modal-overlay')) {
              handleSaveAndCloseDetails(); // Chama a função que verifica e salva
            }
          }}
        >
          <div className="modal-content details-view">
            <button
              className="close-btn"
              style={{ position: 'absolute', top: 15, right: 15 }}
              onClick={handleSaveAndCloseDetails} // Chama a função que verifica e salva
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
                    onClick={() =>
                      openForm(detailBook, detailBook.categoryName)
                    }
                  >
                    Editar Livro (Dados Gerais)
                  </button>
                </div>
              </div>
              <div className="details-right">
                <h1>{detailBook.title}</h1>
                <p className="detail-author">{detailBook.author}</p>
                
                {/* AVALIAÇÃO - AGORA EDITÁVEL */}
                <div className="review-box" style={{ marginTop: '1.5rem' }}>
                    <h3>Sua Avaliação</h3>
                    <div className="star-rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${
                          // Usa detailReview.nota para controlar o estado da estrela
                          star <= (detailReview?.nota || 0) ? 'active' : ''
                        }`}
                        onClick={() =>
                          setDetailReview((prev) => ({
                            ...prev,
                            nota:
                              prev.nota === star ? 0 : star,
                          }))
                        }
                        style={{cursor: 'pointer'}}
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
                
                {/* RESENHA - AGORA EDITÁVEL */}
                <div className="review-box">
                  <h3>Resenha / Notas Pessoais</h3>
                  {detailReview === null ? (
                    <p>Carregando resenha...</p>
                  ) : (
                    <textarea
                      rows="4"
                      value={detailReview.comentario}
                      onChange={(e) =>
                        setDetailReview((prev) => ({
                          ...prev,
                          comentario: e.target.value,
                        }))
                      }
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
                      saveReview(
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
      )}

      {/* MODAL CONFIRMAÇÃO EXCLUSÃO */}
      {deleteModalOpen && bookToDelete && (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target.className.includes('modal-overlay')) {
              setDeleteModalOpen(false);
              setBookToDelete(null);
            }
          }}
        >
          <div className="modal-content small">
            <div className="modal-header">
              <h2>Excluir livro</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setBookToDelete(null);
                }}
              >
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
              <button
                className="btn-secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setBookToDelete(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn-danger" onClick={deleteBook}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;