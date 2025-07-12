import { User, UserRole, UserStatus } from '../types'
import { USER_ROLES, USER_STATUSES, DEFAULT_AVATAR } from '../constants'

export function getUserDisplayName(user: User): string {
  return user.name || user.email
}

export function getUserInitials(user: User): string {
  const name = getUserDisplayName(user)
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export function getUserAvatarUrl(user: User): string {
  return user.avatar || DEFAULT_AVATAR
}

export function formatUserRole(role: UserRole): string {
  return USER_ROLES[role] || role
}

export function formatUserStatus(status: UserStatus): string {
  return USER_STATUSES[status] || status
}

export function isUserActive(user: User): boolean {
  return user.status === 'active'
}

export function canUserPerformAction(user: User, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    user: 1,
    admin: 2,
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export function getLastLoginText(user: User): string {
  if (!user.lastLoginAt) return '로그인 기록 없음'
  
  const now = new Date()
  const lastLogin = new Date(user.lastLoginAt)
  const diffMs = now.getTime() - lastLogin.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  
  return lastLogin.toLocaleDateString('ko-KR')
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUserName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50
}

export function generateUsername(email: string): string {
  return email.split('@')[0]
}