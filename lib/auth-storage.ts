import { User } from '@/types/user';

// Keys for localStorage
const AUTH_TOKEN_KEY = 'auth_token';
const USER_EMAIL_KEY = 'user_email';
const USER_DATA_KEY = 'user_data';

export const AuthStorage = {
  // Store authentication data
  setAuthData: (token: string, email: string, userData: Partial<User>) => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_EMAIL_KEY, email);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  },

  // Get stored authentication token
  getAuthToken: (): string | null => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  // Get stored email
  getStoredEmail: (): string | null => {
    try {
      return localStorage.getItem(USER_EMAIL_KEY);
    } catch (error) {
      console.error('Error getting stored email:', error);
      return null;
    }
  },

  // Get stored user data
  getUserData: (): Partial<User> | null => {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Clear all stored authentication data
  clearAuthData: () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_EMAIL_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!AuthStorage.getAuthToken();
  }
}; 