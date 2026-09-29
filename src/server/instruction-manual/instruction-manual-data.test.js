import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getAppliance,
  saveInstructionManual
} from './instruction-manual-data.js'
import { fetchJson, patchJson } from '../common/api/api.js'

vi.mock('../common/api/api.js', () => ({
  fetchJson: vi.fn(),
  patchJson: vi.fn()
}))

describe('instruction-manual-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('gets appliance technical review data', async () => {
    fetchJson.mockResolvedValue({
      data: {
        id: 'CS200i'
      }
    })

    await getAppliance('CS200i')

    expect(fetchJson).toHaveBeenCalledWith(
      '/appliances/CS200i/technical-review'
    )
  })

  test('encodes appliance identifier', async () => {
    fetchJson.mockResolvedValue({ data: {} })

    await getAppliance('ABC 123')

    expect(fetchJson).toHaveBeenCalledWith(
      '/appliances/ABC%20123/technical-review'
    )
  })

  test('saves a passed instruction-manual review', async () => {
    patchJson.mockResolvedValue({ data: {} })

    const instructionManual = {
      title: 'Instruction manual',
      includeVersion: true,
      version: '2.1',
      publicationDate: '2027-09-25'
    }

    await saveInstructionManual('CS200i', true, instructionManual)

    expect(patchJson).toHaveBeenCalledWith(
      '/appliances/CS200i/technical-review/checks',
      {
        check: 'instructionManual',
        result: true,
        data: {
          instructionManual
        }
      }
    )
  })

  test('saves a failed instruction-manual review', async () => {
    patchJson.mockResolvedValue({ data: {} })

    await saveInstructionManual('CS200i', false, {
      title: '',
      includeVersion: null,
      version: '',
      publicationDate: null
    })

    expect(patchJson).toHaveBeenCalledWith(
      '/appliances/CS200i/technical-review/checks',
      {
        check: 'instructionManual',
        result: false,
        data: {
          instructionManual: {
            title: '',
            includeVersion: null,
            version: '',
            publicationDate: null
          }
        }
      }
    )
  })
})
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getAppliance,
  saveInstructionManual
} from './instruction-manual-data.js'
import { fetchJson, patchJson } from '../common/api/api.js'

vi.mock('../common/api/api.js', () => ({
  fetchJson: vi.fn(),
  patchJson: vi.fn()
}))

describe('instruction-manual-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('gets appliance technical review data', async () => {
    fetchJson.mockResolvedValue({
      data: {
        id: 'CS200i'
      }
    })

    await getAppliance('CS200i')

    expect(fetchJson).toHaveBeenCalledWith(
      '/appliances/CS200i/technical-review'
    )
  })

  test('encodes appliance identifier', async () => {
    fetchJson.mockResolvedValue({ data: {} })

    await getAppliance('ABC 123')

    expect(fetchJson).toHaveBeenCalledWith(
      '/appliances/ABC%20123/technical-review'
    )
  })

  test('saves a passed instruction-manual review', async () => {
    patchJson.mockResolvedValue({ data: {} })

    const instructionManual = {
      title: 'Instruction manual',
      includeVersion: true,
      version: '2.1',
      publicationDate: '2027-09-25'
    }

    await saveInstructionManual('CS200i', true, instructionManual)

    expect(patchJson).toHaveBeenCalledWith(
      '/appliances/CS200i/technical-review/checks',
      {
        check: 'instructionManual',
        result: true,
        data: {
          instructionManual
        }
      }
    )
  })

  test('saves a failed instruction-manual review', async () => {
    patchJson.mockResolvedValue({ data: {} })

    await saveInstructionManual('CS200i', false, {
      title: '',
      includeVersion: null,
      version: '',
      publicationDate: null
    })

    expect(patchJson).toHaveBeenCalledWith(
      '/appliances/CS200i/technical-review/checks',
      {
        check: 'instructionManual',
        result: false,
        data: {
          instructionManual: {
            title: '',
            includeVersion: null,
            version: '',
            publicationDate: null
          }
        }
      }
    )
  })
})
