// import { makeEnum, dm, midiAccess } from './utility.js'
// import Transporter from './transporter.js'
// import Controller from './controller.js'
// import Synthesizer from './synthesizer.js'

// export const PARTS = ['bass', 'drum', 'keys', 'lead']
// export const PARTS_ENUM = makeEnum(PARTS)

// class Paginator { }

// class Part { }

// class Band { }

// function appendToBodyIfNotNull(div) {
//     if (div) { document.body.append(div) }
// }

// export function makeSequencer(config) {
//     // Create the transporter, paginator, and band
//     const paginator = new Paginator()
//     const transporter = new Transporter(config.transporter)
//     const band = new Band(config.parts)

//     // Connect the paginator, transporter, and band
//     paginator.connect(transporter, band)
//     transporter.connect(paginator, band)
//     band.connect(transporter)

//     // Render the transporter and band
//     const transporterDiv = transporter.render()
//     const bandDiv = band.render()

//     // Append the transporter and band to the body
//     appendToBodyIfNotNull(transporterDiv)
//     appendToBodyIfNotNull(bandDiv)

//     // Start the paginator
//     paginator.start()
// }

import Transporter from './transporter.js'
import Band from './band.js'

export default class Sequencer {
    paginator = new Paginator()
    transporter = new Transporter()
    band = new Band()

    tryConfig(config) {
        // Check if there even is a config
        if (!config) {
            throw new Error('config is required')
        }

        // We use a problems variable to collect all the problems because we want
        // to be able to evaluate transporter and band even if the other one fails
        const problems = []

        const { transporter, band } = config

        if (!transporter) {
            problems.push('transporter is required')
        } else {
            try {
                this.transporter.tryConfig(transporter)
            } catch (e) {
                problems.push(e.message)
            }
        }

        if (!band) {
            problems.push('band is required')
        } else {
            try {
                this.band.tryConfig(band)
            } catch (e) {
                problems.push(e.message)
            }
        }

        if (problems.length > 0) {
            throw new Error(problems.join('\n'))
        }
    }
}