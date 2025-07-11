import React, { useState } from 'react'
import { Card, Button, Input } from '@/shared'
import { User } from '../types'
import { useUploadAvatar } from '../hooks'

interface UserProfileProps {
  user: User
  onUpdate?: (data: any) => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  })

  const uploadAvatarMutation = useUploadAvatar()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadAvatarMutation.mutateAsync({ id: user.id, file })
    } catch (error) {
      console.error('아바타 업로드 실패:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate?.(formData)
    setIsEditing(false)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'guest': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="flex items-start space-x-6">
          {/* 아바타 섹션 */}
          <div className="flex-shrink-0">
            <div className="relative">
              {user.avatar ? (
                <img
                  className="h-24 w-24 rounded-full object-cover"
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-2xl text-gray-600 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* 아바타 업로드 버튼 */}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 사용자 정보 */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="이름"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="이메일"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled
                />
                <div className="flex space-x-3">
                  <Button type="submit">저장</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>

                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>가입일: {new Date(user.createdAt).toLocaleDateString()}</p>
                  {user.lastLoginAt && (
                    <p>마지막 로그인: {new Date(user.lastLoginAt).toLocaleDateString()}</p>
                  )}
                </div>

                <Button onClick={() => setIsEditing(true)}>
                  프로필 수정
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 추가 정보 카드들 */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">계정 활동</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">총 로그인 횟수</span>
            <span className="font-medium">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">마지막 활동</span>
            <span className="font-medium">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '없음'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">계정 상태</span>
            <span className={`font-medium ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {user.status}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}