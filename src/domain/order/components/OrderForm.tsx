import React, { useState } from 'react'
import { Button } from '@/shared/components'
import { useCreateOrder } from '../hooks'
import { formatPrice } from '../utils'
import type { CreateOrderRequest, OrderItem } from '../types'

interface OrderFormProps {
  items: OrderItem[]
  onSuccess?: (orderId: string) => void
  onCancel?: () => void
}

export const OrderForm: React.FC<OrderFormProps> = ({
  items,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shipping: {
      recipientName: '',
      recipientPhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      memo: ''
    },
    payment: {
      method: 'card' as 'card' | 'transfer' | 'virtual_account'
    }
  })

  const [sameAsCustomer, setSameAsCustomer] = useState(true)
  const createMutation = useCreateOrder()

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const shippingFee = subtotal >= 50000 ? 0 : 3000 // 5만원 이상 무료배송
  const totalAmount = subtotal + shippingFee

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleShippingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value
      }
    }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        address: {
          ...prev.shipping.address,
          [field]: value
        }
      }
    }))
  }

  const handleSameAsCustomerChange = (checked: boolean) => {
    setSameAsCustomer(checked)
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          recipientName: prev.customerName,
          recipientPhone: prev.customerPhone
        }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const orderData: CreateOrderRequest = {
      items,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      shipping: formData.shipping,
      payment: formData.payment,
      subtotal,
      shippingFee,
      totalAmount
    }

    try {
      const result = await createMutation.mutateAsync(orderData)
      onSuccess?.(result.id)
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <div className="order-form__header">
        <h2>주문/결제</h2>
      </div>

      <div className="order-form__content">
        {/* 주문 상품 요약 */}
        <section className="order-form__section">
          <h3>주문 상품</h3>
          <div className="order-form__items">
            {items.map((item, index) => (
              <div key={index} className="order-form__item">
                <img src={item.productImage} alt={item.productName} />
                <div className="order-form__item-info">
                  <span className="order-form__item-name">{item.productName}</span>
                  <span className="order-form__item-quantity">x{item.quantity}</span>
                  <span className="order-form__item-price">{formatPrice(item.totalPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 주문자 정보 */}
        <section className="order-form__section">
          <h3>주문자 정보</h3>
          <div className="order-form__fields">
            <div className="order-form__field">
              <label htmlFor="customerName">이름 *</label>
              <input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
              />
            </div>
            <div className="order-form__field">
              <label htmlFor="customerEmail">이메일 *</label>
              <input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                required
              />
            </div>
            <div className="order-form__field">
              <label htmlFor="customerPhone">연락처 *</label>
              <input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* 배송 정보 */}
        <section className="order-form__section">
          <h3>배송 정보</h3>
          <div className="order-form__checkbox">
            <label>
              <input
                type="checkbox"
                checked={sameAsCustomer}
                onChange={(e) => handleSameAsCustomerChange(e.target.checked)}
              />
              주문자와 동일
            </label>
          </div>
          <div className="order-form__fields">
            <div className="order-form__field">
              <label htmlFor="recipientName">받는분 *</label>
              <input
                id="recipientName"
                type="text"
                value={formData.shipping.recipientName}
                onChange={(e) => handleShippingChange('recipientName', e.target.value)}
                required
              />
            </div>
            <div className="order-form__field">
              <label htmlFor="recipientPhone">연락처 *</label>
              <input
                id="recipientPhone"
                type="tel"
                value={formData.shipping.recipientPhone}
                onChange={(e) => handleShippingChange('recipientPhone', e.target.value)}
                required
              />
            </div>
            <div className="order-form__field">
              <label htmlFor="zipCode">우편번호 *</label>
              <input
                id="zipCode"
                type="text"
                value={formData.shipping.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                required
              />
            </div>
            <div className="order-form__field">
              <label htmlFor="street">주소 *</label>
              <input
                id="street"
                type="text"
                value={formData.shipping.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                required
              />
            </div>
            <div className="order-form__field">
              <label htmlFor="memo">배송메모</label>
              <textarea
                id="memo"
                value={formData.shipping.memo}
                onChange={(e) => handleShippingChange('memo', e.target.value)}
                placeholder="배송 시 요청사항을 입력해주세요"
              />
            </div>
          </div>
        </section>

        {/* 결제 정보 */}
        <section className="order-form__section">
          <h3>결제 정보</h3>
          <div className="order-form__payment-methods">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.payment.method === 'card'}
                onChange={(e) => handleInputChange('payment', { method: e.target.value })}
              />
              신용카드
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="transfer"
                checked={formData.payment.method === 'transfer'}
                onChange={(e) => handleInputChange('payment', { method: e.target.value })}
              />
              계좌이체
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="virtual_account"
                checked={formData.payment.method === 'virtual_account'}
                onChange={(e) => handleInputChange('payment', { method: e.target.value })}
              />
              가상계좌
            </label>
          </div>
        </section>

        {/* 결제 금액 */}
        <section className="order-form__section">
          <h3>결제 금액</h3>
          <div className="order-form__payment-summary">
            <div className="order-form__payment-row">
              <span>상품금액</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="order-form__payment-row">
              <span>배송비</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            <div className="order-form__payment-row order-form__payment-row--total">
              <span>총 결제금액</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="order-form__actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={createMutation.isPending}
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={createMutation.isPending}
          size="large"
        >
          {formatPrice(totalAmount)} 결제하기
        </Button>
      </div>
    </form>
  )
}