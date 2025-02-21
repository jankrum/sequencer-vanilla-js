import { getConfig } from './modules/config.js'
import Paginator from './modules/paginator.js'
import Transporter from './modules/transporter.js'
import Band from './modules/band.js'

const config = await getConfig()

console.log(config)

const paginator = new Paginator(config)
const transporter = Transporter.build(config)
const band = new Band(config)

paginator.listenTo(transporter)
transporter.listenTo(paginator, band)
band.listenTo(paginator, transporter)

// Add the elements from the objects to the body if they are not null
const elements = [transporter, band]
    .map(object => object.getElements())  // Get the elements from the objects
    .flat()  // Flatten the array of arrays
    .filter(ele => ele)  // Filter out the null elements

document.body.append(...elements)

// Sends info to transporter and band
paginator.start()