import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, onSwitchToRegister, onSwitchToFindAccount }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('사용자명 또는 이메일을 입력하세요.');
      return;
    }
    if (!formData.password) {
      setError('비밀번호를 입력하세요.');
      return;
    }

    try {
      onLogin(formData.username, formData.password, formData.rememberMe);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>로그인</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">사용자명 또는 이메일</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="사용자명 또는 이메일을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>자동 로그인</span>
            </label>
          </div>

          <button type="submit" className="btn-submit">로그인</button>
        </form>

        <div className="auth-links">
          <button onClick={onSwitchToRegister} className="link-button">
            회원가입
          </button>
          <span className="divider">|</span>
          <button onClick={onSwitchToFindAccount} className="link-button">
            계정 찾기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
