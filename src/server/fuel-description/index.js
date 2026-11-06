import Joi from 'joi'
import {
  fuelDescriptionController,
  fuelDescriptionMarkCompleteController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelDescription = {
  plugin: {
    name: 'fuelDescription',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-description',
          ...fuelDescriptionController,
          options: {
            validate: { params: paramsSchema }
          }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/fuel-description',
          ...fuelDescriptionMarkCompleteController,
          options: {
            validate: { params: paramsSchema }
          }
        },
        {
          method: 'GET',
          path: '/fuel-weight/{fuelId}',
          handler(request, h) {
            return h.redirect(
              `/review-fuel/${encodeURIComponent(request.params.fuelId)}/fuel-description`
            )
          },
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'GET',
          path: '/fuel-composition/{fuelId}',
          handler(request, h) {
            return h.redirect(
              `/review-fuel/${encodeURIComponent(request.params.fuelId)}/fuel-description`
            )
          },
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'GET',
          path: '/sulphur-content/{fuelId}',
          handler(request, h) {
            return h.redirect(
              `/review-fuel/${encodeURIComponent(request.params.fuelId)}/fuel-description`
            )
          },
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'GET',
          path: '/manufacturing-process/{fuelId}',
          handler(request, h) {
            return h.redirect(
              `/review-fuel/${encodeURIComponent(request.params.fuelId)}/fuel-description`
            )
          },
          options: { validate: { params: paramsSchema } }
        }
      ])
    }
  }
}
