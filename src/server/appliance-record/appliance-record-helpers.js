import { applianceRecordContent } from './content.js'

const content = applianceRecordContent.en

// Backend returns appliance status as live | hidden | pending | rejected
export const normalizeApplianceStatus = (status) =>
  content.applianceStatus[status] ? status : content.statusValues.pending

export const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const buildCertificationTableRows = (appliance) =>
  appliance.certifications.map((cert) => {
    const statusTagColor =
      content.certificationStatus[cert.status] ||
      content.certificationStatus.uncertified
    const dateText = cert.dateCertified || content.notCertifiedText

    return [
      { text: cert.country },
      {
        html: `<strong class="govuk-tag ${statusTagColor.tagClass}">${statusTagColor.label}</strong>`
      },
      { text: dateText },
      {
        html: `<a href="${cert.changeUrl}" class="govuk-link">${content.changeText}<span class="govuk-visually-hidden"> certification for ${cert.country}</span></a>`
      }
    ]
  })

export const buildSubPageBreadcrumbs = (modelName, returnHref) => ({
  breadcrumbs: [
    { text: content.nav.home, href: content.nav.homeHref },
    {
      text: content.nav.applianceRecords,
      href: content.nav.applianceRecordsHref
    },
    { text: modelName, href: returnHref }
  ],
  returnToRecord: content.nav.returnToRecord
})

export const buildNonLegacyDetailsRows = (appliance) =>
  appliance.details.map((detail) => ({
    key: { text: detail.label },
    actions: {
      items: [
        {
          href: detail.viewUrl,
          text: content.actionText,
          visuallyHiddenText: detail.label.toLowerCase()
        }
      ]
    }
  }))

export const buildLegacyDetailsRows = (appliance) => {
  const hasInstructionManual = !!(
    appliance.instructionManual?.title ||
    appliance.instructionManual?.version ||
    appliance.instructionManual?.publicationDate
  )
  const hasLegacyComments = !!appliance.legacy?.comments?.length

  const details = [
    {
      label: content.legacyDetailsItems.applianceDetails,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/appliance-details`
    }
  ]

  if (hasInstructionManual) {
    details.push({
      label: content.legacyDetailsItems.manuals,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/instruction-manual`
    })
  }

  if (hasLegacyComments) {
    details.push({
      label: content.legacyDetailsItems.legacyComments,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/legacy-comments`
    })
  }

  details.push(
    {
      label: content.formatApplicationDetailsLabel(
        appliance.legacy?.applicationId
      ),
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/application-details`
    },
    {
      label: content.legacyDetailsItems.actionHistory,
      viewUrl: `/appliance-record/${encodeURIComponent(appliance.id)}/action-history`
    }
  )

  return details.map((detail) => ({
    key: { text: detail.label },
    actions: {
      items: [
        {
          href: detail.viewUrl,
          text: content.actionText,
          visuallyHiddenText: detail.label.toLowerCase()
        }
      ]
    }
  }))
}

export const buildRejectedDetailsRows = (appliance) => {
  const rejectedRows = [
    {
      key: { text: content.rejectedDetails.dateRejected },
      value: {
        text: appliance.updatedAt
          ? new Date(appliance.updatedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          : null
      }
    },
    {
      key: { text: content.rejectedDetails.rejectedBy },
      value: {
        text:
          appliance.technicalReview?.reviewedBy ||
          content.rejectedDetails.notSpecified
      }
    }
  ]

  const remainingRows = appliance.isLegacyRecord
    ? buildLegacyDetailsRows(appliance)
    : buildNonLegacyDetailsRows(appliance)

  return [...rejectedRows, ...remainingRows]
}

export const buildDetailsRows = (appliance) => {
  if (appliance.applianceStatus === content.statusValues.rejected) {
    return buildRejectedDetailsRows(appliance)
  }

  return appliance.isLegacyRecord
    ? buildLegacyDetailsRows(appliance)
    : buildNonLegacyDetailsRows(appliance)
}

export const buildPublicListing = (appliance) => {
  const showLink = appliance.applianceStatus === content.statusValues.live
  return {
    showLink,
    url: showLink ? appliance.publicListingUrl : null,
    linkText: content.viewPublicListingText
  }
}

export const buildActions = (appliance) => {
  const buttons = []

  if (appliance.buttons.hideFromPublic) {
    buttons.push({
      text: content.hideFromPublicText,
      href: appliance.hideFromPublicUrl,
      classes: 'govuk-button govuk-button--secondary'
    })
  }

  if (appliance.buttons.makePublic) {
    buttons.push({
      text: content.makePublicText,
      href: appliance.makePublicUrl,
      classes: 'govuk-button'
    })
  }

  return { buttons }
}

export const buildApplianceRecordData = (applianceId, data = {}) => {
  const certifications = Object.entries(content.countries).map(
    ([countryKey, countryName]) => {
      const certification = data.certifications?.[countryKey] || {}

      // Routes use kebab-case (northern-ireland); the data keys are camelCase.
      const countrySlug = countryKey.replaceAll(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`
      )

      // Backend returns certification status as awaiting_decision | certified | uncertified
      return {
        country: countryName,
        status: certification.status || 'awaiting_decision',
        dateCertified: certification.lastCertifiedAt
          ? formatDate(certification.lastCertifiedAt)
          : null,
        changeUrl: `${encodeURIComponent(applianceId)}/approval-status-${countrySlug}`
      }
    }
  )

  const applianceStatus = normalizeApplianceStatus(data.status)
  const statusDisplay = content.applianceStatus[applianceStatus]

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
    hideFromPublicUrl: `/appliance-record/${encodeURIComponent(applianceId)}/change-display-status`,
    makePublicUrl: `/appliance-record/${encodeURIComponent(applianceId)}/change-display-status`,
    certifications,
    details
  }

  if (data.applicationId !== undefined) {
    transformedData.applicationId = data.applicationId
  }
  if (data.isLegacyRecord !== undefined) {
    transformedData.isLegacyRecord = data.isLegacyRecord
  }
  if (data.legacy !== undefined) {
    transformedData.legacy = data.legacy
  }
  if (data.instructionManual !== undefined) {
    transformedData.instructionManual = data.instructionManual
  }

  return transformedData
}
