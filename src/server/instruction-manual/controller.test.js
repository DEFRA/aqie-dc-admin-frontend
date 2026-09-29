import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getSavedFormValues,
  handleInstructionManualRequest,
  handleInstructionManualDecisionRequest
} from './controller.js'
import {
  getAppliance,
  saveInstructionManual
} from './instruction-manual-data.js'

vi.mock('./instruction-manual-data.js', () => ({
  getAppliance: vi.fn(),
  saveInstructionManual: vi.fn()
}))

vi.mock('../common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    error: vi.fn()
  })
}))

function createResponseToolkit() {
  const response = {
    code: vi.fn()
  }

  response.code.mockReturnValue(response)

  return {
    view: vi.fn(() => response),
    redirect: vi.fn((location) => ({
      location
    }))
  }
}

function createAppliance(overrides = {}) {
  return {
    id: 'CS200i',
    modelName: 'Twin Heat CS200i',
    ...overrides
  }
}

function createValidPayload(overrides = {}) {
  return {
    action: 'passed',
    title: 'Twin Heat CS200i instruction manual',
    includeVersion: 'yes',
    version: '2.1',
    publicationDay: '25',
    publicationMonth: '9',
    publicationYear: '2027',
    ...overrides
  }
}

describe('handleInstructionManualRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders the instruction-manual page', async () => {
    const appliance = createAppliance()

    getAppliance.mockResolvedValue({
      data: appliance
    })

    const request = {
      params: {
        applianceId: 'CS200i'
      }
    }

    const h = createResponseToolkit()

    await handleInstructionManualRequest(request, h)

    expect(getAppliance).toHaveBeenCalledWith('CS200i')

    expect(h.view).toHaveBeenCalledWith(
      'instruction-manual/index',
      expect.objectContaining({
        pageTitle: 'Review instruction manuals for Twin Heat CS200i',
        heading: 'Review instruction manuals for Twin Heat CS200i',
        appliance,
        reviewHref: '/review-appliance/CS200i'
      })
    )
  })

  test('populates saved instruction-manual data', async () => {
    const appliance = createAppliance({
      instructionManual: {
        title: 'Saved manual',
        includeVersion: true,
        version: '3.2',
        publicationDate: '2027-10-05'
      }
    })

    getAppliance.mockResolvedValue({
      data: appliance
    })

    const h = createResponseToolkit()

    await handleInstructionManualRequest(
      {
        params: {
          applianceId: 'CS200i'
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'instruction-manual/index',
      expect.objectContaining({
        formValues: {
          title: 'Saved manual',
          includeVersion: 'yes',
          version: '3.2',
          publicationDay: '5',
          publicationMonth: '10',
          publicationYear: '2027'
        }
      })
    )
  })

  test('renders service error when appliance loading fails', async () => {
    getAppliance.mockRejectedValue(new Error('API unavailable'))

    const h = createResponseToolkit()

    const response = await handleInstructionManualRequest(
      {
        params: {
          applianceId: 'CS200i'
        }
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })

    expect(response.code).toHaveBeenCalledWith(500)
  })
})

describe('handleInstructionManualDecisionRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    getAppliance.mockResolvedValue({
      data: createAppliance()
    })

    saveInstructionManual.mockResolvedValue({
      data: {}
    })
  })

  test('saves passed data and redirects to review page', async () => {
    const request = {
      params: {
        applianceId: 'CS200i'
      },
      payload: createValidPayload()
    }

    const h = createResponseToolkit()

    const response = await handleInstructionManualDecisionRequest(request, h)

    expect(saveInstructionManual).toHaveBeenCalledWith('CS200i', true, {
      title: 'Twin Heat CS200i instruction manual',
      includeVersion: true,
      version: '2.1',
      publicationDate: '2027-09-25'
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/CS200i')

    expect(response).toEqual({
      location: '/review-appliance/CS200i'
    })
  })

  test('clears version when include version is no', async () => {
    const request = {
      params: {
        applianceId: 'CS200i'
      },
      payload: createValidPayload({
        includeVersion: 'no',
        version: 'old version'
      })
    }

    const h = createResponseToolkit()

    await handleInstructionManualDecisionRequest(request, h)

    expect(saveInstructionManual).toHaveBeenCalledWith(
      'CS200i',
      true,
      expect.objectContaining({
        includeVersion: false,
        version: ''
      })
    )
  })

  test('shows multiple errors and does not save', async () => {
    const request = {
      params: {
        applianceId: 'CS200i'
      },
      payload: {
        action: 'passed',
        title: '',
        includeVersion: '',
        version: '',
        publicationDay: '',
        publicationMonth: '',
        publicationYear: ''
      }
    }

    const h = createResponseToolkit()

    const response = await handleInstructionManualDecisionRequest(request, h)

    expect(saveInstructionManual).not.toHaveBeenCalled()

    expect(h.view).toHaveBeenCalledWith(
      'instruction-manual/index',
      expect.objectContaining({
        hasErrors: true,
        pageTitle: 'Error: Review instruction manuals for Twin Heat CS200i',
        errors: [
          {
            field: 'title',
            message: 'Enter the title of the instruction manual',
            href: '#title'
          },
          {
            field: 'includeVersion',
            message: 'Select if you want to include a version',
            href: '#includeVersion'
          },
          {
            field: 'publicationDate',
            message: 'Enter the publication date',
            href: '#publicationDate'
          }
        ]
      })
    )

    expect(response.code).toHaveBeenCalledWith(400)
  })

  test('retains submitted values after validation failure', async () => {
    const request = {
      params: {
        applianceId: 'CS200i'
      },
      payload: createValidPayload({
        title: '',
        includeVersion: 'yes',
        version: '',
        publicationDay: '20'
      })
    }

    const h = createResponseToolkit()

    await handleInstructionManualDecisionRequest(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'instruction-manual/index',
      expect.objectContaining({
        formValues: expect.objectContaining({
          title: '',
          includeVersion: 'yes',
          version: '',
          publicationDay: '20',
          publicationMonth: '9',
          publicationYear: '2027'
        })
      })
    )
  })

  test('mark as failed skips validation and redirects', async () => {
    const request = {
      params: {
        applianceId: 'CS200i'
      },
      payload: {
        action: 'failed',
        title: '',
        includeVersion: '',
        version: '',
        publicationDay: '',
        publicationMonth: '',
        publicationYear: ''
      }
    }

    const h = createResponseToolkit()

    await handleInstructionManualDecisionRequest(request, h)

    expect(saveInstructionManual).toHaveBeenCalledWith('CS200i', false, {
      title: '',
      includeVersion: null,
      version: '',
      publicationDate: null
    })

    expect(h.redirect).toHaveBeenCalledWith('/review-appliance/CS200i')
  })

  test('mark as failed retains a complete valid date', async () => {
    const request = {
      params: {
        applianceId: 'CS200i'
      },
      payload: {
        action: 'failed',
        title: 'Draft manual',
        includeVersion: 'yes',
        version: 'Draft 1',
        publicationDay: '25',
        publicationMonth: '9',
        publicationYear: '2027'
      }
    }

    const h = createResponseToolkit()

    await handleInstructionManualDecisionRequest(request, h)

    expect(saveInstructionManual).toHaveBeenCalledWith('CS200i', false, {
      title: 'Draft manual',
      includeVersion: true,
      version: 'Draft 1',
      publicationDate: '2027-09-25'
    })
  })

  test('renders service error when saving fails', async () => {
    saveInstructionManual.mockRejectedValue(new Error('Database unavailable'))

    const h = createResponseToolkit()

    const response = await handleInstructionManualDecisionRequest(
      {
        params: {
          applianceId: 'CS200i'
        },
        payload: createValidPayload()
      },
      h
    )

    expect(h.view).toHaveBeenCalledWith('error/index', {
      message: 'Sorry, there is a problem with the service'
    })

    expect(response.code).toHaveBeenCalledWith(500)
  })
})

describe('getSavedFormValues', () => {
  test('returns empty fields when no saved data exists', () => {
    expect(getSavedFormValues(createAppliance())).toEqual({
      title: '',
      includeVersion: '',
      version: '',
      publicationDay: '',
      publicationMonth: '',
      publicationYear: ''
    })
  })

  test('populates no radio selection correctly', () => {
    expect(
      getSavedFormValues(
        createAppliance({
          instructionManual: {
            title: 'Manual',
            includeVersion: false,
            version: '',
            publicationDate: '2027-09-25'
          }
        })
      )
    ).toEqual({
      title: 'Manual',
      includeVersion: 'no',
      version: '',
      publicationDay: '25',
      publicationMonth: '9',
      publicationYear: '2027'
    })
  })
})
