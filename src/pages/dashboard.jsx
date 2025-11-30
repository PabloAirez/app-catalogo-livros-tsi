import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CategoryManager from '../components/CategoryManager';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import FilterBar from '../components/dashboard/FilterBar';
import CategorySection from '../components/dashboard/CategorySection';
import BookFormModal from '../components/dashboard/BookFormModal';
import BookDetailsModal from '../components/dashboard/BookDetailsModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';
import '../assets/css/dashboard.css';

const API_BASE = 'http://localhost/app-catalogo-livros-tsi/api';

const Dashboard = () => {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

  // --- ESTADOS DE DADOS ---
  const [libraryData, setLibraryData] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE UI ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // --- MODAIS E FORMS ---
  const [activeModal, setActiveModal] = useState(null);
  const [detailBook, setDetailBook] = useState(null);
  const [detailReview, setDetailReview] = useState(null);
  const [initialDetailReview, setInitialDetailReview] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

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

    const fetchCategories = async () => {
      if (!usuarioLogado?.id) return;
      try {
        const res = await fetch(`${API_BASE}/categorias?usuario_id=${usuarioLogado.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserCategories(data);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
    fetchLivros();
  }, []);

  // --- HELPERS ---
  const getCover = (isbn, url_capa) => {
    if (url_capa) return url_capa;
    if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
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

  const saveReview = async (newRating, newReview, livroId, reviewId) => {
    if (!usuarioLogado || !livroId) return;

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

      return savedReview;
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error(error.message || 'Erro ao salvar avaliação.');
    }
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
    setActiveModal('form');
  };

  const openDetailsModal = async (book, categoryName) => {
    setDetailReview(null);
    setDetailBook({
      ...book,
      categoryName,
    });
    setActiveModal('details');

    const review = await fetchBookReview(book.id);
    setDetailReview(review);
    setInitialDetailReview(review);
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

    const livroId = livroSalvo.id || formData.id;
    const rating = formData.rating;
    const review = formData.review;

    if (rating > 0 || review) {
      const existingReview = await fetchBookReview(livroId);
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
        data[catIndex].books.push(normalizedBook);
      } else {
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
  const bookCategories = libraryData.map((c) => c.category);
  const dbCategories = userCategories.map(c => c.nome);
  const allCategories = [...new Set([...bookCategories, ...dbCategories])].sort();

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

  const handleSaveAndCloseDetails = async () => {
    if (!detailReview || !detailBook || !initialDetailReview) {
      setActiveModal(null);
      return;
    }

    const newRating = detailReview.nota;
    const newReview = detailReview.comentario;

    const isRatingChanged = newRating !== initialDetailReview.nota;
    const isReviewChanged = newReview !== initialDetailReview.comentario;

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
  };

  const handleFormInputChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleReviewChange = (field, value) => {
    setDetailReview((prev) => ({ ...prev, [field]: value }));
  };

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
      <DashboardNavbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewBook={() => openForm()}
        onCategoriesClick={() => setCategoryModalOpen(true)}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        usuarioLogado={usuarioLogado}
        onLogout={() => {
          window.localStorage.removeItem('usuario');
          window.location = '/';
        }}
        userMenuOpen={userMenuOpen}
        onUserMenuToggle={() => setUserMenuOpen(!userMenuOpen)}
      />

      <FilterBar
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        filterStatus={filterStatus}
        allCategories={allCategories}
        totalBooks={totalBooks}
        onCategoryChange={setFilterCategory}
        onStatusChange={setFilterStatus}
        onClearFilters={() => {
          setSearchTerm('');
          setFilterCategory('');
          setFilterStatus('');
        }}
      />

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
            <CategorySection
              key={index}
              data={data}
              index={index}
              isExpanded={expandedCategories[index]}
              onToggleExpanded={(idx) =>
                setExpandedCategories((p) => ({
                  ...p,
                  [idx]: !p[idx],
                }))
              }
              onCardClick={openDetailsModal}
              onEdit={(book, catName) => openForm(book, catName)}
              onDelete={(book, catName) => {
                setBookToDelete({ ...book, categoryName: catName });
                setDeleteModalOpen(true);
              }}
              getCover={getCover}
              formatStatus={formatStatus}
              scrollContainer={scrollContainer}
            />
          ))
        )}
      </main>

      <BookFormModal
        isOpen={activeModal === 'form'}
        formData={formData}
        allCategories={allCategories}
        onFormChange={handleFormInputChange}
        onSubmit={saveBook}
        onClose={() => setActiveModal(null)}
        onFetchISBN={fetchISBN}
      />

      <BookDetailsModal
        isOpen={activeModal === 'details'}
        detailBook={detailBook}
        detailReview={detailReview}
        onClose={handleSaveAndCloseDetails}
        onEdit={(book) => {
          openForm(book, detailBook.categoryName);
          setActiveModal('form');
        }}
        onSaveReview={saveReview}
        onReviewChange={handleReviewChange}
        getCover={getCover}
        formatStatus={formatStatus}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        bookToDelete={bookToDelete}
        onConfirm={deleteBook}
        onCancel={() => {
          setDeleteModalOpen(false);
          setBookToDelete(null);
        }}
      />

      <CategoryManager
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        usuarioLogado={usuarioLogado}
      />
    </div>
  );
};

export default Dashboard;
