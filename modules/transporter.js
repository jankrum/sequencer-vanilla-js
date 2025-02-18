import { DuplexMidi } from './midi.js'
import Band from './band.js'
import dm from './dm.js'

function makeIntoDomTransporter(transporter) {
    const chartTitleHeading = dm('h2', { class: 'lcd' }, 'Da picture')

    function makeButton(icon) {
        return dm('button', { class: 'transporter-button' },
            dm('span', { class: 'material-icons' }, icon)
        )
    }

    const previousButton = makeButton('skip_previous')
    const playButton = makeButton('play_arrow')
    const pauseButton = makeButton('pause')
    const stopButton = makeButton('stop')
    const recordButton = makeButton('voicemail')
    const nextButton = makeButton('skip_next')

    transporter.connect = (paginator, band) => {
        previousButton.click = () => paginator.goPrevious()
        nextButton.click = () => paginator.goNext()

        playButton.click = () => band.play()
        pauseButton.click = () => band.pause()
        stopButton.click = () => band.stop()
        recordButton.click = () => band.record()
    }

    transporter.changeChart = (chartTitle, canPrevious, canNext) => {
        chartTitleHeading.value = chartTitle
        previousButton.disabled = !canPrevious
        nextButton.disabled = !canNext
    }

    transporter.changePlayback = (playbackState) => {
        playButton.disabled = playbackState === Band.states.playing
        pauseButton.disabled = playbackState !== Band.states.playing
        stopButton.disabled = playbackState === Band.states.stopped
    }

    transporter.setIsRecording = (isRecording) => {
        recordButton.disabled = isRecording
    }

    const buttons = [previousButton, playButton, pauseButton, stopButton, recordButton, nextButton]
    const buttonDiv = dm('div', {}, ...buttons)
    const div = dm('div', { id: 'transporter' }, chartTitleHeading, buttonDiv)

    transporter.render = () => div
}

function makeIntoMidiTransporter(transporter) {
    throw new Error('Midi transporter not implemented')
}

export default class Transporter extends DuplexMidi {
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

    connect() { }

    render() { }

    setChart() { }
}