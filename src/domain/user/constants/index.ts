import { UserRole, UserStatus } from '../types'

export const USER_ROLES: Record<UserRole, string> = {
  admin: '관리자',
  user: '사용자',
  guest: '게스트',
}

export const USER_STATUSES: Record<UserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  pending: '대기',
  suspended: '정지',
}

export const DEFAULT_AVATAR = '/images/default-avatar.png'

export const USER_PERMISSIONS = {
  CREATE_USER: 'user:create',
  READ_USER: 'user:read',
  UPDATE_USER: 'user:update',
  DELETE_USER: 'user:delete',
} as const