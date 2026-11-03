import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

const { getFuelTechnicalReviewMock, saveFuelTechnicalReviewMock } = vi.hoisted(() => ({
    getFuelTechnicalReviewMock: vi.fn(),
    saveFuelTechnicalReviewMock: vi.fn()
}))

vi.mock('./data.js', () => ({
    getFuelTechnicalReview: getFuelTechnicalReviewMock,
    saveFuelTechnicalReview: saveFuelTechnicalReviewMock
}))

describe('test-results', () => {
    let server

    beforeAll(async () => {
        server = await createServer()
        await server.initialize()
    })

    beforeEach(() => {
        getFuelTechnicalReviewMock.mockReset()
        saveFuelTechnicalReviewMock.mockReset()
    })

    afterAll(async () => {
        await server.stop({ timeout: 0 })
    })

    test('renders the add test results page with data prefilled', async () => {
        getFuelTechnicalReviewMock.mockResolvedValue({
            data: {
                fuelId: 'FUEL-001',
                name: 'Kings Starterlog',
                supplierType: 'Manufacture',
                testResults: {
                    smokeEmission: 1.25,
                    sulphurContent: 0.5
                }
            }
        })

        const response = await server.inject({
            method: 'GET',
            url: '/review-fuel/FUEL-001/test-results'
        })

        expect(response.statusCode).toBe(statusCodes.ok)
        expect(response.payload).toContain('Add test results for Kings Starterlog')
        expect(response.payload).toContain('value="1.25"')
        expect(response.payload).toContain('value="0.5"')
    })

    test('validates required values when the user marks the check as passed', async () => {
        getFuelTechnicalReviewMock.mockResolvedValue({
            data: {
                fuelId: 'FUEL-001',
                name: 'Kings Starterlog',
                supplierType: 'Manufacture',
                testResults: {
                    smokeEmission: null,
                    sulphurContent: null
                }
            }
        })

        const response = await server.inject({
            method: 'POST',
            url: '/review-fuel/FUEL-001/test-results',
            payload: {
                result: true,
                smokeEmission: '',
                sulphurContent: ''
            }
        })

        expect(response.statusCode).toBe(statusCodes.badRequest)
        expect(response.payload).toContain(
            'smokeEmission must be a non-negative number when passed'
        )
        expect(response.payload).toContain(
            'sulphurContent must be a non-negative number when passed'
        )
    })

    test('allows a failed result when values are empty or null', async () => {
        getFuelTechnicalReviewMock.mockResolvedValue({
            data: {
                fuelId: 'FUEL-001',
                name: 'Kings Starterlog',
                supplierType: 'Manufacture',
                testResults: {
                    smokeEmission: null,
                    sulphurContent: null
                }
            }
        })
        saveFuelTechnicalReviewMock.mockResolvedValue({ success: true })

        const response = await server.inject({
            method: 'POST',
            url: '/review-fuel/FUEL-001/test-results',
            payload: {
                result: false,
                smokeEmission: '',
                sulphurContent: ''
            }
        })

        expect(response.statusCode).toBe(302)
        expect(response.headers.location).toBe('/review-fuel/FUEL-001')
        expect(saveFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-001', false, {
            smokeEmission: null,
            sulphurContent: null
        })
    })

    test('rejects invalid negative values for failed results', async () => {
        getFuelTechnicalReviewMock.mockResolvedValue({
            data: {
                fuelId: 'FUEL-001',
                name: 'Kings Starterlog',
                supplierType: 'Manufacture',
                testResults: {
                    smokeEmission: null,
                    sulphurContent: null
                }
            }
        })

        const response = await server.inject({
            method: 'POST',
            url: '/review-fuel/FUEL-001/test-results',
            payload: {
                result: false,
                smokeEmission: '-1',
                sulphurContent: '0.5'
            }
        })

        expect(response.statusCode).toBe(statusCodes.badRequest)
        expect(response.payload).toContain(
            'smokeEmission must be a non-negative number or null when failed'
        )
    })

    test('redirects back to the fuel review page after saving a passed result', async () => {
        getFuelTechnicalReviewMock.mockResolvedValue({
            data: {
                fuelId: 'FUEL-001',
                name: 'Kings Starterlog',
                supplierType: 'Manufacture',
                testResults: {
                    smokeEmission: 1.25,
                    sulphurContent: 0.5
                }
            }
        })
        saveFuelTechnicalReviewMock.mockResolvedValue({ success: true })

        const response = await server.inject({
            method: 'POST',
            url: '/review-fuel/FUEL-001/test-results',
            payload: {
                result: true,
                smokeEmission: '1.25',
                sulphurContent: '0.5'
            }
        })

        expect(response.statusCode).toBe(302)
        expect(response.headers.location).toBe('/review-fuel/FUEL-001')
        expect(saveFuelTechnicalReviewMock).toHaveBeenCalledWith('FUEL-001', true, {
            smokeEmission: 1.25,
            sulphurContent: 0.5
        })
    })
})
