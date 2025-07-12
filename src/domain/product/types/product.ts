import { BaseEntity } from '@/common/types'

export interface Product extends BaseEntity {
  name: string
  description: string
  price: number
  originalPrice?: number
  category: ProductCategory
  brand: string
  sku: string
  images: ProductImage[]
  specifications: ProductSpecification[]
  stock: number
  status: ProductStatus
  rating: number
  reviewCount: number
  tags: string[]
  weight?: number
  dimensions?: ProductDimensions
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  parentId?: string
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  order: number
  isMain: boolean
}

export interface ProductSpecification {
  key: string
  value: string
  group?: string
}

export interface ProductDimensions {
  width: number
  height: number
  depth: number
  unit: 'mm' | 'cm' | 'm'
}

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'discontinued'

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  originalPrice?: number
  categoryId: string
  brand: string
  sku: string
  specifications?: ProductSpecification[]
  stock: number
  tags?: string[]
  weight?: number
  dimensions?: ProductDimensions
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  originalPrice?: number
  categoryId?: string
  brand?: string
  stock?: number
  status?: ProductStatus
  specifications?: ProductSpecification[]
  tags?: string[]
  weight?: number
  dimensions?: ProductDimensions
}

export interface ProductListFilter {
  categoryId?: string
  brand?: string
  status?: ProductStatus
  minPrice?: number
  maxPrice?: number
  search?: string
  tags?: string[]
  inStock?: boolean
}

export interface ProductSearchParams extends ProductListFilter {
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}