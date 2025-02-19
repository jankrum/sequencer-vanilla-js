import { DuplexMidi } from './midi.js'
import Paginator from './paginator.js'
import Band from './band.js'
import dm, { makeToggleBox } from './dm.js'

//#region DOM Transporter
function makeIntoDomTransporter(transporter) {
    // The DOM elements
    const chartTitleHeading = dm('h2', { class: 'lcd' })

    function makeButton(icon) {
        return dm('button', { class: 'transporter-button' },
            dm('span', { class: 'material-icons' }, icon)
        )
    }

    const previousButton = makeButton('skip_previous')
    const playButton = makeButton('play_arrow')
    const pauseButton = makeButton('pause')
    const stopButton = makeButton('stop')
    const recordSpan = dm('span', { class: 'material-icons' }, 'voicemail')
    const recordBox = makeToggleBox(true, true)
    const recordLabel = dm('label', { class: 'transporter-button' }, recordSpan, recordBox)
    const nextButton = makeButton('skip_next')

    // The transporter methods
    const { previousClicked, playClicked, pauseClicked, stopClicked, recordClicked, nextClicked } = Transporter.eventEnum
    transporter.addEventListener = (action, callback) => {
        const buttonEventName = 'mousedown'
        switch (action) {
            case previousClicked:
                previousButton.addEventListener(buttonEventName, callback)
                break
            case playClicked:
                playButton.addEventListener(buttonEventName, callback)
                break
            case pauseClicked:
                pauseButton.addEventListener(buttonEventName, callback)
                break
            case stopClicked:
                stopButton.addEventListener(buttonEventName, callback)
                break
            case recordClicked:
                recordLabel.addEventListener(buttonEventName, callback)
                break
            case nextClicked:
                nextButton.addEventListener(buttonEventName, callback)
                break
            default:
                throw new Error(`Unsupported action ${action} in Transporter.addEventListener()`)
        }
    }

    transporter.listenTo = (paginator, band) => {
        // Subscribe to paginator changing charts
        paginator.addEventListener(Paginator.eventEnum.chartChanged, ({ chartTitle, canPrevious, canNext }) => {
            chartTitleHeading.innerText = chartTitle
            previousButton.disabled = !canPrevious
            nextButton.disabled = !canNext
        })

        // Subscribe to band changing playback state
        band.addEventListener(Band.eventEnum.playbackChanged, ({ playbackState }) => {
            playButton.disabled = playbackState === Band.states.playing
            pauseButton.disabled = playbackState !== Band.states.playing
            stopButton.disabled = playbackState === Band.states.stopped
        })

        // Subscribe to band changing recording state
        band.addEventListener(Band.eventEnum.isRecordingChanged, ({ isRecording }) => {
            recordBox.checked = isRecording
        })
    }

    // Render the DOM
    transporter.render = () => dm('div', { id: 'transporter' },
        chartTitleHeading,
        dm('div', {},
            previousButton,
            playButton,
            pauseButton,
            stopButton,
            recordLabel,
            nextButton,
        ),
    )
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Transporter
function makeIntoMidiTransporter(transporter) {
    throw new Error('MIDI transporter not implemented')
}
//#endregion

//-----------------------------------------------------------------------------

//#region Transporter
export default class Transporter extends DuplexMidi {
    static eventEnum = Object.freeze({
        previousClicked: 0,
        playClicked: 1,
        pauseClicked: 2,
        stopClicked: 3,
        recordClicked: 4,
        nextClicked: 5,
    })

    constructor() {
        super()
    }

    tryConfig(config) {
        if (!config) {
            throw new Error('Transporter config is required')
        }

        if (typeof config !== 'object') {
            throw new Error('Transporter config must be an object')
        }

        const { isMidi } = config

        if (isMidi === undefined) {
            throw new Error('Transporter config is missing isMidi')
        }

        if (typeof isMidi !== 'boolean') {
            throw new Error('Transporter config isMidi must be a boolean')
        }

        if (!isMidi) {
            makeIntoDomTransporter(this)
        } else {
            super.tryConfig(config)
            makeIntoMidiTransporter(this)
        }
    }

    getConfigElement() {
        return super.getConfigElement('TRANSPORTER')
    }

    addEventListener(action, callback) {
        throw new Error('Cannot call addEventListener() on abstract Transporter')
    }

    listenTo() {
        throw new Error('Cannot call listenTo() on abstract Transporter')
    }

    render() {
        throw new Error('Cannot call render() on abstract Transporter')
    }
}
//#endregion