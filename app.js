import Sequencer from './modules/sequencer.js'

const sequencer = new Sequencer()

try {
    await sequencer.start()
    console.log('sequencer', sequencer)
} catch (error) {
    console.error(error)
}