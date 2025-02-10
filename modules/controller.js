import { DuplexMidi } from './midi-utilities.js'

export default class Controller extends DuplexMidi {
    constructor() {
        super()
    }

    getConfigElement(name) {
        return super.getConfigElement('CONTROLLER')
    }
}