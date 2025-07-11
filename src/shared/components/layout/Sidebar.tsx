import React from 'react'
import { clsx } from 'clsx'
import { useGlobalStore } from '@/global/store'

interface SidebarItem {
  id: string
  label: string
  path: string
  icon?: React.ReactNode
}

const navigationItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    </svg>
  },
  {
    id: 'users',
    label: 'Users',
    path: '/users',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  },
  {
    id: 'products',
    label: 'Products',
    path: '/products',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  },
  {
    id: 'orders',
    label: 'Orders',
    path: '/orders',
    icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  },
]

export const Sidebar: React.FC = () => {
  const { sidebarOpen } = useGlobalStore()

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-40 h-screen w-64 bg-gray-50 border-r border-gray-200 transition-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-center justify-center h-16 bg-gray-100 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}