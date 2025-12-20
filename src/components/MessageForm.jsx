import React, { useState } from 'react';
import './MessageForm.css';

function MessageForm({ currentUser, onClose, onSendMessage }) {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 입력 검증
    if (!recipient.trim()) {
      setError('받는 사람을 입력하세요.');
      return;
    }

    if (!message.trim()) {
      setError('메시지 내용을 입력하세요.');
      return;
    }

    // 위험한 문자 체크 (XSS 방지)
    const dangerousPattern = /<script|<iframe|javascript:|onerror=|onload=/i;
    if (dangerousPattern.test(message) || dangerousPattern.test(recipient)) {
      setError('위험한 문자가 포함되어 있습니다.');
      return;
    }

    // 사용자 존재 여부 확인
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const targetUser = users.find(u => u.username.toLowerCase() === recipient.toLowerCase());

    if (!targetUser) {
      setError('존재하지 않는 사용자입니다.');
      return;
    }

    if (targetUser.username === currentUser.username) {
      setError('자기 자신에게는 메시지를 보낼 수 없습니다.');
      return;
    }

    // 메시지 전송
    const newMessage = {
      id: Date.now(),
      from: currentUser.username,
      fromName: currentUser.username,
      to: targetUser.username,
      toName: targetUser.username,
      content: message.trim(),
      date: new Date().toISOString(),
      read: false
    };

    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));

    if (onSendMessage) {
      onSendMessage(newMessage);
    }

    alert('메시지가 전송되었습니다.');
    onClose();
  };

  return (
    <div className="message-form-overlay" onClick={onClose}>
      <div className="message-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="message-form-header">
          <h2>메시지 보내기</h2>
          <button className="btn-close-modal" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="message-error">{error}</div>}
          
          <div className="form-group">
            <label>받는 사람</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="사용자 이름을 입력하세요"
              className="message-input"
            />
          </div>

          <div className="form-group">
            <label>메시지</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요 (텍스트만 가능)"
              className="message-textarea"
              rows="8"
            />
            <div className="char-count">{message.length} / 500</div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-send">
              전송
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MessageForm;
