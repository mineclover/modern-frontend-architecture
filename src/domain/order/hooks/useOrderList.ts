import { useOrders, useUserOrders } from './useOrder'
import { OrderSearchParams, OrderStatus, PaymentStatus } from '../types'
import { useMemo } from 'react'

// 필터링된 주문 목록 조회
export const useFilteredOrders = (filters: OrderSearchParams) => {
  const ordersQuery = useOrders(filters)
  
  return {
    ...ordersQuery,
    orders: ordersQuery.data?.data || [],
    pagination: ordersQuery.data?.pagination,
  }
}

// 상태별 주문 조회
export const useOrdersByStatus = (status: OrderStatus, params?: Omit<OrderSearchParams, 'status'>) => {
  return useOrders({
    ...params,
    status,
  })
}

// 결제 상태별 주문 조회
export const useOrdersByPaymentStatus = (paymentStatus: PaymentStatus, params?: Omit<OrderSearchParams, 'paymentStatus'>) => {
  return useOrders({
    ...params,
    paymentStatus,
  })
}

// 주문 검색
export const useOrderSearch = (query: string, params?: Omit<OrderSearchParams, 'search'>) => {
  return useOrders({
    ...params,
    search: query,
  })
}

// 특정 기간 주문 조회
export const useOrdersByDateRange = (startDate: Date, endDate: Date, params?: Omit<OrderSearchParams, 'startDate' | 'endDate'>) => {
  return useOrders({
    ...params,
    startDate,
    endDate,
  })
}

// 고객별 주문 이력
export const useCustomerOrderHistory = (userId: string, limit = 10) => {
  return useUserOrders(userId, {
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
}

// 최근 주문 목록
export const useRecentOrders = (limit = 10) => {
  return useOrders({
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
}

// 대기 중인 주문 목록
export const usePendingOrders = () => {
  return useOrdersByStatus('pending')
}

// 배송 중인 주문 목록
export const useShippedOrders = () => {
  return useOrdersByStatus('shipped')
}

// 주문 통계 요약
export const useOrderStats = () => {
  const allOrdersQuery = useOrders()
  const pendingOrdersQuery = useOrdersByStatus('pending')
  const shippedOrdersQuery = useOrdersByStatus('shipped')
  
  return useMemo(() => {
    const allOrders = allOrdersQuery.data?.data || []
    const pendingOrders = pendingOrdersQuery.data?.data || []
    const shippedOrders = shippedOrdersQuery.data?.data || []
    
    return {
      totalOrders: allOrders.length,
      pendingCount: pendingOrders.length,
      shippedCount: shippedOrders.length,
      totalRevenue: allOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: allOrders.length > 0 
        ? allOrders.reduce((sum, order) => sum + order.totalAmount, 0) / allOrders.length 
        : 0,
      isLoading: allOrdersQuery.isLoading || pendingOrdersQuery.isLoading || shippedOrdersQuery.isLoading,
    }
  }, [allOrdersQuery, pendingOrdersQuery, shippedOrdersQuery])
}