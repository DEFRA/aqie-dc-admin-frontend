import { ConfidentialClientApplication } from '@azure/msal-node'
import { config } from './config.js'

export const msalConfig = {
  auth: {
    clientId: config.get('azure.clientId'),
    authority: `https://login.microsoftonline.com/${config.get('azure.tenantId')}`,
    clientSecret: config.get('azure.clientSecret')
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message) => {
        console.log(message)
      },
      piiLoggingEnabled: false,
      logLevel: 'Info'
    }
  }
}

//export const msalClient = new ConfidentialClientApplication(msalConfig)
let _msalClient

export function msalClient() {
  if (!_msalClient) {
    _msalClient = new ConfidentialClientApplication(msalConfig)
  }
  return _msalClient
}
