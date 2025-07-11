// 전역 상태 관리
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface GlobalState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  loading: boolean
  notifications: Notification[]
}

interface GlobalActions {
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setLoading: (loading: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export type GlobalStore = GlobalState & GlobalActions

export const useGlobalStore = create<GlobalStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      theme: 'light',
      sidebarOpen: true,
      loading: false,
      notifications: [],

      // Actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLoading: (loading) => set({ loading }),
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }]
        }))
      },
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },
    }),
    { name: 'global-store' }
  )
)