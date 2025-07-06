export function setToken(token: string) {
  localStorage.setItem('auth_token', token)
}

export function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function removeToken() {
  localStorage.removeItem('auth_token')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function handleUnauthorized() {
  removeToken()
  window.location.href = '/login'
} 