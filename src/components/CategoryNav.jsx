import React from 'react';
import './CategoryNav.css';

const categories = [
  { id: 'all', name: '전체', icon: '📋' },
  { id: 'art', name: '그림', icon: '🎨' },
  { id: 'game', name: '게임', icon: '🎮' },
  { id: 'movie', name: '영화', icon: '🎬' },
  { id: 'comic', name: '만화', icon: '📚' },
  { id: 'sports', name: '스포츠', icon: '⚽' }
];

function CategoryNav({ currentCategory, onSelectCategory }) {
  return (
    <div className="category-nav">
      {categories.map(category => (
        <button
          key={category.id}
          className={`category-btn ${currentCategory === category.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(category.id)}
        >
          <span className="category-icon">{category.icon}</span>
          <span className="category-name">{category.name}</span>
        </button>
      ))}
    </div>
  );
}

export default CategoryNav;
