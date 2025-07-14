# 🔧 Services Layer

**외부 시스템과의 통신 및 인프라 서비스 관리 레이어**

## 🎯 역할과 책임

Services 레이어는 **외부 시스템과의 통신 및 인프라 서비스**를 담당하는 레이어로, 다음과 같은 역할을 담당합니다:

- **HTTP API 통신** 관리 (Axios, Fetch API 래핑)
- **인증 및 인가** 서비스 제공
- **로컬 스토리지/세션 스토리지** 관리
- **알림 서비스** 제공 (Toast, Push Notification)
- **외부 서비스 연동** (Analytics, Error Tracking 등)

## 📦 포함되는 내용

### `/http`
```typescript
// HTTP 클라이언트 설정 및 인터셉터
class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: appConfig.apiBaseUrl,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        const token = this.authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.authService.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
}
```

### `/auth`
```typescript
// 인증 서비스
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/login', credentials);
      
      // 토큰 저장
      this.setToken(response.token);
      this.setUser(response.user);
      
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  getToken(): string | null {
    return storageService.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const userData = storageService.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    storageService.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    storageService.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearAuthData(): void {
    storageService.removeItem(this.TOKEN_KEY);
    storageService.removeItem(this.USER_KEY);
  }
}
```

### `/storage`
```typescript
// 스토리지 서비스 (로컬스토리지, 세션스토리지 추상화)
export class StorageService {
  setItem(key: string, value: string, useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      storage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem failed:', error);
    }
  }

  getItem(key: string, useSession = false): string | null {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      return storage.getItem(key);
    } catch (error) {
      console.error('Storage getItem failed:', error);
      return null;
    }
  }

  removeItem(key: string, useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      storage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem failed:', error);
    }
  }

  clear(useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      storage.clear();
    } catch (error) {
      console.error('Storage clear failed:', error);
    }
  }
}
```

### `/notification`
```typescript
// 알림 서비스
export class NotificationService {
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    // Toast 알림 표시 로직
    toast[type](message);
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    return await Notification.requestPermission();
  }

  async showPushNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      new Notification(title, options);
    }
  }

  showErrorNotification(error: Error): void {
    console.error('Error:', error);
    this.showToast(error.message || 'An error occurred', 'error');
  }
}
```

## 🔒 의존성 규칙

### ✅ 허용되는 의존성
- **하위 레이어**: `common`, `global`
- **외부 라이브러리**: `axios`, `react-query`, `react-toastify` 등
- **브라우저 API**: `localStorage`, `fetch`, `Notification` 등
- **서드파티 서비스**: Analytics, Error Tracking SDK

### ❌ 금지되는 의존성
- **상위 레이어**: `shared`, `domain`, `feature`, `routes`
- **UI 컴포넌트**: React 컴포넌트 직접 의존
- **도메인 로직**: 비즈니스 로직 포함

## 🏗️ 폴더 구조

```
src/services/
├── index.ts              # Public API 정의
├── README.md            # 이 문서
├── http/
│   ├── index.ts         # HTTP 서비스 export
│   ├── client.ts        # HTTP 클라이언트 구현
│   ├── interceptors.ts  # 요청/응답 인터셉터
│   └── types.ts         # HTTP 관련 타입
├── auth/
│   ├── index.ts         # 인증 서비스 export
│   ├── authService.ts   # 인증 서비스 구현
│   ├── tokenManager.ts  # 토큰 관리
│   └── types.ts         # 인증 관련 타입
├── storage/
│   ├── index.ts         # 스토리지 서비스 export
│   ├── storageService.ts # 스토리지 서비스 구현
│   ├── encryptedStorage.ts # 암호화된 스토리지
│   └── types.ts         # 스토리지 관련 타입
└── notification/
    ├── index.ts         # 알림 서비스 export
    ├── notificationService.ts # 알림 서비스 구현
    ├── toastManager.ts  # Toast 알림 관리
    └── types.ts         # 알림 관련 타입
```

## 📝 사용 예시

### HTTP 서비스 사용
```typescript
// 다른 레이어에서 HTTP 서비스 사용
import { httpClient } from '@/services/http';

// Domain API에서 사용
export const fetchUser = async (id: string): Promise<User> => {
  return await httpClient.get<User>(`/users/${id}`);
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  return await httpClient.post<User>('/users', userData);
};
```

### 인증 서비스 사용
```typescript
// 로그인 컴포넌트에서 사용
import { authService } from '@/services/auth';

const LoginForm = () => {
  const handleLogin = async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);
    
    if (result.success) {
      notificationService.showToast('로그인 성공!', 'success');
      // 리다이렉트 로직
    } else {
      notificationService.showToast(result.error, 'error');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* 폼 컨텐츠 */}
    </form>
  );
};
```

### 스토리지 서비스 사용
```typescript
// 사용자 설정 저장
import { storageService } from '@/services/storage';

export const saveUserPreferences = (preferences: UserPreferences) => {
  storageService.setItem('user_preferences', JSON.stringify(preferences));
};

export const loadUserPreferences = (): UserPreferences | null => {
  const data = storageService.getItem('user_preferences');
  return data ? JSON.parse(data) : null;
};
```

## 🔄 에러 핸들링

### 중앙화된 에러 처리
```typescript
// errorHandler.ts
export class ErrorHandler {
  static handle(error: unknown): void {
    if (error instanceof ApiError) {
      this.handleApiError(error);
    } else if (error instanceof NetworkError) {
      this.handleNetworkError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  private static handleApiError(error: ApiError): void {
    notificationService.showToast(error.message, 'error');
    
    // 특정 상태 코드별 처리
    switch (error.status) {
      case 401:
        authService.logout();
        break;
      case 403:
        // 권한 없음 처리
        break;
      case 500:
        // 서버 에러 처리
        break;
    }
  }
}
```

### 재시도 로직
```typescript
// retryPolicy.ts
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
};
```

## ⚠️ 주의사항

### 금지사항
1. **UI 로직 포함 금지**
   ```typescript
   // ❌ 금지: UI 관련 로직
   export const showUserModal = (user: User) => {
     // 모달 표시 로직
   };
   
   // ✅ 올바름: 순수 서비스 로직
   export const validateUserData = (user: User): ValidationResult => {
     // 검증 로직
   };
   ```

2. **도메인 로직 포함 금지**
   ```typescript
   // ❌ 금지: 비즈니스 로직
   export const calculateOrderDiscount = (order: Order) => {
     // 할인 계산 로직
   };
   
   // ✅ 올바름: 인프라 서비스
   export const sendEmail = (emailData: EmailData) => {
     // 이메일 발송 로직
   };
   ```

3. **상위 레이어 의존성 금지**
   ```typescript
   // ❌ 금지
   import { UserCard } from '@/shared/components';
   import { useUserStore } from '@/domain/user';
   
   // ✅ 올바름
   import { HTTP_STATUS } from '@/common';
   import { appConfig } from '@/global';
   ```

## 🧪 테스트 가이드

### 서비스 테스트
```typescript
// authService.test.ts
describe('AuthService', () => {
  beforeEach(() => {
    // Mock setup
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = { token: 'test-token', user: mockUser };
    httpClient.post = jest.fn().mockResolvedValue(mockResponse);

    const result = await authService.login(mockCredentials);

    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUser);
    expect(storageService.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
  });
});
```

### Mock 서비스
```typescript
// mocks/authService.mock.ts
export const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  getToken: jest.fn(),
  getUser: jest.fn(),
  isAuthenticated: jest.fn()
};
```

## 📈 성능 최적화

### 요청 캐싱
```typescript
// requestCache.ts
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5분

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

### 배치 요청
```typescript
// batchProcessor.ts
export class BatchProcessor {
  private queue: BatchRequest[] = [];
  private batchSize = 10;
  private batchDelay = 100;

  add(request: BatchRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...request, resolve, reject });
      
      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else {
        setTimeout(() => this.processBatch(), this.batchDelay);
      }
    });
  }

  private async processBatch(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      const results = await httpClient.post('/batch', {
        requests: batch.map(req => ({ url: req.url, method: req.method, data: req.data }))
      });

      batch.forEach((req, index) => {
        req.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(req => req.reject(error));
    }
  }
}
```

이 레이어는 애플리케이션의 **외부 시스템과의 통신**을 담당하여 안정적이고 효율적인 데이터 교환을 보장합니다.