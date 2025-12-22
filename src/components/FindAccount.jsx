import React, { useState } from 'react';
import './FindAccount.css';

function FindAccount({ onFindAccount, onResetPassword, onSwitchToLogin }) {
  const [mode, setMode] = useState('find'); // 'find' or 'reset'
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [foundUsername, setFoundUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const sendVerificationCode = async () => {
    if (!email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }
    if (!email.includes('@')) {
      setError('유효한 이메일 주소를 입력하세요.');
      return;
    }

    setSendingCode(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setCodeSent(true);
        setMessage(data.message + (data.devCode ? ` (개발 모드 코드: ${data.devCode})` : ''));
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
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await response.json();

      if (response.ok) {
        setCodeVerified(true);
        setMessage(data.message);
        setError('');
      } else {
        setError(data.error || '인증에 실패했습니다.');
      }
    } catch (err) {
      setError('서버와 통신할 수 없습니다.');
    }
  };

  const handleFindAccount = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }

    try {
      const username = onFindAccount(email);
      if (username) {
        setFoundUsername(username);
        setMessage(`회원님의 사용자명은 "${username}" 입니다.`);
      } else {
        setError('해당 이메일로 등록된 계정이 없습니다.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }
    if (!codeVerified) {
      setError('이메일 인증을 먼저 완료해주세요.');
      return;
    }
    if (!newPassword) {
      setError('새 비밀번호를 입력하세요.');
      return;
    }
    if (newPassword.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      onResetPassword(email, newPassword);
      setMessage('비밀번호가 성공적으로 재설정되었습니다.');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setCodeSent(false);
      setCodeVerified(false);
      setVerificationCode('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>계정 찾기</h2>
        
        <div className="mode-tabs">
          <button
            className={mode === 'find' ? 'active' : ''}
            onClick={() => {
              setMode('find');
              setError('');
              setMessage('');
            }}
          >
            사용자명 찾기
          </button>
          <button
            className={mode === 'reset' ? 'active' : ''}
            onClick={() => {
              setMode('reset');
              setError('');
              setMessage('');
            }}
          >
            비밀번호 재설정
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {mode === 'find' ? (
          <form onSubmit={handleFindAccount}>
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입 시 사용한 이메일을 입력하세요"
              />
            </div>
            <button type="submit" className="btn-submit">사용자명 찾기</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <div className="input-with-button">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="가입 시 사용한 이메일을 입력하세요"
                  disabled={codeVerified}
                />
                <button 
                  type="button" 
                  className="btn-check"
                  onClick={sendVerificationCode}
                  disabled={!email || sendingCode || codeVerified}
                >
                  {sendingCode ? '전송중...' : codeVerified ? '인증완료' : '인증코드'}
                </button>
              </div>
              {codeVerified && (
                <div className="check-message success">✓ 이메일 인증이 완료되었습니다</div>
              )}
            </div>

            {codeSent && !codeVerified && (
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
              <label htmlFor="newPassword">새 비밀번호</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                disabled={!codeVerified}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={!codeVerified}
              />
            </div>
            <button type="submit" className="btn-submit" disabled={!codeVerified}>비밀번호 재설정</button>
          </form>
        )}

        <div className="auth-links">
          <button onClick={onSwitchToLogin} className="link-button">
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default FindAccount;
