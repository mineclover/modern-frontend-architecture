import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/constants'
import { productApi } from '../api'
import { CreateProductRequest, UpdateProductRequest } from '../types'

// 상품 생성
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })
    },
  })
}

// 상품 수정
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productApi.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })
    },
  })
}

// 상품 삭제
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })
    },
  })
}

// 상품 이미지 업로드
export const useUploadProductImages = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      productApi.uploadProductImages(id, files),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(id) })
    },
  })
}

// 재고 업데이트
export const useUpdateStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      productApi.updateStock(id, stock),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })
    },
  })
}