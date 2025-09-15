import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 사용자 정보 인터페이스 (백엔드와 일치)
export interface User {
  id: string;
  email: string;
  subscriptionStatus: 'free' | 'trial' | 'premium';
  trialEndDate?: Date;
  createdAt?: Date;
  lastLoginAt?: Date;
}

// 인증 상태 인터페이스
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

// 인증 액션 인터페이스
interface AuthContextType extends AuthState {
  // 인증 관련
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;

  // 게스트 사용자 관리
  createGuestUser: () => Promise<string>; // 게스트 사용자 ID 반환
  upgradeGuestToUser: (email: string, password: string) => Promise<boolean>;

  // 토큰 관리
  getAuthHeaders: () => { Authorization?: string };
  isTokenValid: () => boolean;

  // 사용자 정보 관리
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

// 기본값
const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  refreshToken: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 토큰 저장소 키 상수
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@tarot_timer_access_token',
  REFRESH_TOKEN: '@tarot_timer_refresh_token',
  USER_DATA: '@tarot_timer_user_data',
  GUEST_USER_ID: '@tarot_timer_guest_user_id',
};

// API URL 헬퍼 함수
const getApiUrl = (): string => {
  const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  return apiUrl;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);

  // 컴포넌트 마운트 시 저장된 토큰 및 사용자 정보 로드
  useEffect(() => {
    loadStoredAuthData();
  }, []);

  // 저장된 인증 데이터 로드
  const loadStoredAuthData = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const [storedToken, storedRefreshToken, storedUserData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (storedToken && storedUserData) {
        const user: User = JSON.parse(storedUserData);

        // 토큰 유효성 검사
        if (isTokenValidInternal(storedToken)) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
            token: storedToken,
            refreshToken: storedRefreshToken,
          });
        } else {
          // 토큰이 만료된 경우 refresh 토큰으로 갱신 시도
          if (storedRefreshToken) {
            const refreshed = await refreshAccessTokenInternal(storedRefreshToken);
            if (!refreshed) {
              // 갱신 실패 시 로그아웃
              await clearAuthData();
            }
          } else {
            await clearAuthData();
          }
        }
      } else {
        // 저장된 인증 정보가 없으면 게스트 모드
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading stored auth data:', error);
      await clearAuthData();
    }
  };

  // 로그인
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user, token, refreshToken } = await response.json();

        // 토큰과 사용자 정보 저장
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        ]);

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          token,
          refreshToken,
        });

        return true;
      } else {
        const errorData = await response.json();
        console.error('Login error:', errorData);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Login network error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // 회원가입
  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(`${getApiUrl()}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user, token, refreshToken } = await response.json();

        // 토큰과 사용자 정보 저장
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        ]);

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          token,
          refreshToken,
        });

        return true;
      } else {
        const errorData = await response.json();
        console.error('Register error:', errorData);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Register network error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // 로그아웃
  const logout = async (): Promise<void> => {
    try {
      // 서버에 로그아웃 요청 (토큰 무효화)
      if (authState.token) {
        await fetch(`${getApiUrl()}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuthData();
    }
  };

  // 게스트 사용자 생성
  const createGuestUser = async (): Promise<string> => {
    try {
      // 기존 게스트 ID가 있는지 확인
      const existingGuestId = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_USER_ID);
      if (existingGuestId) {
        return existingGuestId;
      }

      // 새로운 게스트 사용자 생성
      const response = await fetch(`${getApiUrl()}/api/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { guestId } = await response.json();
        await AsyncStorage.setItem(STORAGE_KEYS.GUEST_USER_ID, guestId);
        return guestId;
      } else {
        throw new Error('Failed to create guest user');
      }
    } catch (error) {
      console.error('Error creating guest user:', error);
      // 로컬 게스트 ID 생성
      const localGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.GUEST_USER_ID, localGuestId);
      return localGuestId;
    }
  };

  // 게스트를 정식 사용자로 업그레이드
  const upgradeGuestToUser = async (email: string, password: string): Promise<boolean> => {
    try {
      const guestId = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_USER_ID);
      if (!guestId) {
        return false;
      }

      const response = await fetch(`${getApiUrl()}/api/auth/upgrade-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestId, email, password }),
      });

      if (response.ok) {
        const { user, token, refreshToken } = await response.json();

        // 게스트 ID 제거 및 정식 사용자 토큰 저장
        await Promise.all([
          AsyncStorage.removeItem(STORAGE_KEYS.GUEST_USER_ID),
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
          AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        ]);

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          token,
          refreshToken,
        });

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error upgrading guest user:', error);
      return false;
    }
  };

  // 토큰 갱신
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!authState.refreshToken) {
      return false;
    }
    return refreshAccessTokenInternal(authState.refreshToken);
  };

  // 내부 토큰 갱신 함수
  const refreshAccessTokenInternal = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { token: newToken, refreshToken: newRefreshToken, user } = await response.json();

        // 새로운 토큰 저장
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken),
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken),
          AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        ]);

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          token: newToken,
          refreshToken: newRefreshToken,
        });

        return true;
      } else {
        await clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await clearAuthData();
      return false;
    }
  };

  // 인증 헤더 생성
  const getAuthHeaders = () => {
    if (authState.token) {
      return { Authorization: `Bearer ${authState.token}` };
    }
    return {};
  };

  // 토큰 유효성 검사
  const isTokenValid = (): boolean => {
    return authState.token ? isTokenValidInternal(authState.token) : false;
  };

  // 내부 토큰 유효성 검사
  const isTokenValidInternal = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // 사용자 프로필 업데이트
  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!authState.token) {
        return false;
      }

      const response = await fetch(`${getApiUrl()}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  // 사용자 데이터 새로고침
  const refreshUserData = async (): Promise<void> => {
    try {
      if (!authState.token) {
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        setAuthState(prev => ({
          ...prev,
          user,
        }));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // 인증 데이터 정리
  const clearAuthData = async (): Promise<void> => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
    ]);

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    refreshAccessToken,
    createGuestUser,
    upgradeGuestToUser,
    getAuthHeaders,
    isTokenValid,
    updateUserProfile,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;