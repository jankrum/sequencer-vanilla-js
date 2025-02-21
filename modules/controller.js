import { DuplexMidi } from './midi.js'

class DomController {

}

export default class Controller {
    static nameInConfig = 'controller'

    static validateConfig(config) {
        DuplexMidi.validateConfig(config, Controller.nameInConfig)
    }

    static getConfig(config) {
        return DuplexMidi.getConfig(config, Controller.nameInConfig)
    }

    static build(config) {
        console.log(config)
        if (config.isMidi === false) {
            return new DomController()
        } else {
            throw new Error('MIDI controller not implemented')
        }
    }
}