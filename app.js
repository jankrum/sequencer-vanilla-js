import getConfig from './modules/cool-get-config.js'
// import { makeSequencer } from './modules/sequencer.js'

// Get the config and make the sequencer
const config = await getConfig()
console.log(config)
// makeSequencer(config)