import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Logo from '../assets/img/livro.png'; 
import '../assets/css/dashboard.css';

const Dashboard = () => {
  // --- ESTADOS DE DADOS (LIBRARY) ---
  const [libraryData, setLibraryData] = useState([
    {
      category: "Tecnologia & Design",
      books: [
        { id: 1, title: "O Design do Dia a Dia", author: "Don Norman", isbn: "9780465050659", year: 2013, publisher: "Rocco", status: "lido", rating: 5, review: "Essencial para entender UX." },
        { id: 2, title: "Sprint", author: "Jake Knapp", isbn: "9781442397682", year: 2016, publisher: "Intrínseca", status: "lendo", rating: 4, review: "Metodologia ágil interessante." },
        { id: 3, title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", year: 2008, publisher: "Alta Books", status: "lido", rating: 5, review: "Bíblia do programador." },
        { id: 4, title: "O Programador Pragmático", author: "Andrew Hunt", isbn: "9780201616224", year: 1999, publisher: "Bookman", status: "para-ler", rating: 0, review: "" },
        { id: 5, title: "Refatoração", author: "Martin Fowler", isbn: "9780201485677", year: 1999, publisher: "Novatec", status: "none", rating: 0, review: "" },
        { id: 6, title: "Arquitetura Limpa", author: "Robert C. Martin", isbn: "9780134494166", year: 2017, publisher: "Alta Books", status: "lendo", rating: 4, review: "Denso, mas necessário." },
        { id: 7, title: "Entendendo Algoritmos", author: "Aditya Bhargava", isbn: "9781617292231", year: 2016, publisher: "Novatec", status: "lido", rating: 5, review: "Muito didático e ilustrado." },
        { id: 8, title: "Padrões de Projeto", author: "Erich Gamma", isbn: "9780201633610", year: 1994, publisher: "Bookman", status: "none", rating: 0, review: "" },
        { id: 9, title: "Não Me Faça Pensar", author: "Steve Krug", isbn: "9780321965516", year: 2014, publisher: "Alta Books", status: "lido", rating: 4, review: "Rápido e direto." },
        { id: 10, title: "O Mítico Homem-Mês", author: "Fred Brooks", isbn: "9780201835953", year: 1975, publisher: "Alta Books", status: "para-ler", rating: 0, review: "" }
      ]
    },
    {
      category: "Ficção Científica",
      books: [
        { id: 11, title: "Duna", author: "Frank Herbert", isbn: "9780441013593", year: 1965, publisher: "Aleph", status: "lido", rating: 5, review: "Uma obra prima absoluta." },
        { id: 12, title: "Neuromancer", author: "William Gibson", isbn: "9780441569595", year: 1984, publisher: "Aleph", status: "lido", rating: 4, review: "O pai do Cyberpunk." },
        { id: 13, title: "Fundação", author: "Isaac Asimov", isbn: "9780553293357", year: 1951, publisher: "Aleph", status: "lendo", rating: 0, review: "" },
        { id: 14, title: "O Guia do Mochileiro das Galáxias", author: "Douglas Adams", isbn: "9780345391803", year: 1979, publisher: "Arqueiro", status: "lido", rating: 5, review: "Hilário e genial." },
        { id: 15, title: "Fahrenheit 451", author: "Ray Bradbury", isbn: "9781451673319", year: 1953, publisher: "Biblioteca Azul", status: "para-ler", rating: 0, review: "" },
        { id: 16, title: "1984", author: "George Orwell", isbn: "9780451524935", year: 1949, publisher: "Companhia das Letras", status: "lido", rating: 5, review: "Perturbador e atual." },
        { id: 17, title: "Admirável Mundo Novo", author: "Aldous Huxley", isbn: "9780060850524", year: 1932, publisher: "Biblioteca Azul", status: "none", rating: 0, review: "" },
        { id: 18, title: "Eu, Robô", author: "Isaac Asimov", isbn: "9780553294385", year: 1950, publisher: "Aleph", status: "lendo", rating: 4, review: "" },
        { id: 19, title: "Blade Runner", author: "Philip K. Dick", isbn: "9780345404473", year: 1968, publisher: "Aleph", status: "none", rating: 0, review: "" },
        { id: 20, title: "Jogador Nº 1", author: "Ernest Cline", isbn: "9780307887436", year: 2011, publisher: "Leya", status: "lido", rating: 4, review: "Diversão pura." }
      ]
    },
    {
      category: "Negócios & Carreira",
      books: [
        { id: 21, title: "A Marca da Vitória", author: "Phil Knight", isbn: "9781501135910", year: 2016, publisher: "Sextante", status: "lido", rating: 5, review: "Melhor biografia de negócios." },
        { id: 22, title: "Comece Pelo Porquê", author: "Simon Sinek", isbn: "9781591846444", year: 2009, publisher: "Sextante", status: "lendo", rating: 3, review: "Conceito bom, um pouco repetitivo." },
        { id: 23, title: "Essencialismo", author: "Greg McKeown", isbn: "9780804137386", year: 2014, publisher: "Sextante", status: "lido", rating: 5, review: "Mudou minha forma de priorizar." },
        { id: 24, title: "Rápido e Devagar", author: "Daniel Kahneman", isbn: "9780374533557", year: 2011, publisher: "Objetiva", status: "para-ler", rating: 0, review: "" },
        { id: 25, title: "O Poder do Hábito", author: "Charles Duhigg", isbn: "9780812981605", year: 2012, publisher: "Objetiva", status: "lido", rating: 4, review: "" },
        { id: 26, title: "Pai Rico, Pai Pobre", author: "Robert Kiyosaki", isbn: "9781612680194", year: 1997, publisher: "Alta Books", status: "none", rating: 0, review: "" },
        { id: 27, title: "Como Fazer Amigos", author: "Dale Carnegie", isbn: "9780671027032", year: 1936, publisher: "Sextante", status: "lido", rating: 5, review: "Clássico atemporal." },
        { id: 28, title: "Mindset", author: "Carol Dweck", isbn: "9780345472328", year: 2006, publisher: "Objetiva", status: "lendo", rating: 0, review: "" },
        { id: 29, title: "Hábitos Atômicos", author: "James Clear", isbn: "9780735211292", year: 2018, publisher: "Alta Life", status: "para-ler", rating: 0, review: "" },
        { id: 30, title: "Do Zero ao Um", author: "Peter Thiel", isbn: "9780804139298", year: 2014, publisher: "Objetiva", status: "none", rating: 0, review: "" }
      ]
    },
    {
      category: "Fantasia & Aventura",
      books: [
        { id: 31, title: "O Hobbit", author: "J.R.R. Tolkien", isbn: "9780547928227", year: 1937, publisher: "HarperCollins", status: "lido", rating: 5, review: "O início da jornada." },
        { id: 32, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", isbn: "9780590353427", year: 1997, publisher: "Rocco", status: "lido", rating: 5, review: "Nostalgia pura." },
        { id: 33, title: "O Nome do Vento", author: "Patrick Rothfuss", isbn: "9780756404741", year: 2007, publisher: "Arqueiro", status: "lendo", rating: 5, review: "Escrita poética maravilhosa." },
        { id: 34, title: "As Crônicas de Nárnia", author: "C.S. Lewis", isbn: "9780064471190", year: 1950, publisher: "Martins Fontes", status: "para-ler", rating: 0, review: "" },
        { id: 35, title: "A Guerra dos Tronos", author: "George R.R. Martin", isbn: "9780553103540", year: 1996, publisher: "Leya", status: "lido", rating: 5, review: "Político e brutal." },
        { id: 36, title: "A Sociedade do Anel", author: "J.R.R. Tolkien", isbn: "9780618640157", year: 1954, publisher: "HarperCollins", status: "lido", rating: 5, review: "" },
        { id: 37, title: "O Ladrão de Raios", author: "Rick Riordan", isbn: "9780786838653", year: 2005, publisher: "Intrínseca", status: "none", rating: 0, review: "" },
        { id: 38, title: "Eragon", author: "Christopher Paolini", isbn: "9780375826696", year: 2002, publisher: "Rocco", status: "none", rating: 0, review: "" },
        { id: 39, title: "Mistborn", author: "Brandon Sanderson", isbn: "9780765311788", year: 2006, publisher: "Leya", status: "para-ler", rating: 0, review: "Dizem que o sistema de magia é incrível." },
        { id: 40, title: "The Witcher", author: "Andrzej Sapkowski", isbn: "9780316029186", year: 1993, publisher: "Martins Fontes", status: "lendo", rating: 4, review: "" }
      ]
    }
  ]);

  
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
  
  const initialForm = { id: '', title: '', author: '', isbn: '', year: '', publisher: '', genre: '', status: 'none', rating: 0, review: '' };
  const [formData, setFormData] = useState(initialForm);

  // --- EFEITOS ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDark(true);
  }, []);

  // --- HELPERS ---
  const getCover = (isbn) => isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : 'https://placehold.co/200x300?text=Capa';
  
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
    const field = id === 'genre' ? 'genre' : id; // Mapeia input list 'genre'
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openForm = (book = null, catName = '') => {
    if (book) {
      setFormData({
        id: book.id, title: book.title, author: book.author, isbn: book.isbn || '',
        year: book.year || '', publisher: book.publisher || '', genre: catName,
        status: book.status || 'none', rating: book.rating || 0, review: book.review || ''
      });
    } else {
      setFormData(initialForm);
    }
    setActiveModal('form');
  };

  const saveBook = (e) => {
    e.preventDefault();
    const newBook = { ...formData, id: formData.id ? parseInt(formData.id) : Date.now(), rating: parseInt(formData.rating) };
    const catName = formData.genre;

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
    if (window.confirm("Excluir este livro?")) {
      setLibraryData(prev => prev.map(c => ({ ...c, books: c.books.filter(b => b.id !== id) })).filter(c => c.books.length > 0));
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
          ...prev, title: info.title || "", author: info.authors?.[0]?.name || "",
          publisher: info.publishers?.[0]?.name || "", year: info.publish_date?.split(' ').pop() || ""
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
      return (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
             (!filterStatus || b.status === filterStatus);
    });
    return books.length > 0 ? { ...cat, books } : null;
  }).filter(Boolean);

  const totalBooks = filteredData.reduce((acc, c) => acc + c.books.length, 0);

  // ================= RETORNO JSX =================
  // ... (Lógica e estados anteriores permanecem iguais) ...

  return (
    <div className={`dashboard-container ${isDark ? 'dark-mode' : ''}`}>
      
      {/* 1. NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <span className="logo"><img src={Logo} width="60px"/></span>
          <div className="search-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="nav-actions">
            <button className="btn-primary" onClick={() => openForm()}>+ Novo Livro</button>
            <button className="theme-btn" onClick={toggleTheme}>{isDark ? 
                    /* ÍCONE SOL (Para voltar ao Light Mode) */
                    (<svg class="icon-sun" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4.92969 4.92969L6.34969 6.34969" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17.6484 17.6484L19.0684 19.0684" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6.34969 17.6484L4.92969 19.0684" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19.0684 4.92969L17.6484 6.34969" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ) : (
                    /* ÍCONE LUA CORRIGIDO (Para ir ao Dark Mode) */
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    )}
            </button>
            
            <div className="user-dropdown-container">
              <div className="user-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <img src="https://ui-avatars.com/api/?name=User&background=0071e3&color=fff" alt="User" />
              </div>
              {userMenuOpen && (
                <div className="user-menu show">
                  <div className="user-info"><strong>Usuário</strong><br/><span>user@select.com</span></div>
                  <hr/>
                  <button className="btn-logout" onClick={() => window.location.reload()}>Sair</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. BARRA DE FILTROS (ESTAVA FALTANDO NA SUA IMAGEM) */}
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
                        <img src={getCover(book.isbn)} className="book-cover" loading="lazy" alt="Capa"/>
                      </div>
                      <div className="book-info">
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                        <div className="card-rating">{[1,2,3,4,5].map(i => <span key={i} className={i <= book.rating ? '' : 'empty-star'}>★</span>)}</div>
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
            
            {/* ... Abas ... */}
            <div className="modal-tabs">
              <button className={`tab-btn ${activeTab==='manual'?'active':''}`} onClick={()=>setActiveTab('manual')}>Manual</button>
              <button className={`tab-btn ${activeTab==='isbn'?'active':''}`} onClick={()=>setActiveTab('isbn')}>ISBN</button>
            </div>
            
            {activeTab === 'manual' ? (
              <form onSubmit={saveBook}>
                <div className="form-group"><label>Título</label><input id="title" value={formData.title} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>Autor</label><input id="author" value={formData.author} onChange={handleInputChange} required /></div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Categoria</label>
                    <input id="genre" list="cats" value={formData.genre} onChange={handleInputChange} required placeholder="Selecione ou crie..." />
                    <datalist id="cats">{allCategories.map(c=><option key={c} value={c}/>)}</datalist>
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
                    <div className="form-group"><label>Ano</label><input type="number" id="year" value={formData.year} onChange={handleInputChange} /></div>
                    <div className="form-group"><label>Editora</label><input id="publisher" value={formData.publisher} onChange={handleInputChange} /></div>
                </div>

                {/* AQUI ESTÁ A SECÇÃO DE RESENHA (FORMULÁRIO) */}
                <div className="form-group" style={{marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                    <label>Sua Avaliação</label>
                    <div className="star-rating-input">
                       {[1,2,3,4,5].map(star => (
                         <span key={star} className={`star ${star <= formData.rating ? 'active' : ''}`} onClick={() => setFormData({...formData, rating: star})}>★</span>
                       ))}
                    </div>
                </div>
                <div className="form-group">
                    <label>Resenha / Notas Pessoais</label>
                    <textarea id="review" rows="3" value={formData.review} onChange={handleInputChange} placeholder="O que você achou do livro?"></textarea>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={()=>setActiveModal(null)}>Cancelar</button>
                    <button type="submit" className="btn-primary">Salvar</button>
                </div>
              </form>
            ) : (
              /* Aba ISBN ... */
              <div className="tab-content active">
                <div className="form-group"><label>ISBN</label><div className="isbn-input-group"><input id="isbn" value={formData.isbn} onChange={handleInputChange} placeholder="Ex: 978..." /><button type="button" className="btn-scan" onClick={fetchISBN}>🔍</button></div></div>
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
                <img src={getCover(detailBook.isbn)} className="detail-cover-img" alt="Capa"/>
                {detailBook.status !== 'none' && <span className={`status-badge status-${detailBook.status}`} style={{position:'relative', marginTop:10, display:'inline-block'}}>{formatStatus(detailBook.status)}</span>}
              </div>
              <div className="details-right">
                <h1>{detailBook.title}</h1>
                <p className="detail-author">{detailBook.author}</p>
                <div className="detail-rating">{[1,2,3,4,5].map(i => <span key={i} style={{color: i <= detailBook.rating ? '#f59e0b' : '#d1d5db'}}>★</span>)}</div>
                
                {/* AQUI ESTÁ A SECÇÃO DE RESENHA (LEITURA) */}
                <div className="review-box">
                    <h3>Resenha</h3>
                    <p>{detailBook.review || "Nenhuma resenha adicionada."}</p>
                </div>
                
                <div className="details-actions">
                    <button className="btn-secondary" onClick={() => openForm(detailBook, detailBook.categoryName)}>Editar Informações</button>
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