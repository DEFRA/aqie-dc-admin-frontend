import { describe, it, expect } from 'vitest'
import { buildPaginationConfig } from './pagination-builder.js'

describe('pagination-builder', () => {
  describe('buildPaginationConfig', () => {
    const mockBuildPageUrl = (page) => `/items?page=${page}`

    it('throws error if buildPageUrl is not provided', () => {
      expect(() => {
        buildPaginationConfig({
          paginationData: { page: 1, total: 100, totalPages: 10 }
        })
      }).toThrow('buildPageUrl function is required')
    })

    it('returns default pagination for empty data', () => {
      const result = buildPaginationConfig({
        paginationData: {},
        buildPageUrl: mockBuildPageUrl
      })

      expect(result).toMatchObject({
        start: 0,
        end: 0,
        total: 0,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        hasPagination: false,
        previous: null,
        next: null,
        items: [
          {
            number: 1,
            href: '/items?page=1',
            current: true
          }
        ]
      })
    })

    it('calculates correct start and end for first page', () => {
      const result = buildPaginationConfig({
        paginationData: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(result.start).toBe(1)
      expect(result.end).toBe(10)
      expect(result.currentPage).toBe(1)
    })

    it('calculates correct start and end for middle page', () => {
      const result = buildPaginationConfig({
        paginationData: {
          page: 5,
          limit: 10,
          total: 100,
          totalPages: 10
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(result.start).toBe(41)
      expect(result.end).toBe(50)
      expect(result.currentPage).toBe(5)
    })

    it('calculates correct start and end for last page with partial results', () => {
      const result = buildPaginationConfig({
        paginationData: {
          page: 10,
          limit: 10,
          total: 95,
          totalPages: 10
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(result.start).toBe(91)
      expect(result.end).toBe(95)
    })

    it('handles total zero correctly', () => {
      const result = buildPaginationConfig({
        paginationData: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(result.start).toBe(0)
      expect(result.end).toBe(0)
      expect(result.total).toBe(0)
    })

    it('returns previous link only on page > 1', () => {
      const resultPage1 = buildPaginationConfig({
        paginationData: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(resultPage1.previous).toBeNull()

      const resultPage2 = buildPaginationConfig({
        paginationData: {
          page: 2,
          limit: 10,
          total: 100,
          totalPages: 10
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(resultPage2.previous).toEqual({
        href: '/items?page=1',
        text: 'Previous'
      })
    })

    it('returns next link only when page < totalPages', () => {
      const resultLastPage = buildPaginationConfig({
        paginationData: {
          page: 10,
          limit: 10,
          total: 100,
          totalPages: 10
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(resultLastPage.next).toBeNull()

      const resultPageBefore = buildPaginationConfig({
        paginationData: {
          page: 9,
          limit: 10,
          total: 100,
          totalPages: 10
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(resultPageBefore.next).toEqual({
        href: '/items?page=10',
        text: 'Next'
      })
    })

    it('creates correct pagination items for all pages', () => {
      const result = buildPaginationConfig({
        paginationData: {
          page: 2,
          limit: 10,
          total: 50,
          totalPages: 5
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(result.items).toHaveLength(5)
      expect(result.items).toEqual([
        { number: 1, href: '/items?page=1', current: false },
        { number: 2, href: '/items?page=2', current: true },
        { number: 3, href: '/items?page=3', current: false },
        { number: 4, href: '/items?page=4', current: false },
        { number: 5, href: '/items?page=5', current: false }
      ])
    })

    it('supports custom currentPage override', () => {
      const result = buildPaginationConfig({
        paginationData: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10
        },
        currentPage: 5,
        buildPageUrl: mockBuildPageUrl
      })

      expect(result.currentPage).toBe(5)
      expect(result.start).toBe(41)
      expect(result.end).toBe(50)
      expect(result.items[4]).toEqual({
        number: 5,
        href: '/items?page=5',
        current: true
      })
    })

    it('handles pagination with filters and keywords via buildPageUrl', () => {
      const buildUrlWithFilters = (page) =>
        `/items?page=${page}&filters=active&q=search`

      const result = buildPaginationConfig({
        paginationData: {
          page: 1,
          limit: 10,
          total: 30,
          totalPages: 3
        },
        buildPageUrl: buildUrlWithFilters
      })

      expect(result.items[1]).toEqual({
        number: 2,
        href: '/items?page=2&filters=active&q=search',
        current: false
      })
      expect(result.next).toEqual({
        href: '/items?page=2&filters=active&q=search',
        text: 'Next'
      })
    })

    it('sets hasPagination correctly', () => {
      const singlePage = buildPaginationConfig({
        paginationData: {
          page: 1,
          total: 5,
          totalPages: 1
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(singlePage.hasPagination).toBe(false)

      const multiPage = buildPaginationConfig({
        paginationData: {
          page: 1,
          total: 100,
          totalPages: 10
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(multiPage.hasPagination).toBe(true)
    })

    it('provides countText object for custom display formatting', () => {
      const result = buildPaginationConfig({
        paginationData: {
          page: 3,
          limit: 10,
          total: 250,
          totalPages: 25
        },
        buildPageUrl: mockBuildPageUrl
      })

      expect(result.countText).toEqual({
        start: 21,
        end: 30,
        total: 250,
        limit: 10
      })
    })
  })
})
