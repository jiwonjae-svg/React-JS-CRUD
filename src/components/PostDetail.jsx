import React from 'react';
import './PostDetail.css';

function PostDetail({ post, onEdit, onBack, onDelete }) {
  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="post-detail-container">
      <div className="detail-header">
        <h2>{post.title}</h2>
        <div className="detail-info">
          <span>작성자: {post.author}</span>
          <span>작성일: {new Date(post.date).toLocaleString()}</span>
          <span>조회수: {post.views}</span>
        </div>
      </div>
      
      <div className="detail-content">
        {post.content}
      </div>
      
      <div className="detail-actions">
        <button className="btn-back" onClick={onBack}>목록</button>
        <div>
          <button className="btn-edit" onClick={() => onEdit(post)}>수정</button>
          <button 
            className="btn-delete" 
            onClick={() => {
              if (window.confirm('정말 삭제하시겠습니까?')) {
                onDelete(post.id);
              }
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
