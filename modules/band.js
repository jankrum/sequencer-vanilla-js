import Paginator from './paginator.js'
import Transporter from './transporter.js'
import Part from './part.js'
import dm, { makeToggleBox } from './dm.js'

//#region Band
export default class Band {
    static partNames = ['bass', 'drum', 'keys', 'lead']

    // Playback states
    static states = Object.freeze({
        playing: 0,
        paused: 1,
        stopped: 2,
    })

    // Event types
    static eventEnum = Object.freeze({
        play: 0,
        pause: 1,
        stop: 2,
    })

    static validateConfig(config) {
        const { record, showSource } = config

        const problems = []

        if (record === undefined) {
            problems.push('record config is required')
        } else if (typeof record !== 'boolean') {
            problems.push('record config must be a boolean')
        }

        if (showSource === undefined) {
            problems.push('showSource config is required')
        } else if (typeof showSource !== 'boolean') {
            problems.push('showSource config must be a boolean')
        }

        for (const partName of Band.partNames) {
            try {
                // The part for this name in the config
                const partInConfig = config[partName]

                // If the part is not in the config, throw an error
                if (!partInConfig) {
                    throw new Error(`${partName} config is required`)
                }

                if (typeof partInConfig !== 'object') {
                    throw new Error(`${partName} config must be an object`)
                }

                Part.validateConfig(partInConfig)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }

    // Get the config elements for the band
    static getConfig(config) {
        const partConfigs = Object.fromEntries(Band.partNames.map(name => [name, Part.getConfig(config?.[name], name)]))

        const recordToggleBox = makeToggleBox(config?.record ?? true)
        const recordLabel = dm('label', {}, 'Record Performances', recordToggleBox)
        const showSourceToggleBox = makeToggleBox(config?.showSource ?? true)
        const showSourceLabel = dm('label', {}, 'Show Source', showSourceToggleBox)

        return {
            elements: [
                ...Object.values(partConfigs).map(({ elements }) => elements).flat(),
                dm('div', { class: 'wide' },
                    recordLabel,
                    showSourceLabel,
                ),
            ],
            get values() {
                return {
                    ...Object.fromEntries(Object.entries(partConfigs).map(([name, ele]) => [name, ele.values])),
                    record: recordToggleBox.checked,
                    showSource: showSourceToggleBox.checked,
                }
            }
        }
    }

    // The parts of the band
    parts = {}

    // Playback state
    #state = Band.states.paused
    playSubscription = () => { }
    pauseSubscription = () => { }
    stopSubscription = () => { }

    schedulerTimeout = 0
    chartSource = ''
    load = () => { }
    eventGenerator = function* () { }
    startTime = 0
    durationIntoSong = 0
    nextEvent = null

    constructor(config) {
        const { record, showSource } = config

        this.record = record
        this.showSource = showSource

        for (const partName of Band.partNames) {
            this.parts[partName] = new Part(config[partName], partName)
        }
    }

    // Subscribe to an event
    addEventListener(action, callback) {
        const { play, pause, stop } = Band.eventEnum

        // We use a single value to store the subscription because there will only be one subscriber per event
        switch (action) {
            case play:
                this.playSubscription = callback
                break
            case pause:
                this.pauseSubscription = callback
                break
            case stop:
                this.stopSubscription = callback
                break
            default:
                throw new Error(`Unsupported action ${action} in Band.addEventListener()`)
        }
    }

    play() {
        this.playSubscription()
    }

    pause() {
        this.pauseSubscription()
    }

    resume() {
        this.playSubscription()
    }

    stop() {
        this.stopSubscription()
    }

    changeChart(chart) {
        this.state = Band.states.stopped

        const load = this.load = () => {
            // for (const { controller } of Object.values(this.parts)) {
            //     controller.clear()
            // }
        }

        load()
    }

    // Playback state
    get state() {
        return this.#state
    }

    set state(newValue) {
        const { playing, paused, stopped } = Band.states

        // Finite state machine for state changes
        switch (this.#state) {
            case playing:
                switch (newValue) {
                    case paused:
                        // If we are currently playing and want to pause
                        this.pause()
                        this.#state = paused
                        break
                    case stopped:
                        // If we are currently playing and want to stop
                        this.stop()
                        this.#state = stopped
                        break
                    default:
                        throw new Error(`Unsupported state ${newValue} in Band.state = ${this.#state}`)
                }
                break
            case paused:
                switch (newValue) {
                    case playing:
                        // If we are currently paused and want to play
                        this.resume()
                        this.#state = playing
                        break
                    case stopped:
                        // If we are currently paused and want to stop
                        this.stop()
                        this.#state = stopped
                        break
                    default:
                        throw new Error(`Unsupported state ${newValue} in Band.state = ${this.#state}`)
                }
                break
            case stopped:
                switch (newValue) {
                    case playing:
                        // If we are currently stopped and want to play
                        this.play()
                        this.#state = playing
                        break
                    case stopped:
                        // If we are currently stopped and want to stop
                        // Do nothing
                        break
                    default:
                        throw new Error(`Unsupported Band.state ${newValue}`)
                }
                break
            default:
                throw new Error(`Unsupported state ${this.#state} in Band.state`)
        }
    }

    // Subscribe to events from the paginator and transporter
    listenTo(paginator, transporter) {
        // Subscribe to the Paginator's chartChanged event
        paginator.addEventListener(Paginator.eventEnum.chartChanged, ({ chart }) => this.changeChart(chart))

        // Subscribe to the Transporter's play, pause, stop and record buttons
        const { playClicked, pauseClicked, stopClicked } = Transporter.eventEnum
        const { playing, paused, stopped } = Band.states

        transporter.addEventListener(playClicked, () => this.state = playing)
        transporter.addEventListener(pauseClicked, () => this.state = paused)
        transporter.addEventListener(stopClicked, () => this.state = stopped)
    }

    getElements() {
        return []
    }
}
//#endregion