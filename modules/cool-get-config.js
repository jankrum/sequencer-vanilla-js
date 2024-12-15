import { dm, midiAccess } from './utility.js'

// Class for creating MIDI port selects
class MIDIPortSelect {
    constructor(labelText, id, ports) {
        this.labelText = labelText
        this.id = id
        this.ports = ports
    }

    render() {
        return dm(
            'label',
            {},
            `${this.labelText}: `,
            dm(
                'select',
                { id: this.id },
                ...this.generateOptions()
            )
        )
    }

    generateOptions() {
        if (this.ports.length === 0) {
            return [dm('option', { value: '' }, 'No MIDI ports available')]
        }
        return this.ports.map(port => dm('option', { value: port.id }, port.name))
    }
}

// Class for Transporter configuration
class TransporterConfig {
    constructor(midiPorts) {
        this.midiPorts = midiPorts
    }

    render() {
        return dm(
            'fieldset',
            {},
            dm('legend', {}, 'Transporter Configuration'),
            dm(
                'label',
                {},
                'Transporter Type: ',
                dm(
                    'select',
                    { id: 'transporterType' },
                    dm('option', { value: 'Dom' }, 'Dom'),
                    dm('option', { value: 'Midi' }, 'Midi')
                )
            ),
            dm(
                'div',
                { id: 'midiTransporterConfig', style: 'display: none;' },
                new MIDIPortSelect('MIDI Input', 'transporterMidiInput', this.midiPorts.inputs).render(),
                new MIDIPortSelect('MIDI Output', 'transporterMidiOutput', this.midiPorts.outputs).render()
            )
        )
    }

    addEventListeners() {
        const transporterTypeSelect = document.getElementById('transporterType')
        const midiConfigDiv = document.getElementById('midiTransporterConfig')

        transporterTypeSelect.addEventListener('change', () => {
            midiConfigDiv.style.display = transporterTypeSelect.value === 'Midi' ? 'block' : 'none'
        })
    }
}

// Class for Controller configuration
class ControllerConfig {
    constructor(partName, midiPorts) {
        this.partName = partName
        this.midiPorts = midiPorts
    }

    render() {
        return dm(
            'div',
            {},
            dm(
                'label',
                {},
                'Controller Type: ',
                dm(
                    'select',
                    { id: `${this.partName}ControllerType` },
                    dm('option', { value: 'Dom' }, 'Dom'),
                    dm('option', { value: 'Midi' }, 'Midi')
                )
            ),
            dm(
                'div',
                { id: `${this.partName}ControllerMidiConfig`, style: 'display: none;' },
                new MIDIPortSelect('MIDI Input', `${this.partName}ControllerMidiInput`, this.midiPorts.inputs).render(),
                new MIDIPortSelect('MIDI Output', `${this.partName}ControllerMidiOutput`, this.midiPorts.outputs).render()
            )
        )
    }

    addEventListeners() {
        const controllerTypeSelect = document.getElementById(`${this.partName}ControllerType`)
        const midiConfigDiv = document.getElementById(`${this.partName}ControllerMidiConfig`)

        controllerTypeSelect.addEventListener('change', () => {
            midiConfigDiv.style.display = controllerTypeSelect.value === 'Midi' ? 'block' : 'none'
        })
    }
}

// Class for Synthesizer configuration
class SynthesizerConfig {
    constructor(partName, midiPorts) {
        this.partName = partName
        this.midiPorts = midiPorts
    }

    render() {
        return dm(
            'div',
            {},
            dm(
                'label',
                {},
                'Synthesizer Type: ',
                dm(
                    'select',
                    { id: `${this.partName}SynthesizerType` },
                    dm('option', { value: 'Dom' }, 'Dom'),
                    dm('option', { value: 'Midi' }, 'Midi')
                )
            ),
            dm(
                'div',
                { id: `${this.partName}SynthesizerMidiConfig`, style: 'display: none;' },
                new MIDIPortSelect('MIDI Output', `${this.partName}SynthesizerMidiOutput`, this.midiPorts.outputs).render(),
                dm(
                    'label',
                    {},
                    'MIDI Channel: ',
                    dm(
                        'input',
                        { type: 'number', id: `${this.partName}SynthesizerMidiChannel`, min: 1, max: 16, value: 1 }
                    )
                )
            )
        )
    }

    addEventListeners() {
        const synthTypeSelect = document.getElementById(`${this.partName}SynthesizerType`)
        const midiConfigDiv = document.getElementById(`${this.partName}SynthesizerMidiConfig`)

        synthTypeSelect.addEventListener('change', () => {
            midiConfigDiv.style.display = synthTypeSelect.value === 'Midi' ? 'block' : 'none'
        })
    }
}

// Class for Part configuration
class PartConfig {
    constructor(partName, midiPorts) {
        this.partName = partName
        this.midiPorts = midiPorts
    }

    render() {
        return dm(
            'fieldset',
            {},
            dm('legend', {}, `${this.partName.toUpperCase()} Configuration`),
            new ControllerConfig(this.partName, this.midiPorts).render(),
            new SynthesizerConfig(this.partName, this.midiPorts).render()
        )
    }

    addEventListeners() {
        new ControllerConfig(this.partName, this.midiPorts).addEventListeners()
        new SynthesizerConfig(this.partName, this.midiPorts).addEventListeners()
    }
}

// Main function to get the config
export default async function getConfig() {
    const midiPorts = {
        inputs: Array.from(midiAccess?.inputs.values() || []),
        outputs: Array.from(midiAccess?.outputs.values() || []),
    }

    const transporterConfig = new TransporterConfig(midiPorts)
    document.body.appendChild(transporterConfig.render())

    const parts = ['bass', 'drum', 'keys', 'lead']
    parts.forEach(part => {
        const partConfig = new PartConfig(part, midiPorts)
        document.body.appendChild(partConfig.render())
        partConfig.addEventListeners()
    })

    transporterConfig.addEventListeners()

    // Control buttons and remember checkbox
    const controlsDiv = dm(
        'div',
        { style: 'margin-top: 20px;' },
        dm(
            'button',
            { id: 'submitButton', type: 'button' },
            'Submit'
        ),
        dm(
            'button',
            { id: 'refreshMidiButton', type: 'button', style: 'margin-left: 10px;' },
            'Refresh MIDI Ports'
        ),
        dm(
            'label',
            { style: 'margin-left: 10px;' },
            dm('input', { type: 'checkbox', id: 'rememberConfig' }),
            ' Remember Configuration'
        )
    )

    document.body.appendChild(controlsDiv)
}
