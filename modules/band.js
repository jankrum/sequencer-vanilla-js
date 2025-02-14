import Controller from './controller.js'
import Synthesizer from './synthesizer.js'
import dm from './dm.js'
import timesDo from './times-do.js'

//#region Part
class Part {
    controller = new Controller()
    synthesizer = new Synthesizer()

    tryConfig(config) {
        if (!config) {
            throw new Error('part config is required')
        }

        if (typeof config !== 'object') {
            throw new Error('part config must be an object')
        }

        const problems = []

        const { controller, synthesizer } = config

        if (controller === undefined) {
            problems.push('controller is required')
        } else if (typeof controller !== 'object') {
            problems.push('controller must be an object')
        } else {
            try {
                this.controller.tryConfig(controller)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (synthesizer === undefined) {
            problems.push('synthesizer is required')
        } else if (typeof synthesizer !== 'object') {
            problems.push('synthesizer must be an object')
        } else {
            try {
                this.synthesizer.tryConfig(synthesizer)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }

    getConfigElement(name) {
        return dm('fieldset', {},
            dm('legend', {}, name.toUpperCase()),
            this.controller.getConfigElement(name),
            dm('hr'),
            this.synthesizer.getConfigElement()
        )
    }

    getConfigValues() {
        return {
            controller: this.controller.getConfigValues(),
            synthesizer: this.synthesizer.getConfigValues()
        }
    }
}
//#endregion

//#region Helper
const HELPER = {
    EVENT: Object.freeze({
        NOTE_ON: 144,
        NOTE_OFF: 128,
    }),
    TIMING: Object.freeze({
        convertBeatsToMs(beats, tempo) {
            return beats * 60000 / tempo
        },
        shorten(durationMs) {
            return Math.max(durationMs - 0.1, durationMs * 0.9)
        }
    }),
    midiNoteToPitch(midiNote) {
        if (midiNote < 0 || midiNote > 127) {
            throw new Error('Out of bound MIDI note value')
        }

        const noteNames = [
            ['C', 'B#'],
            ['C#', 'Db'],
            ['D'],
            ['D#', 'Eb'],
            ['E', 'Fb'],
            ['F', 'E#'],
            ['F#', 'Gb'],
            ['G'],
            ['G#', 'Ab'],
            ['A'],
            ['A#', 'Bb'],
            ['B', 'Cb'],
        ]

        const octave = Math.floor(midiNote / 12) - 1
        const noteIndex = midiNote % 12

        // Get possible enharmonic equivalents
        const possibleNotes = noteNames[noteIndex].map(noteName => {
            // Adjust octave calculation for notes like B#
            if (noteName === 'B#' && noteIndex === 0) {
                return `${noteName}${octave - 1}`
            } else {
                return `${noteName}${octave}`
            }
        })

        return possibleNotes
    },
    PITCH: Object.freeze(Object.fromEntries([...timesDo(128, noteNumber => {
        if (noteNumber < 0 || noteNumber > 127) {
            throw new Error('Out of bound MIDI note value')
        }

        const noteNames = [
            ['C', 'B#'],
            ['C#', 'Db'],
            ['D'],
            ['D#', 'Eb'],
            ['E', 'Fb'],
            ['F', 'E#'],
            ['F#', 'Gb'],
            ['G'],
            ['G#', 'Ab'],
            ['A'],
            ['A#', 'Bb'],
            ['B', 'Cb'],
        ]

        const noteIndex = noteNumber % 12
        const octave = Math.floor(noteNumber / 12) - 1

        // Get possible enharmonic equivalents
        const possibleNotes = noteNames[noteIndex].map(noteName => {
            // Adjust octave calculation for notes like B#
            if (noteName === 'B#' && noteIndex === 0) {
                return `${noteName}${octave - 1}`
            } else {
                return `${noteName}${octave}`
            }
        })

        return possibleNotes.map(n => [n, noteNumber])
    })].flat())),
    DYNAMICS: Object.freeze({
        PPPP: 8,
        PPP: 16,
        PP: 32,
        P: 48,
        MP: 64,
        MF: 80,
        F: 96,
        FF: 112,
        FFF: 120,
        FFFF: 127,
    }),
}
//#endregion

//#region Band
export default class Band {
    static partNames = ['bass', 'drum', 'keys', 'lead']
    parts = Object.fromEntries(Band.partNames.map(name => [name, new Part()]))

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

    getConfigElements() {
        return Band.partNames.map(name => this.parts[name].getConfigElement(name))
    }

    getConfigValues() {
        return Object.fromEntries(Band.partNames.map(name => [name, this.parts[name].getConfigValues()]))
    }

    connect() { }

    render() { }

    setChart(chart) { }
}
//#endregion