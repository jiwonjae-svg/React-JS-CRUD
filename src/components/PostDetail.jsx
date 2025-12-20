import React, { useState } from 'react';
import './PostDetail.css';

function PostDetail({ post, currentUser, onEdit, onBack, onDelete, onToggleLike, onAddComment, onDeleteComment, allPosts, onSelectPost }) {
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({}); // 각 댓글별 대댓글 입력
  const [showReplyForm, setShowReplyForm] = useState({}); // 답글 폼 표시 여부
  const [isScrapped, setIsScrapped] = useState(false);

  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  const isAuthor = currentUser && post.author === currentUser.username;
  const isLiked = currentUser && post.likedBy && post.likedBy.includes(currentUser.username);

  // 스크랩 상태 확인
  React.useEffect(() => {
    if (currentUser) {
      const scraps = JSON.parse(localStorage.getItem('scraps') || '{}');
      const userScraps = scraps[currentUser.username] || [];
      setIsScrapped(userScraps.includes(post.id));
    }
  }, [currentUser, post.id]);

  // 스크랩 토글
  const handleToggleScrap = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const scraps = JSON.parse(localStorage.getItem('scraps') || '{}');
    let userScraps = scraps[currentUser.username] || [];

    if (isScrapped) {
      userScraps = userScraps.filter(id => id !== post.id);
    } else {
      userScraps.push(post.id);
    }

    scraps[currentUser.username] = userScraps;
    localStorage.setItem('scraps', JSON.stringify(scraps));
    setIsScrapped(!isScrapped);
  };

  // 같은 카테고리의 다른 게시글 (최대 10개)
  const relatedPosts = allPosts
    ? allPosts
        .filter(p => p.category === post.category && p.id !== post.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
    : [];

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!commentText.trim()) {
      alert('댓글 내용을 입력하세요.');
      return;
    }
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  // 답글 폼 토글
  const toggleReplyForm = (commentId) => {
    setShowReplyForm(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // 대댓글 입력 변경
  const handleReplyTextChange = (commentId, text) => {
    setReplyTexts(prev => ({
      ...prev,
      [commentId]: text
    }));
  };

  // 대댓글 작성
  const handleSubmitReply = (commentId) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    const replyText = replyTexts[commentId];
    if (!replyText || !replyText.trim()) {
      alert('답글 내용을 입력하세요.');
      return;
    }
    onAddComment(post.id, replyText, commentId);
    setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
    setShowReplyForm(prev => ({ ...prev, [commentId]: false }));
  };

  // 댓글 총 개수 계산 (댓글 + 대댓글)
  const getTotalCommentCount = () => {
    if (!post.comments) return 0;
    return post.comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);
  };

  return (
    <div className="post-detail-container">
      <div className="detail-header">
        <h2>{post.title}</h2>
        <div className="detail-info">
          <span>작성자: {post.authorName || post.author}</span>
          <span>작성일: {new Date(post.date).toLocaleString()}</span>
          <span>조회수: {post.views}</span>
          <span>좋아요: {post.likes || 0}</span>
        </div>
      </div>
      
      <div className="detail-content">
        {post.content}
        
        {/* 미디어 첨부 파일 */}
        {post.media && post.media.length > 0 && (
          <div className="media-section">
            {post.media.map((media, index) => (
              <div key={index} className="media-item">
                {media.type === 'image' ? (
                  <img src={media.url} alt={`첨부 이미지 ${index + 1}`} />
                ) : media.type === 'video' ? (
                  <video controls>
                    <source src={media.url} />
                    브라우저가 비디오를 지원하지 않습니다.
                  </video>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="detail-like-section">
        <button
          className={`btn-like-large ${isLiked ? 'liked' : ''}`}
          onClick={() => onToggleLike(post.id)}
        >
          {isLiked ? '❤️' : '🤍'} 좋아요 {post.likes || 0}
        </button>
        <button
          className={`btn-scrap ${isScrapped ? 'scrapped' : ''}`}
          onClick={handleToggleScrap}
        >
          {isScrapped ? '📌' : '📍'} {isScrapped ? '스크랩됨' : '스크랩'}
        </button>
      </div>

      {/* 댓글 섹션 */}
      <div className="comments-section">
        <h3>댓글 {getTotalCommentCount()}개</h3>
        
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={currentUser ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
            rows="3"
            disabled={!currentUser}
          />
          <button type="submit" className="btn-comment-submit" disabled={!currentUser}>
            댓글 작성
          </button>
        </form>

        <div className="comments-list">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => {
              const isCommentAuthor = currentUser && comment.author === currentUser.username;
              return (
                <div key={comment.id} className="comment-wrapper">
                  <div className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.authorName || comment.author}</span>
                      <span className="comment-date">
                        {new Date(comment.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      {currentUser && (
                        <button
                          className="btn-reply"
                          onClick={() => toggleReplyForm(comment.id)}
                        >
                          답글
                        </button>
                      )}
                      {isCommentAuthor && (
                        <button
                          className="btn-comment-delete"
                          onClick={() => {
                            if (window.confirm('댓글을 삭제하시겠습니까?')) {
                              onDeleteComment(post.id, comment.id);
                            }
                          }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 답글 작성 폼 */}
                  {showReplyForm[comment.id] && currentUser && (
                    <div className="reply-form">
                      <textarea
                        value={replyTexts[comment.id] || ''}
                        onChange={(e) => handleReplyTextChange(comment.id, e.target.value)}
                        placeholder="답글을 입력하세요..."
                        rows="2"
                      />
                      <div className="reply-form-actions">
                        <button
                          className="btn-reply-submit"
                          onClick={() => handleSubmitReply(comment.id)}
                        >
                          답글 작성
                        </button>
                        <button
                          className="btn-reply-cancel"
                          onClick={() => toggleReplyForm(comment.id)}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 대댓글 목록 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-list">
                      {comment.replies.map((reply) => {
                        const isReplyAuthor = currentUser && reply.author === currentUser.username;
                        return (
                          <div key={reply.id} className="reply-item">
                            <div className="reply-header">
                              <span className="reply-icon">↳</span>
                              <span className="reply-author">{reply.authorName || reply.author}</span>
                              <span className="reply-date">
                                {new Date(reply.date).toLocaleString()}
                              </span>
                            </div>
                            <div className="reply-content">{reply.content}</div>
                            {isReplyAuthor && (
                              <button
                                className="btn-reply-delete"
                                onClick={() => {
                                  if (window.confirm('답글을 삭제하시겠습니까?')) {
                                    onDeleteComment(post.id, reply.id, comment.id);
                                  }
                                }}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="no-comments">첫 댓글을 작성해보세요!</p>
          )}
        </div>
      </div>
      
      <div className="detail-actions">
        <button className="btn-back" onClick={() => onBack(post.category)}>목록</button>
        <div>
          {isAuthor && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* 관련 게시글 */}
      {relatedPosts.length > 0 && (
        <div className="related-posts">
          <h3>같은 게시판의 다른 글</h3>
          <ul className="related-list">
            {relatedPosts.map(relatedPost => (
              <li key={relatedPost.id} onClick={() => onSelectPost(relatedPost.id)}>
                <span className="related-title">{relatedPost.title}</span>
                <span className="related-meta">
                  <span>👁️ {relatedPost.views}</span>
                  <span>❤️ {relatedPost.likes}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PostDetail;
