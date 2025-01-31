// // import { makeEnum } from './utility.js'

// // const TRANSPORTER_TYPES = ['DOM', 'MIDI']
// // export const TRANSPORTER_TYPE_ENUM = makeEnum(TRANSPORTER_TYPES)

// import { midiAccess } from "./utility"

// function getMidiPortProblems(portName, isInput) {
//     const problems = []

//     if (midiAccess === null) {
//         problems.push('MIDI not available')
//         return problems
//     }

//     if (!portName) {
//         problems.push('portName is required')
//         return problems
//     }

//     if (isInput === undefined) {
//         problems.push('isInput is required')
//         return problems
//     }

//     // Find the port in the inputs or outputs
//     const ports = Array.from(isInput ? midiAccess.inputs : midiAccess.outputs.values())
//     const port = ports.find(port => port.name === portName)

//     if (!port) {
//         problems.push(`port ${portName} not found`)
//     }

//     return problems
// }

// function getDuplexMidiProblems(config) {
//     const problems = []

//     if (!config) {
//         problems.push('duplexMidi config is required')
//         return problems
//     }

//     const { input, output } = config

//     if (!input) {
//         problems.push('input is required')
//     }

//     if (!output) {
//         problems.push('output is required')
//     }

//     if (input === output) {
//         problems.push('input and output must be different')
//     }

//     if (problems.length === 0) {
//         problems.push(...getMidiPortProblems(input, true))
//         problems.push(...getMidiPortProblems(output, false))
//     }

//     return problems
// }

import { DuplexMidi } from "./midi-utilities"

export default class Transporter {
    isMidi = false
    duplexMidi = new DuplexMidi()

    tryConfig(config) {
        if (!config) {
            throw new Error('config is required')
        }

        const { isMidi, ports } = config

        if (isMidi === undefined) {
            throw new Error('isMidi is required')
        }

        if (isMidi) {
            try {
                this.duplexMidi.tryConfig(ports)
            } catch (e) {
                throw new Error(`duplexMidi: ${e.message}`)
            }
        }
    }
}