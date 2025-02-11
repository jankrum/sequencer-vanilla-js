import { SimplexMidi } from './simplex-and-duplex.js'

export default class Synthesizer extends SimplexMidi {
    constructor() {
        super()
    }

    getConfigElement() {
        return super.getConfigElement('SYNTHESIZER')
    }
}