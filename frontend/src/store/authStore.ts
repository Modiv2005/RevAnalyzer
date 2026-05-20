import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (tokenData: { access_token: string; user_id: string; email: string; role: string; full_name?: string }) => void;
  logout: () => void;
  setError: (err: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load token from local storage
  const storedToken = localStorage.getItem('bi_token');
  const storedUser = localStorage.getItem('bi_user');
  
  let parsedUser: User | null = null;
  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      parsedUser = null;
    }
  }

  return {
    token: storedToken,
    user: parsedUser,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
    login: (tokenData) => {
      localStorage.setItem('bi_token', tokenData.access_token);
      const userObj = {
        id: tokenData.user_id,
        email: tokenData.email,
        role: tokenData.role,
        full_name: tokenData.full_name
      };
      localStorage.setItem('bi_user', JSON.stringify(userObj));
      set({
        token: tokenData.access_token,
        user: userObj,
        isAuthenticated: true,
        error: null
      });
    },
    logout: () => {
      localStorage.removeItem('bi_token');
      localStorage.removeItem('bi_user');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        error: null
      });
    },
    setError: (err) => set({ error: err })
  };
});
