import { DuplexMidi } from './midi.js'
import Paginator from './paginator.js'
import Band from './band.js'
import dm from './dm.js'

//#region DOM Transporter
class DomTransporter {
    static makeButton(icon) {
        return dm('button', { class: 'transporter-button' },
            dm('span', { class: 'material-icons' }, icon)
        )
    }

    static buttonNamesAndIcons = [
        ['previous', 'skip_previous'],
        ['play', 'play_arrow'],
        ['pause', 'pause'],
        ['stop', 'stop'],
        ['next', 'skip_next'],
    ]

    chartTitleHeading = dm('h2', { class: 'lcd' })
    buttons = Object.fromEntries(DomTransporter.buttonNamesAndIcons.map(([name, icon]) => [name, DomTransporter.makeButton(icon)]))

    addEventListener(action, callback) {
        const { previousClicked, playClicked, pauseClicked, stopClicked, nextClicked } = Transporter.eventEnum
        const { buttons } = this
        const eventName = 'mousedown'

        switch (action) {
            case previousClicked:
                buttons.previous.addEventListener(eventName, callback)
                break
            case playClicked:
                buttons.play.addEventListener(eventName, callback)
                break
            case pauseClicked:
                buttons.pause.addEventListener(eventName, callback)
                break
            case stopClicked:
                buttons.stop.addEventListener(eventName, callback)
                break
            case nextClicked:
                buttons.next.addEventListener(eventName, callback)
                break
            default:
                throw new Error(`Unsupported action ${action} in Transporter.addEventListener()`)
        }
    }

    listenTo(paginator, band) {
        const { buttons } = this

        paginator.addEventListener(Paginator.eventEnum.chartChanged, ({ chartTitle, canPrevious, canNext }) => {
            this.chartTitleHeading.innerText = chartTitle
            buttons.previous.disabled = !canPrevious
            buttons.next.disabled = !canNext
        })

        band.addEventListener(Band.eventEnum.play, () => {
            buttons.play.disabled = true
            buttons.pause.disabled = false
            buttons.stop.disabled = false
        })

        band.addEventListener(Band.eventEnum.pause, () => {
            buttons.play.disabled = false
            buttons.pause.disabled = true
            buttons.stop.disabled = false
        })

        band.addEventListener(Band.eventEnum.stop, () => {
            buttons.play.disabled = false
            buttons.pause.disabled = true
            buttons.stop.disabled = true
        })
    }

    getElements() {
        return [dm('div', { id: 'transporter' },
            this.chartTitleHeading,
            dm('div', {},
                ...Object.values(this.buttons),
            ),
        ),]
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Transporter
// function makeIntoMidiTransporter(transporter) {
//     throw new Error('MIDI transporter not implemented')
// }
//#endregion

//-----------------------------------------------------------------------------

//#region Transporter
export default class Transporter {
    static eventEnum = Object.freeze({
        previousClicked: 0,
        playClicked: 1,
        pauseClicked: 2,
        stopClicked: 3,
        nextClicked: 4,
    })

    static nameInConfig = 'transporter'

    static validateConfig(config) {
        DuplexMidi.validateConfig(config, Transporter.nameInConfig)
    }

    static getConfig(config) {
        return DuplexMidi.getConfig(config, Transporter.nameInConfig)
    }

    static build(config) {
        if (config.transporter.isMidi === false) {
            return new DomTransporter()
        } else {
            throw new Error('MIDI transporter not implemented')
        }
    }
}
//#endregion