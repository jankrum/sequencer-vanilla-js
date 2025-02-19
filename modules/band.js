import Paginator from './paginator.js'
import Transporter from './transporter.js'
import Part from './part.js'

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
        playbackChanged: 0,
        isRecordingChanged: 1,
    })

    // The parts of the band
    parts = Object.fromEntries(Band.partNames.map(name => [name, new Part()]))

    // Playback state
    #state = Band.states.paused
    playbackChangedSubscription = () => { }

    // Recording state
    #isRecording = true
    isRecordingChangedSubscription = () => { }

    schedulerTimeout = 0
    chartSource = ''
    load = () => { }
    eventGenerator = function* () { }
    startTime = 0
    durationIntoSong = 0
    nextEvent = null

    // Tries to use config, throws an error if it can't
    tryConfig(config) {
        if (!config) {
            throw new Error('band config is required')
        }

        if (typeof config !== 'object') {
            throw new Error('band config must be an object')
        }

        const problems = []

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

                // Try to configure the part with the part in the config
                this.parts[partName].tryConfig(partInConfig)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }

    // Get the config elements for the band
    getConfigElements() {
        return Band.partNames.map(name => this.parts[name].getConfigElement(name))
    }

    // Get the config values for the band
    getConfigValues() {
        return Object.fromEntries(Band.partNames.map(name => [name, this.parts[name].getConfigValues()]))
    }

    // Subscribe to an event
    addEventListener(action, callback) {
        const { playbackChanged, isRecordingChanged } = Band.eventEnum

        // We use a single value to store the subscription because there will only be one subscriber per event
        switch (action) {
            case playbackChanged:
                this.playbackChangedSubscription = callback
                break
            case isRecordingChanged:
                this.isRecordingChangedSubscription = callback
                break
            default:
                throw new Error(`Unsupported action ${action} in Band.addEventListener()`)
        }
    }

    play() { }

    pause() { }

    resume() { }

    stop() { }

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

        // Notify the subscriber to the event
        this.playbackChangedSubscription({ playbackState: this.#state })
    }

    // Toggles the recording state and notifies the subscriber
    toggleIsRecording() {
        this.isRecordingChangedSubscription({
            isRecording: this.#isRecording = !this.#isRecording,
        })
    }

    // Subscribe to events from the paginator and transporter
    listenTo(paginator, transporter) {
        // Subscribe to the Paginator's chartChanged event
        const { chartChanged } = Paginator.eventEnum

        paginator.addEventListener(chartChanged, ({ chart }) => this.changeChart(chart))

        // Subscribe to the Transporter's play, pause, stop and record buttons
        const { playClicked, pauseClicked, stopClicked, recordClicked } = Transporter.eventEnum
        const { playing, paused, stopped } = Band.states

        transporter.addEventListener(playClicked, () => this.state = playing)
        transporter.addEventListener(pauseClicked, () => this.state = paused)
        transporter.addEventListener(stopClicked, () => this.state = stopped)
        transporter.addEventListener(recordClicked, () => this.toggleIsRecording())
    }

    render() { }
}
//#endregion