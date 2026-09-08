import inert from '@hapi/inert'

import { home } from './home/index.js'
import { about } from './about/index.js'
import { health } from './health/index.js'
import { dashboard } from './dashboard/index.js'
import { applicationsAppliances } from './applications-appliances/index.js'
import { reviewApplicationAppliances } from './review-application-appliances/index.js'
import { reviewAppliance } from './review-appliance/index.js'
import { technicalDrawings } from './technical-drawings/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'
import { azureAuth } from './plugins/azure-auth.js'

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([
        home,
        about,
        azureAuth,
        dashboard,
        applicationsAppliances,
        reviewApplicationAppliances,
        reviewAppliance,
        technicalDrawings
      ])

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
