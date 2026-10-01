import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleOtherApplianceTypeRequest,
  handleOtherApplianceTypeDecisionRequest,
  otherApplianceTypeController,
  otherApplianceTypeDecisionController
} from './controller.js'
import { otherApplianceType } from './index.js'
import {
  getApplianceForOtherType,
  getSecondaryApplianceTypes,
  saveOtherApplianceType
} from './other-appliance-type-data.js'

vi.mock('./other-appliance-type-data.js', () => ({
  getApplianceForOtherType: vi.fn(),
  getSecondaryApplianceTypes: vi.fn(),
  saveOtherApplianceType: vi.fn()
}))

describe('other-appliance-type module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('should render radio buttons using value as the displayed label', async () => {
    getApplianceForOtherType.mockResolvedValue({
      data: { modelName: 'Model X', otherApplianceType: 'Air heater' }
    })
    getSecondaryApplianceTypes.mockResolvedValue([
      { value: 'Air heater', isPrimary: false },
      { value: 'Gasifier', isPrimary: false }
    ])

    const code = vi.fn().mockReturnThis()
    const h = { view: vi.fn(() => ({ code })) }

    await handleOtherApplianceTypeRequest(
      { params: { applianceId: 'abc123' } },
      h
    )

    expect(h.view).toHaveBeenCalledTimes(1)
    expect(h.view.mock.calls[0][1].otherApplianceTypeItems).toEqual([
      {
        value: 'Air heater',
        text: 'Air heater',
        checked: true,
        id: 'otherApplianceType-air-heater'
      },
      {
        value: 'Gasifier',
        text: 'Gasifier',
        checked: false,
        id: 'otherApplianceType-gasifier'
      }
    ])
  })

  it('should validate against DB-backed secondary values before saving', async () => {
    getApplianceForOtherType.mockResolvedValue({
      data: { modelName: 'Model X' }
    })
    getSecondaryApplianceTypes.mockResolvedValue([
      { value: 'Air heater', isPrimary: false },
      { value: 'Gasifier', isPrimary: false }
    ])

    const code = vi.fn().mockReturnThis()
    const h = { view: vi.fn(() => ({ code })) }

    await handleOtherApplianceTypeDecisionRequest(
      {
        params: { applianceId: 'abc123' },
        payload: { otherApplianceType: 'Unknown type' }
      },
      h
    )

    expect(code).toHaveBeenCalledWith(400)
    expect(saveOtherApplianceType).not.toHaveBeenCalled()
    expect(h.view.mock.calls[0][1].otherApplianceTypeItems).toEqual([
      {
        value: 'Air heater',
        text: 'Air heater',
        checked: false,
        id: 'otherApplianceType-air-heater'
      },
      {
        value: 'Gasifier',
        text: 'Gasifier',
        checked: false,
        id: 'otherApplianceType-gasifier'
      }
    ])
  })
})
