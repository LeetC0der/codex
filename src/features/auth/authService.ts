import type { LoginValues } from '../../lib/validators';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

const STORAGE_KEY = 'auth_session';

export const authService = {
  async login(values: LoginValues): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return {
      token: btoa(`${values.email}:session`),
      user: {
        id: crypto.randomUUID(),
        name: values.email.split('@')[0],
        email: values.email,
      },
    };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  saveSession(payload: AuthResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },

  getSession(): AuthResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },
};
