import dm, { makeToggleBox } from './dm.js'

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

//#region MIDI Access
const MIDI_ACCESS = await (async () => {
    try {
        return await navigator.requestMIDIAccess({ sysex: true })
    } catch {
        return null
    }
})()

const HAS_MIDI_ACCESS = MIDI_ACCESS !== null
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Port
class MidiPort {
    static blankName = 'No Devices Found'

    static validateConfig(config, name, ports) {
        if (config === undefined) {
            throw new Error(`${name} config is required`)
        }

        if (typeof config !== 'string') {
            throw new Error(`${name} config must be a string`)
        }

        if (!HAS_MIDI_ACCESS) {
            throw new Error('MIDI not available')
        }

        const port = ports.find((port) => port.name === config)

        if (!port) {
            throw new Error(`${name} port ${config} not found`)
        }
    }

    static getConfig(config, icon, ports) {
        const select = dm('select', {},
            ...ports.map((port) => dm('option', { value: port.name, selected: port.name === config }, port.name))
        )

        return {
            elements: [dm('label', {}, dm('span', { class: 'material-icons' }, icon), select)],
            get values() {
                return select.value
            }
        }
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Input Port
class InputMidiPort extends MidiPort {
    static nameInConfig = 'input'

    static get ports() {
        const portArray = HAS_MIDI_ACCESS ? Array.from(MIDI_ACCESS.inputs.values()) : []
        return portArray.length > 0 ? portArray : [{ name: super.blankName }]
    }

    static validateConfig(config) {
        const { nameInConfig, ports } = InputMidiPort
        super.validateConfig(config, nameInConfig, ports)
    }

    static getConfig(config) {
        const { ports } = InputMidiPort
        return super.getConfig(config, 'login', ports)
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Output Port
class OutputMidiPort extends MidiPort {
    static nameInConfig = 'output'

    static get ports() {
        const portArray = HAS_MIDI_ACCESS ? Array.from(MIDI_ACCESS.outputs.values()) : []
        return portArray.length > 0 ? portArray : [{ name: super.blankName }]
    }

    static validateConfig(config) {
        const { nameInConfig, ports } = OutputMidiPort
        super.validateConfig(config, nameInConfig, ports)
    }

    static getConfig(config) {
        const { ports } = OutputMidiPort
        return super.getConfig(config, 'logout', ports)
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region MIDI Channel
class OutputMidiChannel {
    static validateConfig(config) {
        if (config === undefined) {
            throw new Error('output channel is required')
        }

        if (typeof config !== 'number') {
            throw new Error('output channel must be a number')
        }

        if (config < 1 || config > 16) {
            throw new Error('output channel must be between 1 and 16')
        }
    }

    static getConfig(config) {
        const input = dm('input', { type: 'number', min: '1', max: '16', value: config ?? 1 })

        return {
            elements: [dm('label', {}, 'Channel: ', input)],
            get values() {
                return parseInt(input.value)
            },
        }
    }
}
//#endregion

//-----------------------------------------------------------------------------

//#region Simplex MIDI
// An object that represents a simplex midi output connection that
// communicates with channel messages, so channel must be specified
export class SimplexMidi {
    static validateConfig(config, nameInConfig) {
        const configPortion = config[nameInConfig]

        if (configPortion === undefined) {
            throw new Error(`${nameInConfig} config is required`)
        }

        if (typeof configPortion !== 'object') {
            throw new Error(`${nameInConfig} config must be an object`)
        }

        const { isMidi, output } = configPortion

        if (isMidi === undefined) {
            throw new Error('isMidi is required')
        }

        if (typeof isMidi !== 'boolean') {
            throw new Error('isMidi must be a boolean')
        }

        if (isMidi) {
            if (output === undefined) {
                throw new Error('output config is required')
            }

            if (typeof output !== 'object') {
                throw new Error('output config must be an object')
            }

            const problems = []

            const { port, channel } = output

            if (port === undefined) {
                problems.push('output port is required')
            } else if (typeof port !== 'string') {
                problems.push('output port must be a string')
            } else {
                try {
                    OutputMidiPort.validateConfig(port)
                } catch (error) {
                    problems.push(error.message)
                }
            }

            if (channel === undefined) {
                problems.push('output channel is required')
            } else if (typeof channel !== 'number') {
                problems.push('output channel must be a number')
            } else if (channel < 1 || channel > 16) {
                problems.push('output channel must be between 1 and 16')
            }

            if (problems.length > 0) {
                throw new Error(problems.join('\n'))
            }
        }
    }

    static getConfig(config, nameInConfig) {
        const configPortion = config?.[nameInConfig] ?? { isMidi: false }

        const midiToggleBox = makeToggleBox(HAS_MIDI_ACCESS && configPortion.isMidi, !HAS_MIDI_ACCESS)
        const midiToggleLabel = dm('label', {}, dm('b', {}, capitalizeFirstLetter(nameInConfig)), midiToggleBox)
        const outputMidiPortConfig = OutputMidiPort.getConfig(configPortion.output)
        const outputMidiChannelConfig = OutputMidiChannel.getConfig(configPortion.output)

        midiToggleBox.addEventListener('change', () => {
            const disabled = !midiToggleBox.checked
            outputMidiPortConfig.disabled = disabled
            outputMidiChannelConfig.disabled = disabled
        })

        return {
            elements: [dm('div', { class: 'midi-config' },
                midiToggleLabel,
                dm('div', { class: 'wide' },
                    ...outputMidiPortConfig.elements,
                    ...outputMidiChannelConfig.elements,
                ),
            )],
            get values() {
                const isMidi = midiToggleBox.checked
                return {
                    [nameInConfig]: {
                        isMidi,
                        ...isMidi ? {
                            output: {
                                port: outputMidiPortConfig.values,
                                channel: outputMidiChannelConfig.values,
                            },
                        } : {},
                    },
                }
            },
        }
    }
}
//#endregion

//-----------------------------------------------------------------------------


//#region Duplex MIDI
// An object that represents a duplex midi connection that communicates
// with system messages, so channel does not have to be specified
export class DuplexMidi {
    static validateConfig(config, nameInConfig) {
        const configPortion = config[nameInConfig]

        if (configPortion === undefined) {
            throw new Error(`${nameInConfig} config is required`)
        }

        if (typeof configPortion !== 'object') {
            throw new Error(`${nameInConfig} config must be an object`)
        }

        const { isMidi, ports } = configPortion

        if (isMidi === undefined) {
            throw new Error('isMidi is required')
        }

        if (typeof isMidi !== 'boolean') {
            throw new Error('isMidi must be a boolean')
        }

        if (isMidi) {
            if (ports === undefined) {
                throw new Error('ports config is required')
            }

            if (typeof ports !== 'object') {
                throw new Error('ports config must be an object')
            }

            const problems = []

            const { input, output } = ports

            if (input === undefined) {
                problems.push('input port is required')
            } else if (typeof input !== 'string') {
                problems.push('input port must be a string')
            } else {
                try {
                    InputMidiPort.validateConfig(input)
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
                    OutputMidiPort.validateConfig(output)
                } catch (error) {
                    problems.push(error.message)
                }
            }

            if (problems.length > 0) {
                throw new Error(problems.join('\n'))
            }
        }
    }

    static getConfig(config, nameInConfig) {
        const configPortion = config?.[nameInConfig] ?? { isMidi: false }

        const midiToggleBox = makeToggleBox(HAS_MIDI_ACCESS && configPortion.isMidi, !HAS_MIDI_ACCESS)
        const midiToggleLabel = dm('label', {}, dm('b', {}, capitalizeFirstLetter(nameInConfig)), midiToggleBox)
        const inputMidiPortConfig = InputMidiPort.getConfig(config)
        const outputMidiPortConfig = OutputMidiPort.getConfig(config)

        midiToggleBox.addEventListener('change', () => {
            const disabled = !midiToggleBox.checked
            inputMidiPortConfig.disabled = disabled
            outputMidiPortConfig.disabled = disabled
        })

        return {
            elements: [dm('div', { class: 'midi-config' },
                midiToggleLabel,
                dm('div', { class: 'wide' },
                    ...inputMidiPortConfig.elements,
                    ...outputMidiPortConfig.elements,
                ),
            )],
            get values() {
                const isMidi = midiToggleBox.checked
                return {
                    [nameInConfig]: {
                        isMidi,
                        ...isMidi ? {
                            ports: {
                                input: inputMidiPortConfig.values,
                                output: outputMidiPortConfig.values,
                            },
                        } : {},
                    },
                }
            },
        }
    }
}
//#endregion