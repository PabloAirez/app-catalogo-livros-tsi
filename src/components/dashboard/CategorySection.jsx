import React from 'react';
import BookCard from './BookCard';

const CategorySection = ({
  data,
  index,
  isExpanded,
  onToggleExpanded,
  onCardClick,
  onEdit,
  onDelete,
  getCover,
  formatStatus,
  scrollContainer,
}) => {
  return (
    <section className="category-section">
      <div className="section-header">
        <h2 className="section-title">{data.category}</h2>
        <button
          className="view-all-btn"
          onClick={() => onToggleExpanded(index)}
        >
          {isExpanded ? 'Ver menos' : 'Ver tudo'}
        </button>
      </div>

      <div
        className={`carousel-wrapper ${isExpanded ? 'expanded' : ''}`}
        id={`wrapper-${index}`}
      >
        {!isExpanded && (
          <button
            className="nav-btn prev"
            onClick={() => scrollContainer(`track-${index}`, 'left')}
          >
            ❮
          </button>
        )}

        <div
          id={`track-${index}`}
          className={`carousel-track ${isExpanded ? 'grid-view' : ''}`}
        >
          {data.books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              categoryName={data.category}
              onCardClick={onCardClick}
              onEdit={onEdit}
              onDelete={onDelete}
              getCover={getCover}
              formatStatus={formatStatus}
            />
          ))}
        </div>

        {!isExpanded && (
          <button
            className="nav-btn next"
            onClick={() => scrollContainer(`track-${index}`, 'right')}
          >
            ❯
          </button>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
