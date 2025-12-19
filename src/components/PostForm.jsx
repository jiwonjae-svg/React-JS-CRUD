import React, { useState, useEffect } from 'react';
import './PostForm.css';

function PostForm({ post, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: ''
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        author: post.author,
        content: post.content
      });
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.author.trim()) {
      alert('작성자를 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="post-form-container">
      <h2>{post ? '게시글 수정' : '새 게시글 작성'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">작성자</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="작성자를 입력하세요"
            disabled={!!post}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
            rows="10"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="btn-submit">
            {post ? '수정' : '작성'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostForm;
