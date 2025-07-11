import { api } from '../http'
import { ApiResponse } from '@/common/types'

interface LoginCredentials {
  email: string
  password: string
}

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

interface AuthResponse {
  user: AuthUser
  token: string
  refreshToken: string
}

class AuthService {
  private tokenKey = 'auth_token'
  private refreshTokenKey = 'refresh_token'

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    const { user, token, refreshToken } = response.data.data
    
    this.setTokens(token, refreshToken)
    return { user, token, refreshToken }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      this.clearTokens()
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh', {
      refreshToken
    })
    
    const newToken = response.data.data.token
    this.setToken(newToken)
    return newToken
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<ApiResponse<AuthUser>>('/auth/me')
    return response.data.data
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token)
    localStorage.setItem(this.refreshTokenKey, refreshToken)
  }

  clearTokens(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
export type { LoginCredentials, AuthUser, AuthResponse }