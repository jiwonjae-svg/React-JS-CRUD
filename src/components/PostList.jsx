import React, { useState } from 'react';
import './PostList.css';

function PostList({ posts, currentUser, onSelectPost, onDeletePost, onCreateNew, onToggleLike, onBack, boardName }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const boardNames = {
    comic: '만화',
    game: '게임',
    movie: '영화',
    book: '책',
    music: '음악',
    sports: '스포츠'
  };

  // 즐겨찾기 상태 확인
  React.useEffect(() => {
    if (currentUser && boardName) {
      const favoriteBoards = JSON.parse(localStorage.getItem('favoriteBoards') || '{}');
      const userFavorites = favoriteBoards[currentUser.username] || [];
      setIsFavorite(userFavorites.includes(boardName));
    }
  }, [currentUser, boardName]);

  // 즐겨찾기 토글
  const handleToggleFavorite = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const favoriteBoards = JSON.parse(localStorage.getItem('favoriteBoards') || '{}');
    let userFavorites = favoriteBoards[currentUser.username] || [];

    if (isFavorite) {
      userFavorites = userFavorites.filter(board => board !== boardName);
    } else {
      userFavorites.push(boardName);
    }

    favoriteBoards[currentUser.username] = userFavorites;
    localStorage.setItem('favoriteBoards', JSON.stringify(favoriteBoards));
    setIsFavorite(!isFavorite);
  };

  // 검색 필터링
  const filteredPosts = posts.filter(post => {
    const searchLower = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.authorName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="post-list-container">
      <div className="header">
        {onBack && (
          <button className="btn-back" onClick={onBack}>
            ← 홈으로
          </button>
        )}
        <h1>{boardName ? `${boardNames[boardName]} 게시판` : '게시판'}</h1>
        <div className="header-actions">
          {boardName && currentUser && (
            <button 
              className={`btn-favorite ${isFavorite ? 'favorited' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              {isFavorite ? '⭐' : '☆'}
            </button>
          )}
          <button className="btn-create" onClick={onCreateNew}>
            글쓰기
          </button>
        </div>
      </div>
      
      {/* 검색 바 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="제목, 내용, 작성자로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
            ✕
          </button>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="empty-message">
          <p>{searchTerm ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}</p>
        </div>
      ) : (
        <table className="post-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>좋아요</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post, index) => {
              const isAuthor = currentUser && post.author === currentUser.username;
              const isLiked = currentUser && post.likedBy && post.likedBy.includes(currentUser.username);
              
              return (
                <tr key={post.id}>
                  <td>{filteredPosts.length - index}</td>
                  <td 
                    className="post-title" 
                    onClick={() => onSelectPost(post.id)}
                  >
                    <span className="title-text">{post.title}</span>
                    {post.comments && post.comments.length > 0 && (
                      <span className="comment-count"> [{post.comments.length}]</span>
                    )}
                  </td>
                  <td>{post.authorName || post.author}</td>
                  <td>{new Date(post.date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`btn-like ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(post.id);
                      }}
                    >
                      {isLiked ? '❤️' : '🤍'} {post.likes || 0}
                    </button>
                  </td>
                  <td>{post.views}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PostList;
