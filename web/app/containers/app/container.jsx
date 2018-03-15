/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/namespace */
/* eslint-disable import/named */
import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Helmet} from 'react-helmet'
import {createPropsSelector} from 'reselect-immutable-helpers'
import classNames from 'classnames'
import WebFont from 'webfontloader'
import {isRunningInAstro} from '../../utils/astro-integration'

import * as appActions from './actions'

import {hidePreloader} from 'progressive-web-sdk/dist/preloader'
import DangerousHTML from 'progressive-web-sdk/dist/components/dangerous-html'
import SkipLinks from 'progressive-web-sdk/dist/components/skip-links'
import Lockup from 'progressive-web-sdk/dist/components/lockup'
import {removeNotification} from 'progressive-web-sdk/dist/store/notifications/actions'
import Header from '../../containers/header/container'
import Footer from '../../containers/footer/container'
import NativeConnector from '../native-connector/container'
import * as selectors from './selectors'
import {getNotifications} from '../../store/selectors'
import {getPageFetchError, hasFetchedCurrentPath} from 'progressive-web-sdk/dist/store/offline/selectors'
import {getOpenModals} from 'progressive-web-sdk/dist/store/modals/selectors'

import {isMessagingSupported} from 'progressive-web-sdk/dist/utils/messaging'
import PushMessagingController from 'progressive-web-sdk/dist/components/push-messaging-controller'

import ModalManager from '../../modals'
import NotificationManager from '../../components/notification-manager'

import {prefetchTemplateChunks} from '../templates'

// i18n
import {ProxyIntlProvider} from '../../components/intl/index'

// Offline support
import Offline from '../offline/container'
import OfflineBanner from '../offline/partials/offline-banner'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.hidePreloaderWhenCSSIsLoaded = this.hidePreloaderWhenCSSIsLoaded.bind(this)
    }

    componentDidMount() {
        this.hidePreloaderWhenCSSIsLoaded()
        this.props.fetchSvgSprite()
        this.props.initializeApp()
        this.props.setInitialLocale()
        this.props.setStandAloneAppFlag()
        WebFont.load({
            google: {
                families: ['Oswald:200,400']
            }
        })

        // Prefetch & cache code-splitted chunks when the browser is
        // at the end of frame to allow for quick page transitions
        // and graceful failure when offline.
        prefetchTemplateChunks()
    }

    componentDidUpdate() {
        const targetId = document.location.hash.slice(1)
        if (targetId && targetId.length > 0 && document.getElementById(targetId) !== null) {
            const currentY = window.scrollY
            const headerOffset = document.getElementById('app-header').getBoundingClientRect().bottom || 0
            const targetElem = document.getElementById(targetId)
            const targetY = targetElem.getBoundingClientRect().top - headerOffset
            if (currentY !== targetY) {
                window.scrollTo(0, targetY)
            }
        }
    }

    hidePreloaderWhenCSSIsLoaded(counter = 0) {
        // We wait to wait, but if we wait too long, we'll assume something
        // went wrong with setting window.Progressive.stylesheetLoaded so
        // we'll show the page anyways.
        if (window.Progressive.stylesheetLoaded || counter === 10) {
            hidePreloader()

            // Only after we loaded the CSS can confidently unhide the app.
            // This is necessary, because showing the app by default might show
            // a flash of an ugly, unstyled app until the CSS finally loads.
            this.props.toggleHideApp(false)
        } else {
            console.log('[Mobify.Progressive] Waiting for CSS to be loaded by checking for window.Progressive.stylesheetLoaded')
            counter++
            setTimeout(() => this.hidePreloaderWhenCSSIsLoaded(counter), 100)
        }
    }

    render() {
        const {
            children,
            fetchError,
            hasFetchedCurrentPath,
            notifications,
            removeNotification,
            sprite,
            hideApp,
            openModals,
            scrollManager,
            retryingConnection
        } = this.props

        const routeProps = children.props.route
        const CurrentHeader = routeProps.Header || Header
        const CurrentFooter = routeProps.Footer || Footer

        const skipLinksItems = [
            // Customize your list of SkipLinks here. These are necessary to
            // achieve compliance with WCAG 2.0's guideline 2.4.1: "Bypass
            // Blocks". Compliance is required under some laws, such as the ADA
            // (Americans with Disabilities Act). For more details, see here:
            //
            // @URL: https://www.w3.org/TR/WCAG20-TECHS/G1.html
            {target: '#app-main', label: 'Skip to content'},
            {target: '#header-navigation', label: 'Skip to main navigation'},
            {target: '#app-footer', label: 'Skip to footer'},
        ]

        const appClassNames = classNames('t-app', `t-app--${routeProps.routeName}`)

        // The default title will show if no other title is provided to Helmet
        const defaultTitle = ('Preview' in window.Mobify)
            ? 'PREVIEWING – Merlin\'s Potions'
            : 'Merlin\'s Potions'

        // When a title is supplied to Helmet, the following template is used
        const siteTitleTemplate = ('Preview' in window.Mobify)
            ? `PREVIEWING – %s`
            : `%s`

        // While there are modals open, the rest of application is made hidden.
        // This way, keyboard and screen reader users cannot accidentally escape
        // the modal; users will remain "trapped", because these are modals,
        // after all.
        const hideModalBackground = Object.keys(openModals).length > 0

        const showOnlyOffline = fetchError && !hasFetchedCurrentPath

        const mainAppWrapperClasses = classNames({
            'u-flexbox u-flex u-direction-column': !showOnlyOffline,
            'u-display-none': showOnlyOffline
        })

        // We're cloning the container here so that we can inject this retryingConnection prop
        // This will allow us to reload the page to recover from offline mode
        const clonedChildren = React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child, {
                retryingConnection
            })
        })

        return (
            <Lockup locked={scrollManager.locked}>
                <ProxyIntlProvider>
                    <div
                        id="app"
                        className={appClassNames}
                        style={{display: hideApp ? 'none' : 'initial'}}
                    >
                        <Helmet
                            defaultTitle={defaultTitle}
                            titleTemplate={siteTitleTemplate}
                        />

                        <DangerousHTML html={sprite}>
                            {(htmlObj) => <div hidden dangerouslySetInnerHTML={htmlObj} />}
                        </DangerousHTML>

                        <div aria-hidden={hideModalBackground}>
                            <SkipLinks items={skipLinksItems} />

                            <div id="app-wrap" className="t-app__wrapper u-flexbox u-direction-column">
                                {isRunningInAstro && <NativeConnector />}

                                {isMessagingSupported() && <PushMessagingController dimScreenOnSystemAsk />}

                                <div id="app-header" className="u-flex-none" role="banner">
                                    <CurrentHeader headerHasSignIn={routeProps.headerHasSignIn} />
                                    {
                                        // Only display banner when we are offline and have content to show
                                        fetchError && hasFetchedCurrentPath && <OfflineBanner />
                                    }

                                    {notifications &&
                                        <NotificationManager
                                            notifications={notifications}
                                            actions={{removeNotification}}
                                        />
                                    }
                                </div>

                                <div className={mainAppWrapperClasses} >
                                    <main id="app-main" className="u-flex" role="main">
                                        {clonedChildren}
                                    </main>

                                    <div id="app-footer" className="u-flex-none">
                                        <CurrentFooter />
                                    </div>
                                </div>

                                {showOnlyOffline && <Offline location={children.props.location} route={routeProps} />}
                            </div>
                        </div>

                        <ModalManager />
                    </div>
                </ProxyIntlProvider>
            </Lockup>
        )
    }
}

App.propTypes = {
    children: PropTypes.element.isRequired,
    fetchError: PropTypes.string,
    fetchSvgSprite: PropTypes.func,
    hasFetchedCurrentPath: PropTypes.bool,
    hideApp: PropTypes.bool,
    /**
     * The react-router history object
     */
    history: PropTypes.object,
    /**
    * Calls a command in the integration manager that initializes some app data
    */
    initializeApp: PropTypes.func,
    /**
     * The Apps current locale
    */
    locale: PropTypes.string,
    messages: PropTypes.object,
    notifications: PropTypes.array,
    openModals: PropTypes.object,
    removeNotification: PropTypes.func,
    retryingConnection: PropTypes.bool,
    scrollManager: PropTypes.object,
    setInitialLocale: PropTypes.func,
    setStandAloneAppFlag: PropTypes.func,
    /**
     * The SVG icon sprite needed in order for all Icons to work
     */
    sprite: PropTypes.string,
    toggleHideApp: PropTypes.func
}

const mapStateToProps = createPropsSelector({
    notifications: getNotifications,
    fetchError: getPageFetchError,
    hasFetchedCurrentPath,
    locale: selectors.getLocale,
    openModals: getOpenModals,
    sprite: selectors.getSvgSprite,
    hideApp: selectors.getHideApp,
    scrollManager: selectors.getScrollManager,
    messages: selectors.getTranslations,
    retryingConnection: selectors.isRetryingConnection
})

const mapDispatchToProps = {
    removeNotification,
    fetchSvgSprite: appActions.fetchSvgSprite,
    toggleHideApp: appActions.toggleHideApp,
    initializeApp: appActions.initializeApp,
    setInitialLocale: appActions.setInitialLocale,
    setStandAloneAppFlag: appActions.checkIfStandAlone
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
