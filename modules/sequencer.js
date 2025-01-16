import { makeEnum, dm, midiAccess } from './utility.js'
import Transporter from './transporter.js'
import Controller from './controller.js'
import Synthesizer from './synthesizer.js'

export const PARTS = ['bass', 'drum', 'keys', 'lead']
export const PARTS_ENUM = makeEnum(PARTS)

class Paginator { }

class Part { }

class Band { }

function appendToBodyIfNotNull(div) {
    if (div) { document.body.append(div) }
}

export default function makeSequencer(config) {
    // Create the transporter, paginator, and band
    const paginator = new Paginator()
    const transporter = new Transporter(config.transporter)
    const band = new Band(config.parts)

    // Connect the paginator, transporter, and band
    paginator.connect(transporter, band)
    transporter.connect(paginator, band)
    band.connect(transporter)

    // Render the transporter and band
    const transporterDiv = transporter.render()
    const bandDiv = band.render()

    // Append the transporter and band to the body
    appendToBodyIfNotNull(transporterDiv)
    appendToBodyIfNotNull(bandDiv)

    // Start the paginator
    paginator.start()
}