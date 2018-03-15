/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'

// Components
import template from '../../template'
import PageMeta from '../../components/page-meta'

import {initialize} from './actions'

// Partials
import HomeCarousel from './partials/home-carousel'
import HomeCategories from './partials/home-categories'
import HomePopularProducts from './partials/home-popular-products'

// Selectors
import {getHomePageMeta, getHeroProducts} from './selectors'

const banners = [{
    src: '//via.placeholder.com/400x200',
    alt: 'Merlins Potions'
}, {
    src: '//via.placeholder.com/400x200',
    alt: 'Free Shipping By Owl'
}, {
    src: '//via.placeholder.com/400x200',
    alt: 'Books'
}]

const Home = ({pageMeta, products}) => {
    return (
        <div className="t-home__container">
            <PageMeta {...pageMeta} />
            <HomeCarousel banners={banners} />
            <HomeCategories />
            { products && <HomePopularProducts products={products} /> }
        </div>
    )
}

Home.propTypes = {
    pageMeta: PropTypes.object,
    products: PropTypes.array
}

Home.initAction = initialize

const mapStateToProps = createPropsSelector({
    pageMeta: getHomePageMeta,
    products: getHeroProducts
})

const connectedHome = connect(mapStateToProps)(Home)

export default template(connectedHome)
