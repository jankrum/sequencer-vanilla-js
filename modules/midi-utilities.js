const midiAccess = await (async () => {
    try {
        return await navigator.requestMIDIAccess({ sysex: true })
    } catch {
        return null
    }
})()

class MidiPort {
    static getFromMap(map, portName) {
        if (midiAccess === null) {
            throw new Error('MIDI not available')
        }

        const valuesArray = Array.from(map.values())
        const port = valuesArray.find(port => port.name === portName)

        if (!port) {
            throw new Error(`port ${portName} not found`)
        }

        return port
    }

    static refresh
}

class InputMidiPort {
    static getProblems(portName) {
        const problems = []

        if (midiAccess === null) {
            problems.push('MIDI not available')
            return problems
        }

        if (!portName) {
            problems.push('portName is required')
            return problems
        }



        return problems
    }
}

class OutputMidiPort { }

export class SimplexMidi { }

export class DuplexMidi {
    static getProblems(config) {
        const problems = []

        if (!config) {
            problems.push('config is required')
            return problems
        }

        const { input, output } = config

        if (!input) {
            problems.push('input is required')
        }

        if (!output) {
            problems.push('output is required')
        }

        if (input === output) {
            problems.push('input and output must be different')
        }

        if (problems.length === 0) {
            problems.push(...InputMidiPort.getProblems(input))
            problems.push(...InputMidiPort.getProblems(output))
        }

        return problems
    }
}