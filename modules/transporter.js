import { DuplexMidi } from './midi.js'

export default class Transporter extends DuplexMidi {
    constructor() {
        super()
    }

    getConfigElement() {
        return super.getConfigElement('TRANSPORTER')
    }

    connect() { }

    render() { }
}