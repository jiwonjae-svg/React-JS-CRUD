import React, { useState, useEffect, useRef } from 'react';
import './PostForm.css';

function PostForm({ post, currentUser, onSubmit, onCancel, defaultCategory }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: defaultCategory || 'comic',
    media: []
  });
  const [draggedMediaIndex, setDraggedMediaIndex] = useState(null);
  const [draggedImageElement, setDraggedImageElement] = useState(null);
  const contentRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (post) {
      // 기존 게시글 수정 시 content에서 이미지 마커 파싱
      const imageRegex = /\[IMG:([^:]+):([^\]]+)\]/g;
      const images = [];
      let match;
      
      while ((match = imageRegex.exec(post.content)) !== null) {
        images.push({
          type: 'image',
          name: match[1],
          url: match[2]
        });
      }
      
      setFormData({
        title: post.title,
        content: post.content,
        category: post.category || defaultCategory || 'comic',
        media: [...images, ...(post.media?.filter(m => m.type === 'video') || [])]
      });
      
      // contentEditable div에 HTML 렌더링
      if (contentRef.current) {
        contentRef.current.innerHTML = parseContentToHTML(post.content);
      }
    } else if (defaultCategory) {
      setFormData(prev => ({
        ...prev,
        category: defaultCategory
      }));
    }
  }, [post, defaultCategory]);
  
  // content 문자열을 HTML로 변환 (이미지 마커를 img 태그로)
  const parseContentToHTML = (content) => {
    const imageRegex = /\[IMG:([^:]+):([^\]]+)\]/g;
    return content
      .split('\n')
      .map(line => {
        return line.replace(imageRegex, (match, name, url) => {
          return `<img src="${url}" alt="${name}" class="inline-image" draggable="true" data-name="${name}" />`;
        });
      })
      .join('<br>');
  };
  
  // contentEditable div의 HTML을 content 문자열로 변환
  const parseHTMLToContent = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // img 태그를 이미지 마커로 변환
    const images = tempDiv.querySelectorAll('img.inline-image');
    images.forEach(img => {
      const marker = `[IMG:${img.dataset.name}:${img.src}]`;
      img.replaceWith(marker);
    });
    
    return tempDiv.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/&nbsp;/g, ' ')
      .trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // contentEditable div 내용 변경 핸들러
  const handleContentInput = () => {
    if (contentRef.current) {
      const htmlContent = contentRef.current.innerHTML;
      const textContent = parseHTMLToContent(htmlContent);
      
      setFormData(prev => ({
        ...prev,
        content: textContent
      }));
      
      // media 배열 업데이트 (현재 존재하는 이미지만 유지)
      const currentImages = contentRef.current.querySelectorAll('img.inline-image');
      const imageMedia = Array.from(currentImages).map(img => ({
        type: 'image',
        name: img.dataset.name,
        url: img.src
      }));
      
      setFormData(prev => ({
        ...prev,
        media: [...imageMedia, ...prev.media.filter(m => m.type === 'video')]
      }));
    }
  };

  // 이미지를 contentEditable div의 커서 위치에 삽입
  const insertImageIntoContent = (imageUrl, imageName) => {
    if (!contentRef.current) return;
    
    contentRef.current.focus();
    
    // 현재 선택 영역 가져오기
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // 이미지 요소 생성
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = imageName;
    img.className = 'inline-image';
    img.draggable = true;
    img.dataset.name = imageName;
    
    // 드래그 이벤트 리스너 추가
    img.addEventListener('dragstart', handleImageDragStart);
    img.addEventListener('dragover', handleImageDragOver);
    img.addEventListener('drop', handleImageDrop);
    
    if (range) {
      range.deleteContents();
      range.insertNode(img);
      
      // 이미지 뒤에 공간 추가
      const space = document.createTextNode('\u00A0');
      range.setStartAfter(img);
      range.insertNode(space);
      range.setStartAfter(space);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      contentRef.current.appendChild(img);
    }
    
    handleContentInput();
  };
  
  // 이미지 드래그 앤 드롭 핸들러
  const handleImageDragStart = (e) => {
    setDraggedImageElement(e.target);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleImageDrop = (e) => {
    e.preventDefault();
    
    if (!draggedImageElement || !e.target) return;
    
    const dropTarget = e.target.closest('.inline-image');
    if (!dropTarget || dropTarget === draggedImageElement) {
      setDraggedImageElement(null);
      return;
    }
    
    // 드래그된 이미지를 드롭 위치로 이동
    const parent = dropTarget.parentNode;
    parent.insertBefore(draggedImageElement, dropTarget);
    
    setDraggedImageElement(null);
    handleContentInput();
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
            
            // 이미지를 미디어 배열에 추가
            setFormData(prev => ({
              ...prev,
              media: [...prev.media, mediaItem]
            }));

            // 동시에 content에 이미지 마커 삽입
            insertImageIntoContent(compressedUrl, file.name);
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

    // 파일 입력 초기화
    e.target.value = '';
  };

  const handleRemoveMedia = (index) => {
    const removedMedia = formData.media[index];
    
    // 이미지인 경우 contentEditable div에서도 제거
    if (removedMedia.type === 'image' && contentRef.current) {
      const images = contentRef.current.querySelectorAll('img.inline-image');
      images.forEach(img => {
        if (img.src === removedMedia.url && img.dataset.name === removedMedia.name) {
          img.remove();
        }
      });
      handleContentInput();
    }
    
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleMediaDragStart = (index) => {
    setDraggedMediaIndex(index);
  };

  const handleMediaDragOver = (e, index) => {
    e.preventDefault();
    if (draggedMediaIndex === null || draggedMediaIndex === index) return;
    
    const newMedia = [...formData.media];
    const draggedItem = newMedia[draggedMediaIndex];
    newMedia.splice(draggedMediaIndex, 1);
    newMedia.splice(index, 0, draggedItem);
    
    setFormData(prev => ({
      ...prev,
      media: newMedia
    }));
    setDraggedMediaIndex(index);
  };

  const handleMediaDragEnd = () => {
    setDraggedMediaIndex(null);
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
          <div
            ref={contentRef}
            className="content-editor"
            contentEditable
            onInput={handleContentInput}
            onPaste={(e) => {
              // 일반 텍스트만 붙여넣기
              e.preventDefault();
              const text = e.clipboardData.getData('text/plain');
              document.execCommand('insertText', false, text);
            }}
            data-placeholder="내용을 입력하세요. 이미지를 추가하면 커서 위치에 삽입됩니다."
          />
        </div>

        <div className="form-group">
          <label htmlFor="media">미디어 첨부</label>
          <label htmlFor="media" className="file-upload-btn">
            📷 사진/동영상 추가
          </label>
          <input
            type="file"
            id="media"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <p className="file-info">이미지는 커서 위치에 삽입되며, 드래그하여 위치를 변경할 수 있습니다.</p>
        </div>

        {/* 첨부된 이미지 목록 (미니 썸네일) */}
        {formData.media.filter(m => m.type === 'image').length > 0 && (
          <div className="attached-images-list">
            <p className="attached-images-label">📎 첨부된 이미지 ({formData.media.filter(m => m.type === 'image').length}개)</p>
            <div className="attached-images-thumbnails">
              {formData.media.filter(m => m.type === 'image').map((media, index) => {
                const actualIndex = formData.media.indexOf(media);
                return (
                  <div
                    key={actualIndex}
                    className="thumbnail-item"
                  >
                    <img src={media.url} alt={media.name} />
                    <button
                      type="button"
                      className="btn-remove-thumbnail"
                      onClick={() => handleRemoveMedia(actualIndex)}
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 비디오만 별도 미리보기 */}
        {formData.media.filter(m => m.type === 'video').length > 0 && (
          <div className="media-preview-section">
            <h4>첨부된 비디오 ({formData.media.filter(m => m.type === 'video').length}개)</h4>
            <div className="media-preview-grid">
              {formData.media.filter(m => m.type === 'video').map((media) => {
                const videoIndex = formData.media.findIndex(m => m === media);
                return (
                  <div
                    key={videoIndex}
                    className={`media-preview-item ${draggedMediaIndex === videoIndex ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleMediaDragStart(videoIndex)}
                    onDragOver={(e) => handleMediaDragOver(e, videoIndex)}
                    onDragEnd={handleMediaDragEnd}
                  >
                    <video src={media.url} />
                    <button
                      type="button"
                      className="btn-remove-media"
                      onClick={() => handleRemoveMedia(videoIndex)}
                      title="삭제"
                    >
                      ✕
                    </button>
                    <div className="media-index">{formData.media.filter(m => m.type === 'video').indexOf(media) + 1}</div>
                  </div>
                );
              })}
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
