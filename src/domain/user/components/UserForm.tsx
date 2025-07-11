import React, { useState, useEffect } from 'react'
import { Modal, Button, Input } from '@/shared'
import { User, CreateUserRequest, UpdateUserRequest } from '../types'

interface UserFormProps {
  user?: User | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as const,
    status: 'active' as const,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!user

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        status: user.status,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다'
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일은 필수입니다'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = '비밀번호는 필수입니다'
    } else if (!isEditing && formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const submitData = isEditing
        ? {
            name: formData.name,
            role: formData.role,
            status: formData.status,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '사용자 수정' : '새 사용자 추가'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="이름"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
        />

        <Input
          label="이메일"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          disabled={isEditing}
          required
        />

        {!isEditing && (
          <Input
            label="비밀번호"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            error={errors.password}
            required
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            역할
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
          >
            <option value="user">사용자</option>
            <option value="admin">관리자</option>
            <option value="guest">게스트</option>
          </select>
        </div>

        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기</option>
              <option value="suspended">정지</option>
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? '수정' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}