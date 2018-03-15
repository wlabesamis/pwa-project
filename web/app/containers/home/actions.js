/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import {createAction} from 'progressive-web-sdk/dist/utils/action-creation'
import IntegrationManager from 'mobify-integration-manager/dist/'

import {getHeroProductsSearchParams} from './constants'

export const receiveHomeData = createAction('Receive Home Data')

export const initialize = (url, routeName) => (dispatch) => {
    // Fetch information you need for the template here
    dispatch(IntegrationManager.custom.getPageMetaData(routeName))
        .then((pageMeta) => dispatch(receiveHomeData(pageMeta)))

    const searchParams = getHeroProductsSearchParams()
    dispatch(IntegrationManager.productSearch.searchProducts(searchParams))

    return Promise.resolve()
}
