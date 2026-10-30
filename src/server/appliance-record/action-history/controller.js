import { actionHistoryContent } from './content.js'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { getApplianceActionHistory } from './action-history-data.js'
import { formatDate } from '../../../config/nunjucks/filters/format-date.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const logger = createLogger()
const content = actionHistoryContent.en

const DATE_FORMAT = 'd MMMM yyyy'

function buildViewModel(history, applianceId) {
  const returnHref = `/appliance-record/${encodeURIComponent(applianceId)}`

  return {
    pageTitle: content.pageTitle(history.name),
    heading: content.heading(history.name),
    content,
    rows: history.actions.map((action) => [
      { text: action.description },
      { text: action.completedBy },
      { text: formatDate(action.completedAt, DATE_FORMAT) }
    ]),
    backLink: { href: returnHref },
    returnHref,
    breadcrumbs: [
      { text: 'Home', href: '/manage-certification' },
      { text: 'Appliance records', href: '/appliance-records' },
      { text: history.name, href: returnHref }
    ]
  }
}

async function handleActionHistoryRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: history } = await getApplianceActionHistory(applianceId)

    return h.view('action-history/index', buildViewModel(history, applianceId))
  } catch (error) {
    logger.error(
      `[actionHistory] failed to load ${applianceId}: ${error.message}`
    )

    const notFound = error.status === statusCodes.notFound

    return h
      .view('error/index', {
        message: notFound ? content.errors.notFound : content.errors.generic
      })
      .code(notFound ? statusCodes.notFound : statusCodes.internalServerError)
  }
}

export const actionHistoryController = {
  handler: handleActionHistoryRequest
}

export { handleActionHistoryRequest }
