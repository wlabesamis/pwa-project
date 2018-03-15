/* global DEBUG */

import {Connector} from './connectors/_merlins-connector'
import IntegrationManager from 'mobify-integration-manager/dist/'
import {jqueryResponse} from 'progressive-web-sdk/dist/jquery-response'

import MerlinMapper from './config/merlins/url'
import urlMapper from './config/url-mapper'

import extension from './connector-extension/merlins-connector'

const initConnector = () => {
    if (window && window.location && !/(www|staging).merlinspotions.com/.test(window.location.hostname)) {
        throw new Error('The Merlins Connector only works on the Magento Merlins Potions website. Are you sure that you have the right connector initialized?')
    }

    urlMapper.initialize(MerlinMapper)

    const connector = Connector({
        features: {
            jqueryResponse
        }
    })
    IntegrationManager.initialize(
        connector,
        extension,
        {
            name: 'merlins',
            debug: DEBUG
        }
    )
}

export default initConnector
