import Sequencer from './modules/sequencer.js'
const sequencer = new Sequencer()
await sequencer.start()
console.log('sequencer', sequencer)