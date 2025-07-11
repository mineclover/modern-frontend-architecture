import { api } from '@/services/http'
import { ApiResponse, PaginatedResponse } from '@/common/types'
import { User, CreateUserRequest, UpdateUserRequest, UserListFilter } from '../types'

export const userApi = {
  // 사용자 목록 조회
  getUsers: async (params?: UserListFilter & { page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params })
    return response.data
  },

  // 사용자 상세 조회
  getUser: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    return response.data.data
  },

  // 사용자 생성
  createUser: async (data: CreateUserRequest) => {
    const response = await api.post<ApiResponse<User>>('/users', data)
    return response.data.data
  },

  // 사용자 수정
  updateUser: async (id: string, data: UpdateUserRequest) => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data)
    return response.data.data
  },

  // 사용자 삭제
  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/users/${id}`)
    return response.data
  },

  // 사용자 아바타 업로드
  uploadAvatar: async (id: string, file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.post<ApiResponse<{ url: string }>>(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },
}