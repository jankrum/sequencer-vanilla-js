const PART_NAMES = ['bass', 'drum', 'keys', 'lead']
const MIDI_PORTS = {
    INPUT: [
        'IAC Driver Bus 1',
        // 'Transporter',
        // 'Bass Controller',
        // 'Drum Controller',
        // 'Keys Controller',
        // 'Lead Controller',
    ],
    OUTPUT: [
        'IAC Driver Bus 1',
        // 'Transporter',
        // 'Bass Controller',
        // 'Drum Controller',
        // 'Keys Controller',
        // 'Lead Controller',
        // 'Bass Synthesizer',
        // 'Drum Synthesizer',
        // 'Keys Synthesizer',
        // 'Lead Synthesizer',
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

function makeMidiSelect(isInput) {
    const ports = isInput ? MIDI_PORTS.INPUT : MIDI_PORTS.OUTPUT

    return dm('select', {},
        ...ports.map(port => dm('option', { value: port }, port))
    )
}

function makeDuplexConfig(name) {
    return dm('div', { class: 'midi-config' },
        dm('label', { class: 'wide' },
            dm('b', {}, name),
            dm('input', { type: 'checkbox' }),
        ),
        dm('div', { class: 'wide' },
            dm('label', {},
                'Input: ',
                makeMidiSelect(true)
            ),
            dm('label', {},
                'Output: ',
                makeMidiSelect(false)
            )
        )
    )
}

function makePartConfig(partName) {
    return dm('fieldset', {},
        dm('legend', {}, partName.toUpperCase()),
        makeDuplexConfig('CONTROLLER'),
        dm('hr'),
        dm('div', { class: 'midi-config' },
            dm('label', { class: 'wide' },
                dm('b', {}, 'SYNTHESIZER'),
                dm('input', { type: 'checkbox' }),
            ),
            dm('div', { class: 'wide' },
                dm('label', {}, 'Output: ',
                    makeMidiSelect(false)
                ),
                dm('label', {}, 'Channel: ',
                    dm('input', { type: 'number', min: '1', max: '16', value: '1' })
                )
            )
        )
    )
}

document.body.append(
    dm('form', { id: 'config' },
        dm('label', {}, 'Show Chart Source',
            dm('input', { type: 'checkbox', name: 'band-show-chart-source', checked: 'true' })
        ),
        dm('hr', { class: 'wide' }),
        makeDuplexConfig('TRANSPORTER'),
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