import { api } from '@/services/http'
import { ApiResponse, PaginatedResponse } from '@/common/types'
import { 
  Order, 
  OrderSummary,
  CreateOrderRequest, 
  UpdateOrderRequest, 
  OrderSearchParams 
} from '../types'

export const orderApi = {
  // 주문 목록 조회
  getOrders: async (params?: OrderSearchParams) => {
    const response = await api.get<PaginatedResponse<Order>>('/orders', { params })
    return response.data
  },

  // 주문 상세 조회
  getOrder: async (id: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data.data
  },

  // 주문 생성
  createOrder: async (data: CreateOrderRequest) => {
    const response = await api.post<ApiResponse<Order>>('/orders', data)
    return response.data.data
  },

  // 주문 수정
  updateOrder: async (id: string, data: UpdateOrderRequest) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}`, data)
    return response.data.data
  },

  // 주문 취소
  cancelOrder: async (id: string, reason?: string) => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason })
    return response.data.data
  },

  // 주문 환불
  refundOrder: async (id: string, amount?: number, reason?: string) => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${id}/refund`, { 
      amount, 
      reason 
    })
    return response.data.data
  },

  // 사용자별 주문 목록
  getUserOrders: async (userId: string, params?: Omit<OrderSearchParams, 'userId'>) => {
    const response = await api.get<PaginatedResponse<Order>>(`/users/${userId}/orders`, { params })
    return response.data
  },

  // 주문 통계
  getOrderSummary: async (startDate?: Date, endDate?: Date) => {
    const params = {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }
    const response = await api.get<ApiResponse<OrderSummary>>('/orders/summary', { params })
    return response.data.data
  },

  // 주문 추적
  trackOrder: async (orderNumber: string) => {
    const response = await api.get<ApiResponse<{
      order: Order
      trackingInfo: any[]
    }>>(`/orders/track/${orderNumber}`)
    return response.data.data
  },

  // 주문 영수증
  getOrderReceipt: async (id: string) => {
    const response = await api.get<Blob>(`/orders/${id}/receipt`, {
      responseType: 'blob'
    })
    return response.data
  },

  // 배송 정보 업데이트
  updateShipping: async (id: string, trackingNumber: string, estimatedDeliveryDate?: Date) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/shipping`, {
      trackingNumber,
      estimatedDeliveryDate: estimatedDeliveryDate?.toISOString(),
    })
    return response.data.data
  },

  // 주문 상태 업데이트
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status })
    return response.data.data
  },
}