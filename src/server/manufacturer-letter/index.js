import Joi from 'joi'
import { manufacturerLetterController } from './controller.js'

/**
 * Routes for the manufacturer-letter technical review screen.
 * Registered from src/server/router.js.
 * The fuelId is stored in the session during the fuel review workflow.
 */

export const manufacturerLetter = {
  plugin: {
    name: 'manufacturerLetter',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/manufacturer-letter',
          handler: manufacturerLetterController.get
        },
        {
          method: 'POST',
          path: '/manufacturer-letter',
          handler: manufacturerLetterController.post,
          options: {
            validate: {
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
