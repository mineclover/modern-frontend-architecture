import React from 'react'
import { Button } from '@/shared/components'
import { formatPrice, getProductMainImage, isProductInStock } from '../utils'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  onViewDetails?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  variant?: 'default' | 'compact' | 'featured'
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
  variant = 'default'
}) => {
  const mainImage = getProductMainImage(product)
  const inStock = isProductInStock(product)
  
  const handleViewDetails = () => {
    onViewDetails?.(product)
  }

  const handleAddToCart = () => {
    if (inStock) {
      onAddToCart?.(product)
    }
  }

  return (
    <div className={`product-card product-card--${variant}`}>
      <div className="product-card__image">
        <img 
          src={mainImage} 
          alt={product.name}
          loading="lazy"
        />
        {product.discount > 0 && (
          <div className="product-card__badge">
            -{Math.round(product.discount)}%
          </div>
        )}
      </div>
      
      <div className="product-card__content">
        <h3 className="product-card__title" onClick={handleViewDetails}>
          {product.name}
        </h3>
        
        <p className="product-card__brand">{product.brand}</p>
        
        {variant !== 'compact' && (
          <p className="product-card__description">
            {product.description}
          </p>
        )}
        
        <div className="product-card__price">
          {product.discount > 0 ? (
            <>
              <span className="product-card__price--discounted">
                {formatPrice(product.salePrice)}
              </span>
              <span className="product-card__price--original">
                {formatPrice(product.originalPrice)}
              </span>
            </>
          ) : (
            <span className="product-card__price--current">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        
        <div className="product-card__stock">
          {inStock ? (
            <span className="product-card__stock--available">
              재고 {product.stock}개
            </span>
          ) : (
            <span className="product-card__stock--unavailable">
              품절
            </span>
          )}
        </div>
        
        <div className="product-card__actions">
          <Button
            variant="secondary"
            size="small"
            onClick={handleViewDetails}
          >
            상세보기
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            장바구니
          </Button>
        </div>
      </div>
    </div>
  )
}