export function handleQualityControlRequest(request, h) {
  const { fuelId } = request.params
  const encoded = encodeURIComponent(fuelId)

  return h.view('fuel-details/quality-control/index', {
    pageTitle: 'Quality control',
    backLink: { href: `/review-fuel/${encoded}/fuel-details` }
  })
}

export const qualityControlController = {
  handler: handleQualityControlRequest
}
