import React from 'react'
import { clsx } from 'clsx'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useGlobalStore } from '@/global/store'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useGlobalStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      <main
        className={clsx(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}