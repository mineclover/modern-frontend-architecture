import { BaseEntity } from '@/common/types'

export interface User extends BaseEntity {
  email: string
  name: string
  avatar?: string
  role: UserRole
  status: UserStatus
  lastLoginAt?: Date
}

export type UserRole = 'admin' | 'user' | 'guest'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export interface CreateUserRequest {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface UpdateUserRequest {
  name?: string
  avatar?: string
  role?: UserRole
  status?: UserStatus
}

export interface UserListFilter {
  role?: UserRole
  status?: UserStatus
  search?: string
}