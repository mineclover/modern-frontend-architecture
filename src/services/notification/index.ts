// 알림 서비스
type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  closable?: boolean
}

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration: number
  position: string
  closable: boolean
  timestamp: number
}

class NotificationService {
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  show(
    type: NotificationType,
    title: string,
    message?: string,
    options: NotificationOptions = {}
  ): string {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: options.duration ?? 5000,
      position: options.position ?? 'top-right',
      closable: options.closable ?? true,
      timestamp: Date.now(),
    }

    this.notifications.push(notification)
    this.notifyListeners()

    // 자동 제거
    if (notification.duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, notification.duration)
    }

    return id
  }

  success(title: string, message?: string, options?: NotificationOptions): string {
    return this.show('success', title, message, options)
  }

  error(title: string, message?: string, options?: NotificationOptions): string {
    return this.show('error', title, message, { ...options, duration: 0 })
  }

  warning(title: string, message?: string, options?: NotificationOptions): string {
    return this.show('warning', title, message, options)
  }

  info(title: string, message?: string, options?: NotificationOptions): string {
    return this.show('info', title, message, options)
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notifyListeners()
  }

  clear(): void {
    this.notifications = []
    this.notifyListeners()
  }

  getAll(): Notification[] {
    return [...this.notifications]
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications))
  }
}

export const notificationService = new NotificationService()
export type { NotificationType, NotificationOptions, Notification }