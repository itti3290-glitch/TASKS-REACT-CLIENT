import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from './types';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readSavedUser(): User | null {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(readSavedUser());

  function login(newToken: string, newUser: User) {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  // Same token, new details (for example after the user edits their profile).
  function updateUser(newUser: User) {
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
