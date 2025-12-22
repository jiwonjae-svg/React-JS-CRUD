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
  const [usernameCheckStatus, setUsernameCheckStatus] = useState(''); // '', 'checking', 'available', 'taken'
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    // 사용자명이 변경되면 재확인 필요
    if (name === 'username') {
      setUsernameChecked(false);
      setUsernameCheckStatus('');
    }
    // 이메일이 변경되면 재인증 필요
    if (name === 'email') {
      setEmailVerified(false);
      setCodeSent(false);
    }
  };

  const checkUsername = async () => {
    if (!formData.username.trim()) {
      setError('사용자명을 입력하세요.');
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('사용자명은 3자 이상 20자 이하여야 합니다.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_가-힣]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('사용자명은 영문, 숫자, 한글, 밑줄(_)만 사용할 수 있습니다.');
      return;
    }

    setUsernameCheckStatus('checking');
    setError('');

    // 로컬스토리지에서 확인
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const exists = users.some(user => user.username.toLowerCase() === formData.username.toLowerCase());
      
      if (exists) {
        setUsernameCheckStatus('taken');
        setUsernameChecked(false);
        setError('이미 사용 중인 사용자명입니다.');
      } else {
        setUsernameCheckStatus('available');
        setUsernameChecked(true);
      }
    }, 500);
  };

  const sendVerificationCode = async () => {
    if (!formData.email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('유효한 이메일 주소를 입력하세요.');
      return;
    }

    setSendingCode(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setCodeSent(true);
        alert(data.message + (data.devCode ? ` (개발 모드 코드: ${data.devCode})` : ''));
      } else {
        setError(data.error || '인증 코드 전송에 실패했습니다.');
      }
    } catch (err) {
      setError('서버와 통신할 수 없습니다.');
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('인증 코드를 입력하세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/email/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          code: verificationCode 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailVerified(true);
        setError('');
        alert(data.message);
      } else {
        setError(data.error || '인증에 실패했습니다.');
      }
    } catch (err) {
      setError('서버와 통신할 수 없습니다.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 사용자명 중복 확인 체크
    if (!usernameChecked) {
      setError('사용자명 중복 확인을 해주세요.');
      return;
    }

    // 이메일 인증 체크
    if (!emailVerified) {
      setError('이메일 인증을 완료해주세요.');
      return;
    }
    
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
            <div className="input-with-button">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="사용자명을 입력하세요"
              />
              <button 
                type="button" 
                className="btn-check"
                onClick={checkUsername}
                disabled={!formData.username || usernameCheckStatus === 'checking'}
              >
                {usernameCheckStatus === 'checking' ? '확인중...' : '중복확인'}
              </button>
            </div>
            {usernameCheckStatus === 'available' && (
              <div className="check-message success">✓ 사용 가능한 사용자명입니다</div>
            )}
            {usernameCheckStatus === 'taken' && (
              <div className="check-message error">✗ 이미 사용 중인 사용자명입니다</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <div className="input-with-button">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
                disabled={emailVerified}
              />
              <button 
                type="button" 
                className="btn-check"
                onClick={sendVerificationCode}
                disabled={!formData.email || sendingCode || emailVerified}
              >
                {sendingCode ? '전송중...' : emailVerified ? '인증완료' : '인증코드'}
              </button>
            </div>
            {emailVerified && (
              <div className="check-message success">✓ 이메일 인증이 완료되었습니다</div>
            )}
          </div>

          {codeSent && !emailVerified && (
            <div className="form-group">
              <label htmlFor="verificationCode">인증 코드</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="6자리 인증 코드 입력"
                  maxLength={6}
                />
                <button 
                  type="button" 
                  className="btn-check"
                  onClick={verifyCode}
                  disabled={!verificationCode}
                >
                  확인
                </button>
              </div>
              <div className="check-message info">📧 이메일로 전송된 6자리 코드를 입력하세요 (5분간 유효)</div>
            </div>
          )}

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
