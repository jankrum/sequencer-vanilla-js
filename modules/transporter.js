import { DuplexMidi } from "./simplex-and-duplex.js"

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