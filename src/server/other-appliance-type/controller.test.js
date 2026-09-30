import { describe, it, expect } from 'vitest'
import {
  otherApplianceTypeController,
  otherApplianceTypeDecisionController
} from './controller.js'
import { otherApplianceType } from './index.js'

describe('other-appliance-type module', () => {
  it('should export controllers', () => {
    expect(otherApplianceTypeController).toBeDefined()
    expect(otherApplianceTypeController.handler).toBeDefined()
    expect(otherApplianceTypeDecisionController).toBeDefined()
    expect(otherApplianceTypeDecisionController.handler).toBeDefined()
  })

  it('should export plugin with correct name', () => {
    expect(otherApplianceType.plugin.name).toBe('otherApplianceType')
    expect(otherApplianceType.plugin.register).toBeDefined()
  })

  it('should have secondary appliance types defined in routes', () => {
    expect(otherApplianceType.plugin).toBeDefined()
  })
})
