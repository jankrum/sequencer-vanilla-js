import dm from './dm.js'
import Controller from './controller.js'
import Synthesizer from './synthesizer.js'

export default class Part {
    controller = new Controller()
    synthesizer = new Synthesizer()

    tryConfig(config) {
        if (!config) {
            throw new Error('part config is required')
        }

        if (typeof config !== 'object') {
            throw new Error('part config must be an object')
        }

        const problems = []

        const { controller, synthesizer } = config

        if (controller === undefined) {
            problems.push('controller is required')
        } else if (typeof controller !== 'object') {
            problems.push('controller must be an object')
        } else {
            try {
                this.controller.tryConfig(controller)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (synthesizer === undefined) {
            problems.push('synthesizer is required')
        } else if (typeof synthesizer !== 'object') {
            problems.push('synthesizer must be an object')
        } else {
            try {
                this.synthesizer.tryConfig(synthesizer)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }

    getConfigElement(name) {
        return dm('fieldset', {},
            dm('legend', {}, name.toUpperCase()),
            this.controller.getConfigElement(name),
            dm('hr'),
            this.synthesizer.getConfigElement()
        )
    }

    getConfigValues() {
        return {
            controller: this.controller.getConfigValues(),
            synthesizer: this.synthesizer.getConfigValues()
        }
    }
}