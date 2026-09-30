import { describe, it, expect } from 'vitest'
import {
  getApplianceForOtherType,
  saveOtherApplianceType,
  getSecondaryApplianceTypes
} from './other-appliance-type-data.js'

describe('other-appliance-type-data', () => {
  it('should export getApplianceForOtherType function', () => {
    expect(typeof getApplianceForOtherType).toBe('function')
  })

  it('should export saveOtherApplianceType function', () => {
    expect(typeof saveOtherApplianceType).toBe('function')
  })

  it('should export getSecondaryApplianceTypes function', () => {
    expect(typeof getSecondaryApplianceTypes).toBe('function')
  })
})
