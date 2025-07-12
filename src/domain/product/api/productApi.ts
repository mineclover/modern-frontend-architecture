import { api } from '@/services/http'
import { ApiResponse, PaginatedResponse } from '@/common/types'
import { 
  Product, 
  ProductCategory,
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductListFilter,
  ProductSearchParams 
} from '../types'

export const productApi = {
  // 상품 목록 조회
  getProducts: async (params?: ProductSearchParams) => {
    const response = await api.get<PaginatedResponse<Product>>('/products', { params })
    return response.data
  },

  // 상품 상세 조회
  getProduct: async (id: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data.data
  },

  // 상품 생성
  createProduct: async (data: CreateProductRequest) => {
    const response = await api.post<ApiResponse<Product>>('/products', data)
    return response.data.data
  },

  // 상품 수정
  updateProduct: async (id: string, data: UpdateProductRequest) => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}`, data)
    return response.data.data
  },

  // 상품 삭제
  deleteProduct: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/products/${id}`)
    return response.data
  },

  // 상품 이미지 업로드
  uploadProductImages: async (id: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })
    
    const response = await api.post<ApiResponse<{ images: string[] }>>(`/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  // 상품 카테고리 조회
  getCategories: async () => {
    const response = await api.get<ApiResponse<ProductCategory[]>>('/products/categories')
    return response.data.data
  },

  // 브랜드 목록 조회
  getBrands: async () => {
    const response = await api.get<ApiResponse<string[]>>('/products/brands')
    return response.data.data
  },

  // 상품 재고 업데이트
  updateStock: async (id: string, stock: number) => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/stock`, { stock })
    return response.data.data
  },

  // 인기 상품 조회
  getPopularProducts: async (limit = 10) => {
    const response = await api.get<ApiResponse<Product[]>>('/products/popular', {
      params: { limit }
    })
    return response.data.data
  },

  // 추천 상품 조회
  getRecommendedProducts: async (productId: string, limit = 10) => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/${productId}/recommendations`, {
      params: { limit }
    })
    return response.data.data
  },
}