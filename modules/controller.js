import { DuplexMidi } from './midi.js'

export default class Controller extends DuplexMidi {
    constructor() {
        super()
    }

    getConfigElement(name) {
        return super.getConfigElement('CONTROLLER')
    }
}