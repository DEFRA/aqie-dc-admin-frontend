/**
 * Hapi plugin registration for the brand-name feature.
 *
 * Registers two routes that use the same controller:
 * - GET/POST /review-fuel/{fuelId}/brand-name (Manufacturer supplierType)
 * - GET/POST /review-fuel/{fuelId}/rebrand-name (Rebrand supplierType)
 *
 * The controller determines which content/styling to use based on the route path.
 * Both routes update the same `brandName` database field.
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

const payloadSchema = Joi.object({
  brandName: Joi.string().allow(''),
  rebrandName: Joi.string().allow('')
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
              payload: payloadSchema
            }
          }
        },
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/rebrand-name',
          ...brandNameController,
          options: { validate: { params: paramsSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/rebrand-name',
          ...brandNameDecisionController,
          options: {
            validate: {
              params: paramsSchema,
              payload: payloadSchema
            }
          }
        }
      ])
    }
  }
}
