import { fuelRecordsController } from './controller.js'

export const fuelRecords = {
  plugin: {
    name: 'fuelRecords',
    register(server) {
      server.route([
        {
          method: ['GET', 'POST'],
          path: '/fuel-records',
          ...fuelRecordsController
        }
      ])
    }
  }
}
