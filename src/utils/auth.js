const AUTH_CHANGED_EVENT = 'cakapkarier-auth-changed';
const AUTH_TOKEN_KEY = 'token';

const parseJwtPayload = (token) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const isTokenUsable = (token) => {
  if (!token) return false;

  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;

  return payload.exp * 1000 > Date.now();
};

export const isAuthenticated = () => isTokenUsable(getAuthToken());

export const setAuthToken = (token) => {
  if (isTokenUsable(token)) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  localStorage.removeItem('isLoggedIn');
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const clearAuth = () => setAuthToken(null);

export const subscribeAuthChange = (callback) => {
  const handler = () => callback(isAuthenticated());
  window.addEventListener('storage', handler);
  window.addEventListener(AUTH_CHANGED_EVENT, handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  };
};
