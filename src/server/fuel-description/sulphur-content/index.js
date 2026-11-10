import Joi from 'joi'
import { fuelDescriptionSulphurContentController } from './controller.js'

const paramsSchema = Joi.object({
  fuelId: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(64)
    .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelDescriptionSulphurContent = {
  plugin: {
    name: 'fuelDescriptionSulphurContent',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-description/sulphur-content',
          ...fuelDescriptionSulphurContentController,
          options: {
            validate: { params: paramsSchema }
          }
        }
      ])
    }
  }
}
