import React, { useState } from 'react'
import { Button } from '@/shared/components'
import { useProduct } from '../hooks'
import { formatPrice, isProductInStock, getStockStatus } from '../utils'

interface ProductDetailProps {
  productId: string
  onAddToCart?: (productId: string, quantity: number) => void
  onBack?: () => void
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  onAddToCart,
  onBack
}) => {
  const { data: product, isLoading, error } = useProduct(productId)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  if (isLoading) {
    return <div className="product-detail__loading">상품 정보를 불러오는 중...</div>
  }

  if (error || !product) {
    return <div className="product-detail__error">상품을 찾을 수 없습니다.</div>
  }

  const inStock = isProductInStock(product)
  const stockStatus = getStockStatus(product)

  const handleAddToCart = () => {
    if (inStock && onAddToCart) {
      onAddToCart(product.id, quantity)
    }
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(quantity + delta, product.stock))
    setQuantity(newQuantity)
  }

  return (
    <div className="product-detail">
      {onBack && (
        <button className="product-detail__back" onClick={onBack}>
          ← 뒤로 가기
        </button>
      )}
      
      <div className="product-detail__content">
        <div className="product-detail__images">
          <div className="product-detail__main-image">
            <img 
              src={product.images[selectedImage]?.url} 
              alt={product.name}
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="product-detail__thumbnails">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  className={`product-detail__thumbnail ${
                    selectedImage === index ? 'product-detail__thumbnail--active' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image.url} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="product-detail__info">
          <div className="product-detail__header">
            <h1 className="product-detail__title">{product.name}</h1>
            <p className="product-detail__brand">{product.brand}</p>
          </div>
          
          <div className="product-detail__price">
            {product.discount > 0 ? (
              <>
                <span className="product-detail__price--discounted">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="product-detail__price--original">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="product-detail__discount">
                  {Math.round(product.discount)}% 할인
                </span>
              </>
            ) : (
              <span className="product-detail__price--current">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <div className="product-detail__description">
            <h3>상품 설명</h3>
            <p>{product.description}</p>
          </div>
          
          {product.specifications && product.specifications.length > 0 && (
            <div className="product-detail__specifications">
              <h3>상품 사양</h3>
              <dl>
                {product.specifications.map((spec) => (
                  <div key={spec.name} className="product-detail__spec">
                    <dt>{spec.name}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          
          <div className="product-detail__stock">
            <span className={`product-detail__stock-status product-detail__stock-status--${stockStatus}`}>
              {inStock ? `재고 ${product.stock}개` : '품절'}
            </span>
          </div>
          
          {inStock && (
            <div className="product-detail__quantity">
              <label>수량</label>
              <div className="product-detail__quantity-controls">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
          )}
          
          <div className="product-detail__actions">
            <Button
              variant="primary"
              size="large"
              onClick={handleAddToCart}
              disabled={!inStock}
              fullWidth
            >
              {inStock ? `${formatPrice(product.salePrice * quantity)} 장바구니 담기` : '품절'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}