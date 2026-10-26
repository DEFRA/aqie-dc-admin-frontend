import { testReportsContent } from './content.js'

const content = testReportsContent.en

function formatKw(value) {
  return value !== undefined && value !== null
    ? `${value} kW`
    : content.notProvided
}

function formatSmokeEmission(value) {
  if (value === undefined || value === null) return content.notProvided
  const unit = value === 1 ? 'gram per hour' : 'grams per hour'
  return `${value} ${unit}`
}

export function buildTestResultsRows(appliance) {
  const t = appliance.testResults

  return [
    {
      key: { text: content.labels.ratedOutput },
      value: { text: formatKw(t?.ratedOutput) }
    },
    {
      key: { text: content.labels.testedOutputRated },
      value: { text: formatKw(t?.testedOutput?.rated) }
    },
    {
      key: { text: content.labels.testedOutputLow },
      value: { text: formatKw(t?.testedOutput?.low) }
    },
    {
      key: { text: content.labels.smokeEmissionRated },
      value: { text: formatSmokeEmission(t?.smokeEmissionOutput?.rated) }
    },
    {
      key: { text: content.labels.smokeEmissionLow },
      value: { text: formatSmokeEmission(t?.smokeEmissionOutput?.low) }
    }
  ]
}
