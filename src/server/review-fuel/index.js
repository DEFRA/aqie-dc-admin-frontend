import Joi from 'joi'
import { reviewFuelController, fuelDecisionController } from './controller.js'
import { incompleteReviewController } from './incomplete-review-controller.js'

/**
 * Route registration for the review-fuel page.
 * Validates the fuelId path param and delegates the actual request handling to the
 * controller layer.
 */
const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const reviewFuel = {
  plugin: {
    name: 'reviewFuel',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}',
          ...reviewFuelController,
          options: {
            validate: { params: paramsSchema }
          }
        },
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/incomplete-review',
          ...incompleteReviewController,
          options: {
            validate: { params: paramsSchema }
          }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}',
          ...fuelDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                decision: Joi.string().valid('accept', 'reject').required()
              })
            }
          }
        }
      ])
    }
  }
}
