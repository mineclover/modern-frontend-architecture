import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/constants'
import { orderApi } from '../api'
import { CreateOrderRequest, UpdateOrderRequest, OrderSearchParams } from '../types'

// 주문 목록 조회
export const useOrders = (params?: OrderSearchParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, params],
    queryFn: () => orderApi.getOrders(params),
  })
}

// 주문 상세 조회
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER(id),
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  })
}

// 사용자별 주문 목록
export const useUserOrders = (userId: string, params?: Omit<OrderSearchParams, 'userId'>) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_ORDERS, userId, params],
    queryFn: () => orderApi.getUserOrders(userId, params),
    enabled: !!userId,
  })
}

// 주문 통계
export const useOrderSummary = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDER_SUMMARY, startDate, endDate],
    queryFn: () => orderApi.getOrderSummary(startDate, endDate),
  })
}

// 주문 추적
export const useOrderTracking = (orderNumber: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDER_TRACKING, orderNumber],
    queryFn: () => orderApi.trackOrder(orderNumber),
    enabled: !!orderNumber,
    refetchInterval: 30000, // 30초마다 자동 갱신
  })
}