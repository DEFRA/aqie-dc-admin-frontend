import { beforeEach, describe, expect, test, vi } from 'vitest'
import { statusCodes } from '../common/constants/status-codes.js'
import { fuelApplicationDetailsContent } from './content.js'
import { handleFuelApplicationDetailsRequest } from './controller.js'

const content = fuelApplicationDetailsContent.en

const { getFuelApplicationDetailsMock } = vi.hoisted(() => ({
    getFuelApplicationDetailsMock: vi.fn()
}))

vi.mock('./fuel-application-details-data.js', () => ({
    getFuelApplicationDetails: getFuelApplicationDetailsMock
}))

const baseApplication = {
    id: 'app-0317',
    linkedItems: [
        {
            companyName: 'Flamers Ltd',
            companyFullAddress: 'Sonna\nMullingar\nCo. Westmeath\nN91 PYC8',
            companyContact: {
                name: 'Contact Name',
                email: 'contact.email@flamers.com',
                alternativeEmail: 'alt.email@flamers.com',
                phone: '07722 334455'
            },
            responsiblePerson: {
                name: 'Responsible Name',
                email: 'responsible.email@flamers.com'
            },
            customerComplaints: true,
            fuelBagging: 'Bagged at source',
            manufacturerOrReseller: 'Manufacturer',
            brandNames: 'Kings Starterlog',
            technicalReview: { status: 'in_progress' }
        }
    ]
}

function toolkit() {
    const code = vi.fn().mockReturnValue('rendered')
    return {
        view: vi.fn().mockReturnValue({ code }),
        code
    }
}

describe('#handleFuelApplicationDetailsRequest', () => {
    beforeEach(() => {
        getFuelApplicationDetailsMock.mockReset()
    })

    test('renders the fuel application details page with the correct title and heading', async () => {
        getFuelApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
        const h = toolkit()

        await handleFuelApplicationDetailsRequest(
            { params: { applicationId: 'app-0317' } },
            h
        )

        expect(h.view).toHaveBeenCalledWith(
            'fuel-application-details/index',
            expect.objectContaining({
                pageTitle: content.pageTitle('app-0317'),
                heading: content.heading('app-0317')
            })
        )
    })

    test('builds the applicant summary rows for the GOV.UK details page', async () => {
        getFuelApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
        const h = toolkit()

        await handleFuelApplicationDetailsRequest(
            { params: { applicationId: 'app-0317' } },
            h
        )

        const [, viewModel] = h.view.mock.calls[0]
        expect(viewModel.summaryRows).toHaveLength(11)
        expect(viewModel.summaryRows[0].value.text).toBe('Flamers Ltd')
        expect(viewModel.summaryRows[1].value.html).toContain('Sonna')
        expect(viewModel.summaryRows[7].value.text).toBe(
            'responsible.email@flamers.com'
        )
        expect(viewModel.summaryRows[8].value.text).toBe(content.boolean.yes)
    })

    test('renders the fuel table with status labels and continue-review action', async () => {
        getFuelApplicationDetailsMock.mockResolvedValue({ data: baseApplication })
        const h = toolkit()

        await handleFuelApplicationDetailsRequest(
            { params: { applicationId: 'app-0317' } },
            h
        )

        const [, viewModel] = h.view.mock.calls[0]
        expect(viewModel.fuelRows).toHaveLength(1)
        expect(viewModel.fuelRows[0]).toMatchObject({
            brandName: 'Kings Starterlog',
            statusLabel: 'In progress',
            actionText: 'Continue review'
        })
        expect(viewModel.continueReviewHref).toBe('/not-found')
    })

    test('falls back to safe values when the backend data is missing', async () => {
        getFuelApplicationDetailsMock.mockResolvedValue({
            data: {
                companyName: undefined,
                companyContact: {},
                responsiblePerson: {},
                fuels: undefined,
                customerComplaints: undefined,
                fuelBagging: undefined,
                manufacturerOrReseller: undefined
            }
        })
        const h = toolkit()

        await handleFuelApplicationDetailsRequest(
            { params: { applicationId: 'app-0317' } },
            h
        )

        const [, viewModel] = h.view.mock.calls[0]
        expect(viewModel.summaryRows[0].value.text).toBe(content.notProvided)
        expect(viewModel.summaryRows[8].value.text).toBe(content.notProvided)
        expect(viewModel.fuelRows).toEqual([])
    })

    test('renders the standard error page when the data fetch fails', async () => {
        getFuelApplicationDetailsMock.mockRejectedValue(new Error('backend down'))
        const h = {
            view: vi
                .fn()
                .mockReturnValue({ code: vi.fn().mockReturnValue('error-page') }),
            code: vi.fn()
        }

        await handleFuelApplicationDetailsRequest(
            { params: { applicationId: 'app-0317' } },
            h
        )

        expect(h.view).toHaveBeenCalledWith(
            'error/index',
            expect.objectContaining({
                message: content.errors.generic
            })
        )
        expect(h.view.mock.results[0].value.code).toHaveBeenCalledWith(
            statusCodes.internalServerError
        )
    })
})
