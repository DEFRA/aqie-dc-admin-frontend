import Joi from 'joi'
import { manufacturerLetterController } from './controller.js'

/**
 * Routes for the manufacturer-letter technical review screen.
 * Registered from src/server/router.js and validated by a strict fuel ID schema.
 */

const fuelIdSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const manufacturerLetter = {
  plugin: {
    name: 'manufacturerLetter',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/manufacturer-letter',
          handler: manufacturerLetterController.get,
          options: { validate: { params: fuelIdSchema } }
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/manufacturer-letter',
          handler: manufacturerLetterController.post,
          options: {
            validate: {
              params: fuelIdSchema,
              payload: Joi.object({
                decision: Joi.string().valid('pass', 'fail').required()
              })
            }
          }
        }
      ])
    }
  }
}
