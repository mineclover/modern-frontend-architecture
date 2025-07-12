import { ProductStatus } from '../types'

export const PRODUCT_STATUSES: Record<ProductStatus, string> = {
  draft: '초안',
  active: '판매중',
  inactive: '비활성',
  discontinued: '단종',
}

export const PRODUCT_SORT_OPTIONS = [
  { value: 'name', label: '이름순' },
  { value: 'price', label: '가격순' },
  { value: 'rating', label: '평점순' },
  { value: 'createdAt', label: '등록일순' },
] as const

export const DEFAULT_PRODUCT_IMAGE = '/images/default-product.png'

export const STOCK_STATUS = {
  OUT_OF_STOCK: 0,
  LOW_STOCK: 10,
  IN_STOCK: 50,
} as const

export const PRODUCT_RATING = {
  MIN: 0,
  MAX: 5,
  STEP: 0.1,
} as const
