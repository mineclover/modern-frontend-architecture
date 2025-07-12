import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/constants'
import { orderApi } from '../api'
import { CreateOrderRequest, UpdateOrderRequest } from '../types'

// 주문 생성
export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderApi.createOrder(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ORDERS })
      queryClient.setQueryData(QUERY_KEYS.ORDER(order.id), order)
    },
  })
}

// 주문 수정
export const useUpdateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) =>
      orderApi.updateOrder(id, data),
    onSuccess: (order, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ORDERS })
    },
  })
}

// 주문 취소
export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderApi.cancelOrder(id, reason),
    onSuccess: (order, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ORDERS })
    },
  })
}

// 주문 환불
export const useRefundOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount?: number; reason?: string }) =>
      orderApi.refundOrder(id, amount, reason),
    onSuccess: (order, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ORDERS })
    },
  })
}

// 배송 정보 업데이트
export const useUpdateShipping = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      trackingNumber, 
      estimatedDeliveryDate 
    }: { 
      id: string; 
      trackingNumber: string; 
      estimatedDeliveryDate?: Date 
    }) => orderApi.updateShipping(id, trackingNumber, estimatedDeliveryDate),
    onSuccess: (order, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
    },
  })
}

// 주문 상태 업데이트
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateOrderStatus(id, status),
    onSuccess: (order, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
    },
  })
}

// 주문 영수증 다운로드
export const useDownloadReceipt = () => {
  return useMutation({
    mutationFn: (id: string) => orderApi.getOrderReceipt(id),
    onSuccess: (blob, id) => {
      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `order-receipt-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
  })
}