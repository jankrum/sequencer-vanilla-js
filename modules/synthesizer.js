import { SimplexMidi } from './midi.js'

export default class Synthesizer extends SimplexMidi {
    static nameInConfig = 'synthesizer'

    static validateConfig(config) {
        super.validateConfig(config, Synthesizer.nameInConfig)
    }

    static getConfig(config) {
        return super.getConfig(config, Synthesizer.nameInConfig)
    }

    constructor() {
        super()
    }
}