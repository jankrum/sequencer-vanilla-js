import { getConfig } from './modules/config.js'
// import Paginator from './modules/paginator.js'
// import Transporter from './modules/transporter.js'
// import Band from './modules/band.js'

const config = await getConfig()

// const paginator = new Paginator(config)
// const transporter = new Transporter(config)
// const band = new Band(config)

// paginator.listenTo(transporter)
// transporter.listenTo(paginator, band)
// band.listenTo(paginator, transporter)

// // Add the elements from the objects to the body if they are not null
// const getElement = obj => obj.render()
// const isNotNull = x => x !== null
// document.body.append(...[transporter, /*band*/]
//     .map(getElement)
//     .filter(isNotNull)
// )

// // Sends info to transporter and band
// paginator.start()