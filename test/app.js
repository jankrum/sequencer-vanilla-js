const PART_NAMES = ['drum', 'bass', 'keys', 'lead']

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
    return dm('label', {}, 'Use MIDI',
        dm('input', { type: 'checkbox', name: `${portion}-use-midi` })
    )
}

function makeDuplexConfig(portion) {
    return dm('div', { class: 'port-group' },
        dm('label', {}, 'Input Port',
            dm('select', { name: `${portion}-input-port` },
                dm('option', { value: 'port1' }, 'Port 1'),
                dm('option', { value: 'port2' }, 'Port 2')
            )
        ),
        dm('label', {}, 'Output Port',
            dm('select', { name: `${portion}-output-port` },
                dm('option', { value: 'port1' }, 'Port 1'),
                dm('option', { value: 'port2' }, 'Port 2')
            )
        )
    )
}

function makeSimplexConfig(portion) {
    return dm('div', { class: 'port-group' },
        dm('label', {}, 'Output Port',
            dm('select', { name: `${portion}-output-port` },
                dm('option', { value: 'port1' }, 'Port 1'),
                dm('option', { value: 'port2' }, 'Port 2')
            )
        ),
        dm('label', {}, 'Channel',
            dm('input', { type: 'number', name: `${portion}-channel`, min: '1', max: '16', value: '1' })
        )
    )
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function makePartConfig(partName) {
    return dm('div', { class: 'instrument' },
        dm('h3', {}, capitalizeFirstLetter(partName)),
        dm('div', { class: 'part' },
            dm('h4', {}, 'Controller',
                makeUseMidiConfig(`${partName}-controller`),
                makeDuplexConfig(`${partName}-controller`)
            )
        ),
        dm('div', { class: 'part' },
            dm('h4', {}, 'Synthesizer',
                makeUseMidiConfig(`${partName}-synthesizer`),
                makeSimplexConfig(`${partName}-synthesizer`)
            )
        )
    )
}

document.body.append(
    dm('div', { class: 'config-section' },
        dm('h2', {}, 'Transporter'),
        makeUseMidiConfig('transporter'),
        makeDuplexConfig('transporter')
    ),
    dm('div', { class: 'config-section' },
        dm('h2', {}, 'Band'),
        dm('label', {}, 'Show Chart Source',
            dm('input', { type: 'checkbox', name: 'band-show-chart-source' })
        ),
        ...PART_NAMES.map(makePartConfig)
    ),
    dm('div', { class: 'footer' },
        dm('button', { type: 'button' }, 'Refresh MIDI Ports'),
        dm('label', {}, 'Remember Config',
            dm('input', { type: 'checkbox', name: 'remember-config', checked: 'true' })
        ),
        dm('input', { type: 'submit', value: 'Save Config' })
    )
)