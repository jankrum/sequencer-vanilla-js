import { SimplexMidi } from './midi-utilities.js'

export default class Synthesizer extends SimplexMidi {
    constructor() {
        super()
    }

    getConfigElement() {
        return super.getConfigElement('SYNTHESIZER')
    }
}