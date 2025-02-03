const PART_NAMES = ['bass', 'drum', 'keys', 'lead']

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

function makeUseMidiConfig(portion) {
    return dm('label', {}, 'MIDI',
        dm('input', { type: 'checkbox', name: `${portion}-use-midi` })
    )
}

function makeDuplexConfig(portion) {
    return dm('div', { class: 'port-group' },
        dm('select', { name: `${portion}-input-port` },
            dm('option', { value: 'port1' }, 'Port 1'),
            dm('option', { value: 'port2' }, 'Port 2')
        ),
        dm('label', {}, ' → Here → '),
        dm('select', { name: `${portion}-output-port` },
            dm('option', { value: 'port1' }, 'Port 1'),
            dm('option', { value: 'port2' }, 'Port 2')
        )
    )
}

function makeSimplexConfig(portion) {
    return dm('div', { class: 'port-group' },
        dm('label', {}, 'Port: ',
            dm('select', { name: `${portion}-output-port` },
                dm('option', { value: 'port1' }, 'Port 1'),
                dm('option', { value: 'port2' }, 'Port 2')
            )
        ),
        dm('label', {}, 'Channel: ',
            dm('input', { type: 'number', name: `${portion}-channel`, min: '1', max: '16', value: '1' })
        )
    )
}

function makePartConfig(partName) {
    return dm('fieldset', {},
        dm('legend', {}, partName.toUpperCase()),
        dm('div', {},
            dm('h4', {}, 'Controller'),
            makeUseMidiConfig(`${partName}-controller`),
            makeDuplexConfig(`${partName}-controller`)
        ),
        dm('hr'),
        dm('div', {},
            dm('h4', {}, 'Synthesizer'),
            makeUseMidiConfig(`${partName}-synthesizer`),
            makeSimplexConfig(`${partName}-synthesizer`)
        )
    )
}

document.body.append(
    dm('form', { id: 'config-form' },
        dm('fieldset', {},
            dm('legend', {}, 'TRANSPORTER'),
            makeUseMidiConfig('transporter'),
            makeDuplexConfig('transporter')
        ),
        dm('fieldset', {},
            dm('legend', {}, 'PAGE'),
            dm('label', {}, 'Show Chart Source',
                dm('input', { type: 'checkbox', name: 'band-show-chart-source', checked: 'true' })
            ),
        ),
        dm('div', { id: 'part-config-container' }, ...PART_NAMES.map(makePartConfig)),
        dm('div', {},
            dm('button', { type: 'button' }, 'Refresh MIDI Ports'),
            dm('label', {}, 'Remember Config',
                dm('input', { type: 'checkbox', name: 'remember-config', checked: 'true' })
            ),
            dm('button', { type: 'submit' }, 'Submit')
        ),
    )
)