import { describe, it, expect } from 'vitest'
import { formatId } from './format-id.js'

describe('formatId', () => {
  it('should return the last 4 characters of any id', () => {
    expect(formatId('12345678')).toBe('5678')
  })

  it('should return the entire id if less than 4 characters', () => {
    expect(formatId('123')).toBe('123')
  })

  it('should handle 4 character ids', () => {
    expect(formatId('abcd')).toBe('abcd')
  })

  it('should handle undefined', () => {
    expect(formatId(undefined)).toBeUndefined()
  })

  it('should handle null', () => {
    expect(formatId(null)).toBeNull()
  })

  it('should convert non-string to string first', () => {
    expect(formatId(99999999)).toBe('9999')
  })
})
