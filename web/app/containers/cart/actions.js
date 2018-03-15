/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import IntegrationManager from 'mobify-integration-manager/dist/'

import {createPropsSelector} from 'reselect-immutable-helpers'
import {createAction} from 'progressive-web-sdk/dist/utils/action-creation'
import {
    PROMO_ERROR
} from './constants'
import {CART_ESTIMATE_SHIPPING_MODAL, CART_WISHLIST_MODAL, CART_REMOVE_ITEM_MODAL} from '../../modals/constants'
import {cartExpired, handleCartError} from '../app/actions'
import {addNotification} from 'progressive-web-sdk/dist/store/notifications/actions'
import {getIsLoggedIn} from 'progressive-web-sdk/dist/store/user/selectors'
import {trigger} from '../../utils/astro-integration'
import {getEstimateShippingAddress} from '../../store/form/selectors'
import {getSelectedShippingMethod} from '../../store/checkout/shipping/selectors'
import {closeModal, openModal} from '../../modals/actions'
import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'

export const setRemoveItemId = createAction('Set item id for removal', ['removeItemId'])
export const setIsWishlistComplete = createAction('Set wishlist add complete', ['isWishlistAddComplete'])
export const setTaxRequestPending = createAction('Set tax request pending', ['taxRequestPending'])
export const setPromoSubmitting = createAction('Set Promo Submitting', ['promoSubmitting'])

const shippingFormSelector = createPropsSelector({
    address: getEstimateShippingAddress,
    shippingMethod: getSelectedShippingMethod
})

export const initialize = (url, routeName) => (dispatch) => {
    // Fetch information you need for the template here
    // Do not extend the init*Page command as it is going to be deprecated
    return dispatch(IntegrationManager.cart.initCartPage(url, routeName))
}

export const requestCartContent = () => (dispatch) => {
    dispatch(IntegrationManager.cart.getCart())
}

export const submitEstimateShipping = () => (dispatch, getState) => {
    const {address, shippingMethod} = shippingFormSelector(getState())

    dispatch(setTaxRequestPending(true))
    dispatch(IntegrationManager.checkout.fetchShippingMethodsEstimate(address))
        .then(() => dispatch(IntegrationManager.cart.fetchTaxEstimate(address, shippingMethod.id)))
        .catch((error) => dispatch(handleCartError(error)))
        .catch(() => (
            dispatch(addNotification(
                'taxError',
                'Unable to calculate tax and/or shipping.',
                true
            ))
        ))
        .then(() => {
            dispatch(closeModal(CART_ESTIMATE_SHIPPING_MODAL, UI_NAME.estimateShipping))
            dispatch(setTaxRequestPending(false))
        })
}

const cartUpdateError = (error) => (dispatch) => {
    const message = error.message
    if (message.includes('expired')) {
        return dispatch(cartExpired())
    }
    return dispatch(addNotification(
        'cartUpdateError',
        message,
        true
    ))
}

export const removeItem = (itemID) => (dispatch) => {
    return dispatch(IntegrationManager.cart.removeFromCart(itemID))
        .then(() => {
            // Tell Astro the cart has updated, so it can coordinate
            // all active webviews to refresh if needed
            trigger('cart:updated')
        })
        .catch((error) => dispatch(cartUpdateError(error)))
}

export const saveToWishlist = (productId, itemId, productURL, quantity) => (dispatch, getState) => {
    dispatch(setIsWishlistComplete(false))
    dispatch(openModal(CART_WISHLIST_MODAL, UI_NAME.wishlist))
    if (!getIsLoggedIn(getState())) {
        return Promise.resolve()
    }

    return dispatch(IntegrationManager.products.addItemToWishlist(productId, productURL, quantity))
        .then(() => {
            dispatch(removeItem(itemId))
            dispatch(setIsWishlistComplete(true))
        })
        .catch((error) => {
            if (/Failed to fetch|Add Request Failed|Unable to add item/i.test(error.message)) {
                dispatch(closeModal(CART_WISHLIST_MODAL, UI_NAME.wishlist))
                dispatch(addNotification(
                    'cartWishlistError',
                    'Unable to add item to wishlist.',
                    true
                ))
            } else {
                throw error
            }
        })
}

export const openRemoveItemModal = (itemId) => {
    return (dispatch) => {
        dispatch(openModal(CART_REMOVE_ITEM_MODAL, UI_NAME.removeItem))
        dispatch(setRemoveItemId(itemId))
    }
}

export const updateItem = (itemId, itemQuantity) => (dispatch) => {
    return dispatch(IntegrationManager.cart.updateItemQuantity(itemId, itemQuantity))
        .catch((error) => dispatch(cartUpdateError(error)))
}

export const submitPromoCode = ({promo}) => (dispatch) => {
    dispatch(setPromoSubmitting(true))
    dispatch(IntegrationManager.cart.putPromoCode(promo))
        .catch(({message}) => {
            dispatch(addNotification(
                'submitPromoError',
                message.includes(PROMO_ERROR) ? message : PROMO_ERROR,
                true
            ))
        })
        .then(() => dispatch(setPromoSubmitting(false)))
}

export const removePromoCode = (promoId) => (dispatch) => {
    dispatch(IntegrationManager.cart.deletePromoCode(promoId))
        .catch(() => {
            dispatch(addNotification(
                'removePromoError',
                'Unable to remove promo',
                true
            ))
        })
}
