import { getConfig } from './modules/config.js'
import Sequencer from './modules/sequencer.js'

// Get the config and make the sequencer
const config = await getConfig()
console.log('config', config)
const sequencer = new Sequencer(config)
console.log('sequencer', sequencer)