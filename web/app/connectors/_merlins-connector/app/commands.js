/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import {makeRequest} from 'progressive-web-sdk/dist/utils/fetch-utils'
import {parseSearchSuggestions} from './parser'
import {parseNavigation} from '../navigation/parser'
import {receiveFormKey} from '../actions'
import {
    CHECKOUT_SHIPPING_URL,
    WISHLIST_URL,
    SIGN_IN_URL,
    CART_URL,
    MY_ACCOUNT_URL,
    ACCOUNT_ADDRESS_URL,
    ACCOUNT_INFO_URL,
    ACCOUNT_ORDER_LIST_URL,
    buildQueryURL,
    getJQueryResponse
} from '../config'

import {getCookieValue} from '../../../utils/utils'
import {generateFormKeyCookie} from '../utils'
import {readLoggedInState} from '../account/utils'
import {getCart} from 'mobify-integration-manager/dist/integration-manager/api/cart/commands'
import {
    receiveSearchSuggestions,
    setCheckoutShippingURL,
    setCartURL,
    setWishlistURL,
    setSignInURL,
    setAccountAddressURL,
    setAccountInfoURL,
    setAccountURL,
    setAccountOrderListURL,
    setLoggedIn,
    receiveNavigationData,
    receiveSelectedCurrency,
    receiveAvailableCurrencies
} from 'mobify-integration-manager/dist/integration-manager/results'

import {setCurrencyCode} from 'progressive-web-sdk/dist/analytics/actions'

const runningInBrowser = () => typeof window !== 'undefined' && window.Progressive

const canRequestCaptureDoc = (url) => {
    // GoogleBot's version of Chromium does not support manually creating a response
    const isGoogleBot = /googlebot/i.test(window.navigator.userAgent)
    const capturedDocIsForURL = url === window.Progressive.capturedURL

    // AMP builds do not run in a browser and thus window will not be defined
    return runningInBrowser() && !isGoogleBot && capturedDocIsForURL
}

const requestCapturedDoc = () => {
    return window.Progressive.capturedDocHTMLPromise.then((initialCapturedDocHTML) => {
        const body = new Blob([initialCapturedDocHTML], {type: 'text/html'})
        const capturedDocResponse = new Response(body, {
            status: 200,
            statusText: 'OK'
        })

        return Promise.resolve(capturedDocResponse)
    })
}

const stubCurrency = {
    label: 'Dollar',
    symbol: '$',
    code: 'USD'
}

let isInitialEntryToSite = runningInBrowser()
const requestCache = {}

export const fetchPageData = (url) => (dispatch) => {
    let request

    if (isInitialEntryToSite) {
        request = (canRequestCaptureDoc(url) ? requestCapturedDoc() : makeRequest(url))
            .then(getJQueryResponse())
    } else {
        request = makeRequest(url)

        const cachedRequest = requestCache[url]

        // If there is a cached response return it. Otherwise continue on what you
        // were doing and ensure that you add the request to the cache.
        if (cachedRequest) {
            request = cachedRequest
        } else {
            // NOTE: We need to include the jQuery parsing here to avoid having to make
            // clones of the response
            request = makeRequest(url)
                .then(getJQueryResponse())

            // Add request promise to the cache
            requestCache[url] = request
        }
    }

    isInitialEntryToSite = false

    return request
        .then((res) => {
            const [$, $response] = res

            const isLoggedIn = runningInBrowser() ? readLoggedInState() : false
            if (runningInBrowser()) {
                dispatch(setLoggedIn(isLoggedIn))
            }
            dispatch(receiveNavigationData(parseNavigation($, $response, isLoggedIn)))
            return res
        })
        .then((res) => {
            delete requestCache[url]

            return res
        })
        .catch((error) => {
            console.info(error.message)
            if (error.name !== 'FetchError') {
                throw error
            }
        })
}

export const getSearchSuggestions = (query) => (dispatch) => {
    // Mimic desktop behaviour, only make request search when query is 2 characters or more.
    // Empty list if less than 2 characters
    if (query.length < 2) {
        return dispatch(receiveSearchSuggestions(null))
    }

    const queryURL = buildQueryURL(query)
    return makeRequest(queryURL)
        .then((response) => response.json())
        .then((responseJSON) => dispatch(receiveSearchSuggestions(parseSearchSuggestions(responseJSON))))
}

export const initApp = () => (dispatch) => {
    if (typeof document !== 'undefined') {
        // Use the pre-existing form_key if it already exists
        const formKey = getCookieValue('form_key') || generateFormKeyCookie()
        // Make sure the form key is stored in a cookie
        document.cookie = `form_key=${formKey};`
        dispatch(receiveFormKey(formKey))
        dispatch(getCart())
    }

    dispatch(setAccountAddressURL(ACCOUNT_ADDRESS_URL))
    dispatch(setAccountInfoURL(ACCOUNT_INFO_URL))
    dispatch(setAccountOrderListURL(ACCOUNT_ORDER_LIST_URL))
    dispatch(setCheckoutShippingURL(CHECKOUT_SHIPPING_URL))
    dispatch(setWishlistURL(WISHLIST_URL))
    dispatch(setSignInURL(SIGN_IN_URL))
    dispatch(setAccountURL(MY_ACCOUNT_URL))
    dispatch(setCartURL(CART_URL))
    dispatch(receiveSelectedCurrency(stubCurrency))
    // Send currency analytics
    dispatch(setCurrencyCode(stubCurrency.code))
    dispatch(receiveAvailableCurrencies([stubCurrency]))
    return Promise.resolve()
}
