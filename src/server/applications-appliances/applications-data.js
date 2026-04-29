const STUB_APPLICATIONS = Object.freeze({
  notStarted: [{ id: 1083, appliances: [{ modelName: 'Twin Heat CS2001' }] }],
  inProgress: [
    {
      id: '1084',
      appliances: [
        { modelName: 'Twin Heat M20i' },
        { modelName: 'Twin Heat M40i' },
        { modelName: 'Twin Heat M60i' },
        { modelName: 'Twin Heat M80i' }
      ],
      reviewer: {
        name: 'Sean Keller'
      }
    }
  ]
})

/**
 * Fetches appliance application split by review status.
 * stub- will call the backend applications endpoint once it exists
 * returs promise{not started: Array, inProgress: Array}
 */

export async function getApplianceApplications() {
  return {
    notStarted: [...STUB_APPLICATIONS.notStarted],
    inProgress: [...STUB_APPLICATIONS.inProgress]
  }
}
