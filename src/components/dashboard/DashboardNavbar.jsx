import React from 'react';
import Logo from '../../assets/img/livro.png';

const DashboardNavbar = ({
  searchTerm,
  onSearchChange,
  onNewBook,
  onCategoriesClick,
  onListasClick,
  isDark,
  onThemeToggle,
  usuarioLogado,
  onLogout,
  userMenuOpen,
  onUserMenuToggle,
}) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <span className="logo">
          <img src={Logo} width="60px" alt="Logo" />
        </span>
        <div className="search-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="nav-actions">
          <button className="btn-primary" onClick={onNewBook}>
            + Novo Livro
          </button>
          <button className="btn-secondary" onClick={onCategoriesClick}>
            📁 Categorias
          </button>
          <button className="btn-secondary" onClick={onListasClick}>
            📋 Listas
          </button>
          <button className="theme-btn" onClick={onThemeToggle}>
            {isDark ? (
              <svg className="icon-sun" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.92969 4.92969L6.34969 6.34969" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17.6484 17.6484L19.0684 19.0684" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.34969 17.6484L4.92969 19.0684" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.0684 4.92969L17.6484 6.34969" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <div className="user-dropdown-container">
            <div className="user-avatar" onClick={onUserMenuToggle}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioLogado?.nome || 'User')}&background=0071e3&color=fff`}
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
                <button className="btn-logout" onClick={onLogout}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
