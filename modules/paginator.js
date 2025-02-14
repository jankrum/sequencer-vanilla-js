import UrlMap from './url-map.js'
import helloWorld from '/charts/hello-world.js'
import bassScale from '/charts/bass-scale.js'

//#region Setlist
const setlist = [
    helloWorld,
    bassScale,
]
const setlistLength = setlist.length
//#endregion

export default class Paginator {
    static pageUrlKey = 'page'

    chartIndex = 0
    subscription = () => { }

    get canPrevious() {
        return this.chartIndex > 0
    }

    get canNext() {
        return this.chartIndex < setlistLength - 1
    }

    goPrevious() {
        if (this.canPrevious) {
            this.chartIndex--
            this.subscription()
        }
    }

    goNext() {
        if (this.canNext) {
            this.chartIndex++
            this.subscription()
        }
    }

    connect(transporter, band) {
        this.subscription = () => {
            const { chartIndex, canPrevious, canNext } = this

            const chart = setlist[chartIndex]
            const chartTitle = chart.title

            transporter.setChart(chartTitle, canPrevious, canNext)
            band.setChart(chart)

            UrlMap.set(Paginator.pageUrlKey, chartIndex)
        }
    }

    start() {
        this.chartIndex = parseInt(UrlMap.get(Paginator.pageUrlKey) || 0)

        this.subscription()
    }
}