import React, { useState } from 'react'
import { Button } from '@/shared/components'
import { useCreateProduct, useUpdateProduct, useProductCategories } from '../hooks'
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types'

interface ProductFormProps {
  product?: Product
  onSuccess?: (product: Product) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSuccess,
  onCancel,
  mode = product ? 'edit' : 'create'
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    categoryId: product?.categoryId || '',
    originalPrice: product?.originalPrice || 0,
    stock: product?.stock || 0,
    weight: product?.weight || 0,
    dimensions: product?.dimensions || { width: 0, height: 0, depth: 0 },
    tags: product?.tags?.join(', ') || ''
  })

  const { data: categories = [] } = useProductCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const isLoading = createMutation.isPending || updateMutation.isPending

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      originalPrice: Number(formData.originalPrice),
      stock: Number(formData.stock),
      weight: Number(formData.weight),
      dimensions: {
        width: Number(formData.dimensions.width),
        height: Number(formData.dimensions.height),
        depth: Number(formData.dimensions.depth)
      },
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }

    try {
      if (mode === 'create') {
        const result = await createMutation.mutateAsync(submitData as CreateProductRequest)
        onSuccess?.(result)
      } else if (product) {
        const result = await updateMutation.mutateAsync({
          id: product.id,
          data: submitData as UpdateProductRequest
        })
        onSuccess?.(result)
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form__header">
        <h2>{mode === 'create' ? '상품 등록' : '상품 수정'}</h2>
      </div>

      <div className="product-form__content">
        <div className="product-form__field">
          <label htmlFor="name">상품명 *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        <div className="product-form__field">
          <label htmlFor="brand">브랜드 *</label>
          <input
            id="brand"
            type="text"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            required
          />
        </div>

        <div className="product-form__field">
          <label htmlFor="categoryId">카테고리 *</label>
          <select
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
            required
          >
            <option value="">카테고리를 선택하세요</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="product-form__field">
          <label htmlFor="description">상품 설명</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
          />
        </div>

        <div className="product-form__row">
          <div className="product-form__field">
            <label htmlFor="originalPrice">가격 *</label>
            <input
              id="originalPrice"
              type="number"
              min="0"
              value={formData.originalPrice}
              onChange={(e) => handleInputChange('originalPrice', e.target.value)}
              required
            />
          </div>

          <div className="product-form__field">
            <label htmlFor="stock">재고 수량 *</label>
            <input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="product-form__field">
          <label htmlFor="weight">무게 (g)</label>
          <input
            id="weight"
            type="number"
            min="0"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
          />
        </div>

        <div className="product-form__dimensions">
          <label>크기 (cm)</label>
          <div className="product-form__dimensions-inputs">
            <input
              type="number"
              min="0"
              placeholder="가로"
              value={formData.dimensions.width}
              onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
            />
            <span>×</span>
            <input
              type="number"
              min="0"
              placeholder="세로"
              value={formData.dimensions.height}
              onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
            />
            <span>×</span>
            <input
              type="number"
              min="0"
              placeholder="높이"
              value={formData.dimensions.depth}
              onChange={(e) => handleDimensionChange('depth', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="product-form__field">
          <label htmlFor="tags">태그 (쉼표로 구분)</label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="예: 인기, 신상품, 할인"
          />
        </div>
      </div>

      <div className="product-form__actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
        >
          {mode === 'create' ? '상품 등록' : '수정 완료'}
        </Button>
      </div>
    </form>
  )
}