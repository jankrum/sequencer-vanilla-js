import { DuplexMidi } from './simplex-and-duplex.js'

export default class Controller extends DuplexMidi {
    constructor() {
        super()
    }

    getConfigElement(name) {
        return super.getConfigElement('CONTROLLER')
    }
}