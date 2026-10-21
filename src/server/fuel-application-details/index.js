import Joi from 'joi'
import { fuelApplicationDetailsController } from './controller.js'

const paramsSchema = Joi.object({
    applicationId: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(64)
        .pattern(/^[A-Za-z0-9-]+$/)
})

export const fuelApplicationDetails = {
    plugin: {
        name: 'fuelApplicationDetails',
        register(server) {
            server.route([
                {
                    method: 'GET',
                    path: '/review-fuel-application/{applicationId}',
                    ...fuelApplicationDetailsController,
                    options: {
                        validate: { params: paramsSchema }
                    }
                }
            ])
        }
    }
}
