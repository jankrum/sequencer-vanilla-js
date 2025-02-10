import { dm } from './utility.js'

const midiAccess = await (async () => {
    try {
        return await navigator.requestMIDIAccess({ sysex: true })
    } catch {
        return null
    }
})()

const hasMidiAccess = midiAccess !== null

class MidiCheckbox {
    // Properties
    isChecked = true

    tryConfig(isMidi) {
        if (isMidi === undefined) {
            throw new Error('isMidi is required')
        }

        if (typeof isMidi !== 'boolean') {
            throw new Error('isMidi must be a boolean')
        }

        if (isMidi && !hasMidiAccess) {
            throw new Error('MIDI not available')
        }

        this.isChecked = isMidi
    }

    getConfigElement(name) {
        const checkbox = dm('input', { type: 'checkbox' })
        checkbox.disabled = !hasMidiAccess
        checkbox.checked = hasMidiAccess && this.isChecked

        checkbox.addEventListener('change', () => {
            this.isChecked = checkbox.checked
        })

        return dm('label', { class: 'wide' },
            dm('b', {}, name),
            checkbox
        )
    }

    getConfigValues() {
        return this.isChecked
    }
}

class MidiPort {
    getFromMap(map, portName) {
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
    // Class variables
    static blankName = 'No Devices Found'
    static ports = hasMidiAccess ? Array.from(midiAccess.inputs.values()) : [{ name: InputMidiPort.blankName }]

    // Properties
    portName = InputMidiPort.blankName
    port = null

    tryConfig(portName) {
        if (portName === undefined) {
            throw new Error('portName is required')
        }

        if (typeof portName !== 'string') {
            throw new Error('portName must be a string')
        }

        if (!hasMidiAccess) {
            throw new Error('MIDI not available')
        }

        const port = InputMidiPort.ports.find(port => port.name === portName)

        if (!port) {
            throw new Error(`port ${portName} not found`)
        }

        this.portName = portName
        this.port = port
    }

    getConfigElement() {
        const select = dm('select', {},
            ...InputMidiPort.ports.map(port => dm('option', { value: port.name, selected: port.name === this.portName }, port.name))
        )

        select.disabled = !hasMidiAccess

        const updatePort = () => {
            this.portName = select.value ?? InputMidiPort.blankName
            this.port = InputMidiPort.ports.find(port => port.name === this.portName) ?? null
        }

        select.addEventListener('change', updatePort)

        updatePort()

        return dm('label', {},
            'Input: ',
            select
        )
    }

    getConfigValues() {
        return this.portName
    }
}

class OutputMidiPort {
    // Class variables
    static blankName = 'No Devices Found'
    static ports = hasMidiAccess ? Array.from(midiAccess.outputs.values()) : [{ name: OutputMidiPort.blankName }]

    // Properties
    portName = OutputMidiPort.blankName
    port = null

    tryConfig(portName) {
        if (portName === undefined) {
            throw new Error('portName is required')
        }

        if (typeof portName !== 'string') {
            throw new Error('portName must be a string')
        }

        if (!hasMidiAccess) {
            throw new Error('MIDI not available')
        }

        const port = OutputMidiPort.ports.find(port => port.name === portName)

        if (!port) {
            throw new Error(`port ${portName} not found`)
        }

        this.portName = portName
        this.port = port
    }

    getConfigElement() {
        const select = dm('select', {},
            ...OutputMidiPort.ports.map(port => dm('option', { value: port.name, selected: port.name === this.portName }, port.name))
        )

        select.disabled = !hasMidiAccess

        const updatePort = () => {
            this.portName = select.value ?? OutputMidiPort.blankName
            this.port = OutputMidiPort.ports.find(port => port.name === this.portName) ?? null
        }

        select.addEventListener('change', updatePort)

        updatePort()

        return dm('label', {},
            'Output: ',
            select
        )
    }

    getConfigValues() {
        return this.portName
    }
}

class OutputMidiChannel {
    // Properties
    channel = 1

    tryConfig(channel) {
        if (channel === undefined) {
            throw new Error('channel is required')
        }

        if (typeof channel !== 'number') {
            throw new Error('channel must be a number')
        }

        if (channel < 1 || channel > 16) {
            throw new Error('channel must be between 1 and 16')
        }

        this.channel = channel
    }

    getConfigElement() {
        const input = dm('input', { type: 'number', min: '1', max: '16', value: this.channel })

        input.addEventListener('change', () => {
            this.channel = input.value
        })

        return dm('label', {},
            'Channel: ',
            input
        )
    }

    getConfigValues() {
        return this.channel
    }
}

// An object that represents a simplex midi output connection that
// communicates with channel messages, so channel must be specified
export class SimplexMidi {
    // Child objects
    midiCheckbox = new MidiCheckbox()
    outputMidiPort = new OutputMidiPort()
    outputMidiChannel = new OutputMidiChannel()

    tryConfig(config) {
        if (!config) {
            throw new Error('simplexMidi config is required')
        }

        if (typeof config !== 'object') {
            throw new Error('simplexMidi config must be an object')
        }

        const { isMidi, output } = config

        if (isMidi === undefined) {
            throw new Error('isMidi is required')
        }

        if (typeof isMidi !== 'boolean') {
            throw new Error('isMidi must be a boolean')
        }

        this.midiCheckbox.tryConfig(isMidi)

        const problems = []

        if (isMidi) {
            try {
                this.outputMidiPort.tryConfig(output.port)
            } catch (error) {
                problems.push(error.message)
            }

            try {
                this.outputMidiChannel.tryConfig(output.channel)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }

    getConfigElement(name) {
        return dm('div', { class: 'midi-config' },
            this.midiCheckbox.getConfigElement(name),
            dm('div', { class: 'wide' },
                this.outputMidiPort.getConfigElement(),
                this.outputMidiChannel.getConfigElement()
            )
        )
    }

    getConfigValues() {
        return {
            isMidi: this.midiCheckbox.getConfigValues(),
            output: {
                port: this.outputMidiPort.getConfigValues(),
                channel: this.outputMidiChannel.getConfigValues()
            }
        }
    }
}

// An object that represents a duplex midi connection that communicates
// with system messages, so channel does not have to be specified
export class DuplexMidi {
    // Child objects
    midiCheckbox = new MidiCheckbox()
    inputMidiPort = new InputMidiPort()
    outputMidiPort = new OutputMidiPort()

    tryConfig(config) {
        if (!config) {
            throw new Error('duplexMidi config is required')
        }

        const { isMidi, ports } = config

        if (isMidi === undefined) {
            throw new Error('isMidi is required')
        }

        if (typeof isMidi !== 'boolean') {
            throw new Error('isMidi must be a boolean')
        }

        this.midiCheckbox.tryConfig(isMidi)

        const problems = []

        if (isMidi) {
            try {
                this.inputMidiPort.tryConfig(ports.input)
            } catch (error) {
                problems.push(error.message)
            }

            try {
                this.outputMidiPort.tryConfig(ports.output)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }

    getConfigElement(name) {
        return dm('div', { class: 'midi-config' },
            this.midiCheckbox.getConfigElement(name),
            dm('div', { class: 'wide' },
                this.inputMidiPort.getConfigElement(),
                this.outputMidiPort.getConfigElement()
            )
        )
    }

    getConfigValues() {
        return {
            isMidi: this.midiCheckbox.getConfigValues(),
            ports: {
                input: this.inputMidiPort.getConfigValues(),
                output: this.outputMidiPort.getConfigValues()
            }
        }
    }
}