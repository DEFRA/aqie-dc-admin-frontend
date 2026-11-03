import Joi from 'joi'
import { getTestResults, postTestResults } from './controller.js'

const fuelIdSchema = Joi.object({
    fuelId: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(64)
        .pattern(/^[A-Za-z0-9-]+$/)
})

export const testResults = {
    plugin: {
        name: 'test-results',
        register(server) {
            server.route([
                {
                    method: 'GET',
                    path: '/review-fuel/{fuelId}/test-results',
                    handler: getTestResults,
                    options: { validate: { params: fuelIdSchema } }
                },
                {
                    method: 'POST',
                    path: '/review-fuel/{fuelId}/test-results',
                    handler: postTestResults,
                    options: {
                        validate: {
                            params: fuelIdSchema,
                            payload: Joi.object({
                                result: Joi.boolean().required(),
                                smokeEmission: Joi.alternatives()
                                    .try(Joi.number(), Joi.string().allow(''))
                                    .optional(),
                                sulphurContent: Joi.alternatives()
                                    .try(Joi.number(), Joi.string().allow(''))
                                    .optional()
                            })
                        }
                    }
                }
            ])
        }
    }
}
