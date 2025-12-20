import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  validateUsername, 
  validateEmail, 
  validatePassword, 
  hashPassword,
  sanitizeHTML,
  checkRateLimit,
  isSessionExpired
} from '../utils/security';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  // localStorage에서 사용자 데이터 불러오기
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    const savedCurrentUser = localStorage.getItem('currentUser');
    const autoLoginToken = localStorage.getItem('autoLoginToken');
    const loginTime = localStorage.getItem('loginTime');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    
    // 세션 만료 체크 (60분)
    if (savedCurrentUser && loginTime) {
      if (isSessionExpired(parseInt(loginTime), 60)) {
        // 세션 만료
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTime');
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }
    }
    
    // 자동 로그인 체크
    if (autoLoginToken && !savedCurrentUser) {
      try {
        const tokenData = JSON.parse(autoLoginToken);
        const savedUsersList = savedUsers ? JSON.parse(savedUsers) : [];
        const user = savedUsersList.find(
          u => u.username === tokenData.username && u.passwordHash === tokenData.passwordHash
        );
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('loginTime', Date.now().toString());
        } else {
          // 토큰이 유효하지 않으면 제거
          localStorage.removeItem('autoLoginToken');
        }
      } catch (error) {
        localStorage.removeItem('autoLoginToken');
      }
    } else if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    }
  }, []);

  // 회원가입
  const register = (userData) => {
    const { username, email, password } = userData;
    
    // 입력 검증
    if (!validateUsername(username)) {
      throw new Error('사용자명은 3-20자의 영문, 숫자, 언더스코어만 가능합니다.');
    }
    
    if (!validateEmail(email)) {
      throw new Error('올바른 이메일 형식이 아닙니다.');
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error('비밀번호: ' + passwordValidation.errors.join(' '));
    }
    
    // XSS 방지: 입력값 sanitize
    const sanitizedUsername = sanitizeHTML(username);
    const sanitizedEmail = sanitizeHTML(email);
    
    // 중복 체크
    if (users.find(u => u.username === sanitizedUsername)) {
      throw new Error('이미 존재하는 사용자명입니다.');
    }
    if (users.find(u => u.email === sanitizedEmail)) {
      throw new Error('이미 등록된 이메일입니다.');
    }

    // 비밀번호 해싱
    const passwordHash = hashPassword(password);

    const newUser = {
      id: Date.now(),
      username: sanitizedUsername,
      email: sanitizedEmail,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    return newUser;
  };

  // 로그인
  const login = (username, password, rememberMe = false) => {
    // Rate Limiting 체크 (5번 시도 제한, 1분 윈도우)
    const rateLimit = checkRateLimit('login', 5, 60000);
    if (!rateLimit.allowed) {
      const seconds = Math.ceil(rateLimit.retryAfter / 1000);
      throw new Error(`너무 많은 로그인 시도입니다. ${seconds}초 후에 다시 시도해주세요.`);
    }
    
    // XSS 방지
    const sanitizedUsername = sanitizeHTML(username);
    
    // 비밀번호 해싱
    const passwordHash = hashPassword(password);
    
    const user = users.find(
      u => (u.username === sanitizedUsername || u.email === sanitizedUsername) && u.passwordHash === passwordHash
    );

    if (!user) {
      throw new Error('사용자명 또는 비밀번호가 올바르지 않습니다.');
    }

    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('loginTime', Date.now().toString());
    
    // 자동 로그인 설정
    if (rememberMe) {
      const autoLoginToken = {
        username: user.username,
        passwordHash: user.passwordHash,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('autoLoginToken', JSON.stringify(autoLoginToken));
    } else {
      localStorage.removeItem('autoLoginToken');
    }
    
    return user;
  };

  // 로그아웃
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('autoLoginToken');
    localStorage.removeItem('loginTime');
  };

  // 계정 찾기 (이메일로)
  const findAccount = (email) => {
    const user = users.find(u => u.email === email);
    return user ? user.username : null;
  };

  // 비밀번호 재설정
  const resetPassword = (email, newPassword) => {
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      throw new Error('해당 이메일로 등록된 계정이 없습니다.');
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // 회원정보 수정
  const updateProfile = (userId, updatedData) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...updatedData };
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // 현재 로그인한 사용자 정보도 업데이트
    if (currentUser && currentUser.id === userId) {
      const updatedCurrentUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    findAccount,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
