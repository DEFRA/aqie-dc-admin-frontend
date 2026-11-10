import Joi from 'joi'
import {
  fuelDetailsController,
  fuelDetailsMarkCompleteController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

const subRouteStubs = [
  '/brand-name',
  '/additional-brand-names',
  '/fuel-weight',
  '/fuel-composition',
  '/sulphur-content',
  '/manufacturing-process',
  '/quality-control'
]

export const fuelDetails = {
  plugin: {
    name: 'fuelDetails',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-details',
          ...fuelDetailsController,
          options: {
            validate: { params: paramsSchema }
          }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/fuel-details',
          ...fuelDetailsMarkCompleteController,
          options: {
            validate: { params: paramsSchema }
          }
        },
        ...subRouteStubs.map((route) => ({
          method: 'GET',
          path: `${route}/{fuelId}`,
          handler(request, h) {
            const encoded = encodeURIComponent(request.params.fuelId)
            const returnPage =
              request.query.returnTo === 'fuel-description'
                ? 'fuel-description'
                : 'fuel-details'
            return h.redirect(`/review-fuel/${encoded}/${returnPage}`)
          },
          options: { validate: { params: paramsSchema } }
        }))
      ])
    }
  }
}
