import { describe, it, expect } from 'vitest'
import { formatId } from './format-id.js'

describe('formatId', () => {
  it('should strip the 4-digit prefix', () => {
    expect(formatId('7756-0001')).toBe('0001')
  })

  it('should keep a counter longer than 4 digits intact', () => {
    expect(formatId('7756-12345')).toBe('12345')
  })

  it('should only strip the leading prefix', () => {
    expect(formatId('7756-0001-7756-0002')).toBe('0001-7756-0002')
  })

  it('should leave ids without a prefix unchanged', () => {
    expect(formatId('0042')).toBe('0042')
    expect(formatId('app-1')).toBe('app-1')
  })

  it('should handle undefined', () => {
    expect(formatId(undefined)).toBeUndefined()
  })

  it('should handle null', () => {
    expect(formatId(null)).toBeNull()
  })
})
