/**
 * Hapi plugin registration for the rebrand-name feature.
 *
 * This route lets a user view and update the rebranded name for a fuel in the
 * supplier type "Rebrand" journey. The GET route renders the form and the POST
 * route validates the value before saving and redirecting back to the fuel
 * details page.
 */
import Joi from 'joi'
import {
  rebrandNameController,
  rebrandNameDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const rebrandName = {
  plugin: {
    name: 'rebrandName',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/rebrand-name',
          ...rebrandNameController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/rebrand-name',
          ...rebrandNameDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                rebrandName: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
