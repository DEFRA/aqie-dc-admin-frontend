import inert from '@hapi/inert'

import { home } from './home/index.js'
import { about } from './about/index.js'
import { health } from './health/index.js'
import { manageCertification } from './manage-certification/index.js'
import { applianceApplications } from './appliance-applications/index.js'
import { reviewApplianceApplication } from './review-appliance-application/index.js'
import { finishApplicationReview } from './finish-application-review/index.js'
import { applicationReviewComplete } from './application-review-complete/index.js'
import { incompleteApplicationReview } from './incomplete-application-review/index.js'
import { reviewAppliance } from './review-appliance/index.js'
import { conformityMark } from './conformity-mark/index.js'
import { technicalDrawings } from './technical-drawings/index.js'
import { checkPermittedFuels } from './check-permitted-fuels/index.js'
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
        manageCertification,
        applianceApplications,
        reviewApplianceApplication,
        finishApplicationReview,
        applicationReviewComplete,
        incompleteApplicationReview,
        reviewAppliance,
        checkPermittedFuels,
        conformityMark,
        technicalDrawings
      ])

      // Static assets
      await server.register([serveStaticFiles])
    }
  }
}
