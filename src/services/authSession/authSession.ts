const SESSION_KEY = 'world-search:auth-session';

export type AuthRole = 'user' | 'admin';

export interface AuthSession {
  role: AuthRole;
  name: string;
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (v.role === 'user' || v.role === 'admin') && typeof v.name === 'string';
}

export function getAuthSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isAuthSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// This check (and the VITE_ADMIN_* values it compares against) lives entirely
// client-side and is trivially bypassable via devtools — there is no backend
// in this project to verify credentials or issue a session the client can't
// forge. Treat the "admin" role as a UI convenience, not an access control
// boundary. See the README's "Security notes" section.
export function login(name: string, password: string): AuthSession | null {
  const trimmedName = name.trim();
  if (!trimmedName || !password) return null;

  const isAdmin =
    trimmedName === import.meta.env.VITE_ADMIN_USERNAME && password === import.meta.env.VITE_ADMIN_PASSWORD;

  const session: AuthSession = { role: isAdmin ? 'admin' : 'user', name: trimmedName };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('authSession: failed to persist session', err);
  }

  return session;
}

export function logout(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('authSession: failed to clear session', err);
  }
}
