import React, { useState, useEffect } from 'react';
import './PostForm.css';

function PostForm({ post, currentUser, onSubmit, onCancel, defaultCategory }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: defaultCategory || 'comic',
    media: []
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        category: post.category || defaultCategory || 'comic',
        media: post.media || []
      });
    } else if (defaultCategory) {
      setFormData(prev => ({
        ...prev,
        category: defaultCategory
      }));
    }
  }, [post, defaultCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // 이미지 파일인 경우 리사이징
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            const mediaItem = {
              type: 'image',
              url: compressedUrl,
              name: file.name
            };
            
            setFormData(prev => ({
              ...prev,
              media: [...prev.media, mediaItem]
            }));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // 비디오는 크기 제한 확인
        if (file.size > 5 * 1024 * 1024) {
          alert('비디오 파일은 5MB 이하만 업로드 가능합니다.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const mediaItem = {
            type: 'video',
            url: event.target.result,
            name: file.name
          };
          
          setFormData(prev => ({
            ...prev,
            media: [...prev.media, mediaItem]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
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
          <label htmlFor="category">카테고리</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="comic">📚 만화</option>
            <option value="game">🎮 게임</option>
            <option value="movie">🎬 영화</option>
            <option value="book">📖 책</option>
            <option value="music">🎵 음악</option>
            <option value="sports">⚽ 스포츠</option>
          </select>
        </div>

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

        <div className="form-group">
          <label htmlFor="media">미디어 첨부 (이미지/비디오)</label>
          <input
            type="file"
            id="media"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
          />
          <p className="file-info">이미지 또는 비디오 파일을 선택하세요. (여러 개 선택 가능)</p>
        </div>

        {formData.media.length > 0 && (
          <div className="media-preview-section">
            <h4>첨부된 미디어</h4>
            <div className="media-preview-grid">
              {formData.media.map((media, index) => (
                <div key={index} className="media-preview-item">
                  {media.type === 'image' ? (
                    <img src={media.url} alt={`미리보기 ${index + 1}`} />
                  ) : (
                    <video src={media.url} />
                  )}
                  <button
                    type="button"
                    className="btn-remove-media"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
