import { fuelWeightController, fuelWeightSaveController } from './controller.js'

export const fuelWeight = {
  plugin: {
    name: 'fuel-weight',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/review-fuel/{fuelId}/fuel-weight',
          ...fuelWeightController
        },
        {
          method: 'POST',
          path: '/review-fuel/{fuelId}/fuel-weight',
          ...fuelWeightSaveController
        }
      ])
    }
  }
}
