import { OrderStatus, PaymentStatus, PaymentMethod } from '../types'

export const ORDER_STATUSES: Record<OrderStatus, string> = {
  pending: '주문 대기',
  confirmed: '주문 확정',
  processing: '처리 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
  returned: '반품',
  refunded: '환불',
}

export const PAYMENT_STATUSES: Record<PaymentStatus, string> = {
  pending: '결제 대기',
  processing: '결제 진행 중',
  completed: '결제 완료',
  failed: '결제 실패',
  cancelled: '결제 취소',
  refunded: '환불 완료',
  partial_refund: '부분 환불',
}

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  credit_card: '신용카드',
  debit_card: '체크카드',
  bank_transfer: '계좌 이체',
  virtual_account: '가상 계좌',
  mobile_payment: '모바일 결제',
  point: '포인트',
  gift_card: '기프트카드',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'yellow',
  confirmed: 'blue',
  processing: 'orange',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
  returned: 'gray',
  refunded: 'gray',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'yellow',
  processing: 'blue',
  completed: 'green',
  failed: 'red',
  cancelled: 'gray',
  refunded: 'gray',
  partial_refund: 'orange',
}

export const DEFAULT_SHIPPING_COST = 3000 // 기본 배송비 3,000원
export const FREE_SHIPPING_THRESHOLD = 50000 // 무료배송 기준 50,000원

export const ORDER_SORT_OPTIONS = [
  { value: 'createdAt', label: '주문일순' },
  { value: 'totalAmount', label: '주문금액순' },
  { value: 'status', label: '상태순' },
] as const
