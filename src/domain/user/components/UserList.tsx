import React, { useState } from 'react'
import { Button, Input, Loading } from '@/shared'
import { UserCard } from './UserCard'
import { UserForm } from './UserForm'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks'
import { User, UserListFilter } from '../types'

export const UserList: React.FC = () => {
  const [filters, setFilters] = useState<UserListFilter>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data: usersData, isLoading, error } = useUsers(filters)
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
  }

  const handleDelete = async (user: User) => {
    if (window.confirm(`정말로 ${user.name}님을 삭제하시겠습니까?`)) {
      try {
        await deleteUserMutation.mutateAsync(user.id)
      } catch (error) {
        console.error('사용자 삭제 실패:', error)
      }
    }
  }

  if (isLoading) {
    return <Loading text="사용자 목록을 불러오는 중..." />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">사용자 목록을 불러오는데 실패했습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          새 사용자 추가
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="사용자 검색..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.role || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as any }))}
        >
          <option value="">모든 역할</option>
          <option value="admin">관리자</option>
          <option value="user">사용자</option>
          <option value="guest">게스트</option>
        </select>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md"
          value={filters.status || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
        >
          <option value="">모든 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
          <option value="pending">대기</option>
          <option value="suspended">정지</option>
        </select>
      </div>

      {/* 사용자 목록 */}
      <div className="grid gap-4">
        {usersData?.data.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {usersData?.meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            총 {usersData.meta.total}명 중 {usersData.data.length}명 표시
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled={usersData.meta.page <= 1}>
              이전
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={usersData.meta.page >= usersData.meta.totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 사용자 생성/수정 모달 */}
      {(isCreateModalOpen || editingUser) && (
        <UserForm
          user={editingUser}
          isOpen={isCreateModalOpen || !!editingUser}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingUser(null)
          }}
          onSubmit={async (data) => {
            try {
              if (editingUser) {
                await updateUserMutation.mutateAsync({ id: editingUser.id, data })
              } else {
                await createUserMutation.mutateAsync(data)
              }
              setIsCreateModalOpen(false)
              setEditingUser(null)
            } catch (error) {
              console.error('사용자 저장 실패:', error)
            }
          }}
        />
      )}
    </div>
  )
}