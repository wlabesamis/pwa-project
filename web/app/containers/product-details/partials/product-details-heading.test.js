/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-env jest */
/* eslint-disable import/namespace */

import React from 'react'
import Immutable from 'immutable'
import ConnectedProductDetailsHeading from './product-details-heading'
import {mount, shallow} from 'enzyme'
import * as AstroIntegration from '../../../utils/astro-integration'
import {
    wrapProviderIntlProvider,
    intlContext,
    currencyObject
} from '../../../utils/test-utils'

const ProductDetailsHeading = ConnectedProductDetailsHeading.WrappedComponent

const appStore = {
    app: Immutable.fromJS({
        selectedCurrency: currencyObject
    }),
    ui: { // Note: This can't be immutable, otherwise it breaks UI selectors...
        app: Immutable.fromJS({
            translations: {},
            locale: 'en'
        })
    },
}

test('renders without errors', () => {
    const wrapper = mount(
        <ProductDetailsHeading currency={currencyObject} />
    )

    expect(wrapper.length).toBe(1)
})

const ROOT_CLASS = 't-product-details-heading'

test('renders the component class correctly', () => {
    const component = <ProductDetailsHeading currency={currencyObject} />
    const wrapper = shallow(component, intlContext)

    expect(wrapper.hasClass(ROOT_CLASS)).toBe(true)
})

test('renders the title and price', () => {
    const price = '10'
    const title = 'Potion of Healing'
    const component = (
        <ProductDetailsHeading
            title={title}
            price={price}
            available={true}
            currency={currencyObject}
        />
    )

    const wrapper = mount(
        wrapProviderIntlProvider(component, appStore)
    )

    const titleElement = wrapper.find(ProductDetailsHeading).find(`.${ROOT_CLASS}__title`)

    expect(titleElement.length).toBe(1)
    expect(titleElement.text()).toBe(title)

    expect(wrapper.find(ProductDetailsHeading).prop('price')).toBe(price)
    expect(wrapper.find(ProductDetailsHeading).prop('currency')).toBe(currencyObject)
})

test('doesnt render the breadcrumbs if running in Astro', () => {
    AstroIntegration.isRunningInAstro = true

    const component = <ProductDetailsHeading currency={currencyObject} />
    const wrapper = shallow(component, intlContext)
    const breadcrumbs = wrapper.find(`.t-product-details__breadcrumbs`)
    expect(breadcrumbs.length).toBe(0)
})

test('renders the breadcrumbs if not running in Astro', () => {
    AstroIntegration.isRunningInAstro = false

    const component = <ProductDetailsHeading currency={currencyObject} />
    const wrapper = shallow(component, intlContext)
    const breadcrumbs = wrapper.find(`.t-product-details__breadcrumbs`)
    expect(breadcrumbs.length).toBe(1)
})
