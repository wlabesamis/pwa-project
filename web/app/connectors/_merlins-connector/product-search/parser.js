/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import queryString from 'query-string'

// This regex is used to get a product's ID from its "Wishlist" or "Compare"
// button. It's stored in a string in a data attribute of the button.
const PRODUCT_REGEXP = new RegExp(/product":"([0-9]*)","/)

const parseProduct = ($, $product) => {
    const $link = $product.find('.product-item-link')
    const $image = $product.find('.product-image-photo')
    const $price = $product.find('.price')
    const $stock = $product.find('.stock')

    const productName = $link.text()
    const location = $link.attr('href').match(/([^/]+)(?=\.\w+$)/)[1]
    const actionButtonData = $product.find('.towishlist, .tocompare').attr('data-post')
    const productId = PRODUCT_REGEXP.exec(actionButtonData)[1]
    const available = $stock.hasClass('available')

    const priceMatch = $price.text().match(/\$(.+)/)
    const price = priceMatch ? $price.text().match(/\$(.+)/)[1] : undefined

    const link = $link.attr('href')

    const image = {
        _type: 'image',
        alt: $image.attr('alt'),
        link: $image.attr('x-src'),
        title: $image.attr('alt')
    }

    const thumbnail = {
        alt: productName,
        src: image.link,
        title: productName
    }

    return {
        available,
        productId,
        productName,
        link,
        image,
        href: `/${location}.html`,
        thumbnail,
        price
    }
}

const parseProducts = ($, $content) => {
    return $content
            .find('.products.product-items > .product-item')
            .map((index, el) => parseProduct($, $(el)))
            .toArray()
}

const parseSortingOptions = ($, $content) => {
    const options = $content
            .find('#sorter:first option')
            .map((index, el) => ({
                id: el.value,
                label: el.innerText
            }))
            .toArray()

    return options
}

const parseSelectedSortingOptions = ($, $content) => {
    const selected = $content
            .find('#sorter:first option[selected]')
            .val()

    return selected
}

const parseFilter = ($, $option, currentUrl) => {
    const label = $option.find('.filter-options-title').text()
    let ruleset = ''

    const $kinds = $option.find('.filter-options-content a')
    const kinds = $.map($kinds, (el) => {
        const $kind = $(el)
        const $count = $kind.find('.count')
        $count.remove()

        const filterQueryObj = queryString.parse($kind[0].search)
        const currentQueryObj = queryString.parse(currentUrl.split('?')[1])

        // Get the filter rule based on what options are in the filters (link) search
        // and those in the current url. The key value pair that is missing, is the
        // filter this item represents.
        ruleset =
            Object.keys(filterQueryObj)
                .filter((key) => !Object.keys(currentQueryObj).includes(key))[0]

        return {
            label: $kind.text(),
            count: parseInt($count[0].childNodes[0].nodeValue),
            searchKey: filterQueryObj[ruleset],
            query: filterQueryObj[ruleset]
        }
    })

    return {
        label,
        ruleset,
        kinds
    }
}

const parseFilters = ($, $content, currentUrl) => {
    const $options = $content.find('.filter-options-item')
    const options = $.map($options, (el) => parseFilter($, $(el), currentUrl))

    return options
}
import urlParse from 'url-parse'
const parseSelectedFilters = ($, $content, currentUrl) => {
    const filters = []

    // Parse selected filters by getting the current filters applied to this page,
    // then removeing all the filters that appear in the "remove" x filter link.
    // What will be left is the key/value pair of the filter representing the selected
    // filter.
    const urlObj = urlParse(currentUrl)
    const queryObj = queryString.parse(urlObj.query)
    Object.keys(queryObj)
        .forEach((key) => {
            const value = queryObj[key]
            const queryObjClone = {...queryObj}

            delete queryObjClone[key]

            // Look for the selected filter el to get the label and text
            const $selectedFilter = $content.find(`.filter-current a[href$="${queryString.stringify(queryObjClone)}"]`).closest('.item')

            if (!$selectedFilter.length) { return }

            filters.push({
                label: $selectedFilter.find('.filter-value').text(),
                query: `${key}=${value}`,
                ruleset: $selectedFilter.find('.filter-label').text()
            })
        })

    filters.push({
        label: 'Books',
        query: `cgid=${'books'}`,
        ruleset: 'Category'
    })

    return filters
}

export const parseProductSearch = ($, $html) => { // eslint-disable-line no-unused-vars
    const $mainContent = $html.find('#maincontent')

    // If we don't have any products, stop where you are and return.
    const isEmpty = !!$mainContent.find('.column.main .empty').length

    if (isEmpty) {
        return {
            products: []
        }
    }

    const currentUrl =
        JSON.parse($mainContent.find('.toolbar-products:first').attr('data-mage-init'))
            .productListToolbarForm
            .url

    const products = parseProducts($, $mainContent)

    const sortingOptions = parseSortingOptions($, $mainContent)
    const selectedSortingOption = parseSelectedSortingOptions($, $mainContent)
    const filters = parseFilters($, $mainContent, currentUrl)
    const selectedFilters = parseSelectedFilters($, $mainContent, currentUrl)

    const total = parseInt($mainContent.find('#toolbar-amount .toolbar-number:first').text())
    const count = products.length
    const pageSize = parseInt($mainContent.find('#limiter:first option:selected').text())
    const $page = $mainContent.find('.pages .current span:last')
    const page = $page.length ? parseInt($page.text()) - 1 : 0
    const start = page * pageSize
    const query = $html.find('#search').val()

    return {
        start,
        products,
        total,
        query,
        count,
        sortingOptions,
        selectedSortingOption,
        filters,
        selectedFilters
    }
}
