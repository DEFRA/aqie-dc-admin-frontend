import { formatDate } from '../../../config/nunjucks/filters/format-date.js'
import { applianceRecordInstructionManualContent } from './content.js'

const content = applianceRecordInstructionManualContent.en

/**
 * Builds the 3-row summary list for a manual section (instruction or servicing).
 * @param {object|undefined} manual - The manual object from the appliance record
 * @param {string} fallback - Text to show when a field is absent
 */
function buildManualRows(manual, fallback) {
  const title = manual?.title || fallback
  const version = manual?.version || fallback
  const publicationDate = manual?.publicationDate
    ? formatDate(manual.publicationDate, 'd MMMM yyyy')
    : fallback

  return [
    {
      key: { text: content.labels.title },
      value: { text: title }
    },
    {
      key: { text: content.labels.version },
      value: { text: version }
    },
    {
      key: { text: content.labels.publicationDate },
      value: { text: publicationDate }
    }
  ]
}

export function buildInstructionManualRows(appliance) {
  return buildManualRows(appliance.instructionManual, content.notProvided)
}

export function buildServicingManualRows(appliance) {
  return buildManualRows(appliance.servicingManual, content.notAvailable)
}
