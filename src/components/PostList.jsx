import React from 'react';
import './PostList.css';

function PostList({ posts, onSelectPost, onDeletePost, onCreateNew }) {
  return (
    <div className="post-list-container">
      <div className="header">
        <h1>게시판</h1>
        <button className="btn-create" onClick={onCreateNew}>
          글쓰기
        </button>
      </div>
      
      {posts.length === 0 ? (
        <div className="empty-message">
          <p>게시글이 없습니다.</p>
        </div>
      ) : (
        <table className="post-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>조회수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post.id}>
                <td>{posts.length - index}</td>
                <td 
                  className="post-title" 
                  onClick={() => onSelectPost(post.id)}
                >
                  {post.title}
                </td>
                <td>{post.author}</td>
                <td>{new Date(post.date).toLocaleDateString()}</td>
                <td>{post.views}</td>
                <td>
                  <button 
                    className="btn-delete" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('정말 삭제하시겠습니까?')) {
                        onDeletePost(post.id);
                      }
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PostList;
