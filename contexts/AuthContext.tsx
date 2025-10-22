/**
import { useSafeState } from '../hooks/useSafeState';
 * 인증 컨텍스트 (Supabase 통합)
 * 타로 타이머 웹앱용 인증 시스템
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
  updateProfile,
  UserProfile,
} from '../utils/supabase';

// 인증 상태 인터페이스
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
}

// 인증 컨텍스트 타입
interface AuthContextType extends AuthState {
  // 인증 관련
  login: (email: string, password: string) => Promise<{ user: SupabaseUser; session: Session }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, userData?: any) => Promise<{ user: SupabaseUser; session: Session }>;
  resetUserPassword: (email: string) => Promise<void>;

  // 게스트 사용자 관리 (로컬 저장소)
  createGuestUser: () => Promise<string>;
  upgradeGuestToUser: (email: string, password: string) => Promise<boolean>;

  // 사용자 정보 관리
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  refreshUserData: () => Promise<void>;

  // 유틸리티
  isEmailVerified: boolean;

  // 백엔드 API 헤더 (NotificationContext와 호환)
  getAuthHeaders: () => Record<string, string>;
}

// 기본값
const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  user: null,
  profile: null,
  session: null,
};

// 게스트 사용자 키
const GUEST_USER_KEY = '@tarot_timer_guest_user_id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useSafeState<AuthState>(DEFAULT_AUTH_STATE);

  // 프로필 정보 가져오기
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('프로필 조회 오류:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('프로필 조회 중 예외:', error);
      return null;
    }
  };

  // 세션 상태 업데이트
  const updateAuthState = async (session: Session | null) => {
    setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }));

    if (session?.user) {
      // 사용자가 로그인된 경우 프로필 정보 가져오기
      const profileData = await fetchProfile(session.user.id);
      setAuthState(prev => ({
        ...prev,
        profile: profileData,
        isAuthenticated: true,
        isLoading: false,
      }));
    } else {
      setAuthState(prev => ({
        ...prev,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  };

  // 초기화 및 인증 상태 리스너 설정
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 현재 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('세션 확인 오류:', error);
        }

        await updateAuthState(session);

        // 인증 상태 변경 리스너 설정
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('인증 상태 변경:', event, session?.user?.email);

          switch (event) {
            case 'SIGNED_IN':
              await updateAuthState(session);
              break;
            case 'SIGNED_OUT':
              await updateAuthState(null);
              break;
            case 'TOKEN_REFRESHED':
              await updateAuthState(session);
              break;
            case 'USER_UPDATED':
              if (session?.user) {
                const profileData = await fetchProfile(session.user.id);
                setAuthState(prev => ({ ...prev, profile: profileData }));
              }
              break;
            default:
              break;
          }
        });

        setAuthState(prev => ({ ...prev, initialized: true }));

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('인증 초기화 오류:', error);
        setAuthState(prev => ({ ...prev, isLoading: false, initialized: true }));
      }
    };

    initializeAuth();
  }, []);

  // 로그인
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const result = await signInWithEmail(email, password);
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // 회원가입
  const register = async (email: string, password: string, userData?: any) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const result = await signUpWithEmail(email, password, userData);
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // 로그아웃
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await signOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 비밀번호 재설정
  const resetUserPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      throw error;
    }
  };

  // 게스트 사용자 생성
  const createGuestUser = async (): Promise<string> => {
    try {
      // 기존 게스트 ID가 있는지 확인
      const existingGuestId = await AsyncStorage.getItem(GUEST_USER_KEY);
      if (existingGuestId) {
        return existingGuestId;
      }

      // 새로운 게스트 ID 생성
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(GUEST_USER_KEY, guestId);
      return guestId;
    } catch (error) {
      console.error('게스트 사용자 생성 오류:', error);
      // 로컬 게스트 ID 생성
      const localGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(GUEST_USER_KEY, localGuestId);
      return localGuestId;
    }
  };

  // 게스트를 정식 사용자로 업그레이드
  const upgradeGuestToUser = async (email: string, password: string): Promise<boolean> => {
    try {
      const guestId = await AsyncStorage.getItem(GUEST_USER_KEY);
      if (!guestId) {
        return false;
      }

      // 회원가입 진행
      const result = await register(email, password, { upgraded_from_guest: guestId });

      // 성공 시 게스트 ID 제거
      if (result) {
        await AsyncStorage.removeItem(GUEST_USER_KEY);
        return true;
      }

      return false;
    } catch (error) {
      console.error('게스트 업그레이드 오류:', error);
      return false;
    }
  };

  // 프로필 업데이트
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const updatedProfile = await updateProfile(authState.user.id, updates);
      setAuthState(prev => ({ ...prev, profile: updatedProfile }));
      return updatedProfile;
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      throw error;
    }
  };

  // 프로필 새로고침
  const refreshUserData = async () => {
    if (!authState.user) {
      return;
    }

    try {
      const profileData = await fetchProfile(authState.user.id);
      setAuthState(prev => ({ ...prev, profile: profileData }));
    } catch (error) {
      console.error('프로필 새로고침 오류:', error);
    }
  };

  // 백엔드 API 요청용 인증 헤더 생성
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 세션이 있으면 Authorization 헤더 추가
    if (authState.session?.access_token) {
      headers['Authorization'] = `Bearer ${authState.session.access_token}`;
    }

    return headers;
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    resetUserPassword,
    createGuestUser,
    upgradeGuestToUser,
    updateUserProfile,
    refreshUserData,
    isEmailVerified: authState.user?.email_confirmed_at !== null,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 필요 컴포넌트 래퍼
interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  fallback = <div>로그인이 필요합니다.</div>
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// 인증 상태별 조건부 렌더링 훅
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, initialized } = useAuth();

  return {
    isLoading: isLoading || !initialized,
    isAuthenticated,
    showLogin: initialized && !isLoading && !isAuthenticated,
    showApp: initialized && !isLoading && isAuthenticated,
  };
};

export default AuthProvider;