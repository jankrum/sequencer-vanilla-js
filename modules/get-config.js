import { TRANSPORTER_TYPE, CONTROLLER_TYPE, SYNTHESIZER_TYPE } from './constants.js'
import { dm, midiAccess } from './utility.js'

//#region getProblems
function getMidiPortProblems(parentName, portName, direction) {
    const problems = []

    if (!midiAccess) {
        problems.push(`The ${parentName} cannot be type MIDI without MIDI access`)
        return problems
    }

    const midiMap = midiAccess[direction]
    const values = midiMap.values()
    const ports = Array.from(values)

    if (!ports) {
        problems.push(`No MIDI ${direction}`)
        return problems
    }

    const port = ports.find(({ name }) => name === portName)

    if (!port) {
        problems.push(`No MIDI ${direction} named ${portName} for ${parentName}`)
    }

    return problems
}

// function getDuplexMidiProblems(parentName: string, config: DuplexMidiConfig): string[] {
//     const problems: string[] = []

//     const { input, output } = config

//     if (!input) {
//         problems.push(`No MIDI input for ${parentName}`)
//     } else {
//         problems.push(...getMidiPortProblems(parentName, input, 'inputs'))
//     }

//     if (!output) {
//         problems.push(`No MIDI output for ${parentName}`)
//     } else {
//         problems.push(...getMidiPortProblems(parentName, output, 'outputs'))
//     }

//     if (problems.length) {
//         return problems
//     }

//     if (input === output) {
//         problems.push(`Input and output are the same for ${parentName}`)
//         return problems
//     }

//     return problems
// }

function getSimplexMidiProblems(parentName, config) {
    const problems = []

    const { output, channel } = config

    if (!output) {
        problems.push(`No MIDI output for ${parentName}`)
    } else {
        problems.push(...getMidiPortProblems(parentName, output, 'outputs'))
    }

    if (!channel) {
        problems.push(`No MIDI channel for ${parentName}`)
    } else if (channel < 1 || channel > 16) {
        problems.push(`Invalid MIDI channel for ${parentName}: ${channel}`)
    }

    return problems
}

//#region Transporter
function getTransporterProblems(config) {
    const problems = []

    if (config.type === undefined) {
        problems.push('No transporter type')
        return problems
    }

    if (!(config.type in TRANSPORTER_TYPE)) {
        problems.push(`Invalid transporter type: ${config.type}`)
        return problems
    }

    // if (config.type === TransporterType.Midi) {
    //     if (!midiAccess) {
    //         problems.push('No MIDI access')
    //         return problems
    //     }

    //     const { midi } = config

    //     if (!midi) {
    //         problems.push('No MIDI config')
    //         return problems
    //     }

    //     problems.push(...getDuplexMidiProblems('Transporter', midi))
    // }

    return problems
}
//#endregion

//#region Parts
function getControllerProblems(partName, config) {
    const problems = []

    if (config.type === undefined) {
        problems.push(`No controller type for ${partName} part`)
        return problems
    }

    if (!(config.type in CONTROLLER_TYPE)) {
        problems.push(`Invalid controller type for ${partName} part: ${config.type}`)
        return problems
    }

    // if (config.type === ControllerType.Midi) {
    //     if (!midiAccess) {
    //         problems.push('No MIDI access')
    //         return problems
    //     }

    //     const { midi } = config

    //     if (!midi) {
    //         problems.push('No MIDI config')
    //         return problems
    //     }

    //     problems.push(...getDuplexMidiProblems(`${partName} controller`, midi))
    // }

    return problems
}

function getSynthesizerProblems(partName, config) {
    const problems = []

    if (config.type === undefined) {
        problems.push(`No synthesizer type for ${partName} part`)
        return problems
    }

    if (!(config.type in SYNTHESIZER_TYPE)) {
        problems.push(`Invalid synthesizer type for ${partName} part: ${config.type}`)
    }

    if (config.type === SYNTHESIZER_TYPE.Midi) {
        if (!midiAccess) {
            problems.push('No MIDI access')
            return problems
        }

        const { midi } = config

        if (!midi) {
            problems.push('No MIDI config')
            return problems
        }

        problems.push(...getSimplexMidiProblems(`${partName} synthesizer`, midi))
    }

    return problems
}

function getPartProblems(partName, config) {
    const problems = []

    const { controller, synthesizer } = config

    if (!controller) {
        problems.push(`No controller for ${partName} part`)
    } else {
        problems.push(...getControllerProblems(partName, controller))
    }

    if (!synthesizer) {
        problems.push(`No synthesizer for ${partName} part`)
    } else {
        problems.push(...getSynthesizerProblems(partName, synthesizer))
    }

    return problems
}

function getPartsProblems(configs) {
    const problems = []

    const partNames = ['bass', 'drum', 'keys', 'lead']

    for (const partName of partNames) {
        const partConfig = configs[partName]

        if (!partConfig) {
            problems.push(`No ${partName} part`)
            continue
        }

        problems.push(...getPartProblems(partName, partConfig))
    }

    return problems
}
//#endregion

function getProblems(config) {
    const problems = []

    const { transporter, parts } = config

    if (!transporter) {
        problems.push('No transporter')
    } else {
        problems.push(...getTransporterProblems(transporter))
    }

    if (!parts) {
        problems.push('No parts')
    } else {
        problems.push(...getPartsProblems(parts))
    }
    return problems
}
//#endregion

//#region getConfigFromUrl
function getConfigFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)
    const encodedConfig = urlParams.get('config')

    try {
        if (!encodedConfig) {
            return null
        }

        const base64String = decodeURIComponent(encodedConfig)
        const jsonString = atob(base64String)

        const config = JSON.parse(jsonString)

        const problems = getProblems(config)

        if (problems.length) {
            throw new Error(problems.join('\n'))
        }

        return config
    } catch (error) {
        alert(error.message)
        console.error(error)

        urlParams.delete('config')
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState(null, '', newUrl)
    }

    return null
}
//#endregion

//#region getConfigFromUser
// The types of transporters, controllers, and synthesizers
const transporterTypes = [['DOM', TRANSPORTER_TYPE.Dom], /*['MIDI', TransporterType.Midi]*/]
const controllerTypes = [['DOM', CONTROLLER_TYPE.Dom], /*['MIDI', ControllerType.Midi]*/]
const synthesizerTypes = [['DOM', SYNTHESIZER_TYPE.Dom], ['MIDI', SYNTHESIZER_TYPE.Midi]]


const SELECTORS = {
    CONFIG_FORM_ID: 'config-form',
    TRANSPORTER_CONFIG_ID: 'transporter-config',
    PART_CONFIG_CLASS: 'part-config',
    TYPE_DIV_CLASS: 'type-div',
    MIDI_DIV_CLASS: 'midi-div',
    // MIDI_INPUT_SELECT_CLASS: 'midi-input-select',
    MIDI_OUTPUT_SELECT_CLASS: 'midi-output-select',
    REMEMBER_CHECKBOX_ID: 'remember-config',
}

function setUpRadioButtons(typeConfig, typeSpecificNamesAndConfigs) {
    if (!typeConfig.div) {
        throw new Error('setUpRadioButtons called before render')
    }

    // The radio buttons for the type
    const radioButtons = Array.from(typeConfig.div.querySelectorAll('input[type="radio"]'))

    // Add event listeners to the radio buttons
    for (const radioButton of radioButtons) {
        // Make the divs for the specific types hidden or not based on the radio button value
        for (const [type, config] of typeSpecificNamesAndConfigs) {
            radioButton.addEventListener('change', () => {
                if (!config.div) {
                    throw new Error('setUpRadioButtons called before render')
                }

                config.div.classList[Number(radioButton.value) === type ? 'remove' : 'add']('hidden')
            })
        }
    }
}

class TypeConfigElement {
    name
    title
    typeNamesAndEnums
    inputs
    div

    constructor(name, title, typeNamesAndEnums) {
        // Used in render
        this.name = name
        this.title = title
        this.typeNamesAndEnums = typeNamesAndEnums

        // For the config
        this.inputs = {}
        this.div = null
    }

    render() {
        // The inputs and labels for the types
        const inputsAndLabels = this.typeNamesAndEnums.map(([typeName, typeEnum]) => {
            const inputId = `${this.name}-${typeName}`
            const input = dm('input', { id: inputId, type: 'radio', name: this.name, value: typeEnum })
            const label = dm('label', { for: inputId }, typeName)
            this.inputs[typeEnum] = input
            return [input, label]
        }).flat()

        const div = this.div = dm('div', { class: SELECTORS.TYPE_DIV_CLASS }, this.title, ...inputsAndLabels)

        return div
    }

    getConfig() {
        if (!this.div) {
            throw new Error('getConfig called before render')
        }

        return Number((this.div.querySelector('input[type="radio"]:checked')).value)
    }
}

// class DuplexMidiConfigElement {
//     inputSelect: HTMLSelectElement | null = null
//     outputSelect: HTMLSelectElement | null = null
//     div: HTMLElement | null = null

//     render() {
//         const inputSelect = this.inputSelect = dm('select', { class: SELECTORS.MIDI_INPUT_SELECT_CLASS }) as HTMLSelectElement
//         const outputSelect = this.outputSelect = dm('select', { class: SELECTORS.MIDI_OUTPUT_SELECT_CLASS }) as HTMLSelectElement
//         const div = this.div = dm('div', {}, inputSelect, ' → Here → ', outputSelect)

//         return div
//     }

//     getConfig() {
//         if (!this.inputSelect || !this.outputSelect) {
//             throw new Error('getConfig called before render')
//         }

//         return {
//             input: this.inputSelect.value,
//             output: this.outputSelect.value,
//         }
//     }
// }

class SimplexMidiConfigElement {
    select = null
    input = null
    div = null

    render() {
        const select = this.select = dm('select', { class: SELECTORS.MIDI_OUTPUT_SELECT_CLASS })
        const input = this.input = dm('input', { type: 'number', name: 'channel', min: 1, max: 16, value: 1 })
        const div = this.div = dm('div', {}, select, ' on channel ', input)

        return div
    }

    getConfig() {
        if (!this.select || !this.input) {
            throw new Error('getConfig called before render')
        }

        return {
            output: this.select.value,
            channel: this.input.value,
        }
    }
}

class TransporterConfigElement {
    typeConfig = new TypeConfigElement('transporter-type', 'Type: ', transporterTypes)
    // midiConfig: DuplexMidiConfigElement = new DuplexMidiConfigElement()

    render() {
        const legend = dm('legend', {}, 'TRANSPORTER')
        const typeDiv = this.typeConfig.render()
        // const midiDiv = this.midiConfig.render()
        const fieldset = dm('fieldset', { id: SELECTORS.TRANSPORTER_CONFIG_ID }, legend, typeDiv, /*midiDiv*/)

        return fieldset
    }

    setUp() {
        // setUpRadioButtons(this.typeConfig, [[TransporterType.Midi, this.midiConfig]])
    }

    getConfig() {
        const config = {}

        /*const type =*/ config.type = this.typeConfig.getConfig()

        // if (type === TransporterType.Midi) {
        //     config.midi = this.midiConfig.getConfig()
        // }

        return config
    }
}

class ControllerConfigElement {
    typeConfig
    // midiConfig: DuplexMidiConfigElement = new DuplexMidiConfigElement()
    div = null

    constructor(name) {
        this.typeConfig = new TypeConfigElement(`${name}-controller-type`, 'Controller: ', controllerTypes)
    }

    render() {
        const typeDiv = this.typeConfig.render()
        // const midiConfig = this.midiConfig.render()
        const div = this.div = dm('div', {}, typeDiv, /*midiConfig*/)

        return div
    }

    setUp() {
        // setUpRadioButtons(this.typeConfig, [[ControllerType.Midi, this.midiConfig]])
    }

    getConfig() {
        const config = {}

        /*const type =*/ config.type = this.typeConfig.getConfig()

        // if (type === ControllerType.Midi) {
        //     config.midi = this.midiConfig.getConfig()
        // }

        return config
    }
}

class SynthesizerConfigElement {
    typeConfig
    midiConfig = new SimplexMidiConfigElement()

    constructor(name) {
        this.typeConfig = new TypeConfigElement(`${name}-synthesizer-type`, 'Synthesizer: ', synthesizerTypes)
    }

    render() {
        const typeDiv = this.typeConfig.render()
        const midiConfig = this.midiConfig.render()
        const div = dm('div', {}, typeDiv, midiConfig)

        return div
    }

    setUp() {
        setUpRadioButtons(this.typeConfig, [[SYNTHESIZER_TYPE.Midi, this.midiConfig]])
    }

    getConfig() {
        const config = {}

        const type = config.type = this.typeConfig.getConfig()

        if (type === SYNTHESIZER_TYPE.Midi) {
            config.midi = this.midiConfig.getConfig()
        }

        return config
    }
}

class PartConfigElement {
    name
    controllerConfig
    synthesizerConfig

    constructor(name) {
        this.name = name
        this.controllerConfig = new ControllerConfigElement(name)
        this.synthesizerConfig = new SynthesizerConfigElement(name)
    }

    render() {
        const legend = dm('legend', {}, this.name.toUpperCase())
        const controllerDiv = this.controllerConfig.render()
        const hr = dm('hr')
        const synthesizerDiv = this.synthesizerConfig.render()
        const fieldset = dm('fieldset', {}, legend, controllerDiv, hr, synthesizerDiv)

        return fieldset
    }

    setUp() {
        this.controllerConfig.setUp()
        this.synthesizerConfig.setUp()
    }

    getConfig() {
        return {
            controller: this.controllerConfig.getConfig(),
            synthesizer: this.synthesizerConfig.getConfig(),
        }
    }
}

class ProblemDiv {
    div = null

    render() {
        const div = this.div = dm('div', { class: 'problem-div' })

        return div
    }

    addProblems(problems) {
        if (!this.div) {
            throw new Error('addProblems called before render')
        }

        const div = this.div

        div.innerHTML = ''

        for (const problem of problems) {
            const p = dm('p', {}, problem)
            div.appendChild(p)
        }
    }
}

class MiscellaneousDiv {
    refreshButton = null
    rememberCheckbox = null
    problemDiv = new ProblemDiv()

    render() {
        const refreshButton = this.refreshButton = dm('button', { type: 'button' }, 'Refresh MIDI Ports')
        const rememberCheckbox = this.rememberCheckbox = dm('input', { type: 'checkbox', id: SELECTORS.REMEMBER_CHECKBOX_ID })
        const rememberLabel = dm('label', { for: SELECTORS.REMEMBER_CHECKBOX_ID }, 'Remember')
        const submitButton = dm('button', { type: 'submit' }, 'Submit')
        const problemDiv = this.problemDiv.render()
        const div = dm('div', {}, refreshButton, rememberCheckbox, rememberLabel, submitButton, problemDiv)

        return div
    }

    setUp() { }
}

class ConfigFormElement {
    transporterConfig = new TransporterConfigElement()
    partConfigs = {
        bass: new PartConfigElement('bass'),
        drum: new PartConfigElement('drum'),
        keys: new PartConfigElement('keys'),
        lead: new PartConfigElement('lead'),
    }
    miscellaneousDiv = new MiscellaneousDiv()
    form = null

    render() {
        const transporterFieldset = this.transporterConfig.render()
        const partFieldsets = Object.values(this.partConfigs).map(partConfig => partConfig.render())
        const miscellaneousDiv = this.miscellaneousDiv.render()
        const form = this.form = dm('form', { id: SELECTORS.CONFIG_FORM_ID }, transporterFieldset, ...partFieldsets, miscellaneousDiv)

        return form
    }

    setUp() {
        if (!this.form) {
            throw new Error('setUp called before render')
        }

        // Set up the parts, transporter, and miscellaneous div
        this.transporterConfig.setUp()

        for (const partConfig of Object.values(this.partConfigs)) {
            partConfig.setUp()
        }

        if (!this.miscellaneousDiv.refreshButton) {
            throw new Error('setUp called before render')
        }

        this.miscellaneousDiv.refreshButton.addEventListener('mousedown', this.refreshMidi.bind(this))

        // Refresh the MIDI portions
        this.refreshMidi()

        // Click the first radio buttons
        // We do this after refreshing the MIDI ports so that the MIDI radio buttons are disabled if there is no MIDI access
        this.clickAllFirstRadioButtons()

        // Show the form
        this.form.classList.remove('hidden')
    }

    getConfig() {
        return {
            transporter: this.transporterConfig.getConfig(),
            parts: {
                bass: this.partConfigs.bass.getConfig(),
                drum: this.partConfigs.drum.getConfig(),
                keys: this.partConfigs.keys.getConfig(),
                lead: this.partConfigs.lead.getConfig(),
            },
        }
    }

    refreshMidi() {
        if (!this.form) {
            throw new Error('refreshMidi called before render')
        }

        // The radio buttons for the MIDI type
        const midiTypeRadioButtons = Array.from(this.form.querySelectorAll('input[type="radio"][value="1"]'))

        // Enable/disable the MIDI radio buttons
        for (const radioButton of midiTypeRadioButtons) {
            radioButton.disabled = !midiAccess
        }

        // If there is no MIDI access, we can't do anything else
        if (!midiAccess) {
            return
        }

        function populateMidiSelects(selector, direction) {
            // The selects we will be populating
            const selectElements = document.getElementsByClassName(selector)

            // The names of the MIDI ports for the given direction
            const portNames = Array.from((midiAccess)[direction].values()).map((port) => port.name)  // Types suck here

            // Populate the select elements
            for (const select of selectElements) {
                // If there is a currently selected port, we want to keep it selected
                const selectedPort = select.value || portNames[0]

                // Clear the select element's children
                select.innerHTML = ''

                // Add an option for each port
                for (const port of portNames) {
                    const option = dm('option', { value: port }, port)
                    select.appendChild(option)
                }

                // If the selected port is still available, select it
                if (portNames.includes(selectedPort)) {
                    select.value = selectedPort
                }
            }
        }

        // Populate the MIDI selects
        // populateMidiSelects(SELECTORS.MIDI_INPUT_SELECT_CLASS, 'inputs')
        populateMidiSelects(SELECTORS.MIDI_OUTPUT_SELECT_CLASS, 'outputs')
    }

    clickAllFirstRadioButtons() {
        if (!this.form) {
            throw new Error('clickAllFirstRadioButtons called before render')
        }

        // The first radio buttons for everything
        const firstRadioButtons = Array.from(this.form.querySelectorAll('input[type="radio"]:enabled:first-of-type'))

        // Click all the first radio buttons
        for (const radioButton of firstRadioButtons) {
            radioButton.click()
        }
    }

    getPromise() {
        return new Promise(resolve => {
            if (!this.form) {
                throw new Error('getPromise called before render')
            }

            this.form.addEventListener('submit', (event) => {
                if (!this.form) {
                    throw new Error('submit event listener called after form was removed')
                }

                // Prevent the form from submitting
                event.preventDefault()

                // Get the config from the form
                const config = this.getConfig()

                // Get the problems with the config
                const problems = getProblems(config)

                // Add the problems to the problem div
                this.miscellaneousDiv.problemDiv.addProblems(problems)

                // If there are problems, don't resolve the promise
                if (problems.length) {
                    return
                }

                // If the user wants to remember the config, save it to the url
                if (this.miscellaneousDiv.rememberCheckbox?.checked) {
                    try {
                        const jsonString = JSON.stringify(config)
                        const base64String = btoa(jsonString)
                        const encodedString = encodeURIComponent(base64String)
                        const url = `${window.location.origin}${window.location.pathname}?config=${encodedString}`
                        window.history.pushState({}, '', url)
                    } catch (error) {
                        alert('Error saving config to URL')
                        console.error(error)
                    }
                }

                // Remove the form from the DOM
                this.form.remove()

                // Resolve the promise with the config
                resolve(config)
            })
        })
    }
}

async function getConfigFromUser() {
    // The form we will be working with
    const configForm = new ConfigFormElement()

    // Render the form and append it to the body
    document.body.append(configForm.render())

    // Set up the event listeners and refresh the MIDI ports
    configForm.setUp()

    // Get the config from the user
    const config = await configForm.getPromise()

    // Return the config
    return config
}
//#endregion

//#region getConfig
export default async () => {
    return getConfigFromUrl() || await getConfigFromUser()
}
//#endregion