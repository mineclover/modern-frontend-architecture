import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/constants'
import { productApi } from '../api'
import { CreateProductRequest, UpdateProductRequest, ProductSearchParams } from '../types'

// 상품 목록 조회
export const useProducts = (params?: ProductSearchParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, params],
    queryFn: () => productApi.getProducts(params),
  })
}

// 상품 상세 조회
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(id),
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
  })
}

// 상품 카테고리 조회
export const useProductCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_CATEGORIES,
    queryFn: productApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
  })
}

// 브랜드 목록 조회
export const useProductBrands = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_BRANDS,
    queryFn: productApi.getBrands,
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
  })
}

// 인기 상품 조회
export const usePopularProducts = (limit = 10) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.POPULAR_PRODUCTS, limit],
    queryFn: () => productApi.getPopularProducts(limit),
  })
}

// 추천 상품 조회
export const useRecommendedProducts = (productId: string, limit = 10) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.RECOMMENDED_PRODUCTS, productId, limit],
    queryFn: () => productApi.getRecommendedProducts(productId, limit),
    enabled: !!productId,
  })
}