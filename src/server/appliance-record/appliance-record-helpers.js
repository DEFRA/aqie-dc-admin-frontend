import { applianceRecordContent } from './content.js'

const content = applianceRecordContent.en

export const STATUS_LABEL_MAP = {
  awaiting_decision: 'Awaiting decision',
  pending: 'Awaiting decision',
  new: 'Awaiting decision',
  certified: 'Certified',
  uncertified: 'Uncertified',
  not_certified: 'Not certified',
  revoked: 'Rejected',
  rejected: 'Rejected'
}

export const normalizeStatusKey = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')

export const normalizeApplianceStatus = (status) => {
  const normalized = normalizeStatusKey(status)

  if (['new', 'awaiting_decision', 'pending'].includes(normalized)) {
    return 'pending'
  }

  if (['uncertified', 'not_certified', 'revoked'].includes(normalized)) {
    return 'hidden'
  }

  if (['live', 'hidden', 'rejected'].includes(normalized)) {
    return normalized
  }

  return normalized || 'pending'
}

export const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const buildApplianceRecordData = (applianceId, data = {}) => {
  const certifications = Object.entries(content.countries).map(
    ([countryKey, countryName]) => {
      const certification = data.certifications?.[countryKey] || {}
      const normalizedCertificationStatus = normalizeStatusKey(
        certification.status
      )
      const certStatusLabel =
        STATUS_LABEL_MAP[normalizedCertificationStatus] ||
        certification.status ||
        'Not certified'

      return {
        country: countryName,
        status: certStatusLabel,
        dateCertified: certification.lastCertifiedAt
          ? formatDate(certification.lastCertifiedAt)
          : null,
        changeUrl: `/approval-status-${countryKey}`
      }
    }
  )

  const applianceStatus = normalizeApplianceStatus(
    data.status || data.applianceStatus || content.statusValues.pending
  )
  const baseStatusDisplay =
    content.applianceStatus[applianceStatus] || content.applianceStatus.pending
  const statusDisplay = { ...baseStatusDisplay }

  if (applianceStatus === content.statusValues.rejected) {
    statusDisplay.label = content.applianceStatus.rejected.label
    statusDisplay.tagClass = content.applianceStatus.rejected.tagClass
  }

  const buttons = {}
  if (applianceStatus === content.statusValues.live) {
    buttons.showPublicListing = true
    if (data.canTogglePublicVisibility) {
      buttons.hideFromPublic = true
    }
  } else if (
    applianceStatus === content.statusValues.hidden &&
    data.canTogglePublicVisibility
  ) {
    buttons.makePublic = true
  }

  const details = [
    {
      label: content.detailsItems.applianceDetails,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/appliance-details`
    },
    {
      label: content.detailsItems.testResults,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/test-reports`
    },
    {
      label: content.detailsItems.instructionManual,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/instruction-manual`
    },
    {
      label: content.formatApplicationDetailsLabel(data.applicationId),
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/application-details`
    },
    {
      label: content.detailsItems.actionHistory,
      viewUrl: `/appliance-record/${encodeURIComponent(applianceId)}/action-history`
    }
  ]

  const transformedData = {
    id: data.id,
    modelName: data.modelName || content.defaultModelName,
    applianceStatus,
    updatedAt: data.updatedAt || null,
    technicalReview: data.technicalReview || null,
    statusDisplay: {
      label: statusDisplay.label,
      tagClass: statusDisplay.tagClass
    },
    canTogglePublicVisibility: data.canTogglePublicVisibility || false,
    buttons,
    publicListingUrl: `/appliance-list/${encodeURIComponent(applianceId)}`,
    hideFromPublicUrl: '/change-display-status',
    makePublicUrl: '/change-display-status',
    certifications,
    details
  }

  if (data.applicationId !== undefined) {
    transformedData.applicationId = data.applicationId
  }
  if (data.isLegacyRecord !== undefined) {
    transformedData.isLegacyRecord = data.isLegacyRecord
  }

  return transformedData
}
