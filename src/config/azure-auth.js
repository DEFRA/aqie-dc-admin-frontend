import { ConfidentialClientApplication } from '@azure/msal-node'
import { config } from './config.js'
import { createLogger } from '../server/common/helpers/logging/logger.js'

const logger = createLogger()

export const msalConfig = {
  auth: {
    clientId: config.get('azure.clientId'),
    authority: `${config.get('azure.authorityHost')}/${config.get('azure.tenantId')}`,
    clientSecret: config.get('azure.clientSecret')
  },
  system: {
    loggerOptions: {
      loggerCallback: (_level, message) => {
        logger.debug(message)
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
