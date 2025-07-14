import { describe, it, expect } from 'vitest'
import { crossJoin } from './arrayTool'

describe('arrayTool', () => {
  describe('crossJoin', () => {
    it('should create cross join of two arrays', () => {
      const lang = ['en', 'de'] as const
      const size = ['1024px', '768px']
      
      const result = crossJoin(lang, size)
      
      expect(result).toHaveLength(4)
      expect(result).toEqual([
        { lang: 'en', size: '1024px' },
        { lang: 'en', size: '768px' },
        { lang: 'de', size: '1024px' },
        { lang: 'de', size: '768px' }
      ])
    })

    it('should handle empty lang array', () => {
      const lang = [] as const
      const size = ['1024px', '768px']
      
      const result = crossJoin(lang, size)
      
      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should handle empty size array', () => {
      const lang = ['en', 'de'] as const
      const size: string[] = []
      
      const result = crossJoin(lang, size)
      
      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should handle single items in both arrays', () => {
      const lang = ['ko'] as const
      const size = ['1680px']
      
      const result = crossJoin(lang, size)
      
      expect(result).toHaveLength(1)
      expect(result).toEqual([
        { lang: 'ko', size: '1680px' }
      ])
    })

    it('should work with readonly arrays from as const', () => {
      const i18n = {
        defaultLocale: 'en',
        locales: ['en', 'de', 'cs', 'ko'],
      } as const
      
      const sizes = ['1024px', '768px', '1680px']
      
      const result = crossJoin(i18n.locales, sizes)
      
      expect(result).toHaveLength(12)
      expect(result[0]).toEqual({ lang: 'en', size: '1024px' })
      expect(result[11]).toEqual({ lang: 'ko', size: '1680px' })
    })

    it('should return correct type for result items', () => {
      const langs = ['en'] as const
      const sizes = ['1024px']
      
      const results = crossJoin(langs, sizes)
      
      // Type check - result should be AnyObject[]
      expect(results).toHaveLength(1)
      expect(results[0]).toHaveProperty('lang')
      expect(results[0]).toHaveProperty('size')
      expect(typeof results[0]?.lang).toBe('string')
      expect(typeof results[0]?.size).toBe('string')
    })

    it('should handle large arrays efficiently', () => {
      const largeLanguages = ['en', 'de', 'cs', 'ko', 'fr', 'es', 'it', 'pt', 'ru', 'zh'] as const
      const largeSizes = ['320px', '768px', '1024px', '1440px', '1920px']
      
      const largeResult = crossJoin(largeLanguages, largeSizes)
      
      expect(largeResult).toHaveLength(50) // 10 * 5
      expect(largeResult[0]).toEqual({ lang: 'en', size: '320px' })
      expect(largeResult[49]).toEqual({ lang: 'zh', size: '1920px' })
    })
  })
})