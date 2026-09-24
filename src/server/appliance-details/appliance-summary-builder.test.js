import { describe, test, expect } from 'vitest'
import {
  formatBoolean,
  formatApplianceType,
  formatNominalOutput,
  valueText,
  buildSummaryItems
} from './appliance-summary-builder.js'

describe('#formatters', () => {
  describe('formatBoolean', () => {
    test('returns Yes for true', () => {
      expect(formatBoolean(true)).toBe('Yes')
    })

    test('returns No for false', () => {
      expect(formatBoolean(false)).toBe('No')
    })

    test('returns Not provided for undefined', () => {
      expect(formatBoolean(undefined)).toBe('Not provided')
    })

    test('returns Not provided for null', () => {
      expect(formatBoolean(null)).toBe('Not provided')
    })
  })

  describe('formatApplianceType', () => {
    test('capitalizes the first letter', () => {
      expect(formatApplianceType('boiler')).toBe('Boiler')
    })

    test('handles already capitalized input', () => {
      expect(formatApplianceType('Boiler')).toBe('Boiler')
    })

    test('returns Not provided for empty string', () => {
      expect(formatApplianceType('')).toBe('Not provided')
    })

    test('returns Not provided for null', () => {
      expect(formatApplianceType(null)).toBe('Not provided')
    })

    test('returns Not provided for undefined', () => {
      expect(formatApplianceType(undefined)).toBe('Not provided')
    })
  })

  describe('formatNominalOutput', () => {
    test('appends kW suffix to number', () => {
      expect(formatNominalOutput(2)).toBe('2 kW')
    })

    test('returns Not provided for null', () => {
      expect(formatNominalOutput(null)).toBe('Not provided')
    })

    test('returns Not provided for undefined', () => {
      expect(formatNominalOutput(undefined)).toBe('Not provided')
    })

    test('returns Not provided for empty string', () => {
      expect(formatNominalOutput('')).toBe('Not provided')
    })
  })

  describe('valueText', () => {
    test('returns string value', () => {
      expect(valueText('Twin Heat M40i')).toBe('Twin Heat M40i')
    })

    test('returns Not provided for null', () => {
      expect(valueText(null)).toBe('Not provided')
    })

    test('returns Not provided for undefined', () => {
      expect(valueText(undefined)).toBe('Not provided')
    })

    test('returns Not provided for empty string', () => {
      expect(valueText('')).toBe('Not provided')
    })
  })
})

describe('#buildSummaryItems', () => {
  const baseAppliance = {
    modelName: 'Twin Heat M40i',
    modelNumber: null,
    applianceType: 'boiler',
    isVariant: false,
    existingAuthorisedAppliance: null,
    nominalOutput: 2,
    multifuelAppliance: false
  }

  test('builds 6 base items for standard appliance', () => {
    const items = buildSummaryItems(baseAppliance)
    expect(items).toHaveLength(6)
  })

  test('includes model name row', () => {
    const items = buildSummaryItems(baseAppliance)
    expect(items[0].key.text).toBe('Model name')
    expect(items[0].value.text).toBe('Twin Heat M40i')
  })

  test('includes model number row with Add action when empty', () => {
    const items = buildSummaryItems(baseAppliance)
    expect(items[1].key.text).toBe('Model number (optional)')
    expect(items[1].value.text).toBe('Not provided')
    expect(items[1].actions.items[0].text).toBe('Add')
  })

  test('includes appliance type row', () => {
    const items = buildSummaryItems(baseAppliance)
    expect(items[2].key.text).toBe('Appliance type')
    expect(items[2].value.text).toBe('Boiler')
  })

  test('adds Other appliance type row when applianceType is other', () => {
    const appliance = { ...baseAppliance, applianceType: 'other' }
    const items = buildSummaryItems(appliance)
    expect(items).toHaveLength(7)
    const otherRow = items.find(
      (row) => row.key.text === 'Other appliance type'
    )
    expect(otherRow).toBeDefined()
    expect(otherRow.value.html).toContain('appliance-type-other')
    expect(otherRow.value.html).toContain('Select')
  })

  test('includes isVariant row', () => {
    const items = buildSummaryItems(baseAppliance)
    const variantRow = items.find(
      (row) => row.key.text === 'Is it a variant of a certified appliance?'
    )
    expect(variantRow).toBeDefined()
    expect(variantRow.value.text).toBe('No')
  })

  test('adds Variant details row when isVariant is true', () => {
    const appliance = {
      ...baseAppliance,
      isVariant: true,
      existingAuthorisedAppliance: 'Model XYZ'
    }
    const items = buildSummaryItems(appliance)
    expect(items).toHaveLength(7)
    const variantDetailsRow = items.find(
      (row) => row.key.text === 'Variant details'
    )
    expect(variantDetailsRow).toBeDefined()
    expect(variantDetailsRow.value.text).toBe('Model XYZ')
    expect(variantDetailsRow.actions.items[0].text).toBe('Change')
  })

  test('shows Not provided for variant details when isVariant is true but no details', () => {
    const appliance = { ...baseAppliance, isVariant: true }
    const items = buildSummaryItems(appliance)
    const variantDetailsRow = items.find(
      (row) => row.key.text === 'Variant details'
    )
    expect(variantDetailsRow.value.text).toBe('Not provided')
    expect(variantDetailsRow.actions).toBeUndefined()
  })

  test('includes nominal output row', () => {
    const items = buildSummaryItems(baseAppliance)
    const outputRow = items.find(
      (row) => row.key.text === 'Nominal (thermal) output'
    )
    expect(outputRow).toBeDefined()
    expect(outputRow.value.text).toBe('2 kW')
  })

  test('includes multifuel appliance row', () => {
    const items = buildSummaryItems(baseAppliance)
    const multifuelRow = items.find(
      (row) => row.key.text === 'Is it a multifuel appliance?'
    )
    expect(multifuelRow).toBeDefined()
    expect(multifuelRow.value.text).toBe('No')
  })

  test('builds 8 items when both conditional rows appear', () => {
    const appliance = {
      ...baseAppliance,
      applianceType: 'other',
      isVariant: true,
      existingAuthorisedAppliance: 'Variant XYZ'
    }
    const items = buildSummaryItems(appliance)
    expect(items).toHaveLength(8)
  })
})
