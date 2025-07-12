import { BaseEntity } from '@/common/types'

export interface Order extends BaseEntity {
  orderNumber: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  subtotal: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod
  notes?: string
  estimatedDeliveryDate?: Date
  actualDeliveryDate?: Date
  trackingNumber?: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  options?: OrderItemOption[]
}

export interface OrderItemOption {
  key: string
  value: string
  price?: number
}

export interface ShippingAddress {
  recipientName: string
  phone: string
  zipCode: string
  address: string
  addressDetail: string
  city: string
  state: string
  country: string
}

export type OrderStatus = 
  | 'pending'           // 주문 대기
  | 'confirmed'         // 주문 확정
  | 'processing'        // 처리 중
  | 'shipped'           // 배송 중
  | 'delivered'         // 배송 완료
  | 'cancelled'         // 주문 취소
  | 'returned'          // 반품
  | 'refunded'          // 환불

export type PaymentStatus = 
  | 'pending'           // 결제 대기
  | 'processing'        // 결제 진행 중
  | 'completed'         // 결제 완료
  | 'failed'            // 결제 실패
  | 'cancelled'         // 결제 취소
  | 'refunded'          // 환불 완료
  | 'partial_refund'    // 부분 환불

export type PaymentMethod = 
  | 'credit_card'       // 신용카드
  | 'debit_card'        // 체크카드
  | 'bank_transfer'     // 계좌 이체
  | 'virtual_account'   // 가상 계좌
  | 'mobile_payment'    // 모바일 결제
  | 'point'             // 포인트
  | 'gift_card'         // 기프트카드

export interface CreateOrderRequest {
  items: {
    productId: string
    quantity: number
    options?: OrderItemOption[]
  }[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  paymentMethod: PaymentMethod
  notes?: string
  couponCode?: string
}

export interface UpdateOrderRequest {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  shippingAddress?: ShippingAddress
  notes?: string
  trackingNumber?: string
  estimatedDeliveryDate?: Date
  actualDeliveryDate?: Date
}

export interface OrderListFilter {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  userId?: string
  startDate?: Date
  endDate?: Date
  search?: string
  minAmount?: number
  maxAmount?: number
}

export interface OrderSearchParams extends OrderListFilter {
  sortBy?: 'createdAt' | 'totalAmount' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface OrderSummary {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  statusBreakdown: Record<OrderStatus, number>
  paymentStatusBreakdown: Record<PaymentStatus, number>
}