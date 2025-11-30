import React from 'react';

const BookCard = ({
  book,
  categoryName,
  onCardClick,
  onEdit,
  onDelete,
  getCover,
  formatStatus,
}) => {
  return (
    <article
      className="book-card"
      onClick={() => onCardClick(book, categoryName)}
    >
      {book.status && book.status !== 'none' && (
        <span className={`status-badge status-${book.status}`}>
          {formatStatus(book.status)}
        </span>
      )}
      <div className="card-actions">
        <button
          className="action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(book, categoryName);
          }}
        >
          ✎
        </button>
        <button
          className="action-btn delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(book, categoryName);
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
            <span key={i} className={i <= book.rating ? '' : 'empty-star'}>
              ★
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BookCard;
