import React, { useState } from 'react';
import './Register.css';

function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 사용자명 검증
    if (!formData.username.trim()) {
      setError('사용자명을 입력하세요.');
      return;
    }
    
    // 사용자명 길이 제한 (3-20자)
    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('사용자명은 3자 이상 20자 이하여야 합니다.');
      return;
    }
    
    // 사용자명 특수문자 제한 (영문, 숫자, 밑줄만 허용)
    const usernameRegex = /^[a-zA-Z0-9_가-힣]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('사용자명은 영문, 숫자, 한글, 밑줄(_)만 사용할 수 있습니다.');
      return;
    }
    
    // XSS 방지 - HTML 태그 차단
    if (/<script|<iframe|javascript:/i.test(formData.username)) {
      setError('사용자명에 허용되지 않는 문자가 포함되어 있습니다.');
      return;
    }
    
    // 중복 확인
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.username.toLowerCase() === formData.username.toLowerCase())) {
      setError('이미 사용 중인 사용자명입니다.');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('유효한 이메일 주소를 입력하세요.');
      return;
    }
    
    // 이메일 중복 확인
    if (users.some(user => user.email.toLowerCase() === formData.email.toLowerCase())) {
      setError('이미 사용 중인 이메일입니다.');
      return;
    }
    
    if (!formData.password) {
      setError('비밀번호를 입력하세요.');
      return;
    }
    if (formData.password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      onRegister(formData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>회원가입</h2>
        {error && <div className="error-message">{error}</div>}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <button type="submit" className="btn-submit">가입하기</button>
        </form>

        <div className="auth-links">
          <span>이미 계정이 있으신가요?</span>
          <button onClick={onSwitchToLogin} className="link-button">
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
