// Order domain public API

// Types
export type { 
  Order, 
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingAddress,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderListFilter,
  OrderSearchParams,
  OrderSummary
} from './types'

// Components
export { OrderCard, OrderList, OrderDetail, OrderForm } from './components'

// Hooks
export {
  useOrders,
  useOrder,
  useUserOrders,
  useOrderSummary,
  useOrderTracking,
  useCreateOrder,
  useUpdateOrder,
  useCancelOrder,
  useRefundOrder,
  useUpdateShipping,
  useUpdateOrderStatus,
  useDownloadReceipt,
  useFilteredOrders,
  useOrdersByStatus,
  useOrdersByPaymentStatus,
  useOrderSearch,
  useOrdersByDateRange,
  useCustomerOrderHistory,
  useRecentOrders,
  usePendingOrders,
  useShippedOrders,
  useOrderStats
} from './hooks'

// API
export { orderApi } from './api'

// Utils
export {
  formatOrderStatus,
  formatPaymentStatus,
  formatPaymentMethod,
  getOrderStatusColor,
  getPaymentStatusColor,
  formatOrderNumber,
  formatOrderAmount,
  calculateOrderTotal,
  calculateSubtotal,
  calculateShippingCost,
  isOrderCancellable,
  isOrderRefundable,
  isOrderTrackable,
  getOrderProgress,
  getEstimatedDeliveryText,
  formatOrderDate,
  getOrderItemsCount,
  validateShippingAddress,
  generateOrderNumber
} from './utils'

// Constants
export {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  DEFAULT_SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
  ORDER_SORT_OPTIONS
} from './constants'
