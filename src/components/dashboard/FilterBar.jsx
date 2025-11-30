import React from 'react';

const FilterBar = ({
  searchTerm,
  filterCategory,
  filterStatus,
  allCategories,
  allListas,
  totalBooks,
  onCategoryChange,
  onStatusChange,
  onClearFilters,
}) => {
  const hasFilters = searchTerm || filterCategory || filterStatus;

  return (
    <div className="filter-bar">
      <div className="filter-container">
        <span className="filter-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filtrar:
        </span>
        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
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
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">Todas as Listas</option>
          {allListas && allListas.map((lista) => (
            <option key={lista.id} value={lista.id}>
              {lista.nome}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button className="btn-clear" onClick={onClearFilters}>
            Limpar
          </button>
        )}
      </div>
      <span className="result-count">{totalBooks} livros encontrados</span>
    </div>
  );
};

export default FilterBar;
