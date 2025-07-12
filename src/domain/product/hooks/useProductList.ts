import { useProducts, useProductCategories, useProductBrands } from './useProduct'
import { ProductSearchParams } from '../types'
import { useMemo } from 'react'

// 필터링된 상품 목록 조회
export const useFilteredProducts = (filters: ProductSearchParams) => {
  const productsQuery = useProducts(filters)
  
  return {
    ...productsQuery,
    products: productsQuery.data?.data || [],
    pagination: productsQuery.data?.pagination,
  }
}

// 카테고리별 상품 조회
export const useProductsByCategory = (categoryId: string, params?: Omit<ProductSearchParams, 'categoryId'>) => {
  return useProducts({
    ...params,
    categoryId,
  })
}

// 브랜드별 상품 조회
export const useProductsByBrand = (brand: string, params?: Omit<ProductSearchParams, 'brand'>) => {
  return useProducts({
    ...params,
    brand,
  })
}

// 상품 검색
export const useProductSearch = (query: string, params?: Omit<ProductSearchParams, 'search'>) => {
  return useProducts({
    ...params,
    search: query,
  })
}

// 필터 옵션 조회 (카테고리, 브랜드 등)
export const useProductFilterOptions = () => {
  const categoriesQuery = useProductCategories()
  const brandsQuery = useProductBrands()
  
  return useMemo(() => ({
    categories: categoriesQuery.data || [],
    brands: brandsQuery.data || [],
    isLoading: categoriesQuery.isLoading || brandsQuery.isLoading,
    error: categoriesQuery.error || brandsQuery.error,
  }), [categoriesQuery, brandsQuery])
}