// 스토리지 서비스
class StorageService {
  // Local Storage
  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error('Error setting localStorage item:', error)
    }
  }

  getItem<T = any>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error getting localStorage item:', error)
      return null
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing localStorage item:', error)
    }
  }

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  // Session Storage
  setSessionItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value)
      sessionStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error('Error setting sessionStorage item:', error)
    }
  }

  getSessionItem<T = any>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error getting sessionStorage item:', error)
      return null
    }
  }

  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing sessionStorage item:', error)
    }
  }

  clearSession(): void {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
    }
  }
}

export const storageService = new StorageService()