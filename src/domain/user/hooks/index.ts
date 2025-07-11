import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/constants'
import { userApi } from '../api'
import { CreateUserRequest, UpdateUserRequest, UserListFilter } from '../types'

// 사용자 목록 조회
export const useUsers = (params?: UserListFilter & { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: () => userApi.getUsers(params),
  })
}

// 사용자 상세 조회
export const useUser = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
  })
}

// 사용자 생성
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
    },
  })
}

// 사용자 수정
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
    },
  })
}

// 사용자 삭제
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
    },
  })
}

// 아바타 업로드
export const useUploadAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      userApi.uploadAvatar(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(id) })
    },
  })
}