import { DuplexMidi } from './midi.js'

export default class Controller extends DuplexMidi {
    static nameInConfig = 'controller'

    static validateConfig(config) {
        super.validateConfig(config, Controller.nameInConfig)
    }

    static getConfig(config) {
        return super.getConfig(config, Controller.nameInConfig)
    }

    constructor() {
        super()
    }
}