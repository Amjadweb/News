import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, User, NewsArticle } from '../types';
import { translations, Language } from '../i18n/translations';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  viewPayload: any;
  navigateTo: (view: string, payload?: any) => void;
  currentUser: User | null;
  authToken: string | null;
  permissions: string[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (role?: UserRole, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  hasRolePermission: (permission: string) => boolean;
  savedArticles: string[];
  toggleSaveArticle: (id: string) => void;
  clearAllSavedArticles: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  formatDhakaTime: (isoDate: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewPayload, setViewPayload] = useState<any>(null);

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('truthpulse_auth_token') || null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('truthpulse_auth_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return {
      id: 'usr_owner_1',
      name: 'Rahim Chowdhury (Chief Editor & Owner)',
      email: 'owner@truthpulse.ai',
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00Z',
    };
  });

  const [permissions, setPermissions] = useState<string[]>([
    'ADMIN_ACCESS',
    'MANAGE_SOURCES',
    'MANAGE_SETTINGS',
    'MANAGE_USERS',
    'PUBLISH_NEWS',
    'EDIT_NEWS',
    'DELETE_NEWS',
    'TRIGGER_INGESTION',
    'VIEW_AUDIT_LOGS',
    'VIEW_METRICS',
    'USE_AI_ASSISTANT',
    'FACT_CHECK_MANAGE',
  ]);

  const [savedArticles, setSavedArticles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('truthpulse_saved_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string');
        }
      }
    } catch (e) {
      console.warn('Could not read saved articles from localStorage', e);
    }
    return [];
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial Auth Boot Check or Refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('truthpulse_auth_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setPermissions(data.permissions || []);
            localStorage.setItem('truthpulse_auth_user', JSON.stringify(data.user));
            return;
          }
        } catch (e) {
          console.warn('Stored JWT expired or invalid, requesting fresh session...');
        }
      }

      // Auto-issue initial valid token for default Owner session
      try {
        const res = await fetch('/api/auth/quick-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'OWNER' }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.token) {
            setAuthToken(data.token);
            setCurrentUser(data.user);
            setPermissions(data.permissions || []);
            localStorage.setItem('truthpulse_auth_token', data.token);
            localStorage.setItem('truthpulse_auth_user', JSON.stringify(data.user));
          }
        }
      } catch (err) {
        // Dev server or network offline/starting: retained local state
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setPermissions(data.permissions || []);
        localStorage.setItem('truthpulse_auth_token', data.token);
        localStorage.setItem('truthpulse_auth_user', JSON.stringify(data.user));
        addToast(`Signed in as ${data.user.name} (${data.user.role})`, 'success');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Authentication failed' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const quickLogin = async (role: UserRole = 'OWNER', email?: string) => {
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setPermissions(data.permissions || []);
        localStorage.setItem('truthpulse_auth_token', data.token);
        localStorage.setItem('truthpulse_auth_user', JSON.stringify(data.user));
        addToast(`Session switched to ${data.user.role}: ${data.user.name}`, 'info');
        return { success: true };
      }
      return { success: false, error: 'Quick login failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setPermissions([]);
    localStorage.removeItem('truthpulse_auth_token');
    localStorage.removeItem('truthpulse_auth_user');
    addToast('Signed out of admin session', 'info');
  };

  // Authenticated Fetch Wrapper
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = authToken || localStorage.getItem('truthpulse_auth_token');
      const headers = new Headers(options.headers || {});

      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (res.status === 401) {
        console.warn('Received 401 Unauthorized from backend');
      }

      return res;
    },
    [authToken]
  );

  const hasRolePermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const navigateTo = (view: string, payload: any = null) => {
    setCurrentView(view);
    setViewPayload(payload);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveArticle = (id: string) => {
    setSavedArticles((prev) => {
      const exists = prev.includes(id);
      let updated: string[];
      if (exists) {
        updated = prev.filter((item) => item !== id);
        addToast(
          language === 'bn'
            ? 'সংরক্ষিত তালিকা থেকে সরানো হয়েছে'
            : 'Article removed from saved items',
          'info'
        );
      } else {
        updated = [...prev, id];
        addToast(
          language === 'bn'
            ? 'সংরক্ষিত তালিকায় যোগ করা হয়েছে'
            : 'Article saved to your reading list',
          'success'
        );
      }
      try {
        localStorage.setItem('truthpulse_saved_articles', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save articles to localStorage', e);
      }
      return updated;
    });
  };

  const clearAllSavedArticles = () => {
    setSavedArticles([]);
    try {
      localStorage.removeItem('truthpulse_saved_articles');
    } catch (e) {
      console.warn('Could not clear saved articles from localStorage', e);
    }
    addToast(
      language === 'bn'
        ? 'সকল সংরক্ষিত সংবাদ মুছে ফেলা হয়েছে'
        : 'All saved articles have been cleared',
      'info'
    );
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const formatDhakaTime = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
        timeZone: 'Asia/Dhaka',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return isoDate;
    }
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        toggleTheme,
        currentView,
        setCurrentView,
        viewPayload,
        navigateTo,
        currentUser,
        authToken,
        permissions,
        login,
        quickLogin,
        logout,
        authFetch,
        hasRolePermission,
        savedArticles,
        toggleSaveArticle,
        clearAllSavedArticles,
        toasts,
        addToast,
        removeToast,
        formatDhakaTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

