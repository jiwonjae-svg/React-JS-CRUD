import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 현재 사용자 정보 불러오기
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await authAPI.getCurrentUser();
          setCurrentUser(data.user);
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
          // 토큰이 유효하지 않으면 제거
          await authAPI.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // 회원가입
  const register = async (username, email, password, name) => {
    try {
      const data = await authAPI.register(username, email, password, name);
      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }
  };

  // 로그인
  const login = async (username, password) => {
    try {
      const data = await authAPI.login(username, password);
      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setCurrentUser(null);
    }
  };

  // 회원정보 수정
  const updateProfile = async (userId, updatedData) => {
    try {
      const { usersAPI } = await import('../services/api');
      const data = await usersAPI.updateUser(userId, updatedData);
      
      // 현재 로그인한 사용자 정보 업데이트
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(data.user);
      }
      
      return data.user;
    } catch (error) {
      throw new Error(error.message || '회원정보 수정에 실패했습니다.');
    }
  };

  // 계정 삭제
  const deleteAccount = async (userId) => {
    try {
      const { usersAPI } = await import('../services/api');
      await usersAPI.deleteUser(userId);
      
      if (currentUser && currentUser.id === userId) {
        await logout();
      }
    } catch (error) {
      throw new Error(error.message || '계정 삭제에 실패했습니다.');
    }
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    updateProfile,
    deleteAccount
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
