import React from 'react'
import { Card, Button } from '@/shared'
import { User } from '../types'

interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onView?: (user: User) => void
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onView,
}) => {
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
    <Card>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={user.avatar}
              alt={user.name}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {user.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
              {user.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mb-2">{user.email}</p>
          
          {user.lastLoginAt && (
            <p className="text-xs text-gray-400">
              Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className="flex-shrink-0 flex space-x-2">
          {onView && (
            <Button variant="ghost" size="sm" onClick={() => onView(user)}>
              View
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" onClick={() => onDelete(user)}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}