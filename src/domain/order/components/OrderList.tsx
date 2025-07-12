import React from 'react'
import { OrderCard } from './OrderCard'
import { useFilteredOrders } from '../hooks'
import type { Order, OrderSearchParams } from '../types'

interface OrderListProps {
  filters?: OrderSearchParams
  onOrderSelect?: (order: Order) => void
  onOrderCancel?: (order: Order) => void
  onOrderTrack?: (order: Order) => void
  variant?: 'default' | 'admin'
  emptyMessage?: string
}

export const OrderList: React.FC<OrderListProps> = ({
  filters,
  onOrderSelect,
  onOrderCancel,
  onOrderTrack,
  variant = 'default',
  emptyMessage = '주문이 없습니다.'
}) => {
  const { orders, isLoading, error, pagination } = useFilteredOrders(filters || {})

  if (isLoading) {
    return (
      <div className="order-list__loading">
        <div className="order-list__loading-spinner"></div>
        <p>주문 목록을 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="order-list__error">
        <p>주문 목록을 불러오는데 실패했습니다.</p>
        <button 
          className="order-list__retry-button"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="order-list__empty">
        <div className="order-list__empty-icon">📦</div>
        <p className="order-list__empty-message">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="order-list">
      <div className="order-list__header">
        <div className="order-list__count">
          총 {pagination?.total || orders.length}개의 주문
        </div>
        
        {variant === 'admin' && (
          <div className="order-list__filters">
            <select className="order-list__status-filter">
              <option value="">전체 상태</option>
              <option value="pending">결제대기</option>
              <option value="confirmed">주문확인</option>
              <option value="processing">처리중</option>
              <option value="shipped">배송중</option>
              <option value="delivered">배송완료</option>
              <option value="cancelled">취소됨</option>
            </select>
          </div>
        )}
      </div>

      <div className="order-list__content">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={onOrderSelect}
            onCancel={onOrderCancel}
            onTrack={onOrderTrack}
            variant={variant === 'admin' ? 'admin' : 'default'}
          />
        ))}
      </div>

      {pagination && pagination.hasNext && (
        <div className="order-list__pagination">
          <button className="order-list__load-more">
            더 보기 ({pagination.total - orders.length}개 남음)
          </button>
        </div>
      )}
    </div>
  )
}