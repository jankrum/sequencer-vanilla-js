import { DuplexMidi } from './midi.js'
import dm from './dm.js'

function createButton(name) {
    return [
        name,
        dm('button', { class: 'transporter-button' },
            dm('img', { src: `/icons/${name}.svg`, alt: name })
        )
    ]
}

export default class Transporter extends DuplexMidi {
    buttons = Object.fromEntries([
        'previous',
        'next',
        'stop',
        'play',
        'pause',
        'record',
    ].map(createButton))

    constructor() {
        super()
    }

    getConfigElement() {
        return super.getConfigElement('TRANSPORTER')
    }

    connect() { }

    render() {
        return dm('div', { class: 'transporter' },
            ...Object.values(this.buttons).map(button => button)
        )
    }

    setChart(chartTitle, canPrevious, canNext) { }
}