import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Logo from '../assets/img/livro.png'; 
import '../assets/css/dashboard.css';

const Dashboard = () => {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

  // --- ESTADOS DE DADOS (AGORA VAZIO, SERÁ PREENCHIDO PELA API) ---
  const [libraryData, setLibraryData] = useState([]);

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
    genre: 'Minha Biblioteca', 
    status: 'none', 
    rating: 0, 
    review: '' 
  };
  const [formData, setFormData] = useState(initialForm);

  // --- EFEITOS ---

  // tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDark(true);
  }, []);

  // busca livros da API
  useEffect(() => {
    const fetchBooks = async () => {
      if (!usuarioLogado || !usuarioLogado.id) {
        toast.error("Usuário não encontrado no localStorage");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost/app-catalogo-livros-tsi/api/livros?usuario_id=${usuarioLogado.id}`
        );

        if (!res.ok) {
          throw new Error(`Erro ao carregar livros: ${res.status}`);
        }

        const data = await res.json(); // data é o array de livros do backend

        // mapa do formato da API -> formato usado no front
        const books = data.map((livro) => ({
          id: livro.id,
          title: livro.titulo,
          author: livro.autor,
          isbn: livro.isbn,
          year: livro.data_publicacao ? livro.data_publicacao.split('-')[0] : '',
          publisher: livro.editora,
          genre: 'Minha Biblioteca', // não vem do backend, então fixamos uma categoria
          status: 'none',            // backend ainda não tem status
          rating: 0,                 // backend ainda não tem rating
          review: livro.descricao || '',
          coverUrl: livro.url_capa || ''
        }));

        // uma única categoria padrão
        setLibraryData([
          {
            category: 'Minha Biblioteca',
            books
          }
        ]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar livros do servidor.");
      }
    };

    fetchBooks();
  }, [usuarioLogado]);

  // --- HELPERS ---
  const getCover = (book) => {
    if (book.coverUrl) return book.coverUrl;
    const isbn = book.isbn;
    return isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
      : 'https://placehold.co/200x300?text=Capa';
  };
  
  const formatStatus = (s) => {
    const map = { 'para-ler': 'Para Ler', 'lendo': 'Lendo', 'lido': 'Lido', 'none': '' };
    return map[s] || '';
  };

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

  const openForm = (book = null, catName = 'Minha Biblioteca') => {
    if (book) {
      setFormData({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        year: book.year || '',
        publisher: book.publisher || '',
        genre: book.genre || catName,
        status: book.status || 'none',
        rating: book.rating || 0,
        review: book.review || ''
      });
    } else {
      setFormData(initialForm);
    }
    setActiveModal('form');
  };

  // ATENÇÃO: ainda está salvando só no front (não está chamando a API de POST/PUT)
  const saveBook = (e) => {
    e.preventDefault();
    const newBook = { 
      ...formData, 
      id: formData.id ? parseInt(formData.id) : Date.now(), 
      rating: parseInt(formData.rating) 
    };
    const catName = formData.genre || 'Minha Biblioteca';

    setLibraryData(prev => {
      const data = [...prev];
      if (formData.id) {
        data.forEach(c => c.books = c.books.filter(b => b.id !== parseInt(formData.id)));
      }
      const catIndex = data.findIndex(c => c.category.toLowerCase() === catName.toLowerCase());
      if (catIndex >= 0) data[catIndex].books.push(newBook);
      else data.push({ category: catName, books: [newBook] });

      return data.filter(c => c.books.length > 0);
    });

    setActiveModal(null);
    toast.success(formData.id ? 'Livro atualizado!' : 'Livro adicionado!');
  };

  const deleteBook = (id) => {
    // idem: remove só no front por enquanto
    if (window.confirm("Excluir este livro?")) {
      setLibraryData(prev => 
        prev
          .map(c => ({ ...c, books: c.books.filter(b => b.id !== id) }))
          .filter(c => c.books.length > 0)
      );
      toast.error("Livro excluído.");
    }
  };

  const fetchISBN = async () => {
    const isbn = formData.isbn.replace(/-/g, '').trim();
    if (isbn.length < 10) return toast.error("ISBN inválido");
    try {
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
      const data = await res.json();
      const info = data[`ISBN:${isbn}`];
      if (info) {
        setFormData(prev => ({
          ...prev, 
          title: info.title || "", 
          author: info.authors?.[0]?.name || "",
          publisher: info.publishers?.[0]?.name || "", 
          year: info.publish_date?.split(' ').pop() || ""
        }));
        setActiveTab('manual');
        toast.success("Dados encontrados!");
      } else toast.warn("Livro não encontrado.");
    } catch { toast.error("Erro de conexão."); }
  };

  const scrollContainer = (id, dir) => {
    const container = document.getElementById(id);
    if(container) container.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  // --- FILTROS ---
  const allCategories = libraryData.map(c => c.category);
  const filteredData = libraryData.map(cat => {
    if (filterCategory && cat.category !== filterCategory) return null;
    const books = cat.books.filter(b => {
      return (
        (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         b.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filterStatus || b.status === filterStatus)
      );
    });
    return books.length > 0 ? { ...cat, books } : null;
  }).filter(Boolean);

  const totalBooks = filteredData.reduce((acc, c) => acc + c.books.length, 0);

  // ================= RETORNO JSX =================

  return (
    <div className={`dashboard-container ${isDark ? 'dark-mode' : ''}`}>
      
      {/* 1. NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <span className="logo"><img src={Logo} width="60px" alt="Logo"/></span>
          <div className="search-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="nav-actions">
            <button className="btn-primary" onClick={() => openForm()}>+ Novo Livro</button>
            <button className="theme-btn" onClick={toggleTheme}>
              {isDark ? (
                <svg className="icon-sun" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.92969 4.92969L6.34969 6.34969" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.6484 17.6484L19.0684 19.0684" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.34969 17.6484L4.92969 19.0684" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.0684 4.92969L17.6484 6.34969" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
            
            <div className="user-dropdown-container">
              <div className="user-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <img src={`https://ui-avatars.com/api/?name=${usuarioLogado?.nome || 'User'}&background=0071e3&color=fff`} alt="User" />
              </div>
              {userMenuOpen && (
                <div className="user-menu show">
                  <div className="user-info">
                    <strong>{usuarioLogado?.nome}</strong><br/>
                    <span>{usuarioLogado?.email}</span>
                  </div>
                  <hr/>
                  <button className="btn-logout" onClick={() => window.location.reload()}>Sair</button>
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
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
             Filtrar:
          </span>
          <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Todas as Categorias</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os Status</option>
            <option value="para-ler">Para Ler</option>
            <option value="lendo">Lendo</option>
            <option value="lido">Lido</option>
          </select>
          {(searchTerm || filterCategory || filterStatus) && (
            <button className="btn-clear" onClick={() => { setSearchTerm(''); setFilterCategory(''); setFilterStatus(''); }}>Limpar</button>
          )}
        </div>
        <span className="result-count">{totalBooks} livros encontrados</span>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <main id="app">
        {filteredData.length === 0 ? (
           <div style={{textAlign: 'center', padding: '4rem', color: 'var(--text-muted)'}}>
             <h3>Nenhum livro encontrado</h3>
           </div>
        ) : (
          filteredData.map((data, index) => (
            <section className="category-section" key={index}>
              <div className="section-header">
                <h2 className="section-title">{data.category}</h2>
                <button className="view-all-btn" onClick={() => setExpandedCategories(p => ({...p, [index]: !p[index]}))}>
                  {expandedCategories[index] ? "Ver menos" : "Ver tudo"}
                </button>
              </div>
              
              <div className={`carousel-wrapper ${expandedCategories[index] ? 'expanded' : ''}`} id={`wrapper-${index}`}>
                {!expandedCategories[index] && <button className="nav-btn prev" onClick={() => scrollContainer(`track-${index}`, 'left')}>❮</button>}
                
                <div id={`track-${index}`} className={`carousel-track ${expandedCategories[index] ? 'grid-view' : ''}`}>
                  {data.books.map(book => (
                    <article className="book-card" key={book.id} onClick={() => { setDetailBook({...book, categoryName: data.category}); setActiveModal('details'); }}>
                      {book.status && book.status !== 'none' && <span className={`status-badge status-${book.status}`}>{formatStatus(book.status)}</span>}
                      <div className="card-actions">
                        <button className="action-btn" onClick={(e) => {e.stopPropagation(); openForm(book, data.category)}}>✎</button>
                        <button className="action-btn delete" onClick={(e) => {e.stopPropagation(); deleteBook(book.id)}}>🗑</button>
                      </div>
                      <div className="cover-container">
                        <img src={getCover(book)} className="book-cover" loading="lazy" alt="Capa"/>
                      </div>
                      <div className="book-info">
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                        <div className="card-rating">
                          {[1,2,3,4,5].map(i => <span key={i} className={i <= book.rating ? '' : 'empty-star'}>★</span>)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                
                {!expandedCategories[index] && <button className="nav-btn next" onClick={() => scrollContainer(`track-${index}`, 'right')}>❯</button>}
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
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            
            <div className="modal-tabs">
              <button className={`tab-btn ${activeTab==='manual'?'active':''}`} onClick={()=>setActiveTab('manual')}>Manual</button>
              <button className={`tab-btn ${activeTab==='isbn'?'active':''}`} onClick={()=>setActiveTab('isbn')}>ISBN</button>
            </div>
            
            {activeTab === 'manual' ? (
              <form onSubmit={saveBook}>
                <div className="form-group">
                  <label>Título</label>
                  <input id="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Autor</label>
                  <input id="author" value={formData.author} onChange={handleInputChange} required />
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
                      {allCategories.map(c=><option key={c} value={c}/>)}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select id="status" value={formData.status} onChange={handleInputChange}>
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
                      <input type="number" id="year" value={formData.year} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Editora</label>
                      <input id="publisher" value={formData.publisher} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="form-group" style={{marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                    <label>Sua Avaliação</label>
                    <div className="star-rating-input">
                       {[1,2,3,4,5].map(star => (
                         <span 
                           key={star} 
                           className={`star ${star <= formData.rating ? 'active' : ''}`} 
                           onClick={() => setFormData({...formData, rating: star})}
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
                    />
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={()=>setActiveModal(null)}>Cancelar</button>
                    <button type="submit" className="btn-primary">Salvar</button>
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
                    <button type="button" className="btn-scan" onClick={fetchISBN}>🔍</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALHES (VISUALIZAÇÃO) */}
      {activeModal === 'details' && detailBook && (
        <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && setActiveModal(null)}>
          <div className="modal-content details-view">
            <div className="details-grid">
              <div className="details-left">
                <img src={getCover(detailBook)} className="detail-cover-img" alt="Capa"/>
                {detailBook.status !== 'none' && (
                  <span 
                    className={`status-badge status-${detailBook.status}`} 
                    style={{position:'relative', marginTop:10, display:'inline-block'}}
                  >
                    {formatStatus(detailBook.status)}
                  </span>
                )}
              </div>
              <div className="details-right">
                <h1>{detailBook.title}</h1>
                <p className="detail-author">{detailBook.author}</p>
                <div className="detail-rating">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{color: i <= detailBook.rating ? '#f59e0b' : '#d1d5db'}}>★</span>
                  ))}
                </div>
                
                <div className="review-box">
                    <h3>Resenha</h3>
                    <p>{detailBook.review || "Nenhuma resenha adicionada."}</p>
                </div>
                
                <div className="details-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => openForm(detailBook, detailBook.categoryName || 'Minha Biblioteca')}
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
