import React, { useState } from 'react';
import './PostList.css';

function PostList({ posts, currentUser, onSelectPost, onDeletePost, onCreateNew, onToggleLike, onBack, boardName }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('titleContent'); // 'title', 'titleContent', 'comment', 'author'
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

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

  // 검색 필터링 및 최신순 정렬
  const filteredPosts = posts
    .filter(post => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      
      switch (searchType) {
        case 'title':
          return post.title.toLowerCase().includes(searchLower);
        case 'titleContent':
          return post.title.toLowerCase().includes(searchLower) ||
                 post.content.toLowerCase().includes(searchLower);
        case 'comment':
          return post.comments.some(comment => 
            comment.content.toLowerCase().includes(searchLower) ||
            (comment.replies && comment.replies.some(reply => 
              reply.content.toLowerCase().includes(searchLower)
            ))
          );
        case 'author':
          return post.authorName.toLowerCase().includes(searchLower);
        default:
          return true;
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // 페이지 변경 시 첫 번째 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchType, itemsPerPage]);

  // 페이지 번호 생성 (현재 페이지 주변 5개씩)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 10;
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

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
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          className="search-type-select"
        >
          <option value="title">제목</option>
          <option value="titleContent">제목+내용</option>
          <option value="comment">댓글</option>
          <option value="author">작성자</option>
        </select>
        <input
          type="text"
          placeholder={`${
            searchType === 'title' ? '제목' :
            searchType === 'titleContent' ? '제목 또는 내용' :
            searchType === 'comment' ? '댓글' :
            '작성자'
          }으로 검색...`}
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

      {/* 페이지당 항목 수 선택 */}
      <div className="pagination-controls-top">
        <div className="items-per-page">
          <label>페이지당 항목 수: </label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={30}>30</option>
            <option value={35}>35</option>
            <option value={40}>40</option>
            <option value={45}>45</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="total-count">
          총 {filteredPosts.length}개의 게시글
        </div>
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
            {paginatedPosts.map((post, index) => {
              const isAuthor = currentUser && post.author === currentUser.username;
              const isLiked = currentUser && post.likedBy && post.likedBy.includes(currentUser.username);
              const globalIndex = startIndex + index;
              
              return (
                <tr key={post.id}>
                  <td>{filteredPosts.length - globalIndex}</td>
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

      {/* 페이지네이션 */}
      {filteredPosts.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            처음
          </button>
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            마지막
          </button>
        </div>
      )}
    </div>
  );
}

export default PostList;
