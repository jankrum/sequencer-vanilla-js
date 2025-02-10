import { DuplexMidi } from "./midi-utilities.js"

export default class Transporter extends DuplexMidi {
    constructor() {
        super()
    }

    getConfigElement() {
        return super.getConfigElement('transporter')
    }
}