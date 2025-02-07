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

import Paginator from './paginator.js'
import Transporter from './transporter.js'
import Band from './band.js'

export default class Sequencer {
    static #configUrlKey = 'config'

    paginator = new Paginator()
    transporter = new Transporter()
    band = new Band()

    constructor() { }

    async start() {
        this.canStartFromUrl() || await this.startFromForm()
    }

    canStartFromUrl() {
        // Try to use the config from the URL
        const urlParams = new URLSearchParams(window.location.search)
        const encodedConfig = urlParams.get(Sequencer.#configUrlKey)

        try {
            if (!encodedConfig) {
                throw new Error('No configuration found in URL')
            }

            const base64String = decodeURIComponent(encodedConfig)
            const jsonString = atob(base64String)
            const config = JSON.parse(jsonString)

            // This will throw an error if the config is invalid
            this.tryConfig(config)

            // Yes, we can start from the URL
            return true
        } catch (error) {
            console.log(error)

            urlParams.delete(Sequencer.#configUrlKey)
            const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
            window.history.replaceState(null, '', newUrl)
        }

        // No, we cannot start from the URL
        return false
    }

    async startFromForm() {

    }

    // tryConfig(config) {
    //     // Check if there even is a config
    //     if (!config) {
    //         throw new Error('config is required')
    //     }

    //     // We use a problems variable to collect all the problems because we want
    //     // to be able to evaluate transporter and band even if the other one fails
    //     const problems = []

    //     const { transporter, band } = config

    //     if (!transporter) {
    //         problems.push('transporter is required')
    //     } else {
    //         try {
    //             this.transporter.tryConfig(transporter)
    //         } catch (e) {
    //             problems.push(e.message)
    //         }
    //     }

    //     if (!band) {
    //         problems.push('band is required')
    //     } else {
    //         try {
    //             this.band.tryConfig(band)
    //         } catch (e) {
    //             problems.push(e.message)
    //         }
    //     }

    //     if (problems.length > 0) {
    //         throw new Error(problems.join('\n'))
    //     }
    // }
}