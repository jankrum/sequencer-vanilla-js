// Imports for the Paginator
import UrlMap from './url-map.js'
import Transporter from './transporter.js'

// Imports for the setlist
import helloWorld from '/charts/hello-world.js'
import bassScale from '/charts/bass-scale.js'
import twinkleTwinkleLittleStar from '/charts/twinkle-twinkle-little-star.js'

//#region Setlist
const setlist = [
    helloWorld,
    bassScale,
    twinkleTwinkleLittleStar,
]
const setlistLength = setlist.length
//#endregion

//#region Paginator
export default class Paginator {
    static pageUrlKey = 'page'
    static eventEnum = Object.freeze({
        chartChanged: 0,
    })

    #chartIndex = 0
    chartChangedSubscriptions = []

    // Subscribe to an event
    addEventListener(action, callback) {
        // Paginator only has one event to subscribe to
        // but we use an enum to conform to the API
        const { chartChanged } = Paginator.eventEnum

        switch (action) {
            case chartChanged:
                this.chartChangedSubscriptions.push(callback)
                break
            default:
                throw new Error(`Unsupported action ${action} in Paginator.addEventListener()`)
        }
    }

    set chartIndex(newIndex) {
        // Check if the new index is valid
        if (newIndex < 0 || newIndex >= setlistLength) {
            throw new Error(`chartIndex must be between 0 and ${setlistLength - 1}`)
        }

        // Calculate the new state
        this.#chartIndex = newIndex
        const canPrevious = newIndex > 0
        const canNext = newIndex < setlistLength - 1

        // Update the URL
        UrlMap.set(Paginator.pageUrlKey, newIndex)

        // Get the data for the subscribers
        const chart = setlist[newIndex]
        const chartTitle = chart.title

        // Notify all subscribers
        const { chartChangedSubscriptions } = this
        for (const callback of chartChangedSubscriptions) {
            callback({ chart, chartTitle, canPrevious, canNext })
        }
    }

    get chartIndex() {
        return this.#chartIndex
    }

    // Listen to the buttons on the Transporter
    listenTo(transporter) {
        const { previousClicked, nextClicked } = Transporter.eventEnum

        // Subscribe to the Transporter's previous button
        transporter.addEventListener(previousClicked, () => { this.chartIndex-- })

        transporter.addEventListener(nextClicked, () => { this.chartIndex++ })
    }

    // Start the Paginator, which will send events to the transporter and band
    start() {
        // Get the index from the URL
        const stringIndexFromUrl = UrlMap.get(Paginator.pageUrlKey)
        const indexFromUrl = parseInt(stringIndexFromUrl)

        // Use the index from the URL if it is a valid index number
        const isNotNumber = Number.isNaN(indexFromUrl)
        const isOutOfRange = indexFromUrl < 0 || indexFromUrl >= setlistLength
        this.chartIndex = isNotNumber || isOutOfRange ? 0 : indexFromUrl
    }
}
//#endregion