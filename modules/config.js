import { dm, midiAccess } from './utility.js'
import { PARTS, TRANSPORTER_TYPE, CONTROLLER_TYPE, SYNTHESIZER_TYPE } from './constants.js'

function getProblems(config) {
    const problems = []

    if (!config) {
        problems.push('Invalid configuration')
        return problems
    }

    if (!config.transporter) {
        problems.push('Missing transporter')
    } else {
        if (!Object.values(TRANSPORTER_TYPE).includes(config.transporter.type)) {
            problems.push('Invalid transporter type')
        } else if (config.transporter.type === TRANSPORTER_TYPE.MIDI && !midiAccess) {
            problems.push('Cannot use MIDI transporter without MIDI access')
        }
    }

    if (!config.parts) {
        problems.push('Missing parts')
    } else {
        for (const part of PARTS) {
            if (!config.parts[part]) {
                problems.push(`Missing part: ${part}`)
                continue
            }

            const partConfig = config.parts[part]

            if (!partConfig.controller) {
                problems.push(`Missing controller for part: ${part}`)
            } else {
                if (!Object.values(CONTROLLER_TYPE).includes(partConfig.controller.type)) {
                    problems.push(`Invalid controller type for part: ${part}`)
                } else if (partConfig.controller.type === CONTROLLER_TYPE.MIDI && !midiAccess) {
                    problems.push(`Cannot use MIDI controller for part: ${part} without MIDI access`)
                }
            }

            if (!partConfig.synthesizer) {
                problems.push(`Missing synthesizer for part: ${part}`)
            } else {
                if (!Object.values(SYNTHESIZER_TYPE).includes(partConfig.synthesizer.type)) {
                    problems.push(`Invalid synthesizer type for part: ${part}`)
                } else if (partConfig.synthesizer.type === SYNTHESIZER_TYPE.MIDI && !midiAccess) {
                    problems.push(`Cannot use MIDI synthesizer for part: ${part} without MIDI access`)
                }
            }
        }
    }

    return problems
}

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
        console.error(error)

        urlParams.delete('config')
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState(null, '', newUrl)
    }

    return null
}

function getConfigFromUser() {
    const initialConfig = {
        transporter: {
            type: TRANSPORTER_TYPE.DOM,
        },
        parts: Object.fromEntries(PARTS.map(part => [part, {
            controller: {
                type: CONTROLLER_TYPE.DOM,
            },
            synthesizer: {
                type: SYNTHESIZER_TYPE.DOM,
            },
        }])),
    }

    const initialConfigString = JSON.stringify(initialConfig, null, 4)

    const configTextarea = dm('textarea', { style: { width: '100%', height: '100%' } }, initialConfigString)
    const submitButton = dm('button', {}, 'Submit')
    const rememberCheckbox = dm('input', { type: 'checkbox', checked: true })
    const rememberLabel = dm('label', { style: { marginLeft: '1em' } }, 'Remember this configuration')
    const errorDiv = dm('div', { style: { color: 'red' } })
    const div = dm('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
        configTextarea,
        submitButton,
        dm('div', { style: { display: 'flex', alignItems: 'center' } },
            rememberCheckbox,
            rememberLabel,
        ),
        errorDiv,
    )

    document.body.appendChild(div)

    return new Promise(resolve => {
        submitButton.addEventListener('click', () => {
            try {
                const config = JSON.parse(configTextarea.value)
                const problems = getProblems(config)

                errorDiv.textContent = problems.join('\n')

                if (problems.length) {
                    return
                }

                if (rememberCheckbox.checked) {
                    const base64String = btoa(JSON.stringify(config))
                    const encodedConfig = encodeURIComponent(base64String)

                    const urlParams = new URLSearchParams(window.location.search)
                    urlParams.set('config', encodedConfig)

                    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
                    window.history.replaceState(null, '', newUrl)
                }

                div.remove()

                resolve(config)
            } catch (error) {
                errorDiv.textContent = error.message
            }
        })
    })
}

export async function getConfig() {
    return getConfigFromUrl() || await getConfigFromUser()
}