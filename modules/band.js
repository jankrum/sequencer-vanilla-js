import Controller from './controller.js'
import Synthesizer from './synthesizer.js'
import dm from './dm.js'

class Part {
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

export default class Band {
    static partNames = ['bass', 'drum', 'keys', 'lead']
    parts = Object.fromEntries(Band.partNames.map(name => [name, new Part()]))

    tryConfig(config) {
        if (!config) {
            throw new Error('band config is required')
        }

        if (typeof config !== 'object') {
            throw new Error('band config must be an object')
        }

        const problems = []

        for (const partName of Band.partNames) {
            try {
                // The part for this name in the config
                const partInConfig = config[partName]

                // If the part is not in the config, throw an error
                if (!partInConfig) {
                    throw new Error(`${partName} config is required`)
                }

                if (typeof partInConfig !== 'object') {
                    throw new Error(`${partName} config must be an object`)
                }

                // Try to configure the part with the part in the config
                this.parts[partName].tryConfig(partInConfig)
            } catch (error) {
                problems.push(error.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }

    getConfigElements() {
        return Band.partNames.map(name => this.parts[name].getConfigElement(name))
    }

    getConfigValues() {
        return Object.fromEntries(Band.partNames.map(name => [name, this.parts[name].getConfigValues()]))
    }

    connect() { }

    render() { }
} 