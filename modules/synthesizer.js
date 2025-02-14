import { SimplexMidi } from './midi.js'

export default class Synthesizer extends SimplexMidi {
    constructor() {
        super()
    }

    getConfigElement() {
        return super.getConfigElement('SYNTHESIZER')
    }
}