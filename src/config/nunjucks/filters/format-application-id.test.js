import { describe, test, expect } from 'vitest'

import { formatApplicationId } from './format-application-id.js'

describe('formatApplicationId', () => {
  test('removes the 4-digit prefix and hyphen', () => {
    expect(formatApplicationId('7756-0001')).toBe('0001')
  })

  test('leaves ids without a prefix unchanged', () => {
    expect(formatApplicationId('0042')).toBe('0042')
    expect(formatApplicationId('app-1')).toBe('app-1')
  })

  test('returns nullish values unchanged', () => {
    expect(formatApplicationId(undefined)).toBeUndefined()
    expect(formatApplicationId(null)).toBeNull()
  })
})
