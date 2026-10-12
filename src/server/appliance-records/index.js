import { applianceRecordsController } from './controller.js'

export const applianceRecords = {
  plugin: {
    name: 'applianceRecords',
    register(server) {
      server.route([
        {
          method: ['GET', 'POST'],
          path: '/appliance-records',
          ...applianceRecordsController
        }
      ])
    }
  }
}
