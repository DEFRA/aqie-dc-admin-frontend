export function handleManufacturingProcessRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)
  const returnPage =
    request.query.returnTo === 'fuel-description'
      ? 'fuel-description'
      : 'fuel-details'

  return h.view('fuel-details/manufacturing-process/index', {
    pageTitle: 'Manufacturing process',
    backLink: { href: `/review-fuel/${encoded}/${returnPage}` }
  })
}

export const manufacturingProcessController = {
  handler: handleManufacturingProcessRequest
}
