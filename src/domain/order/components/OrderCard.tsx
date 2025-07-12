import React from 'react'
import { Button } from '@/shared/components'
import { formatOrderStatus, formatOrderDate, formatPrice } from '../utils'
import type { Order } from '../types'

interface OrderCardProps {
  order: Order
  onViewDetails?: (order: Order) => void
  onCancel?: (order: Order) => void
  onTrack?: (order: Order) => void
  variant?: 'default' | 'compact' | 'admin'
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetails,
  onCancel,
  onTrack,
  variant = 'default'
}) => {
  const canCancel = order.status === 'pending' || order.status === 'confirmed'
  const canTrack = order.status === 'shipped' || order.status === 'delivered'

  const handleViewDetails = () => {
    onViewDetails?.(order)
  }

  const handleCancel = () => {
    if (canCancel) {
      onCancel?.(order)
    }
  }

  const handleTrack = () => {
    if (canTrack) {
      onTrack?.(order)
    }
  }

  return (
    <div className={`order-card order-card--${variant}`}>
      <div className="order-card__header">
        <div className="order-card__info">
          <h3 className="order-card__number">주문 #{order.orderNumber}</h3>
          <p className="order-card__date">{formatOrderDate(order.createdAt)}</p>
        </div>
        <div className="order-card__status">
          <span className={`order-card__status-badge order-card__status-badge--${order.status}`}>
            {formatOrderStatus(order.status)}
          </span>
        </div>
      </div>

      <div className="order-card__content">
        {variant !== 'compact' && (
          <div className="order-card__items">
            <div className="order-card__items-summary">
              {order.items.slice(0, 2).map((item, index) => (
                <div key={index} className="order-card__item">
                  <span className="order-card__item-name">{item.productName}</span>
                  <span className="order-card__item-quantity">x{item.quantity}</span>
                </div>
              ))}
              {order.items.length > 2 && (
                <div className="order-card__item">
                  <span className="order-card__item-more">
                    외 {order.items.length - 2}개 상품
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="order-card__payment">
          <div className="order-card__total">
            <span className="order-card__total-label">총 결제금액</span>
            <span className="order-card__total-amount">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="order-card__payment-method">
            {order.payment.method === 'card' && '카드결제'}
            {order.payment.method === 'transfer' && '계좌이체'}
            {order.payment.method === 'virtual_account' && '가상계좌'}
          </div>
        </div>

        {variant === 'admin' && (
          <div className="order-card__customer">
            <p className="order-card__customer-name">주문자: {order.customerName}</p>
            <p className="order-card__customer-email">{order.customerEmail}</p>
          </div>
        )}

        {order.shipping.trackingNumber && (
          <div className="order-card__tracking">
            <span className="order-card__tracking-label">운송장번호:</span>
            <span className="order-card__tracking-number">{order.shipping.trackingNumber}</span>
          </div>
        )}
      </div>

      <div className="order-card__actions">
        <Button
          variant="secondary"
          size="small"
          onClick={handleViewDetails}
        >
          상세보기
        </Button>
        
        {canTrack && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleTrack}
          >
            배송추적
          </Button>
        )}
        
        {canCancel && (
          <Button
            variant="outline"
            size="small"
            onClick={handleCancel}
          >
            주문취소
          </Button>
        )}
      </div>
    </div>
  )
}