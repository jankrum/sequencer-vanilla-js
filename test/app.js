const PART_NAMES = ['bass', 'drum', 'keys', 'lead']
const MIDI_PORTS = {
    INPUT: [
        'Transporter',
        'Bass Controller',
        'Drum Controller',
        'Keys Controller',
        'Lead Controller',
    ],
    OUTPUT: [
        'Transporter',
        'Bass Controller',
        'Drum Controller',
        'Keys Controller',
        'Lead Controller',
        'Bass Synthesizer',
        'Drum Synthesizer',
        'Keys Synthesizer',
        'Lead Synthesizer',
    ],
}

function dm(tag, attributes = {}, ...children) {
    const element = document.createElement(tag)

    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value)
    }

    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child))
        } else if (child) {
            element.appendChild(child)
        }
    }

    return element
}

function makeMidiSelect(portion, isInput) {
    const ports = isInput ? MIDI_PORTS.INPUT : MIDI_PORTS.OUTPUT

    return dm('select', { name: `${portion}-${isInput ? 'input' : 'output'}-port` },
        ...ports.map(port => dm('option', { value: port }, port))
    )
}

function makeDuplexConfig(portion) {
    return dm('div', { class: 'midi-config' },
        dm('label', { class: 'wide' },
            dm('b', {}, portion.split('-').at(-1).toUpperCase()),
            dm('input', { type: 'checkbox', name: `${portion}-use-midi` }),
        ),
        dm('div', { class: 'wide' },
            dm('label', {},
                'Input: ',
                makeMidiSelect(portion, true)
            ),
            dm('label', {},
                'Output: ',
                makeMidiSelect(portion, false)
            )
        )
    )
}

function makePartConfig(partName) {
    const synthesizerPortionName = `${partName}-synthesizer`

    return dm('fieldset', {},
        dm('legend', {}, partName.toUpperCase()),
        makeDuplexConfig(`${partName}-controller`),
        dm('hr'),
        dm('div', { class: 'midi-config' },
            dm('label', { class: 'wide' },
                dm('b', {}, 'SYNTHESIZER'),
                dm('input', { type: 'checkbox', name: `${synthesizerPortionName}-use-midi` }),
            ),
            dm('div', { class: 'wide' },
                dm('label', {}, 'Output: ',
                    makeMidiSelect(synthesizerPortionName, false)
                ),
                dm('label', {}, 'Channel: ',
                    dm('input', { type: 'number', name: `${synthesizerPortionName}-channel`, min: '1', max: '16', value: '1' })
                )
            )
        )
    )
}

document.body.append(
    dm('div', { id: 'config' },
        dm('label', {}, 'Show Chart Source',
            dm('input', { type: 'checkbox', name: 'band-show-chart-source', checked: 'true' })
        ),
        makeDuplexConfig('transporter'),
        ...PART_NAMES.map(makePartConfig),
        dm('div', { class: 'wide' },
            dm('button', { type: 'button' }, 'Refresh MIDI Ports'),
            dm('label', {}, 'Remember Config',
                dm('input', { type: 'checkbox', name: 'remember-config', checked: 'true' })
            ),
            dm('button', { type: 'submit' }, 'Submit')
        ),
    )
)