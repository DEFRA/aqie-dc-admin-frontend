import { checkPermittedFuelsContent } from './content.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import {
  getApplianceForPermittedFuels,
  savePermittedFuels
} from './check-permitted-fuels-data.js'
import { statusCodes } from '../common/constants/status-codes.js'

const logger = createLogger()
const content = checkPermittedFuelsContent.en

function hasAnyLetter(value = '') {
  return /[A-Za-z]/.test(value)
}

function toYesNo(value) {
  if (value === true) {
    return 'Yes'
  }

  if (value === false) {
    return 'No'
  }

  return undefined
}

function renderCheckPermittedFuelsPage(
  h,
  applianceId,
  appliance,
  formValues,
  error
) {
  const heading = content.heading(appliance.modelName)

  return h.view('check-permitted-fuels/index', {
    pageTitle: error ? `Error: ${heading}` : heading,
    heading,
    content,
    appliance,
    reviewHref: `/review-appliance/${encodeURIComponent(applianceId)}`,
    formValues,
    error
  })
}

async function handleCheckPermittedFuelsRequest(request, h) {
  const { applianceId } = request.params

  try {
    const { data: appliance } = await getApplianceForPermittedFuels(applianceId)

    return renderCheckPermittedFuelsPage(
      h,
      applianceId,
      appliance,
      {
        permFuelsCS: appliance.allowedFuels ?? '',
        woodCS: toYesNo(appliance.isPermittedToBurnWood)
      },
      null
    )
  } catch (error) {
    logger.error(
      `[checkPermittedFuels] failed to load ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

async function handleCheckPermittedFuelsDecisionRequest(request, h) {
  const { applianceId } = request.params
  const reviewHref = `/review-appliance/${encodeURIComponent(applianceId)}`
  const { permFuelsCS, woodCS } = request.payload

  try {
    if (!hasAnyLetter(permFuelsCS)) {
      const { data: appliance } =
        await getApplianceForPermittedFuels(applianceId)

      return renderCheckPermittedFuelsPage(
        h,
        applianceId,
        appliance,
        {
          permFuelsCS: permFuelsCS ?? '',
          woodCS: woodCS ?? toYesNo(appliance.isPermittedToBurnWood)
        },
        {
          field: 'permFuelsCS',
          message: content.errors.permittedFuelsRequired,
          href: '#perm-fuels'
        }
      ).code(statusCodes.badRequest)
    }

    if (!woodCS) {
      const { data: appliance } =
        await getApplianceForPermittedFuels(applianceId)

      return renderCheckPermittedFuelsPage(
        h,
        applianceId,
        appliance,
        {
          permFuelsCS: permFuelsCS ?? appliance.allowedFuels ?? '',
          woodCS: undefined
        },
        {
          field: 'woodCS',
          message: content.errors.woodSelectionRequired,
          href: '#woodCS'
        }
      ).code(statusCodes.badRequest)
    }

    await savePermittedFuels(applianceId, permFuelsCS, woodCS === 'Yes')

    return h.redirect(reviewHref)
  } catch (error) {
    logger.error(
      `[checkPermittedFuels] failed to save ${applianceId}: ${error.message}`
    )

    return h
      .view('error/index', { message: content.errors.generic })
      .code(statusCodes.internalServerError)
  }
}

const checkPermittedFuelsController = {
  handler: handleCheckPermittedFuelsRequest
}

const checkPermittedFuelsDecisionController = {
  handler: handleCheckPermittedFuelsDecisionRequest
}

export {
  handleCheckPermittedFuelsRequest,
  handleCheckPermittedFuelsDecisionRequest,
  checkPermittedFuelsController,
  checkPermittedFuelsDecisionController
}
