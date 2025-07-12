import { Order, OrderStatus, PaymentStatus, OrderItem } from '../types'
import { 
  ORDER_STATUSES, 
  PAYMENT_STATUSES, 
  PAYMENT_METHODS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_COST
} from '../constants'

export function formatOrderStatus(status: OrderStatus): string {
  return ORDER_STATUSES[status] || status
}

export function formatPaymentStatus(status: PaymentStatus): string {
  return PAYMENT_STATUSES[status] || status
}

export function formatPaymentMethod(method: string): string {
  return PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] || method
}

export function getOrderStatusColor(status: OrderStatus): string {
  return ORDER_STATUS_COLORS[status] || 'gray'
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  return PAYMENT_STATUS_COLORS[status] || 'gray'
}

export function formatOrderNumber(order: Order): string {
  return order.orderNumber || `ORD-${order.id.slice(-8).toUpperCase()}`
}

export function formatOrderAmount(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

export function formatPrice(amount: number): string {
  return formatOrderAmount(amount)
}

export function calculateOrderTotal(items: OrderItem[], shippingCost = 0, taxAmount = 0, discountAmount = 0): number {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  return subtotal + shippingCost + taxAmount - discountAmount
}

export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.totalPrice, 0)
}

export function calculateShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST
}

export function isOrderCancellable(order: Order): boolean {
  return ['pending', 'confirmed'].includes(order.status)
}

export function isOrderRefundable(order: Order): boolean {
  return ['delivered'].includes(order.status) && order.paymentStatus === 'completed'
}

export function isOrderTrackable(order: Order): boolean {
  return ['shipped', 'delivered'].includes(order.status) && !!order.trackingNumber
}

export function getOrderProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 20,
    processing: 40,
    shipped: 70,
    delivered: 100,
    cancelled: 0,
    returned: 0,
    refunded: 0,
  }
  return progressMap[status] || 0
}

export function getEstimatedDeliveryText(order: Order): string {
  if (!order.estimatedDeliveryDate) return '배송일 미정'
  
  const estimatedDate = new Date(order.estimatedDeliveryDate)
  const today = new Date()
  const diffDays = Math.ceil((estimatedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '배송 예정일 지남'
  if (diffDays === 0) return '오늘 배송 예정'
  if (diffDays === 1) return '내일 배송 예정'
  
  return `${diffDays}일 후 배송 예정`
}

export function formatOrderDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getOrderItemsCount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function validateShippingAddress(address: any): boolean {
  const requiredFields = ['recipientName', 'phone', 'zipCode', 'address', 'city', 'country']
  return requiredFields.every(field => address[field]?.trim())
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${timestamp.slice(-6)}${random}`
}

export function searchOrders(orders: Order[], query: string): Order[] {
  if (!query.trim()) return orders
  
  const searchTerm = query.toLowerCase().trim()
  
  return orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm) ||
    order.items.some(item => 
      item.productName.toLowerCase().includes(searchTerm) ||
      item.sku.toLowerCase().includes(searchTerm)
    ) ||
    order.shippingAddress.recipientName.toLowerCase().includes(searchTerm)
  )
}

export function sortOrders(orders: Order[], sortBy: string, sortOrder: 'asc' | 'desc'): Order[] {
  const sorted = [...orders].sort((a, b) => {
    let aValue: any
    let bValue: any
    
    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'totalAmount':
        aValue = a.totalAmount
        bValue = b.totalAmount
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
  
  return sorted
}
