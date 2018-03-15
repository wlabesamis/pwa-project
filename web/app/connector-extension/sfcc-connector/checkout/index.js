/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import {SubmissionError} from 'redux-form'
import {AMEX, MASTER} from './constants'

import {
    createBasket,
    handleCartData,
    requestCartData,
    createNewBasket,
    updateExpiredCart
} from 'mobify-integration-manager/dist/connectors/sfcc/cart/utils'
import {
    getPaymentURL,
    getConfirmationURL,
    CHECKOUT_SHIPPING_CONTENT_ID,
    CHECKOUT_PAYMENT_CONTENT_ID,
    CHECKOUT_CONFIRMATION_CONTENT_ID
} from 'mobify-integration-manager/dist/connectors/sfcc/config'
import {
    makeApiRequest,
    makeApiJsonRequest,
    getCustomerID,
    checkForResponseFault,
    requestContentById
} from 'mobify-integration-manager/dist/connectors/sfcc/utils'
import {parsePageMeta} from 'mobify-integration-manager/dist/connectors/sfcc/parsers'
import {getSavedAddresses} from 'mobify-integration-manager/dist/connectors/sfcc/account/commands'

import {
    receiveCheckoutPageMeta,
    receiveShippingMethods,
    receiveShippingAddress,
    receiveBillingAddress,
    receiveSelectedShippingMethod,
    receiveBillingSameAsShipping,
    receiveCheckoutConfirmationData
} from 'mobify-integration-manager/dist/integration-manager/api/checkout/results'
import {getOrderTotal} from 'progressive-web-sdk/dist/store/cart/selectors'
import {receiveOrderConfirmationContents} from 'mobify-integration-manager/dist/integration-manager/results'
import {getCardData, AMERICAN_EXPRESS, MASTERCARD} from 'progressive-web-sdk/dist/card-utils'

import {getSelectedShippingMethodValue} from '../../../store/checkout/shipping/selectors'

import {
    populateLocationsData,
    createOrderAddressObject
} from 'mobify-integration-manager/dist/connectors/sfcc/checkout/utils'
import {parseShippingAddressFromBasket} from 'mobify-integration-manager/dist/connectors/sfcc/checkout/parsers'

export const fetchShippingMethodsEstimate = (inputAddress = {}) => (dispatch, getState) => {
    const selectedShippingMethodId = getSelectedShippingMethodValue(getState())
    return createBasket()
        .then((basket) => makeApiRequest(`/baskets/${basket.basket_id}/shipments/me/shipping_methods`, {method: 'GET'}))
        .then((response) => response.json())
        .then((basket) => dispatch(updateExpiredCart(basket)))
        .then(({applicable_shipping_methods}) => {
            const shippingMethods = applicable_shipping_methods
                  .map(({name, description, price, id}) => ({
                      label: `${name} - ${description}`,
                      cost: `${price}`,
                      id
                  }))

            dispatch(receiveShippingAddress({
                ...inputAddress
            })) // set initial values for the shipping form
            dispatch(receiveSelectedShippingMethod(selectedShippingMethodId || shippingMethods[0].id))
            return dispatch(receiveShippingMethods(shippingMethods))
        })
}

export const initCheckoutShippingPage = () => (dispatch) => {
    const gettingSavedAddress = dispatch(getSavedAddresses())

    const gettingCartData = requestCartData()
        .then((basket) => dispatch(updateExpiredCart(basket)))
        .then((basket) => {
            const {
                customer_info: {
                    email
                },
                shipments: [{
                    shipping_address,
                    shipping_method
                }]
            } = basket

            // Ensure required properties for Address runtype are present
            let initialValues = {
                countryId: 'us',
                name: '',
                firstname: '',
                lastname: '',
                addressLine1: '',
                postcode: '',
                telephone: '',
                city: ''
            }

            /* eslint-disable camelcase */
            if (shipping_address) {
                initialValues = {
                    ...initialValues,
                    username: email,
                    name: shipping_address.full_name,
                    firstname: shipping_address.first_name,
                    lastname: shipping_address.last_name,
                    company: shipping_address.company_name,
                    addressLine1: shipping_address.address1,
                    addressLine2: shipping_address.address2,
                    countryId: shipping_address.country_code,
                    city: shipping_address.city,
                    regionId: shipping_address.state_code,
                    postcode: shipping_address.postal_code,
                    telephone: shipping_address.phone
                }
            }

            dispatch(receiveSelectedShippingMethod(shipping_method ? shipping_method.id : undefined))
            /* eslint-enable camelcase */
            dispatch(receiveShippingAddress(initialValues))
            dispatch(populateLocationsData())
            return initialValues
        })
        .then((initialValues) => dispatch(fetchShippingMethodsEstimate(initialValues)))

    const gettingPageMeta = requestContentById(CHECKOUT_SHIPPING_CONTENT_ID)
        .then((resJSON) => {
            dispatch(receiveCheckoutPageMeta(parsePageMeta(resJSON).pageMeta))
        })

    return Promise.all([gettingSavedAddress, gettingCartData, gettingPageMeta])
}

export const initCheckoutConfirmationPage = () => (dispatch) => {
    return requestContentById(CHECKOUT_CONFIRMATION_CONTENT_ID)
        .then((resJSON) => {
            dispatch(receiveCheckoutPageMeta(parsePageMeta(resJSON).pageMeta))
        })
}

export const initCheckoutPaymentPage = () => (dispatch) => {
    dispatch(populateLocationsData())
    const gettingPaymentData = requestCartData()
        .then((basket) => dispatch(updateExpiredCart(basket)))
        .then((basket) => {
            const shippingMethod = basket.shipments[0].shipping_method
            const addressData = parseShippingAddressFromBasket(basket)

            dispatch(receiveSelectedShippingMethod(shippingMethod ? shippingMethod.id : undefined))
            dispatch(receiveShippingAddress(addressData))
            dispatch(receiveBillingSameAsShipping(true))
            dispatch(receiveBillingAddress(addressData))
        })
    const gettingPageMeta = requestContentById(CHECKOUT_PAYMENT_CONTENT_ID)
        .then((resJSON) => {
            dispatch(receiveCheckoutPageMeta(parsePageMeta(resJSON).pageMeta))
        })
    return Promise.all([gettingPaymentData, gettingPageMeta])
}

const setCustomerNameAndEmail = (formValues, basket) => () => {
    const customerID = getCustomerID()
    const requestBody = {
        email: formValues.username,
        customer_name: formValues.name,
        customer_id: customerID
    }

    return makeApiJsonRequest(
        `/baskets/${basket.basket_id}/customer`,
        requestBody,
        {method: 'PUT'}
    )
}

const setShippingAddress = (formValues, basket) => () => (
    makeApiJsonRequest(
        `/baskets/${basket.basket_id}/shipments/me/shipping_address?use_as_billing=true`,
        createOrderAddressObject(formValues),
        {method: 'PUT'}
    )
    .then(checkForResponseFault)
)

const setShippingMethod = (formValues, basket) => () => (
    makeApiJsonRequest(
        `/baskets/${basket.basket_id}/shipments/me/shipping_method`,
        {id: formValues.shippingMethodId},
        {method: 'PUT'}
    )
    .then(checkForResponseFault)
)

const getTypeValue = (getCard) => {
    switch (getCard) {
        case AMERICAN_EXPRESS:
            return AMEX
        case MASTERCARD:
            return MASTER
        default:
            return getCard
    }
}

export const submitShipping = (formValues) => (dispatch) => (
    createBasket()
        .then((basket) => dispatch(setCustomerNameAndEmail(formValues, basket)))
        .then((basket) => dispatch(updateExpiredCart(basket)))
        .then((basket) => dispatch(setShippingAddress(formValues, basket)))
        .then((basket) => dispatch(setShippingMethod(formValues, basket)))
        .catch((error) => {
            if (error.message.includes('expired')) {
                throw error
            }
            throw new SubmissionError({_error: 'Unable to save shipping data'})
        })
        .then((basket) => {
            dispatch(handleCartData(basket))
            return getPaymentURL()
        })
)

const addPaymentMethod = (formValues, basket) => (dispatch, getState) => {
    const getCardType = getCardData(formValues.ccnumber).cardType
    const type = getTypeValue(getCardType)
    const orderTotal = getOrderTotal(getState())
    const amount = parseFloat(orderTotal)

    const requestBody = {
        amount,
        payment_method_id: 'CREDIT_CARD',
        payment_card: {
            card_type: type
        }
    }

    return makeApiJsonRequest(
        `/baskets/${basket.basket_id}/payment_instruments`,
        requestBody,
        {method: 'POST'}
    )
}

const setBillingAddress = (formValues, basket) => () => {
    if (formValues.billingSameAsShipping) {
        // No change to the address is necessary
        return Promise.resolve(basket)
    }

    // set billing address
    return makeApiJsonRequest(
        `/baskets/${basket.basket_id}/billing_address?use_as_shipping=false`,
        createOrderAddressObject(formValues),
        {method: 'PUT'}
    )
    .then(checkForResponseFault)
}

const createOrder = (basket) => () => makeApiJsonRequest('/orders', basket, {method: 'POST'})

const setPaymentMethod = (formValues, order) => () => {
   // set payment method
    const getCardType = getCardData(formValues.ccnumber).cardType
    const type = getTypeValue(getCardType)
    const expiryMonth = /^\d\d/.exec(formValues.ccexpiry)[0]
    const expiryYear = /\d\d$/.exec(formValues.ccexpiry)[0]
    const paymentInstrumentID = order.payment_instruments[0].payment_instrument_id

    const requestBody = {
        payment_card: {
            card_type: type,
            expiration_month: parseInt(expiryMonth),
            expiration_year: 2000 + parseInt(expiryYear),
            holder: formValues.ccname,
            number: formValues.ccnumber,
            security_code: formValues.cvv
        },
        payment_method_id: 'CREDIT_CARD'
    }

    return makeApiJsonRequest(
        `/orders/${order.order_no}/payment_instruments/${paymentInstrumentID}`,
        requestBody,
        {method: 'PATCH'}
    )
}

export const submitPayment = (formValues) => (dispatch) => {
    return createBasket()
        .then((basket) => dispatch(addPaymentMethod(formValues, basket)))
        .then((basket) => dispatch(updateExpiredCart(basket)))
        .then((basket) => dispatch(setBillingAddress(formValues, basket)))
        .then((basket) => dispatch(createOrder(basket)))
        .then((order) => dispatch(setPaymentMethod(formValues, order)))
        .then((order) => {
            const orderConfirmationData = {
                orderNumber: order.order_no
            }

            dispatch(receiveOrderConfirmationContents(orderConfirmationData))

            // Send transaction analytics
            dispatch(receiveCheckoutConfirmationData(orderConfirmationData))

            // The new basket data isn't required for the confirmation page,
            // so we can return the URL without waiting for this to complete
            dispatch(createNewBasket())

            return getConfirmationURL()
        })
}

export const updateShippingAndBilling = () => () => Promise.resolve()

export const fetchSavedShippingAddresses = () => () => Promise.resolve()
