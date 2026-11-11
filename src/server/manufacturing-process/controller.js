export function handleFuelDescriptionManufacturingProcessRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('manufacturing-process/index', {
    pageTitle: 'Manufacturing process',
    backLink: { href: `/review-fuel/${encoded}/fuel-description` }
  })
}

export const manufacturingProcessController = {
  handler: handleFuelDescriptionManufacturingProcessRequest
}
