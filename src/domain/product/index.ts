// Product domain public API

// Types
export type { 
  Product, 
  ProductCategory,
  ProductImage,
  ProductSpecification,
  ProductStatus,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListFilter,
  ProductSearchParams 
} from './types'

// Components
export { ProductCard, ProductList, ProductDetail, ProductForm } from './components'

// Hooks
export {
  useProducts,
  useProduct,
  useProductCategories,
  useProductBrands,
  usePopularProducts,
  useRecommendedProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUploadProductImages,
  useUpdateStock,
  useFilteredProducts,
  useProductsByCategory,
  useProductsByBrand,
  useProductSearch,
  useProductFilterOptions
} from './hooks'

// API
export { productApi } from './api'

// Utils
export {
  getProductMainImage,
  formatProductStatus,
  formatPrice,
  calculateDiscountPercentage,
  isProductOnSale,
  isProductInStock,
  getStockStatus
} from './utils'

// Constants
export {
  PRODUCT_STATUSES,
  PRODUCT_SORT_OPTIONS,
  DEFAULT_PRODUCT_IMAGE,
  STOCK_STATUS,
  PRODUCT_RATING
} from './constants'
