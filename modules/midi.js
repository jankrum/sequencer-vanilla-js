import dm, { makeToggleBox } from './dm.js'

//#region MIDI Access
const midiAccess = await (async () => {
    try {
        return await navigator.requestMIDIAccess({ sysex: true })
    } catch {
        return null
    }
})()

const hasMidiAccess = midiAccess !== null
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Checkbox
class MidiCheckbox {
    // Properties
    isChecked = hasMidiAccess

    // Make it now so we can attach event listeners
    toggleBox = makeToggleBox(this.isChecked)

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
        const toggleBox = this.toggleBox
        toggleBox.checked = this.isChecked
        toggleBox.disabled = !hasMidiAccess

        toggleBox.addEventListener('change', () => {
            this.isChecked = toggleBox.checked
        })

        return dm('label', {},
            dm('b', {}, name),
            toggleBox
        )
    }

    getConfigValues() {
        return this.isChecked
    }

    addEventListenerToCheckboxChange(callback) {
        this.toggleBox.addEventListener('change', callback)
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Port
class MidiPort {
    // Provide a default blank name for all subclasses
    static blankName = 'No Devices Found';

    select = dm('select', {})

    constructor() {
        if (new.target === MidiPort) {
            throw new Error('MidiPort is an abstract class and cannot be instantiated directly.')
        }

        // Default properties
        this.portName = this.constructor.blankName
        this.port = null
    }

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

        const port = this.constructor.ports.find((port) => port.name === portName)

        if (!port) {
            throw new Error(`port ${portName} not found`)
        }

        this.portName = portName
        this.port = port
    }

    getConfigElement() {
        const Subclass = this.constructor // the subclass

        const select = this.select

        select.append(...Subclass.ports.map((port) =>
            dm(
                'option',
                {
                    value: port.name,
                    selected: port.name === this.portName,
                },
                port.name
            )
        ))

        // Disable selection if MIDI is not accessible
        select.disabled = !hasMidiAccess

        // Event handler to update values
        const updatePort = () => {
            this.portName = select.value ?? Subclass.blankName
            this.port = Subclass.ports.find((port) => port.name === this.portName) ?? null
        }

        // Listen for changes
        select.addEventListener('change', updatePort)

        // Initialize once
        updatePort()

        // Provide a label and return
        return dm('label', {}, this.getLabelText(), select)
    }

    // Used to label the select field; must be overridden in subclasses
    getLabelText() {
        throw new Error('getLabelText() must be implemented by subclass')
    }

    // A hook to return the relevant config values
    getConfigValues() {
        return this.portName
    }

    set disabled(value) {
        this.select.disabled = !hasMidiAccess || value
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Input Port
class InputMidiPort extends MidiPort {
    // Provide static ports for input
    static get ports() {
        const portArray = hasMidiAccess ? Array.from(midiAccess.inputs.values()) : []
        return portArray.length > 0 ? portArray : [{ name: this.blankName }]
    }

    // Customize the label for input
    getLabelText() {
        return 'Input: '
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Output Port
class OutputMidiPort extends MidiPort {
    // Provide static ports for output
    static get ports() {
        const portArray = hasMidiAccess ? Array.from(midiAccess.outputs.values()) : []
        return portArray.length > 0 ? portArray : [{ name: this.blankName }]
    }

    // Customize the label for output
    getLabelText() {
        return 'Output: '
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Channel
class OutputMidiChannel {
    // Properties
    channel = 1
    input = dm('input', { type: 'number', min: '1', max: '16', value: 1 })

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
        const input = this.input

        input.value = this.channel

        input.addEventListener('change', () => {
            this.channel = parseInt(input.value)
        })

        return dm('label', {},
            'Channel: ',
            input
        )
    }

    getConfigValues() {
        return this.channel
    }

    set disabled(value) {
        this.input.disabled = !hasMidiAccess || value
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region Simplex MIDI
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

        if (isMidi) {
            if (output === undefined) {
                throw new Error('output config is required')
            }

            if (typeof output !== 'object') {
                throw new Error('output config must be an object')
            }

            const { port, channel } = output

            const problems = []

            try {
                this.outputMidiPort.tryConfig(port)
            } catch (error) {
                problems.push(error.message)
            }

            try {
                this.outputMidiChannel.tryConfig(channel)
            } catch (error) {
                problems.push(error.message)
            }

            if (problems.length > 0) {
                throw new Error(problems.join('\n'))
            }
        }
    }

    getConfigElement(name) {
        const { midiCheckbox, midiCheckbox: { toggleBox: checkbox }, outputMidiPort, outputMidiChannel } = this

        const updateMidiDisabled = () => {
            const disabled = !checkbox.checked
            outputMidiPort.disabled = disabled
            outputMidiChannel.disabled = disabled
        }

        midiCheckbox.addEventListenerToCheckboxChange(updateMidiDisabled)

        updateMidiDisabled()

        return dm('div', { class: 'midi-config' },
            midiCheckbox.getConfigElement(name),
            dm('div', { class: 'wide' },
                outputMidiPort.getConfigElement(),
                outputMidiChannel.getConfigElement()
            )
        )
    }

    getConfigValues() {
        const isMidi = this.midiCheckbox.getConfigValues()

        return Object.assign({ isMidi }, isMidi ? {
            output: {
                port: this.outputMidiPort.getConfigValues(),
                channel: this.outputMidiChannel.getConfigValues()
            }
        } : {})
    }
}
//#endregion

//-----------------------------------------------------------------------------


//#region Duplex MIDI
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

        if (typeof config !== 'object') {
            throw new Error('duplexMidi config must be an object')
        }

        const { isMidi, ports } = config

        if (isMidi === undefined) {
            throw new Error('isMidi is required')
        }

        if (typeof isMidi !== 'boolean') {
            throw new Error('isMidi must be a boolean')
        }

        this.midiCheckbox.tryConfig(isMidi)

        if (isMidi) {
            if (ports === undefined) {
                throw new Error('ports config is required')
            }

            if (typeof ports !== 'object') {
                throw new Error('ports config must be an object')
            }

            const { input, output } = ports

            const problems = []

            if (input === undefined) {
                problems.push('input port is required')
            } else if (typeof input !== 'string') {
                problems.push('input port must be a string')
            } else {
                try {
                    this.inputMidiPort.tryConfig(ports.input)
                } catch (error) {
                    problems.push(error.message)
                }
            }

            if (output === undefined) {
                problems.push('output port is required')
            } else if (typeof output !== 'string') {
                problems.push('output port must be a string')
            } else {
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
    }

    getConfigElement(name) {
        const { midiCheckbox, midiCheckbox: { toggleBox: checkbox }, inputMidiPort, outputMidiPort } = this

        const updateMidiDisabled = () => {
            const disabled = !checkbox.checked
            inputMidiPort.disabled = disabled
            outputMidiPort.disabled = disabled
        }

        midiCheckbox.addEventListenerToCheckboxChange(updateMidiDisabled)

        updateMidiDisabled()

        return dm('div', { class: 'midi-config' },
            midiCheckbox.getConfigElement(name),
            dm('div', { class: 'wide' },
                inputMidiPort.getConfigElement(),
                outputMidiPort.getConfigElement()
            )
        )
    }

    getConfigValues() {
        const isMidi = this.midiCheckbox.getConfigValues()

        return Object.assign({ isMidi }, isMidi ? {
            ports: {
                input: this.inputMidiPort.getConfigValues(),
                output: this.outputMidiPort.getConfigValues()
            }
        } : {})
    }
}
//#endregion