export function handleManufacturingProcessRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('fuel-details/manufacturing-process/index', {
    pageTitle: 'Manufacturing process',
    backLink: { href: `/review-fuel/${encoded}/fuel-details` }
  })
}

export const manufacturingProcessController = {
  handler: handleManufacturingProcessRequest
}
