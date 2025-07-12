import React from 'react'
import { ProductCard } from './ProductCard'
import { useFilteredProducts } from '../hooks'
import type { Product, ProductSearchParams } from '../types'

interface ProductListProps {
  filters?: ProductSearchParams
  onProductSelect?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  variant?: 'grid' | 'list'
  columns?: 2 | 3 | 4
}

export const ProductList: React.FC<ProductListProps> = ({
  filters,
  onProductSelect,
  onAddToCart,
  variant = 'grid',
  columns = 3
}) => {
  const { products, isLoading, error, pagination } = useFilteredProducts(filters || {})

  if (isLoading) {
    return (
      <div className="product-list__loading">
        <div>상품을 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-list__error">
        상품을 불러오는데 실패했습니다.
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="product-list__empty">
        조건에 맞는 상품이 없습니다.
      </div>
    )
  }

  return (
    <div className="product-list">
      <div className="product-list__header">
        <div className="product-list__count">
          총 {pagination?.total || products.length}개의 상품
        </div>
      </div>
      
      <div 
        className={`product-list__content product-list__content--${variant}`}
        style={{
          gridTemplateColumns: variant === 'grid' ? `repeat(${columns}, 1fr)` : '1fr'
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onProductSelect}
            onAddToCart={onAddToCart}
            variant={variant === 'list' ? 'compact' : 'default'}
          />
        ))}
      </div>
      
      {pagination && pagination.hasNext && (
        <div className="product-list__pagination">
          <button className="product-list__load-more">
            더 보기 ({pagination.total - products.length}개 남음)
          </button>
        </div>
      )}
    </div>
  )
}