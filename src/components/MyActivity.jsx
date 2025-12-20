import React, { useState } from 'react';
import './MyActivity.css';

const MyActivity = ({ 
  posts, 
  currentUser,
  onSelectPost,
  onSelectBoard,
  onSendMessage,
  notifications,
  onNotificationClick,
  onDeleteNotification,
  onDeleteMessage,
  onDeleteScrap
}) => {
  const [activeTab, setActiveTab] = useState('posts'); // posts, notifications, favorites, scraps, messages
  const [selectedMessage, setSelectedMessage] = useState(null);

  // 내가 작성한 글 필터링
  const myPosts = posts.filter(post => post.author === currentUser.username);
  
  // 내가 작성한 댓글 필터링 (모든 게시글의 댓글 검색)
  const myComments = [];
  posts.forEach(post => {
    const userComments = post.comments.filter(c => c.author === currentUser.username);
    userComments.forEach(comment => {
      myComments.push({
        ...comment,
        postId: post.id,
        postTitle: post.title,
        postCategory: post.category
      });
    });
    
    // 대댓글도 검색
    post.comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        const userReplies = comment.replies.filter(r => r.author === currentUser.username);
        userReplies.forEach(reply => {
          myComments.push({
            ...reply,
            postId: post.id,
            postTitle: post.title,
            postCategory: post.category,
            isReply: true
          });
        });
      }
    });
  });

  // 즐겨찾기한 게시판
  const favoriteBoards = JSON.parse(localStorage.getItem('favoriteBoards') || '{}');
  const userFavorites = favoriteBoards[currentUser.username] || [];

  // 스크랩한 게시글
  const scrapData = JSON.parse(localStorage.getItem('scraps') || '{}');
  const userScraps = scrapData[currentUser.username] || [];
  const scrappedPosts = posts.filter(post => userScraps.includes(post.id));

  // 메시지
  const messages = JSON.parse(localStorage.getItem('messages') || '[]');
  const receivedMessages = messages.filter(msg => msg.to === currentUser.username);
  const sentMessages = messages.filter(msg => msg.from === currentUser.username);

  // 알림
  const userNotifications = notifications.filter(n => n.userId === currentUser.username);

  const boardNames = {
    comic: '만화',
    game: '게임',
    movie: '영화',
    book: '책',
    music: '음악',
    sports: '스포츠'
  };

  const handlePostClick = (postId, category) => {
    onSelectBoard(category);
    setTimeout(() => {
      onSelectPost(postId);
    }, 0);
  };

  const renderMyPosts = () => (
    <div className="activity-section">
      <h3>내가 작성한 글 ({myPosts.length})</h3>
      {myPosts.length === 0 ? (
        <p className="empty-message">작성한 글이 없습니다.</p>
      ) : (
        <div className="posts-list">
          {myPosts.map(post => (
            <div key={post.id} className="activity-item" onClick={() => handlePostClick(post.id, post.category)}>
              <div className="activity-item-header">
                <span className="board-badge">[{boardNames[post.category]}]</span>
                <span className="activity-title">{post.title}</span>
              </div>
              <div className="activity-meta">
                <span>{new Date(post.date).toLocaleDateString()}</span>
                <span>조회 {post.views}</span>
                <span>좋아요 {post.likes}</span>
                <span>댓글 {post.comments.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '30px' }}>내가 작성한 댓글 ({myComments.length})</h3>
      {myComments.length === 0 ? (
        <p className="empty-message">작성한 댓글이 없습니다.</p>
      ) : (
        <div className="comments-list">
          {myComments.map((comment, index) => (
            <div 
              key={`${comment.postId}-${comment.id}-${index}`} 
              className="activity-item"
              onClick={() => handlePostClick(comment.postId, comment.postCategory)}
            >
              <div className="activity-item-header">
                <span className="board-badge">[{boardNames[comment.postCategory]}]</span>
                <span className="activity-title">{comment.postTitle}</span>
              </div>
              <div className="comment-content">
                {comment.isReply && <span className="reply-icon">↳ </span>}
                {comment.content}
              </div>
              <div className="activity-meta">
                <span>{new Date(comment.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="activity-section">
      <h3>내 알림 ({userNotifications.length})</h3>
      {userNotifications.length === 0 ? (
        <p className="empty-message">알림이 없습니다.</p>
      ) : (
        <div className="notifications-list">
          {userNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`activity-item notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div 
                className="notification-content"
                onClick={() => onNotificationClick(notification)}
              >
                <div className="notification-type">{notification.type}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="activity-meta">
                  <span>{new Date(notification.date).toLocaleString()}</span>
                </div>
              </div>
              <button
                className="btn-delete-item"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('이 알림을 삭제하시겠습니까?')) {
                    onDeleteNotification(notification.id);
                  }
                }}
                title="삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="activity-section">
      <h3>즐겨찾기한 게시판 ({userFavorites.length})</h3>
      {userFavorites.length === 0 ? (
        <p className="empty-message">즐겨찾기한 게시판이 없습니다.</p>
      ) : (
        <div className="favorites-list">
          {userFavorites.map(boardId => (
            <div 
              key={boardId} 
              className="favorite-board-card"
              onClick={() => onSelectBoard(boardId)}
            >
              <div className="board-icon">📋</div>
              <div className="board-name">{boardNames[boardId]}</div>
              <div className="board-post-count">
                게시글 {posts.filter(p => p.category === boardId).length}개
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScraps = () => (
    <div className="activity-section">
      <h3>스크랩한 게시글 ({scrappedPosts.length})</h3>
      {scrappedPosts.length === 0 ? (
        <p className="empty-message">스크랩한 게시글이 없습니다.</p>
      ) : (
        <div className="posts-list">
          {scrappedPosts.map(post => (
            <div key={post.id} className="activity-item">
              <div 
                className="activity-content"
                onClick={() => handlePostClick(post.id, post.category)}
              >
                <div className="activity-item-header">
                  <span className="board-badge">[{boardNames[post.category]}]</span>
                  <span className="activity-title">{post.title}</span>
                </div>
                <div className="activity-meta">
                  <span>{post.authorName}</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span>조회 {post.views}</span>
                  <span>좋아요 {post.likes}</span>
                </div>
              </div>
              <button
                className="btn-delete-item"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('스크랩을 취소하시겠습니까?')) {
                    onDeleteScrap(post.id);
                  }
                }}
                title="스크랩 취소"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMessages = () => (
    <div className="activity-section">
      <h3>받은 메시지 ({receivedMessages.length})</h3>
      {receivedMessages.length === 0 ? (
        <p className="empty-message">받은 메시지가 없습니다.</p>
      ) : (
        <div className="messages-list">
          {receivedMessages.map(msg => (
            <div key={msg.id} className={`activity-item message-item ${msg.read ? 'read' : 'unread'}`}>
              <div className="message-content-wrapper">
                <div className="message-header">
                  <span className="message-from">보낸이: {msg.fromName}</span>
                  <span className="message-date">{new Date(msg.date).toLocaleString()}</span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
              <div className="message-actions">
                <button
                  className="btn-view-message"
                  onClick={() => setSelectedMessage(msg)}
                  title="자세히 보기"
                >
                  📖
                </button>
                <button
                  className="btn-delete-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('이 메시지를 삭제하시겠습니까?')) {
                      onDeleteMessage(msg.id);
                    }
                  }}
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '30px' }}>보낸 메시지 ({sentMessages.length})</h3>
      {sentMessages.length === 0 ? (
        <p className="empty-message">보낸 메시지가 없습니다.</p>
      ) : (
        <div className="messages-list">
          {sentMessages.map(msg => (
            <div key={msg.id} className="activity-item message-item">
              <div className="message-content-wrapper">
                <div className="message-header">
                  <span className="message-to">받는이: {msg.toName}</span>
                  <span className="message-date">{new Date(msg.date).toLocaleString()}</span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
              <div className="message-actions">
                <button
                  className="btn-view-message"
                  onClick={() => setSelectedMessage(msg)}
                  title="자세히 보기"
                >
                  📖
                </button>
                <button
                  className="btn-delete-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('이 메시지를 삭제하시겠습니까?')) {
                      onDeleteMessage(msg.id);
                    }
                  }}
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="my-activity">
      {/* 메시지 자세히 보기 모달 */}
      {selectedMessage && (
        <div className="message-detail-modal" onClick={() => setSelectedMessage(null)}>
          <div className="message-detail-content" onClick={(e) => e.stopPropagation()}>
            <div className="message-detail-header">
              <h3>메시지 자세히 보기</h3>
              <button className="btn-close-modal" onClick={() => setSelectedMessage(null)}>✕</button>
            </div>
            <div className="message-detail-body">
              <div className="message-detail-info">
                <div className="info-row">
                  <span className="info-label">보낸이:</span>
                  <span className="info-value">{selectedMessage.fromName}</span>
                </div>
                {selectedMessage.to && (
                  <div className="info-row">
                    <span className="info-label">받는이:</span>
                    <span className="info-value">{selectedMessage.toName}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">날짜:</span>
                  <span className="info-value">{new Date(selectedMessage.date).toLocaleString()}</span>
                </div>
              </div>
              <div className="message-detail-text">
                {selectedMessage.content}
              </div>
            </div>
            <div className="message-detail-footer">
              <button className="btn-close" onClick={() => setSelectedMessage(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <div className="activity-header">
        <h2>내 활동</h2>
      </div>
      
      <div className="activity-tabs">
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          작성글
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          내 알림
        </button>
        <button 
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          즐겨찾기
        </button>
        <button 
          className={`tab-btn ${activeTab === 'scraps' ? 'active' : ''}`}
          onClick={() => setActiveTab('scraps')}
        >
          스크랩
        </button>
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          메시지
        </button>
      </div>

      <div className="activity-content">
        {activeTab === 'posts' && renderMyPosts()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'favorites' && renderFavorites()}
        {activeTab === 'scraps' && renderScraps()}
        {activeTab === 'messages' && renderMessages()}
      </div>
    </div>
  );
};

export default MyActivity;
