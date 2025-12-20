import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile({ onClose }) {
  const { currentUser, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setMessage('');
  };

  const handleDeleteAccount = () => {
    if (!window.confirm('정말로 회원탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    const password = window.prompt('비밀번호를 입력하세요:');
    if (!password) {
      return;
    }

    if (password !== currentUser.password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 사용자 삭제
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(u => u.id !== currentUser.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // 해당 사용자의 게시글, 댓글 삭제
      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      const updatedPosts = posts
        .filter(p => p.author !== currentUser.username)
        .map(p => ({
          ...p,
          comments: p.comments.filter(c => c.author !== currentUser.username)
        }));
      localStorage.setItem('posts', JSON.stringify(updatedPosts));

      // 자동 로그인 토큰 삭제
      localStorage.removeItem('autoLoginToken');

      alert('회원탈퇴가 완료되었습니다.');
      logout();
      onClose();
    } catch (err) {
      alert('회원탈퇴 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 비밀번호 변경을 시도하는 경우
    if (formData.newPassword) {
      if (formData.currentPassword !== currentUser.password) {
        setError('현재 비밀번호가 일치하지 않습니다.');
        return;
      }
      if (formData.newPassword.length < 4) {
        setError('새 비밀번호는 최소 4자 이상이어야 합니다.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('새 비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    try {
      const updatedData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword) {
        updatedData.password = formData.newPassword;
      }

      updateProfile(currentUser.id, updatedData);
      setMessage('회원정보가 성공적으로 수정되었습니다.');
      
      // 2초 후 자동으로 닫기
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>회원정보 수정</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="사용자명을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div className="divider-line"></div>
          <p className="section-title">비밀번호 변경 (선택사항)</p>

          <div className="form-group">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="새 비밀번호를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-submit">
              수정
            </button>
          </div>
        </form>

        <div className="danger-zone">
          <h3>위험 구역</h3>
          <p>회원탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
          <button type="button" className="btn-delete-account" onClick={handleDeleteAccount}>
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
