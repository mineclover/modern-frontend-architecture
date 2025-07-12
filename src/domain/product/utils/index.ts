import { Product, ProductStatus } from '../types'
import { PRODUCT_STATUSES, DEFAULT_PRODUCT_IMAGE, STOCK_STATUS } from '../constants'

export function getProductMainImage(product: Product): string {
  const mainImage = product.images.find(img => img.isMain)
  return mainImage?.url || product.images[0]?.url || DEFAULT_PRODUCT_IMAGE
}

export function formatProductStatus(status: ProductStatus): string {
  return PRODUCT_STATUSES[status] || status
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

export function calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

export function isProductOnSale(product: Product): boolean {
  return !!(product.originalPrice && product.originalPrice > product.price)
}

export function isProductInStock(product: Product): boolean {
  return product.stock > STOCK_STATUS.OUT_OF_STOCK
}

export function getStockStatus(product: Product): 'out_of_stock' | 'low_stock' | 'in_stock' {
  if (product.stock <= STOCK_STATUS.OUT_OF_STOCK) return 'out_of_stock'
  if (product.stock <= STOCK_STATUS.LOW_STOCK) return 'low_stock'
  return 'in_stock'
}
