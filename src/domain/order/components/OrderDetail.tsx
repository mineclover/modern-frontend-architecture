import React from 'react'
import { Button } from '@/shared/components'
import { useOrder, useOrderTracking } from '../hooks'
import { formatOrderStatus, formatOrderDate, formatPrice } from '../utils'

interface OrderDetailProps {
  orderId: string
  onBack?: () => void
  onCancel?: (orderId: string) => void
  onTrack?: (orderId: string) => void
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  orderId,
  onBack,
  onCancel,
  onTrack
}) => {
  const { data: order, isLoading, error } = useOrder(orderId)
  const { data: tracking } = useOrderTracking(order?.orderNumber || '')

  if (isLoading) {
    return <div className="order-detail__loading">주문 정보를 불러오는 중...</div>
  }

  if (error || !order) {
    return <div className="order-detail__error">주문을 찾을 수 없습니다.</div>
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed'
  const canTrack = order.status === 'shipped' || order.status === 'delivered'

  const handleCancel = () => {
    if (canCancel && onCancel) {
      onCancel(order.id)
    }
  }

  const handleTrack = () => {
    if (canTrack && onTrack) {
      onTrack(order.id)
    }
  }

  return (
    <div className="order-detail">
      {onBack && (
        <button className="order-detail__back" onClick={onBack}>
          ← 목록으로
        </button>
      )}

      <div className="order-detail__header">
        <h1 className="order-detail__title">주문 상세</h1>
        <div className="order-detail__meta">
          <span className="order-detail__number">주문번호: {order.orderNumber}</span>
          <span className="order-detail__date">{formatOrderDate(order.createdAt)}</span>
        </div>
      </div>

      <div className="order-detail__status">
        <div className="order-detail__status-current">
          <span className={`order-detail__status-badge order-detail__status-badge--${order.status}`}>
            {formatOrderStatus(order.status)}
          </span>
        </div>
        
        {tracking && (
          <div className="order-detail__tracking-info">
            <h3>배송 추적</h3>
            <div className="order-detail__tracking-timeline">
              {tracking.events.map((event, index) => (
                <div key={index} className="order-detail__tracking-event">
                  <div className="order-detail__tracking-time">
                    {formatOrderDate(event.timestamp)}
                  </div>
                  <div className="order-detail__tracking-status">
                    {event.status}
                  </div>
                  <div className="order-detail__tracking-location">
                    {event.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="order-detail__items">
        <h2>주문 상품</h2>
        <div className="order-detail__items-list">
          {order.items.map((item, index) => (
            <div key={index} className="order-detail__item">
              <div className="order-detail__item-image">
                <img src={item.productImage} alt={item.productName} />
              </div>
              <div className="order-detail__item-info">
                <h3 className="order-detail__item-name">{item.productName}</h3>
                <p className="order-detail__item-options">
                  {item.options && Object.entries(item.options).map(([key, value]) => 
                    `${key}: ${value}`
                  ).join(', ')}
                </p>
                <div className="order-detail__item-price">
                  <span className="order-detail__item-unit-price">
                    {formatPrice(item.unitPrice)}
                  </span>
                  <span className="order-detail__item-quantity">
                    x {item.quantity}
                  </span>
                  <span className="order-detail__item-total">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-detail__shipping">
        <h2>배송 정보</h2>
        <div className="order-detail__shipping-address">
          <p className="order-detail__recipient">{order.shipping.recipientName}</p>
          <p className="order-detail__phone">{order.shipping.recipientPhone}</p>
          <address className="order-detail__address">
            {order.shipping.address.street}<br />
            {order.shipping.address.city} {order.shipping.address.state} {order.shipping.address.zipCode}
          </address>
          {order.shipping.memo && (
            <p className="order-detail__delivery-memo">
              배송메모: {order.shipping.memo}
            </p>
          )}
        </div>
        
        {order.shipping.trackingNumber && (
          <div className="order-detail__tracking-number">
            <strong>운송장번호: {order.shipping.trackingNumber}</strong>
          </div>
        )}
      </div>

      <div className="order-detail__payment">
        <h2>결제 정보</h2>
        <div className="order-detail__payment-summary">
          <div className="order-detail__payment-row">
            <span>상품금액</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="order-detail__payment-row">
            <span>배송비</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="order-detail__payment-row order-detail__payment-row--discount">
              <span>할인금액</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="order-detail__payment-row order-detail__payment-row--total">
            <span>총 결제금액</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
        
        <div className="order-detail__payment-method">
          <p>결제방법: {order.payment.method === 'card' ? '카드결제' : '계좌이체'}</p>
          {order.payment.cardNumber && (
            <p>카드정보: {order.payment.cardNumber}</p>
          )}
        </div>
      </div>

      <div className="order-detail__actions">
        {canTrack && (
          <Button
            variant="secondary"
            onClick={handleTrack}
          >
            배송추적
          </Button>
        )}
        
        {canCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            주문취소
          </Button>
        )}
      </div>
    </div>
  )
}