/**
 * Hapi plugin registration for the brand-name feature.
 *
 * This route lets a user view and update the brand name for a fuel in the
 * supplier type "Manufacturer" journey. The GET route renders the form and the POST
 * route validates the value before saving and redirecting back to the fuel
 * details page.
 *
 * Uses the same brandName database field as rebrand-name, but targets Manufacturer supplierType.
 */
import Joi from 'joi'
import {
  brandNameController,
  brandNameDecisionController
} from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const brandName = {
  plugin: {
    name: 'brandName',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/brand-name',
          ...brandNameController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/brand-name',
          ...brandNameDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: Joi.object({
                brandName: Joi.string().allow('').required()
              })
            }
          }
        }
      ])
    }
  }
}
